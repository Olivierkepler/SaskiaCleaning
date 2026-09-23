import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/app/lib/staff-auth";
import { transitionStaffJobStatus } from "@/app/lib/staff-jobs";

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId: raw } = await context.params;
  const bookingId = Number(raw);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status =
    body && typeof body === "object"
      ? (body as { status?: unknown }).status
      : null;

  if (typeof status !== "string") {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  const result = await transitionStaffJobStatus({
    staffId: staff.id,
    bookingId,
    nextStatus: status,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, job: result.job });
}
