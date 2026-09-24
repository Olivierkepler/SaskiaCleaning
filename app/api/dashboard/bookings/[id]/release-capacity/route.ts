import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { adminReleaseBookingCapacity } from "@/app/lib/ops-exceptions";



type RouteContext = { params: Promise<{ id: string }> };

/**
 * Admin-only soft-release of active capacity for one booking.
 * Does not change booking status. Preserves assignment history.
 */
export async function POST(req: Request, context: RouteContext) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

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

  const result = await adminReleaseBookingCapacity({
    bookingId,
    confirm: record.confirm,
    reason: record.reason,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  if (!result.released) {
    return NextResponse.json({
      ok: true,
      alreadyReleased: true,
      released: false,
    });
  }

  return NextResponse.json({
    ok: true,
    released: true,
    assignmentId: result.assignmentId,
    releaseReason: result.releaseReason,
  });
}
