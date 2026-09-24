/**
 * Pure staff / assignment helpers for Phase 11.7.
 */

import { parseBookingTime, timeToMinutes } from "@/app/lib/scheduling-pure";
import { isBookingStatus, type BookingStatus } from "@/app/lib/booking-status";

export const STAFF_ROLES = ["cleaner", "manager"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value);
}

export function normalizeStaffEmail(
  email: string,
): { ok: true; email: string } | { ok: false; error: string } {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (trimmed.length > 254) {
    return { ok: false, error: "Email is too long." };
  }
  return { ok: true, email: trimmed };
}

export function normalizeStaffName(
  name: unknown,
): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof name !== "string") {
    return { ok: false, error: "Name is required." };
  }
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (!cleaned) return { ok: false, error: "Name is required." };
  if (cleaned.length > 120) {
    return { ok: false, error: "Name must be 120 characters or fewer." };
  }
  return { ok: true, name: cleaned };
}

export function normalizeStaffPhone(
  phone: unknown,
): { ok: true; phone: string | null } | { ok: false; error: string } {
  if (phone == null || phone === "") return { ok: true, phone: null };
  if (typeof phone !== "string") {
    return { ok: false, error: "Invalid phone." };
  }
  const trimmed = phone.trim();
  if (!trimmed) return { ok: true, phone: null };
  if (trimmed.length > 40) {
    return { ok: false, error: "Phone must be 40 characters or fewer." };
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) {
    return { ok: false, error: "Please enter a valid phone number." };
  }
  return { ok: true, phone: trimmed };
}

/** Staff may only advance scheduled → in_progress → completed. */
export const STAFF_STATUS_TRANSITIONS: Record<
  string,
  BookingStatus[]
> = {
  scheduled: ["in_progress"],
  in_progress: ["completed"],
};

export function canStaffTransitionStatus(
  from: string,
  to: string,
): boolean {
  if (!isBookingStatus(from) || !isBookingStatus(to)) return false;
  const allowed = STAFF_STATUS_TRANSITIONS[from] ?? [];
  return allowed.includes(to);
}

export function isStaffActionableStatus(status: string): boolean {
  return status === "scheduled" || status === "in_progress";
}

/**
 * Exact-slot conflict (Phase 11.7) — retained for tests.
 * Prefer hasOverlappingStaffConflict for Phase 11.9.
 */
export function hasExactSlotStaffConflict(input: {
  existingAssignments: Array<{
    bookingId: number;
    bookingDate: string | null;
    bookingTime: string | null;
    status: string;
  }>;
  candidateBookingId: number;
  candidateDate: string | null;
  candidateTime: string | null;
  capacityStatuses?: readonly string[];
}): boolean {
  const capacity = input.capacityStatuses ?? [
    "new",
    "contacted",
    "scheduled",
    "in_progress",
    "completed",
  ];
  const date = input.candidateDate;
  const time = parseBookingTime(input.candidateTime);
  if (!date || !time) return false;

  return input.existingAssignments.some((row) => {
    if (row.bookingId === input.candidateBookingId) return false;
    if (!capacity.includes(row.status)) return false;
    if (row.bookingDate !== date) return false;
    return parseBookingTime(row.bookingTime) === time;
  });
}

/**
 * Overlap-aware staff conflict (Phase 11.9 + 11.10 buffer).
 * Uses half-open [start, end) capacity windows in minutes from midnight.
 */
export function hasOverlappingStaffConflict(input: {
  existingAssignments: Array<{
    bookingId: number;
    bookingDate: string | null;
    bookingTime: string | null;
    durationMinutes: number | null;
    bufferMinutes?: number | null;
    status: string;
  }>;
  candidateBookingId: number;
  candidateDate: string | null;
  candidateTime: string | null;
  candidateDurationMinutes: number;
  candidateBufferMinutes?: number;
  capacityStatuses?: readonly string[];
}): boolean {
  const capacity = input.capacityStatuses ?? [
    "new",
    "contacted",
    "scheduled",
    "in_progress",
    "completed",
  ];
  const date = input.candidateDate;
  const time = parseBookingTime(input.candidateTime);
  if (!date || !time) return false;

  const candidateStart = timeToMinutes(time);
  const candidateBuffer =
    typeof input.candidateBufferMinutes === "number" &&
    Number.isInteger(input.candidateBufferMinutes) &&
    input.candidateBufferMinutes >= 0
      ? input.candidateBufferMinutes
      : 0;
  const candidateEnd =
    candidateStart + input.candidateDurationMinutes + candidateBuffer;
  if (Number.isNaN(candidateStart)) return false;

  return input.existingAssignments.some((row) => {
    if (row.bookingId === input.candidateBookingId) return false;
    if (!capacity.includes(row.status)) return false;
    if (row.bookingDate !== date) return false;
    const rowTime = parseBookingTime(row.bookingTime);
    if (!rowTime) return false;
    const rowStart = timeToMinutes(rowTime);
    const rowDuration =
      typeof row.durationMinutes === "number" &&
      Number.isInteger(row.durationMinutes) &&
      row.durationMinutes > 0
        ? row.durationMinutes
        : 120; // LEGACY_DURATION_FALLBACK — keep in sync with booking-duration-pure
    // When bufferMinutes key is omitted (legacy Phase 11.9 callers), treat as 0.
    // When explicitly null (DB), use legacy buffer fallback (30).
    const resolvedRowBuffer =
      "bufferMinutes" in row
        ? row.bufferMinutes == null
          ? 30
          : typeof row.bufferMinutes === "number" &&
              Number.isInteger(row.bufferMinutes) &&
              row.bufferMinutes >= 0
            ? row.bufferMinutes
            : 0
        : 0;
    const rowEnd = rowStart + rowDuration + resolvedRowBuffer;
    return candidateStart < rowEnd && rowStart < candidateEnd;
  });
}

/** Check whether HH:mm falls inside staff weekly window. */
export function isTimeWithinStaffAvailability(input: {
  startTime: string;
  endTime: string;
  slotTime: string;
}): boolean {
  const start = timeToMinutes(input.startTime);
  const end = timeToMinutes(input.endTime);
  const slot = timeToMinutes(input.slotTime);
  if ([start, end, slot].some((n) => Number.isNaN(n))) return false;
  return slot >= start && slot < end;
}

export function staffTimeOffBlocksSlot(input: {
  startTime: string | null;
  endTime: string | null;
  slotTime: string;
}): boolean {
  // Full-day off
  if (input.startTime == null && input.endTime == null) return true;
  if (input.startTime == null || input.endTime == null) return true;
  const start = timeToMinutes(input.startTime);
  const end = timeToMinutes(input.endTime);
  const slot = timeToMinutes(input.slotTime);
  if ([start, end, slot].some((n) => Number.isNaN(n))) return false;
  return slot >= start && slot < end;
}

export function formatStaffRole(role: string): string {
  if (role === "manager") return "Manager";
  if (role === "cleaner") return "Cleaner";
  return role;
}

/** Cookie used to distinguish staff Google login from customer Google login. */
export const STAFF_AUTH_PORTAL_COOKIE = "saskia_auth_portal";
export const STAFF_AUTH_PORTAL_VALUE = "staff";
