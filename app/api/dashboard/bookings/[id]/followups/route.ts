import { NextResponse } from "next/server";
import {
  createBookingFollowup,
  listFollowupsForBooking,
} from "@/app/lib/booking-followups";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function assertDashboardKey(req: Request): boolean {
  return new URL(req.url).searchParams.get("key") === process.env.DASHBOARD_KEY;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  if (!assertDashboardKey(req)) return unauthorized();

  const { id } = await context.params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  const followups = await listFollowupsForBooking(bookingId);
  return NextResponse.json({ followups });
}

export async function POST(req: Request, context: RouteContext) {
  if (!assertDashboardKey(req)) return unauthorized();

  const { id } = await context.params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const result = await createBookingFollowup({
    bookingId,
    payload: {
      followupType: record.followupType ?? record.type,
      contactMethod: record.contactMethod ?? record.method,
      outcome: record.outcome,
      note: record.note,
      nextFollowupAt: record.nextFollowupAt,
      createdByLabel: record.createdByLabel ?? "dashboard",
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true, followup: result.followup });
}
