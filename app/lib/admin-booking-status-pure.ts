import type { BookingStatus } from "@/app/lib/booking-status";
import { parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";
import {
  getCapacityWindow,
  resolveEffectiveBufferMinutes,
} from "@/app/lib/booking-buffer-pure";
import { resolveEffectiveDurationMinutes } from "@/app/lib/booking-duration-pure";
import { isValidBookingDateOnly, parseBookingTime } from "@/app/lib/scheduling-pure";

const terminalStatuses = new Set<BookingStatus>(["completed", "cancelled"]);
const assignmentRequiredStatuses = new Set<BookingStatus>([
  "scheduled",
  "in_progress",
]);

export type AdminBookingStatusTransitionResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      reason: "stale" | "assignment_required" | "concurrent";
    };

export type AdminBookingReservation = {
  isPrimary: boolean;
  isActive: boolean;
  staffIsActive: boolean;
  slotDate: string | Date | null;
  slotTime: string | null;
  windowStart: string | Date | null;
  windowEnd: string | Date | null;
};

export function hasValidAppointmentSlot(input: {
  bookingDate: string | Date | null;
  bookingTime: string | null;
}): boolean {
  const date = parseBookingDateOnly(input.bookingDate);
  const time = parseBookingTime(input.bookingTime);
  return date !== null && isValidBookingDateOnly(date) && time !== null;
}

/** Validate that the live assignment still reserves this exact booking window. */
export function hasValidActiveBookingReservation(input: {
  bookingDate: string | Date | null;
  bookingTime: string | null;
  durationMinutes: number | null;
  bufferMinutes: number | null;
  assignment: AdminBookingReservation | null;
  now?: Date;
}): boolean {
  const date = parseBookingDateOnly(input.bookingDate);
  const time = parseBookingTime(input.bookingTime);
  const assignment = input.assignment;
  if (
    !date ||
    !isValidBookingDateOnly(date) ||
    !time ||
    !assignment ||
    !assignment.isPrimary ||
    !assignment.isActive ||
    !assignment.staffIsActive ||
    parseBookingDateOnly(assignment.slotDate) !== date ||
    parseBookingTime(assignment.slotTime) !== time
  ) {
    return false;
  }

  const expected = getCapacityWindow({
    dateOnly: date,
    startTime: time,
    durationMinutes: resolveEffectiveDurationMinutes(input.durationMinutes),
    bufferMinutes: resolveEffectiveBufferMinutes(input.bufferMinutes),
  });
  const start = assignment.windowStart == null
    ? Number.NaN
    : new Date(assignment.windowStart).getTime();
  const end = assignment.windowEnd == null
    ? Number.NaN
    : new Date(assignment.windowEnd).getTime();
  const now = (input.now ?? new Date()).getTime();

  return Boolean(
    expected &&
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      Number.isFinite(now) &&
      start === expected.windowStartUtc.getTime() &&
      end > start &&
      end >= expected.windowEndUtc.getTime() &&
      end > now,
  );
}

/**
 * Applies the database write only after checking the locked status snapshot.
 * Reopening a terminal booking as scheduled/in progress requires an active
 * primary assignment, which is also its capacity reservation.
 */
export async function applyAdminBookingStatusTransition<T>(input: {
  currentStatus: BookingStatus;
  expectedStatus?: BookingStatus;
  nextStatus: BookingStatus;
  hasValidActiveAssignment: boolean;
  hasAppointmentSlot: boolean;
  update: () => Promise<T | null>;
}): Promise<AdminBookingStatusTransitionResult<T>> {
  if (
    input.expectedStatus !== undefined &&
    input.expectedStatus !== input.currentStatus
  ) {
    return { ok: false, reason: "stale" };
  }

  if (
    terminalStatuses.has(input.currentStatus) &&
    assignmentRequiredStatuses.has(input.nextStatus) &&
    (!input.hasValidActiveAssignment || !input.hasAppointmentSlot)
  ) {
    return { ok: false, reason: "assignment_required" };
  }

  const value = await input.update();
  return value == null
    ? { ok: false, reason: "concurrent" }
    : { ok: true, value };
}
