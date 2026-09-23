/**
 * Pure helpers for booking change-request eligibility and validation.
 */

import { parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";

export const BOOKING_CHANGE_REQUEST_TYPES = ["cancel", "reschedule"] as const;
export type BookingChangeRequestType =
  (typeof BOOKING_CHANGE_REQUEST_TYPES)[number];

export const BOOKING_CHANGE_REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled_by_customer",
] as const;
export type BookingChangeRequestStatus =
  (typeof BOOKING_CHANGE_REQUEST_STATUSES)[number];

export const MAX_CHANGE_REQUEST_REASON_LENGTH = 500;

export function isBookingChangeRequestType(
  value: string,
): value is BookingChangeRequestType {
  return (BOOKING_CHANGE_REQUEST_TYPES as readonly string[]).includes(value);
}

export function isBookingChangeRequestStatus(
  value: string,
): value is BookingChangeRequestStatus {
  return (BOOKING_CHANGE_REQUEST_STATUSES as readonly string[]).includes(value);
}

export function canRequestBookingChange(input: {
  status: string;
  requestType: BookingChangeRequestType;
}): boolean {
  const { status, requestType } = input;

  if (
    status === "completed" ||
    status === "cancelled" ||
    status === "in_progress"
  ) {
    return false;
  }

  // Eligible operational pipeline states
  if (
    status === "new" ||
    status === "contacted" ||
    status === "scheduled"
  ) {
    return requestType === "cancel" || requestType === "reschedule";
  }

  return false;
}

/** Validate YYYY-MM-DD and require a future UTC calendar day. */
export function validateRequestedRescheduleDate(
  value: unknown,
  now: Date = new Date(),
): { ok: true; date: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, error: "Please choose a valid date." };
  }

  const [year, month, day] = value.split("-").map(Number);
  const asUtc = new Date(Date.UTC(year, month - 1, day));
  if (
    asUtc.getUTCFullYear() !== year ||
    asUtc.getUTCMonth() !== month - 1 ||
    asUtc.getUTCDate() !== day
  ) {
    return { ok: false, error: "Please choose a valid date." };
  }

  const todayUtc = now.toISOString().slice(0, 10);
  if (value <= todayUtc) {
    return { ok: false, error: "Please choose a future date." };
  }

  return { ok: true, date: value };
}

export function normalizeChangeRequestReason(
  value: unknown,
): { ok: true; reason: string | null } | { ok: false; error: string } {
  if (value == null || value === "") {
    return { ok: true, reason: null };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "Invalid reason." };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, reason: null };
  }
  if (trimmed.length > MAX_CHANGE_REQUEST_REASON_LENGTH) {
    return {
      ok: false,
      error: `Reason must be ${MAX_CHANGE_REQUEST_REASON_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, reason: trimmed };
}

export function formatChangeRequestTypeLabel(
  type: BookingChangeRequestType,
): string {
  return type === "cancel" ? "Cancellation" : "Reschedule";
}

export function formatChangeRequestStatusLabel(
  status: BookingChangeRequestStatus,
): string {
  switch (status) {
    case "pending":
      return "Pending review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Not approved";
    case "cancelled_by_customer":
      return "Withdrawn";
    default:
      return status;
  }
}

export function describePendingChangeRequest(input: {
  request_type: BookingChangeRequestType;
  requested_date: string | Date | null;
}): string {
  if (input.request_type === "cancel") {
    return "Cancellation request pending";
  }
  const dateOnly = parseBookingDateOnly(input.requested_date);
  return dateOnly
    ? `Reschedule request pending · ${dateOnly}`
    : "Reschedule request pending";
}
