import { NextResponse } from "next/server";
import { getAvailableSlotsForDate } from "@/app/lib/scheduling";
import { isValidBookingDateOnly } from "@/app/lib/scheduling-pure";
import { resolveDurationForBooking } from "@/app/lib/booking-duration";

/**
 * Public read-only availability.
 * Duration is server-calculated from service (+ optional room fields).
 * Returns only date + slot times/labels — no booking, staff, or customer data.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const service = url.searchParams.get("service");
    const bedroomsRaw = url.searchParams.get("bedrooms");
    const bathroomsRaw = url.searchParams.get("bathrooms");

    if (!date || !isValidBookingDateOnly(date)) {
      return NextResponse.json(
        { error: "Invalid date. Use YYYY-MM-DD." },
        { status: 400 },
      );
    }

    if (!service || !service.trim()) {
      return NextResponse.json(
        { error: "A service is required to load available times." },
        { status: 400 },
      );
    }

    const bedrooms =
      bedroomsRaw != null && bedroomsRaw !== ""
        ? Number(bedroomsRaw)
        : null;
    const bathrooms =
      bathroomsRaw != null && bathroomsRaw !== ""
        ? Number(bathroomsRaw)
        : null;

    const duration = await resolveDurationForBooking({
      service,
      bedrooms: Number.isFinite(bedrooms) ? bedrooms : null,
      bathrooms: Number.isFinite(bathrooms) ? bathrooms : null,
    });

    if (!duration.ok) {
      return NextResponse.json({ error: duration.error }, { status: 400 });
    }

    const slots = await getAvailableSlotsForDate(date, {
      durationMinutes: duration.minutes,
    });

    return NextResponse.json({
      date,
      estimatedDurationMinutes: duration.minutes,
      slots: slots.map((slot) => ({
        time: slot.time,
        label: slot.label,
      })),
    });
  } catch (error) {
    console.error("Availability lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to load availability." },
      { status: 500 },
    );
  }
}
