import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";
import { isBookingStatus } from "../../../../lib/booking-status";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (key !== process.env.DASHBOARD_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
    }

    const bookingId = Number.parseInt(id, 10);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || !("status" in body)) {
      return NextResponse.json({ error: "Missing status." }, { status: 400 });
    }

    const { status } = body as { status: unknown };

    if (typeof status !== "string" || !isBookingStatus(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const result = await sql`
      UPDATE booking_requests
      SET status = ${status}
      WHERE id = ${bookingId}
      RETURNING *;
    `;

    if (!result[0]) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      booking: result[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update booking status." },
      { status: 500 }
    );
  }
}
