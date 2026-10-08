import "server-only";

import { sql } from "@/app/lib/db";
import { getZonedDateParts, SASKIA_TIME_ZONE } from "@/app/lib/scheduling-pure";
import {
  DISPATCH_BOOKING_LIMIT,
  DISPATCH_UNDATED_LIMIT,
  mapDispatchBookingRow,
  mapUndatedInquiryRow,
  summarizeDispatchBookings,
  takeDispatchRows,
  type DispatchBooking,
  type DispatchDateRange,
  type UndatedInquiry,
} from "@/app/lib/dispatch-pure";

export type DispatchReadModel = {
  bookings: DispatchBooking[];
  summary: ReturnType<typeof summarizeDispatchBookings>;
  truncated: boolean;
  undatedInquiries: UndatedInquiry[];
  undatedCount: number;
  undatedTruncated: boolean;
};

/** Bounded, PII-minimal dispatch read model. No customer contact/profile joins. */
export async function getDispatchReadModel(
  range: DispatchDateRange,
  now = new Date(),
): Promise<DispatchReadModel> {
  const todayDateOnly = getZonedDateParts(now, SASKIA_TIME_ZONE).dateOnly;
  const [bookingRows, undatedRows, undatedCountRows] = await Promise.all([
    sql`
      SELECT
        b.id AS booking_id,
        b.booking_date,
        b.booking_time,
        b.status,
        b.service,
        b.duration_minutes,
        b.buffer_minutes,
        b.location,
        a.is_active AS assignment_active,
        EXISTS (
          SELECT 1 FROM booking_assignments history
          WHERE history.booking_id = b.id
        ) AS has_assignment_history,
        s.name AS staff_name,
        s.is_active AS staff_active,
        a.window_end
      FROM booking_requests b
      LEFT JOIN LATERAL (
        SELECT assignment.is_active, assignment.staff_id, assignment.window_end
        FROM booking_assignments assignment
        WHERE assignment.booking_id = b.id
          AND assignment.is_primary = true
          AND assignment.is_active = true
        ORDER BY assignment.assigned_at DESC
        LIMIT 1
      ) a ON true
      LEFT JOIN staff_members s ON s.id = a.staff_id
      WHERE b.booking_date >= ${range.from}::date
        AND b.booking_date <= ${range.to}::date
        AND b.booking_time IS NOT NULL
        AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress', 'completed')
      ORDER BY b.booking_date ASC, b.booking_time ASC, b.id ASC
      LIMIT ${DISPATCH_BOOKING_LIMIT + 1}
    `,
    sql`
      SELECT id, status, service, created_at
      FROM booking_requests
      WHERE (booking_date IS NULL OR booking_time IS NULL)
        AND status IN ('new', 'contacted', 'scheduled', 'in_progress')
      ORDER BY created_at DESC, id DESC
      LIMIT ${DISPATCH_UNDATED_LIMIT + 1}
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM booking_requests
      WHERE (booking_date IS NULL OR booking_time IS NULL)
        AND status IN ('new', 'contacted', 'scheduled', 'in_progress')
    `,
  ]);

  const rawBookings = bookingRows as Array<Parameters<typeof mapDispatchBookingRow>[0]>;
  const boundedBookings = takeDispatchRows(rawBookings, DISPATCH_BOOKING_LIMIT);
  const truncated = boundedBookings.truncated;
  const bookings = boundedBookings.rows
    .map((row) => mapDispatchBookingRow(row, todayDateOnly, now));
  const rawUndated = undatedRows as Array<{
    id: unknown;
    status: unknown;
    service: unknown;
    created_at: unknown;
  }>;
  const boundedUndated = takeDispatchRows(rawUndated, DISPATCH_UNDATED_LIMIT);
  const undatedTruncated = boundedUndated.truncated;
  const undatedInquiries = boundedUndated.rows
    .map(mapUndatedInquiryRow);

  return {
    bookings,
    summary: summarizeDispatchBookings(bookings),
    truncated,
    undatedInquiries,
    undatedCount: Number((undatedCountRows[0] as { count?: number } | undefined)?.count ?? 0),
    undatedTruncated,
  };
}
