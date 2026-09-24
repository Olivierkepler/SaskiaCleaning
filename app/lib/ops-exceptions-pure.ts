/**
 * Pure operational-exception classification — Phase 11.12.
 * No DB / Next imports — safe for unit tests.
 */

import { isCapacityProtectedStatus } from "@/app/lib/capacity-release-pure";

export const OPS_EXCEPTION_TYPES = [
  "OVERDUE_NOT_STARTED",
  "OVERDUE_IN_PROGRESS",
  "CAPACITY_HELD_AFTER_COMPLETION",
  "RELEASE_PENDING",
  "UNASSIGNED_FUTURE_BOOKING",
  "STAFF_UNAVAILABLE_FOR_FUTURE_BOOKING",
] as const;

export type OpsExceptionType = (typeof OPS_EXCEPTION_TYPES)[number];

export type OpsSeverity = "info" | "warning" | "critical";

export const OPS_EXCEPTION_LABELS: Record<OpsExceptionType, string> = {
  OVERDUE_NOT_STARTED: "Overdue — not started",
  OVERDUE_IN_PROGRESS: "Overdue — in progress",
  CAPACITY_HELD_AFTER_COMPLETION: "Capacity held",
  RELEASE_PENDING: "Release pending",
  UNASSIGNED_FUTURE_BOOKING: "Unassigned future booking",
  STAFF_UNAVAILABLE_FOR_FUTURE_BOOKING: "Staff unavailable",
};

export const OPS_SEVERITY_FOR_TYPE: Record<OpsExceptionType, OpsSeverity> = {
  OVERDUE_NOT_STARTED: "warning",
  OVERDUE_IN_PROGRESS: "critical",
  CAPACITY_HELD_AFTER_COMPLETION: "info",
  RELEASE_PENDING: "warning",
  UNASSIGNED_FUTURE_BOOKING: "critical",
  STAFF_UNAVAILABLE_FOR_FUTURE_BOOKING: "critical",
};

export type OpsExceptionInput = {
  status: string;
  bookingDate: string | null;
  hasActiveAssignment: boolean;
  windowEndUtc: Date | string | null | undefined;
  staffIsActive: boolean | null;
  /** YYYY-MM-DD in America/New_York "today" for future checks. */
  todayDateOnly: string;
  now?: Date;
};

/**
 * Classify a single operational exception, or null when none.
 * Deterministic; first matching rule wins by priority.
 */
export function classifyOpsException(
  input: OpsExceptionInput,
): OpsExceptionType | null {
  const now = input.now ?? new Date();
  const windowEnd =
    input.windowEndUtc == null ? null : new Date(input.windowEndUtc);
  const windowValid = windowEnd != null && !Number.isNaN(windowEnd.getTime());
  const pastWindow = windowValid && windowEnd!.getTime() <= now.getTime();
  const beforeWindowEnd = windowValid && windowEnd!.getTime() > now.getTime();

  const isFutureBooking =
    input.bookingDate != null && input.bookingDate >= input.todayDateOnly;
  const isOpen =
    input.status === "new" ||
    input.status === "contacted" ||
    input.status === "scheduled" ||
    input.status === "in_progress";

  // Unassigned future open booking — critical ops gap
  if (isOpen && isFutureBooking && !input.hasActiveAssignment) {
    return "UNASSIGNED_FUTURE_BOOKING";
  }

  if (input.hasActiveAssignment && windowValid) {
    if (input.status === "completed") {
      if (beforeWindowEnd) return "CAPACITY_HELD_AFTER_COMPLETION";
      if (pastWindow) return "RELEASE_PENDING";
    }

    if (input.status === "in_progress" && pastWindow) {
      return "OVERDUE_IN_PROGRESS";
    }

    if (
      (input.status === "new" ||
        input.status === "contacted" ||
        input.status === "scheduled") &&
      pastWindow
    ) {
      return "OVERDUE_NOT_STARTED";
    }

    // Future open booking assigned to inactive staff
    if (
      isOpen &&
      isFutureBooking &&
      input.staffIsActive === false
    ) {
      return "STAFF_UNAVAILABLE_FOR_FUTURE_BOOKING";
    }
  }

  return null;
}

export function opsExceptionSeverity(
  type: OpsExceptionType,
): OpsSeverity {
  return OPS_SEVERITY_FOR_TYPE[type];
}

/** Needs-attention count excludes informational capacity-held rows. */
export function countsAsNeedsAttention(type: OpsExceptionType): boolean {
  return type !== "CAPACITY_HELD_AFTER_COMPLETION";
}

export function isOpenBookingStatus(status: string): boolean {
  return isCapacityProtectedStatus(status);
}

/**
 * Admin manual release confirmation rules (pure).
 * Terminal completed/cancelled: confirm only.
 * Open bookings: confirm + non-empty reason required.
 */
export function validateAdminReleaseRequest(input: {
  status: string;
  confirm: unknown;
  reason: unknown;
}): { ok: true } | { ok: false; error: string } {
  if (input.confirm !== true) {
    return {
      ok: false,
      error: "Explicit confirmation is required to release capacity.",
    };
  }

  if (isOpenBookingStatus(input.status)) {
    if (typeof input.reason !== "string" || !input.reason.trim()) {
      return {
        ok: false,
        error:
          "A reason is required when releasing capacity for an active booking.",
      };
    }
    if (input.reason.trim().length > 500) {
      return { ok: false, error: "Reason must be 500 characters or fewer." };
    }
  }

  return { ok: true };
}

/** Admin may mark complete from in_progress (same as staff end-state). */
export function canAdminMarkComplete(status: string): boolean {
  return status === "in_progress";
}
