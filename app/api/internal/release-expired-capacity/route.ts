import { NextResponse } from "next/server";
import {
  countExpiredCompletedCapacity,
  releaseExpiredCompletedCapacity,
} from "@/app/lib/capacity-release";

/**
 * Internal cron: soft-release completed capacity after window_end.
 * Auth: Authorization: Bearer <CRON_SECRET>
 * Cadence: every 15 minutes (see vercel.json).
 * Response contains aggregate counts only — no PII.
 */

function assertCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  // Vercel Cron may send the secret as a query param when configured that way;
  // prefer Authorization header. Also accept x-cron-secret for operators.
  const headerSecret = req.headers.get("x-cron-secret");
  if (headerSecret === secret) return true;

  return false;
}

export async function GET(req: Request) {
  if (!assertCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";

  try {
    if (dryRun) {
      const eligible = await countExpiredCompletedCapacity();
      return NextResponse.json({
        ok: true,
        dryRun: true,
        eligible,
        released: 0,
      });
    }

    const result = await releaseExpiredCompletedCapacity({ source: "cron" });
    return NextResponse.json({
      ok: true,
      released: result.released,
    });
  } catch (error) {
    console.error("Capacity release cron failed");
    void error;
    return NextResponse.json(
      { error: "Cleanup failed." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
