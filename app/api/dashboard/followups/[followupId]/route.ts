import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { resolveBookingFollowup } from "@/app/lib/booking-followups";



type RouteContext = { params: Promise<{ followupId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

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
