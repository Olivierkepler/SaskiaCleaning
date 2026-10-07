import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { sql } from "@/app/lib/db";
import { executeAdminBookingDetailsPatch } from "@/app/lib/admin-booking-details-pure";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }
  const bookingId = Number(id);
  if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await executeAdminBookingDetailsPatch(body, {
      authorized: true,
      update: async (patch) => {
        const updateLocation = patch.location !== undefined;
        const updateNotes = patch.notes !== undefined;
        const rows = await sql`
          UPDATE booking_requests
          SET
            location = CASE WHEN ${updateLocation} THEN ${patch.location ?? null} ELSE location END,
            notes = CASE WHEN ${updateNotes} THEN ${patch.notes ?? null} ELSE notes END
          WHERE id = ${bookingId}
          RETURNING id, location, notes
        `;
        return (rows[0] as {
          id: number;
          location: string | null;
          notes: string | null;
        } | undefined) ?? null;
      },
    });

    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, booking: result.booking });
  } catch {
    return NextResponse.json(
      { error: "Booking details could not be saved." },
      { status: 500 },
    );
  }
}
