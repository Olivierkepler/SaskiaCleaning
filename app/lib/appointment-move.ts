import "server-only";

import { sql } from "@/app/lib/db";
import { parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";
import { parseBookingTime } from "@/app/lib/scheduling-pure";
import { getCapacityWindow } from "@/app/lib/booking-buffer-pure";
import { getCapacityAwareSlotsForDate, validateAppointmentWindowBasics } from "@/app/lib/staff-capacity";
import { staffIsEligibleForSlot } from "@/app/lib/staff";
import { withSchedulingTransaction } from "@/app/lib/scheduling-transaction";
import {
  classifyAssignmentConflict,
  createTransactionBoundAppointmentMove,
  executeAppointmentMove,
  type AppointmentMoveBooking,
  type AppointmentMoveInput,
  type AppointmentMoveResult,
  type MoveAssignmentRow,
} from "@/app/lib/appointment-move-pure";
import { resolveEffectiveDurationMinutes } from "@/app/lib/booking-duration-pure";
import { resolveEffectiveBufferMinutes } from "@/app/lib/booking-buffer-pure";
import {
  isSchedulingPolicyHistoryError,
  recordBookingScheduleValidation,
} from "@/app/lib/scheduling-policy-history";

class MoveRollbackError extends Error {
  constructor(readonly reason: "STALE_BOOKING" | "STALE_ASSIGNMENT") {
    super(reason);
  }
}

function isConstraintConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return candidate.code === "23P01" || candidate.code === "23505" ||
    (typeof candidate.message === "string" &&
      /booking_assignments_staff_window_excl|booking_assignments_staff_active_slot_uidx|booking_assignments_one_active_primary_uidx|exclusion constraint/i.test(candidate.message));
}

async function moveInsideTransaction(input: AppointmentMoveInput, adminUserId?: string | null): Promise<AppointmentMoveResult> {
  return executeAppointmentMove(input, {
    loadBookingForUpdate: async (bookingId) => {
      const rows = await sql`
        SELECT id, booking_date, booking_time, duration_minutes, buffer_minutes, status
        FROM booking_requests
        WHERE id = ${bookingId}
        FOR UPDATE
      `;
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return {
        id: Number(row.id),
        bookingDate: parseBookingDateOnly(row.booking_date as string | Date | null),
        bookingTime: row.booking_time == null ? null : parseBookingTime(String(row.booking_time)),
        durationMinutes: row.duration_minutes == null ? null : Number(row.duration_minutes),
        bufferMinutes: row.buffer_minutes == null ? null : Number(row.buffer_minutes),
        status: String(row.status),
      } satisfies AppointmentMoveBooking;
    },
    loadAssignmentForUpdate: async (bookingId) => {
      const rows = await sql`
        SELECT id, staff_id
        FROM booking_assignments
        WHERE booking_id = ${bookingId}
          AND is_primary = true
          AND is_active = true
        LIMIT 1
        FOR UPDATE
      `;
      const row = rows[0] as { id?: unknown; staff_id?: unknown } | undefined;
      return row ? { id: String(row.id), staffId: String(row.staff_id) } : null;
    },
    validateSchedulingWindow: async ({ bookingDate, bookingTime, window }) => {
      const outcome = await validateAppointmentWindowBasics({
        dateOnly: bookingDate,
        time: bookingTime,
        durationMinutes: window.durationMinutes,
      });
      if (outcome === "VALID") return { ok: true };
      return { ok: false, reason: outcome };
    },
    validateAssignedCleaner: async ({ bookingId, assignment, bookingDate, bookingTime, window }) => {
      const eligibility = await staffIsEligibleForSlot({
        staffId: assignment.staffId,
        dateOnly: bookingDate,
        time: bookingTime,
        durationMinutes: window.durationMinutes,
        bufferMinutes: window.bufferMinutes,
      });
      if (!eligibility.ok) {
        return {
          ok: false,
          reason: /time off/i.test(eligibility.error) ? "STAFF_TIME_OFF" : "STAFF_UNAVAILABLE",
        };
      }

      const rows = await sql`
        SELECT
          a.booking_id,
          COALESCE(a.slot_date, b.booking_date) AS booking_date,
          COALESCE(a.slot_time, b.booking_time) AS booking_time,
          b.duration_minutes,
          b.buffer_minutes,
          b.status
        FROM booking_assignments a
        INNER JOIN booking_requests b ON b.id = a.booking_id
        WHERE a.staff_id = ${assignment.staffId}
          AND a.is_primary = true
          AND a.is_active = true
          AND a.slot_date = ${bookingDate}::date
          AND a.booking_id <> ${bookingId}
      `;
      const existingAssignments = (rows as Array<Record<string, unknown>>).map((row): MoveAssignmentRow => ({
        bookingId: Number(row.booking_id),
        bookingDate: parseBookingDateOnly(row.booking_date as string | Date | null),
        bookingTime: row.booking_time == null ? null : parseBookingTime(String(row.booking_time)),
        durationMinutes: row.duration_minutes == null ? null : Number(row.duration_minutes),
        bufferMinutes: row.buffer_minutes == null ? null : Number(row.buffer_minutes),
        status: String(row.status),
      }));
      const reason = classifyAssignmentConflict({
        bookingId,
        bookingDate,
        bookingTime,
        durationMinutes: window.durationMinutes,
        bufferMinutes: window.bufferMinutes,
        existingAssignments,
      });
      return reason ? { ok: false, reason } : { ok: true };
    },
    hasCapacity: async ({ bookingDate, bookingTime, window }) => {
      const slots = await getCapacityAwareSlotsForDate(bookingDate, {
        durationMinutes: window.durationMinutes,
        bufferMinutes: window.bufferMinutes,
      });
      return slots.some((slot) => slot.time === bookingTime && slot.available);
    },
    persistMove: async ({ booking, assignment, bookingDate, bookingTime, window }) => {
      const moved = await sql`
        WITH moved_booking AS (
          UPDATE booking_requests
          SET booking_date = ${bookingDate}::date,
              booking_time = ${bookingTime}::time
          WHERE id = ${booking.id}
            AND booking_date IS NOT DISTINCT FROM ${booking.bookingDate}::date
            AND booking_time IS NOT DISTINCT FROM ${booking.bookingTime}::time
            AND status = ${booking.status}
          RETURNING id
        ), moved_assignment AS (
          UPDATE booking_assignments a
          SET slot_date = ${bookingDate}::date,
              slot_time = ${bookingTime}::time,
              window_start = ${window.windowStartUtc.toISOString()}::timestamptz,
              window_end = ${window.windowEndUtc.toISOString()}::timestamptz,
              updated_at = now()
          FROM moved_booking
          WHERE a.id = ${assignment?.id ?? null}
            AND a.booking_id = moved_booking.id
            AND a.staff_id = ${assignment?.staffId ?? null}
            AND a.is_primary = true
            AND a.is_active = true
          RETURNING a.id
        )
        SELECT
          EXISTS (SELECT 1 FROM moved_booking) AS booking_updated,
          EXISTS (SELECT 1 FROM moved_assignment) AS assignment_updated
      `;
      const row = moved[0] as { booking_updated?: boolean; assignment_updated?: boolean } | undefined;
      if (!row?.booking_updated) return "STALE_BOOKING";
      if (assignment && !row.assignment_updated) throw new MoveRollbackError("STALE_ASSIGNMENT");
      await recordBookingScheduleValidation({
        bookingId: booking.id,
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
        durationMinutes: window.durationMinutes,
        bufferMinutes: window.bufferMinutes,
        source: "admin_appointment_move",
        adminUserId,
      });
      return "UPDATED";
    },
  });
}

const moveInSerializedDomain = createTransactionBoundAppointmentMove(
  (operation) => withSchedulingTransaction(() => operation()),
  moveInsideTransaction,
);

/**
 * Authoritative appointment move. All reads, validation and dependent writes
 * happen under the global scheduling transaction/advisory lock.
 */
export async function moveBookingAppointmentSafely(
  input: AppointmentMoveInput,
  adminUserId?: string | null,
): Promise<AppointmentMoveResult> {
  try {
    return await moveInSerializedDomain(input, adminUserId);
  } catch (error) {
    if (isSchedulingPolicyHistoryError(error)) throw error;
    if (error instanceof MoveRollbackError) {
      return { ok: false, reason: error.reason === "STALE_ASSIGNMENT" ? "STALE_ASSIGNMENT" : "CONCURRENT_CONFLICT" };
    }
    if (isConstraintConflict(error)) return { ok: false, reason: "CONCURRENT_CONFLICT" };
    console.error("Appointment move failed.");
    return { ok: false, reason: "PERSISTENCE_FAILURE" };
  }
}
