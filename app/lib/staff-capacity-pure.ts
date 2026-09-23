/**
 * Pure multi-cleaner capacity helpers — Phase 11.8 + 11.9 overlap awareness.
 * No DB / Next imports — safe for unit tests.
 */

import {
  parseBookingTime,
  formatBookingTime,
  type AvailableSlot,
} from "@/app/lib/scheduling-pure";
import {
  type StaffRole,
} from "@/app/lib/staff-pure";
import {
  getBookingWindow,
  resolveEffectiveDurationMinutes,
  staffAvailabilityCoversWindow,
  staffTimeOffOverlapsWindow,
  windowsOverlapMinutes,
  type BookingWindow,
} from "@/app/lib/booking-duration-pure";

/** Roles that consume public cleaning capacity (one booking = one unit). */
export const CAPACITY_STAFF_ROLES: readonly StaffRole[] = ["cleaner"];

export function isCapacityStaffRole(role: string): boolean {
  return (CAPACITY_STAFF_ROLES as readonly string[]).includes(role);
}

/**
 * Deterministic auto-assign order:
 * 1. fewest upcoming active assignments
 * 2. oldest staff created_at
 * 3. stable staff id
 */
export function compareStaffForAutoAssign(
  a: { upcomingCount: number; createdAt: string | Date; id: string },
  b: { upcomingCount: number; createdAt: string | Date; id: string },
): number {
  if (a.upcomingCount !== b.upcomingCount) {
    return a.upcomingCount - b.upcomingCount;
  }
  const aCreated = new Date(a.createdAt).getTime();
  const bCreated = new Date(b.createdAt).getTime();
  if (aCreated !== bCreated) return aCreated - bCreated;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export type AssignedWindow = {
  startTime: string;
  durationMinutes: number;
  /** Exclusive end minutes from midnight (same day). */
  startMinutes: number;
  endMinutes: number;
};

export type StaffCapacitySnapshot = {
  id: string;
  role: string;
  isActive: boolean;
  createdAt: string | Date;
  upcomingCount: number;
  weekly: { startTime: string; endTime: string; isActive: boolean } | null;
  timeOff: Array<{ startTime: string | null; endTime: string | null }>;
  /** Active assignment windows on this date (overlap-aware). */
  assignedWindows: AssignedWindow[];
};

export function buildAssignedWindow(
  startTime: string,
  durationMinutes: number | null | undefined,
): AssignedWindow | null {
  const effective = resolveEffectiveDurationMinutes(durationMinutes);
  const window = getBookingWindow({
    dateOnly: "2000-01-01",
    startTime,
    durationMinutes: effective,
  });
  if (!window) return null;
  return {
    startTime: window.startTime,
    durationMinutes: window.durationMinutes,
    startMinutes: window.startMinutes,
    endMinutes: window.endMinutes,
  };
}

export function staffIsEligibleForCapacityWindow(
  staff: StaffCapacitySnapshot,
  window: BookingWindow,
  options?: { ignoreAssignedWindows?: boolean },
): boolean {
  if (!staff.isActive) return false;
  if (!isCapacityStaffRole(staff.role)) return false;
  if (!staff.weekly || !staff.weekly.isActive) return false;
  if (
    !staffAvailabilityCoversWindow({
      availStartTime: staff.weekly.startTime,
      availEndTime: staff.weekly.endTime,
      window,
    })
  ) {
    return false;
  }
  for (const off of staff.timeOff) {
    if (
      staffTimeOffOverlapsWindow({
        offStartTime: off.startTime,
        offEndTime: off.endTime,
        window,
      })
    ) {
      return false;
    }
  }
  if (!options?.ignoreAssignedWindows) {
    for (const assigned of staff.assignedWindows) {
      if (
        windowsOverlapMinutes(
          {
            startMinutes: window.startMinutes,
            endMinutes: window.endMinutes,
          },
          {
            startMinutes: assigned.startMinutes,
            endMinutes: assigned.endMinutes,
          },
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

/** @deprecated exact-time helper — prefer staffIsEligibleForCapacityWindow */
export function staffIsEligibleForCapacitySlot(
  staff: StaffCapacitySnapshot,
  slotTime: string,
  durationMinutes: number = 60,
): boolean {
  const window = getBookingWindow({
    dateOnly: "2000-01-01",
    startTime: slotTime,
    durationMinutes,
  });
  if (!window) return false;
  return staffIsEligibleForCapacityWindow(staff, window);
}

export type SlotCapacitySummary = {
  time: string;
  label: string;
  capacity: number;
  booked: number;
  remaining: number;
  available: boolean;
};

export function summarizeSlotCapacityForDuration(input: {
  candidateSlots: AvailableSlot[];
  staff: StaffCapacitySnapshot[];
  durationMinutes: number;
  dateOnly: string;
  /** Bookings whose windows overlap each candidate (count). */
  overlappingBookedByTime?: Record<string, number>;
}): SlotCapacitySummary[] {
  return input.candidateSlots.map((slot) => {
    const window = getBookingWindow({
      dateOnly: input.dateOnly,
      startTime: slot.time,
      durationMinutes: input.durationMinutes,
    });
    if (!window) {
      return {
        time: slot.time,
        label: slot.label || formatBookingTime(slot.time),
        capacity: 0,
        booked: 0,
        remaining: 0,
        available: false,
      };
    }

    const capacity = input.staff.filter((s) =>
      staffIsEligibleForCapacityWindow(s, window, {
        ignoreAssignedWindows: true,
      }),
    ).length;

    const remainingFromEligible = input.staff.filter((s) =>
      staffIsEligibleForCapacityWindow(s, window),
    ).length;

    const booked = Math.max(
      0,
      Number(input.overlappingBookedByTime?.[slot.time] ?? capacity - remainingFromEligible),
    );

    return {
      time: slot.time,
      label: slot.label || formatBookingTime(slot.time),
      capacity,
      booked: Math.min(booked, capacity),
      remaining: remainingFromEligible,
      available: remainingFromEligible > 0,
    };
  });
}

/** Back-compat wrapper used by older tests — treats duration as 60. */
export function summarizeSlotCapacity(input: {
  candidateSlots: AvailableSlot[];
  staff: StaffCapacitySnapshot[];
  bookedByTime: Record<string, number>;
}): SlotCapacitySummary[] {
  // Map legacy assignedTimes-style snapshots if any tests still pass them —
  // capacity snapshots now use assignedWindows.
  return summarizeSlotCapacityForDuration({
    candidateSlots: input.candidateSlots,
    staff: input.staff,
    durationMinutes: 60,
    dateOnly: "2000-01-01",
    overlappingBookedByTime: input.bookedByTime,
  });
}

export function pickAutoAssignStaffIdForWindow(
  staff: StaffCapacitySnapshot[],
  window: BookingWindow,
): string | null {
  const eligible = staff
    .filter((s) => staffIsEligibleForCapacityWindow(s, window))
    .sort(compareStaffForAutoAssign);
  return eligible[0]?.id ?? null;
}

export function pickAutoAssignStaffId(
  staff: StaffCapacitySnapshot[],
  slotTime: string,
  durationMinutes: number = 60,
): string | null {
  const window = getBookingWindow({
    dateOnly: "2000-01-01",
    startTime: slotTime,
    durationMinutes,
  });
  if (!window) return null;
  return pickAutoAssignStaffIdForWindow(staff, window);
}

export const CAPACITY_CONFLICT_MESSAGE =
  "That time is no longer available. Please choose another time.";

export const CAPACITY_UNAVAILABLE_MESSAGE =
  "Unable to confirm that time right now. Please try again.";

export function parseSlotTimeSafe(value: string): string | null {
  return parseBookingTime(value);
}
