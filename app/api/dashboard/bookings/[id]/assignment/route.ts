import { NextResponse } from "next/server";
import {
  assignStaffToBooking,
  getAssignmentForBooking,
  listEligibleStaffForBooking,
  unassignBooking,
} from "@/app/lib/staff";

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

  const [assignment, eligible] = await Promise.all([
    getAssignmentForBooking(bookingId),
    listEligibleStaffForBooking(bookingId),
  ]);

  return NextResponse.json({
    assignment,
    eligibleStaff: eligible.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
    })),
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
