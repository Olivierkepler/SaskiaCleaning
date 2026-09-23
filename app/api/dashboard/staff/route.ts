import { NextResponse } from "next/server";
import {
  createStaffMember,
  listStaffMembers,
  countUpcomingAssignmentsForStaff,
} from "@/app/lib/staff";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function assertKey(req: Request): boolean {
  return new URL(req.url).searchParams.get("key") === process.env.DASHBOARD_KEY;
}

export async function GET(req: Request) {
  if (!assertKey(req)) return unauthorized();
  try {
    const staff = await listStaffMembers();
    const withCounts = await Promise.all(
      staff.map(async (member) => ({
        ...member,
        upcomingJobs: await countUpcomingAssignmentsForStaff(member.id),
      })),
    );
    return NextResponse.json({ staff: withCounts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load staff." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!assertKey(req)) return unauthorized();
  try {
    const body = await req.json();
    const result = await createStaffMember(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, staff: result.staff });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create staff." }, { status: 500 });
  }
}
