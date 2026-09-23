import "server-only";

import { sql } from "@/app/lib/db";
import { normalizeBookingExtras } from "@/app/lib/customer-bookings-pure";

/** Customer-safe booking fields only (no seen / admin-only joins). */
export type CustomerBooking = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  bedrooms: number;
  bathrooms: number;
  status: string;
  service: string | null;
  frequency: string | null;
  location: string | null;
  booking_date: string | Date | null;
  booking_time: string | null;
  duration_minutes: number | null;
  extras: string[];
  estimate_low: number | null;
  estimate_mid: number | null;
  estimate_high: number | null;
  notes: string | null;
  referral_code: string | null;
  created_at: string | Date | null;
  customer_id: string;
};

type CustomerBookingRow = Omit<CustomerBooking, "extras"> & {
  extras: unknown;
};

function mapRow(row: CustomerBookingRow): CustomerBooking {
  return {
    ...row,
    booking_time:
      row.booking_time == null ? null : String(row.booking_time).slice(0, 8),
    duration_minutes:
      row.duration_minutes == null ? null : Number(row.duration_minutes),
    extras: normalizeBookingExtras(row.extras),
  };
}

/**
 * List bookings owned by the authenticated customer.
 * Ownership: booking_requests.customer_id = customerId
 */
export async function getCustomerBookings(
  customerId: string,
): Promise<CustomerBooking[]> {
  const rows = await sql`
    SELECT
      id,
      name,
      email,
      mobile,
      bedrooms,
      bathrooms,
      status,
      service,
      frequency,
      location,
      booking_date,
      booking_time,
      duration_minutes,
      extras,
      estimate_low,
      estimate_mid,
      estimate_high,
      notes,
      referral_code,
      created_at,
      customer_id
    FROM booking_requests
    WHERE customer_id = ${customerId}
    ORDER BY
      booking_date DESC NULLS LAST,
      created_at DESC NULLS LAST,
      id DESC
  `;

  return (rows as unknown as CustomerBookingRow[]).map(mapRow);
}

/**
 * Fetch a single booking only if owned by customerId.
 * Returns null when missing or not owned (do not distinguish).
 */
export async function getCustomerBookingById(
  customerId: string,
  bookingId: number,
): Promise<CustomerBooking | null> {
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return null;
  }

  const rows = await sql`
    SELECT
      id,
      name,
      email,
      mobile,
      bedrooms,
      bathrooms,
      status,
      service,
      frequency,
      location,
      booking_date,
      booking_time,
      duration_minutes,
      extras,
      estimate_low,
      estimate_mid,
      estimate_high,
      notes,
      referral_code,
      created_at,
      customer_id
    FROM booking_requests
    WHERE id = ${bookingId}
      AND customer_id = ${customerId}
    LIMIT 1
  `;

  const row = rows[0] as CustomerBookingRow | undefined;
  return row ? mapRow(row) : null;
}
