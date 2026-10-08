/** Pure, allowlisted dispatch view-model and range helpers. */

import {
  getZonedDateParts,
  isValidBookingDateOnly,
  SASKIA_TIME_ZONE,
} from "@/app/lib/scheduling-pure";
import {
  classifyOpsException,
  OPS_EXCEPTION_LABELS,
  opsExceptionSeverity,
  type OpsExceptionType,
  type OpsSeverity,
} from "@/app/lib/ops-exceptions-pure";

export const DISPATCH_MAX_RANGE_DAYS = 31;
export const DISPATCH_BOOKING_LIMIT = 500;
export const DISPATCH_UNDATED_LIMIT = 25;

export function takeDispatchRows<T>(rows: T[], limit: number): { rows: T[]; truncated: boolean } {
  return { rows: rows.slice(0, limit), truncated: rows.length > limit };
}

export type DispatchDateRange = { from: string; to: string };
export type DispatchRangeResult =
  | { ok: true; range: DispatchDateRange }
  | { ok: false; error: string };

export function getDefaultDispatchRange(now = new Date()): DispatchDateRange {
  const from = getZonedDateParts(now, SASKIA_TIME_ZONE).dateOnly;
  const [year, month, day] = from.split("-").map(Number);
  const end = new Date(Date.UTC(year, month - 1, day + 6, 12));
  const to = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}-${String(end.getUTCDate()).padStart(2, "0")}`;
  return { from, to };
}

export function validateDispatchDateRange(
  from: unknown,
  to: unknown,
): DispatchRangeResult {
  if (
    typeof from !== "string" ||
    typeof to !== "string" ||
    !isValidBookingDateOnly(from) ||
    !isValidBookingDateOnly(to)
  ) {
    return { ok: false, error: "Choose valid start and end dates." };
  }
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const dayCount = Math.floor(
    (Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) /
      86_400_000,
  ) + 1;
  if (dayCount < 1) {
    return { ok: false, error: "End date must be on or after the start date." };
  }
  if (dayCount > DISPATCH_MAX_RANGE_DAYS) {
    return { ok: false, error: `Choose a date range of ${DISPATCH_MAX_RANGE_DAYS} days or fewer.` };
  }
  return { ok: true, range: { from, to } };
}

export type DispatchBooking = {
  id: number;
  bookingDate: string;
  bookingTime: string;
  status: string;
  service: string | null;
  durationMinutes: number | null;
  bufferMinutes: number | null;
  location: string | null;
  assignmentState: "active" | "assigned_to_inactive_staff" | "previously_released" | "never_assigned";
  staffName: string | null;
  exceptionType: OpsExceptionType | null;
  exceptionLabel: string | null;
  exceptionSeverity: OpsSeverity | null;
};

export type DispatchBookingRow = {
  booking_id: unknown;
  booking_date: unknown;
  booking_time: unknown;
  status: unknown;
  service: unknown;
  duration_minutes: unknown;
  buffer_minutes: unknown;
  location: unknown;
  assignment_active: unknown;
  has_assignment_history: unknown;
  staff_name: unknown;
  staff_active: unknown;
  window_end: unknown;
};

export function isDispatchBookingAssigned(booking: DispatchBooking): boolean {
  return booking.assignmentState === "active" || booking.assignmentState === "assigned_to_inactive_staff";
}

export function isDispatchBookingAwaitingAssignment(booking: DispatchBooking): boolean {
  return !isDispatchBookingAssigned(booking);
}

export function mapDispatchBookingRow(
  row: DispatchBookingRow,
  todayDateOnly: string,
  now = new Date(),
): DispatchBooking {
  const bookingDate = String(row.booking_date).slice(0, 10);
  const bookingTime = String(row.booking_time).slice(0, 5);
  const assignmentActive = row.assignment_active === true;
  const staffActive = row.staff_active == null ? null : row.staff_active === true;
  const exceptionType = classifyOpsException({
    status: String(row.status),
    bookingDate,
    hasActiveAssignment: assignmentActive,
    windowEndUtc: row.window_end as Date | string | null,
    staffIsActive: staffActive,
    todayDateOnly,
    now,
  });

  return {
    id: Number(row.booking_id),
    bookingDate,
    bookingTime,
    status: String(row.status),
    service: row.service == null ? null : String(row.service),
    durationMinutes: row.duration_minutes == null ? null : Number(row.duration_minutes),
    bufferMinutes: row.buffer_minutes == null ? null : Number(row.buffer_minutes),
    location: row.location == null ? null : String(row.location),
    assignmentState: assignmentActive
      ? staffActive === false ? "assigned_to_inactive_staff" : "active"
      : row.has_assignment_history === true ? "previously_released" : "never_assigned",
    staffName: row.staff_name == null ? null : String(row.staff_name),
    exceptionType,
    exceptionLabel: exceptionType ? OPS_EXCEPTION_LABELS[exceptionType] : null,
    exceptionSeverity: exceptionType ? opsExceptionSeverity(exceptionType) : null,
  };
}

export type DispatchSummary = {
  awaitingAssignment: number;
  assigned: number;
  inProgress: number;
  completed: number;
  exceptions: number;
};

/**
 * Counts cover the selected date window only. Awaiting/assigned are open
 * statuses (new/contacted/scheduled) split by current primary assignment;
 * in-progress and completed are status buckets. Exceptions use the shared
 * operations classifier and may overlap any status bucket.
 */
export function summarizeDispatchBookings(bookings: DispatchBooking[]): DispatchSummary {
  const summary: DispatchSummary = {
    awaitingAssignment: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    exceptions: 0,
  };
  for (const booking of bookings) {
    if (booking.exceptionType) summary.exceptions += 1;
    if (booking.status === "in_progress") summary.inProgress += 1;
    else if (booking.status === "completed") summary.completed += 1;
    else if (
      ["new", "contacted", "scheduled"].includes(booking.status) &&
      isDispatchBookingAwaitingAssignment(booking)
    ) summary.awaitingAssignment += 1;
    else if (
      ["new", "contacted", "scheduled"].includes(booking.status) &&
      isDispatchBookingAssigned(booking)
    ) summary.assigned += 1;
  }
  return summary;
}

export type UndatedInquiry = {
  id: number;
  status: string;
  service: string | null;
  submittedAt: string;
};

export function mapUndatedInquiryRow(row: {
  id: unknown;
  status: unknown;
  service: unknown;
  created_at: unknown;
}): UndatedInquiry {
  return {
    id: Number(row.id),
    status: String(row.status),
    service: row.service == null ? null : String(row.service),
    submittedAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
  };
}
