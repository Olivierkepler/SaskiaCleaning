import { NextResponse } from "next/server";
import {
  assignStaffToBooking,
  getAssignmentForBooking,
  listEligibleStaffForBooking,
  unassignBooking,
} from "@/app/lib/staff";
import { sql } from "@/app/lib/db";
import {
  formatBookingTime,
  parseBookingTime,
} from "@/app/lib/scheduling-pure";
import {
  formatBookingTimeRange,
  formatEstimatedDuration,
  resolveEffectiveDurationMinutes,
} from "@/app/lib/booking-duration-pure";
import {
  formatReservedUntil,
  resolveEffectiveBufferMinutes,
} from "@/app/lib/booking-buffer-pure";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function assertKey(req: Request): boolean {
  return new URL(req.url).searchParams.get("key") === process.env.DASHBOARD_KEY;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  if (!assertKey(req)) return unauthorized();
  const { id } = await context.params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  const [assignment, eligible, bookingRows] = await Promise.all([
    getAssignmentForBooking(bookingId),
    listEligibleStaffForBooking(bookingId),
    sql`
      SELECT booking_time, duration_minutes, buffer_minutes
      FROM booking_requests
      WHERE id = ${bookingId}
      LIMIT 1
    `,
  ]);

  const booking = bookingRows[0] as
    | {
        booking_time: string | null;
        duration_minutes: number | null;
        buffer_minutes: number | null;
      }
    | undefined;
  const time = parseBookingTime(
    booking?.booking_time == null ? null : String(booking.booking_time),
  );
  const duration =
    booking?.duration_minutes == null
      ? null
      : Number(booking.duration_minutes);
  const buffer =
    booking?.buffer_minutes == null ? null : Number(booking.buffer_minutes);
  const reservedUntil =
    time && duration != null
      ? formatReservedUntil(time, duration, buffer)
      : null;

  return NextResponse.json({
    assignment,
    eligibleStaff: eligible.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
    })),
    opsWindow: time
      ? {
          serviceRange: formatBookingTimeRange(time, duration),
          serviceLabel: formatEstimatedDuration(
            resolveEffectiveDurationMinutes(duration),
          ),
          reservedUntil: reservedUntil
            ? formatBookingTime(reservedUntil)
            : null,
          bufferMinutes: resolveEffectiveBufferMinutes(buffer),
        }
      : null,
  });
}

export async function PUT(req: Request, context: RouteContext) {
  if (!assertKey(req)) return unauthorized();
  const { id } = await context.params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  const body = await req.json();
  if (body?.unassign === true) {
    const result = await unassignBooking(bookingId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, assignment: null });
  }

  const staffId = typeof body?.staffId === "string" ? body.staffId : "";
  if (!staffId) {
    return NextResponse.json({ error: "staffId required." }, { status: 400 });
  }

  const result = await assignStaffToBooking({
    bookingId,
    staffId,
    assignedBy: "dashboard",
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ success: true, assignment: result.assignment });
}
