/**
 * Pure capacity-release lifecycle helpers — Phase 11.11.
 * No DB / Next imports — safe for unit tests.
 */

/** Soft-release reasons stored on booking_assignments.release_reason. */
export const CAPACITY_RELEASE_REASONS = [
  "cancelled",
  "completed_window_elapsed",
  "rescheduled",
  "admin_release",
] as const;

export type CapacityReleaseReason = (typeof CAPACITY_RELEASE_REASONS)[number];

export function isCapacityReleaseReason(
  value: unknown,
): value is CapacityReleaseReason {
  return (
    typeof value === "string" &&
    (CAPACITY_RELEASE_REASONS as readonly string[]).includes(value)
  );
}

/** Statuses that may auto-release once window_end has elapsed. */
export const AUTO_RELEASABLE_STATUSES = ["completed"] as const;

/** Statuses that must never auto-release solely because time passed. */
export const CAPACITY_PROTECTED_STATUSES = [
  "new",
  "contacted",
  "scheduled",
  "in_progress",
] as const;

export function isAutoReleasableStatus(status: string): boolean {
  return (AUTO_RELEASABLE_STATUSES as readonly string[]).includes(status);
}

export function isCapacityProtectedStatus(status: string): boolean {
  return (CAPACITY_PROTECTED_STATUSES as readonly string[]).includes(status);
}

/**
 * Completed capacity may soft-release when window_end <= now (half-open end).
 * Cancelled is handled immediately elsewhere — not via timed cleanup.
 */
export function isCompletedCapacityReleasable(input: {
  status: string;
  isActive: boolean;
  windowEndUtc: Date | string | null | undefined;
  now?: Date;
}): boolean {
  if (!input.isActive) return false;
  if (input.status !== "completed") return false;
  if (input.windowEndUtc == null) return false;
  const end = new Date(input.windowEndUtc);
  if (Number.isNaN(end.getTime())) return false;
  const now = input.now ?? new Date();
  return end.getTime() <= now.getTime();
}

/**
 * On completion: release immediately only if capacity window already ended.
 * Otherwise keep active until cron/cleanup after window_end.
 */
export function shouldReleaseOnCompletion(input: {
  windowEndUtc: Date | string | null | undefined;
  now?: Date;
}): boolean {
  if (input.windowEndUtc == null) return false;
  const end = new Date(input.windowEndUtc);
  if (Number.isNaN(end.getTime())) return false;
  const now = input.now ?? new Date();
  return end.getTime() <= now.getTime();
}

/**
 * Operational overdue: open statuses whose capacity window has already ended.
 * Surface only — never auto-cancel / auto-complete.
 */
export function isBookingOverdue(input: {
  status: string;
  windowEndUtc: Date | string | null | undefined;
  now?: Date;
}): boolean {
  if (!isCapacityProtectedStatus(input.status)) return false;
  if (input.windowEndUtc == null) return false;
  const end = new Date(input.windowEndUtc);
  if (Number.isNaN(end.getTime())) return false;
  const now = input.now ?? new Date();
  return end.getTime() <= now.getTime();
}

export type CapacityLifecycleLabel =
  | "overdue"
  | "capacity_held"
  | "released"
  | "active"
  | "none";

/**
 * Compact admin lifecycle label.
 * - overdue: protected status + past window_end + still active
 * - capacity_held: completed + still active (waiting for window/cron)
 * - released: inactive assignment (history retained)
 * - active: active claim for open booking inside window
 */
export function classifyCapacityLifecycle(input: {
  status: string;
  isActive: boolean | null | undefined;
  windowEndUtc: Date | string | null | undefined;
  now?: Date;
}): CapacityLifecycleLabel {
  if (input.isActive == null) return "none";
  if (!input.isActive) return "released";

  if (
    isBookingOverdue({
      status: input.status,
      windowEndUtc: input.windowEndUtc,
      now: input.now,
    })
  ) {
    return "overdue";
  }

  if (input.status === "completed") {
    return "capacity_held";
  }

  return "active";
}

export const CAPACITY_LIFECYCLE_LABELS: Record<
  CapacityLifecycleLabel,
  string
> = {
  overdue: "Overdue",
  capacity_held: "Capacity held",
  released: "Released",
  active: "Active",
  none: "",
};
