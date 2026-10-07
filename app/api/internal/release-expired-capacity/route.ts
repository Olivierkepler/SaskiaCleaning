import { NextResponse } from "next/server";
import {
  countExpiredCompletedCapacity,
  releaseExpiredCompletedCapacity,
} from "@/app/lib/capacity-release";
import { pruneExpiredAuthRateLimits } from "@/app/lib/auth-rate-limit";
import { pruneEmailVerificationTokens } from "@/app/lib/customer-email-verification";
import { prunePasswordResetTokens } from "@/app/lib/customer-password-reset";

/**
 * Internal cron: soft-release completed capacity after window_end.
 * Auth: Authorization: Bearer <CRON_SECRET>
 * Cadence: daily (see vercel.json); also prunes expired auth throttle rows.
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
    let rateLimitRowsPruned = 0;
    let verificationTokenRowsPruned = 0;
    let passwordResetTokenRowsPruned = 0;
    try {
      rateLimitRowsPruned = await pruneExpiredAuthRateLimits();
    } catch {
      // Rate-limit cleanup is housekeeping and must not undo capacity release.
      console.error("Auth rate-limit cleanup failed.");
    }
    try {
      verificationTokenRowsPruned = await pruneEmailVerificationTokens();
    } catch {
      console.error("Email verification token cleanup failed.");
    }
    try {
      passwordResetTokenRowsPruned = await prunePasswordResetTokens();
    } catch {
      console.error("Password reset token cleanup failed.");
    }
    return NextResponse.json({
      ok: true,
      released: result.released,
      rateLimitRowsPruned,
      verificationTokenRowsPruned,
      passwordResetTokenRowsPruned,
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
