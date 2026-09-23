import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/app/lib/customer-auth";
import { createCustomerBookingChangeRequest } from "@/app/lib/booking-change-requests";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  // Ignore any client-supplied customer_id / userId.
  const result = await createCustomerBookingChangeRequest({
    customerId: customer.id,
    bookingId,
    requestType: record.requestType,
    requestedDate: record.requestedDate,
    requestedTime: record.requestedTime,
    reason: record.reason,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    request: {
      id: result.request.id,
      bookingId: result.request.booking_id,
      requestType: result.request.request_type,
      requestedDate: result.request.requested_date,
      requestedTime: result.request.requested_time,
      reason: result.request.reason,
      status: result.request.status,
      createdAt: result.request.created_at,
    },
  });
}
