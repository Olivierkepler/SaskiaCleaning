import { NextResponse } from "next/server";
import { resolveBookingFollowup } from "@/app/lib/booking-followups";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function assertDashboardKey(req: Request): boolean {
  return new URL(req.url).searchParams.get("key") === process.env.DASHBOARD_KEY;
}

type RouteContext = { params: Promise<{ followupId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  if (!assertDashboardKey(req)) return unauthorized();

  const { followupId: raw } = await context.params;
  const followupId = Number(raw);
  if (!Number.isInteger(followupId) || followupId <= 0) {
    return NextResponse.json({ error: "Invalid follow-up." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  if (record.resolved !== true) {
    return NextResponse.json(
      { error: "Only resolved=true is supported." },
      { status: 400 },
    );
  }

  const result = await resolveBookingFollowup(followupId);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyResolved: result.alreadyResolved,
    followup: result.followup,
  });
}
