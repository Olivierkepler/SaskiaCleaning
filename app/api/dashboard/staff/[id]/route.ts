import { NextResponse } from "next/server";
import {
  createStaffTimeOff,
  deleteStaffTimeOff,
  findStaffById,
  listStaffAvailability,
  listStaffTimeOff,
  updateStaffMember,
  upsertStaffAvailability,
  countUpcomingAssignmentsForStaff,
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
  const staff = await findStaffById(id);
  if (!staff) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const [availability, timeOff, upcomingJobs] = await Promise.all([
    listStaffAvailability(id),
    listStaffTimeOff(id),
    countUpcomingAssignmentsForStaff(id),
  ]);
  return NextResponse.json({ staff, availability, timeOff, upcomingJobs });
}

export async function PUT(req: Request, context: RouteContext) {
  if (!assertKey(req)) return unauthorized();
  const { id } = await context.params;
  const body = await req.json();

  if (body?.availability && Array.isArray(body.availability)) {
    const result = await upsertStaffAvailability(id, body.availability);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, conflictCount: result.conflictCount },
        { status: result.status },
      );
    }
    return NextResponse.json({ availability: result.days });
  }

  if (body?.timeOff && typeof body.timeOff === "object") {
    const result = await createStaffTimeOff({
      staffId: id,
      offDate: body.timeOff.offDate,
      startTime: body.timeOff.startTime,
      endTime: body.timeOff.endTime,
      reason: body.timeOff.reason,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, conflictCount: result.conflictCount },
        { status: result.status ?? 400 },
      );
    }
    const timeOff = await listStaffTimeOff(id);
    return NextResponse.json({ timeOff, id: result.id });
  }

  const result = await updateStaffMember(id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ staff: result.staff });
}

export async function DELETE(req: Request, context: RouteContext) {
  if (!assertKey(req)) return unauthorized();
  const { id } = await context.params;
  const url = new URL(req.url);
  const timeOffId = Number(url.searchParams.get("timeOffId"));
  if (!Number.isInteger(timeOffId) || timeOffId <= 0) {
    return NextResponse.json({ error: "timeOffId required." }, { status: 400 });
  }
  const deleted = await deleteStaffTimeOff(id, timeOffId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
