import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { sql } from "@/app/lib/db";
import { resolveDurationForBooking } from "@/app/lib/booking-duration";
import { executeAdminBookingDetailsPatch } from "@/app/lib/admin-booking-details-pure";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
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
      load: async () => {
        const rows = await sql`
          SELECT
            br.id, br.location, br.notes, br.service, br.frequency,
            br.bedrooms, br.bathrooms, br.extras, br.pricing_inputs,
            br.duration_minutes, br.status, br.booking_date, br.booking_time,
            EXISTS (
              SELECT 1 FROM booking_assignments a
              WHERE a.booking_id = br.id
                AND a.is_primary = true
                AND a.is_active = true
            ) AS has_active_assignment
          FROM booking_requests br
          WHERE br.id = ${bookingId}
          LIMIT 1
        `;
        const row = rows[0] as Record<string, unknown> | undefined;
        return row ? {
          id: Number(row.id),
          location: row.location == null ? null : String(row.location),
          notes: row.notes == null ? null : String(row.notes),
          service: row.service == null ? null : String(row.service),
          frequency: row.frequency == null ? null : String(row.frequency),
          bedrooms: Number(row.bedrooms),
          bathrooms: Number(row.bathrooms),
          extras: row.extras,
          pricing_inputs: row.pricing_inputs,
          duration_minutes: row.duration_minutes == null ? null : Number(row.duration_minutes),
          has_active_assignment: row.has_active_assignment === true,
          can_be_assigned: String(row.status) !== "cancelled" && row.booking_date != null && row.booking_time != null,
        } : null;
      },
      resolveDuration: async (input) => {
        const result = await resolveDurationForBooking(input);
        return result.ok ? result.minutes : null;
      },
      update: async (update) => {
        const pricing = update.pricing;
        const updateLocation = update.location !== undefined;
        const updateNotes = update.notes !== undefined;
        const updatePricing = pricing !== null;
        const rows = await sql`
          WITH target AS MATERIALIZED (
            SELECT id, duration_minutes, status, booking_date, booking_time
            FROM booking_requests
            WHERE id = ${bookingId}
            FOR UPDATE
          ), active_assignment AS MATERIALIZED (
            SELECT EXISTS (
              SELECT 1
              FROM booking_assignments a
              WHERE a.booking_id = (SELECT id FROM target)
                AND a.is_primary = true
                AND a.is_active = true
            ) AS present
          ), updated AS (
            UPDATE booking_requests br
            SET
              location = CASE WHEN ${updateLocation} THEN ${update.location ?? null} ELSE br.location END,
              notes = CASE WHEN ${updateNotes} THEN ${update.notes ?? null} ELSE br.notes END,
              service = CASE WHEN ${updatePricing} THEN ${update.service} ELSE br.service END,
              frequency = CASE WHEN ${updatePricing} THEN ${update.frequency} ELSE br.frequency END,
              bedrooms = CASE WHEN ${updatePricing} THEN ${update.bedrooms} ELSE br.bedrooms END,
              bathrooms = CASE WHEN ${updatePricing} THEN ${update.bathrooms} ELSE br.bathrooms END,
              extras = CASE WHEN ${updatePricing} THEN ${JSON.stringify(pricing?.extras ?? [])}::jsonb ELSE br.extras END,
              pricing_inputs = CASE WHEN ${updatePricing} THEN ${JSON.stringify(pricing?.pricingInputs ?? null)}::jsonb ELSE br.pricing_inputs END,
              estimate_low = CASE WHEN ${updatePricing} THEN ${pricing?.estimate.low ?? null} ELSE br.estimate_low END,
              estimate_mid = CASE WHEN ${updatePricing} THEN ${pricing?.estimate.mid ?? null} ELSE br.estimate_mid END,
              estimate_high = CASE WHEN ${updatePricing} THEN ${pricing?.estimate.high ?? null} ELSE br.estimate_high END,
              duration_minutes = CASE WHEN ${update.durationChanged} THEN ${update.durationMinutes} ELSE br.duration_minutes END
            WHERE br.id = (SELECT id FROM target)
              AND (
                NOT ${update.durationChanged}
                OR (
                  NOT (SELECT present FROM active_assignment)
                  AND NOT EXISTS (
                    SELECT 1 FROM target t
                    WHERE t.status <> 'cancelled'
                      AND t.booking_date IS NOT NULL
                      AND t.booking_time IS NOT NULL
                  )
                )
              )
            RETURNING
              br.id, br.location, br.notes, br.service, br.frequency,
              br.bedrooms, br.bathrooms, br.extras, br.pricing_inputs,
              br.estimate_low, br.estimate_mid, br.estimate_high,
              br.duration_minutes
          )
          SELECT
            updated.*,
            (SELECT id FROM target) AS target_id,
            (SELECT present FROM active_assignment) AS has_active_assignment,
            EXISTS (
              SELECT 1 FROM target t
              WHERE t.status <> 'cancelled'
                AND t.booking_date IS NOT NULL
                AND t.booking_time IS NOT NULL
            ) AS can_be_assigned
          FROM (SELECT 1) seed
          LEFT JOIN updated ON true
        `;
        const row = rows[0] as Record<string, unknown> | undefined;
        if (!row || row.target_id == null) return { ok: false as const, reason: "not-found" as const };
        if (row.id == null) {
          if (update.durationChanged && row.has_active_assignment === true) {
            return { ok: false as const, reason: "assignment-conflict" as const };
          }
          if (update.durationChanged && row.can_be_assigned === true) {
            return { ok: false as const, reason: "scheduling-conflict" as const };
          }
          throw new Error("Booking update did not return a row.");
        }
        return {
          ok: true as const,
          booking: {
            id: Number(row.id),
            location: row.location == null ? null : String(row.location),
            notes: row.notes == null ? null : String(row.notes),
            service: row.service == null ? null : String(row.service),
            frequency: row.frequency == null ? null : String(row.frequency),
            bedrooms: Number(row.bedrooms),
            bathrooms: Number(row.bathrooms),
            extras: row.extras,
            pricing_inputs: row.pricing_inputs,
            estimate_low: row.estimate_low == null ? null : Number(row.estimate_low),
            estimate_mid: row.estimate_mid == null ? null : Number(row.estimate_mid),
            estimate_high: row.estimate_high == null ? null : Number(row.estimate_high),
            duration_minutes: row.duration_minutes == null ? null : Number(row.duration_minutes),
          },
        };
      },
    });

    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, booking: result.booking });
  } catch {
    return NextResponse.json({ error: "Booking details could not be saved." }, { status: 500 });
  }
}
