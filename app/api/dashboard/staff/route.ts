import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import {
  createStaffMember,
  listStaffMembers,
  countUpcomingAssignmentsForStaff,
} from "@/app/lib/staff";



export async function GET(req: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
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
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
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
