/**
 * Pure travel/handoff buffer helpers — Phase 11.10.
 * POST-JOB buffer only. No distance / GPS / routing.
 * Safe for unit tests (no DB / Next imports).
 */

import {
  getBookingWindow,
  type BookingWindow,
} from "@/app/lib/booking-duration-pure";
import { parseBookingTime } from "@/app/lib/scheduling-pure";

/**
 * Architecture seed / fallback only — admin-editable via scheduling_settings.
 * NOT a claimed historic business SLA.
 */
export const DEFAULT_JOB_BUFFER_MINUTES = 30;
export const MAX_JOB_BUFFER_MINUTES = 180;
export const MIN_JOB_BUFFER_MINUTES = 0;

/** When a future booking has NULL buffer_minutes, use this for capacity math. */
export const LEGACY_BUFFER_FALLBACK_MINUTES = DEFAULT_JOB_BUFFER_MINUTES;

export type NormalizeBufferResult =
  | { ok: true; minutes: number }
  | { ok: false; error: string };

export function normalizeBufferMinutes(
  value: unknown,
): NormalizeBufferResult {
  if (value == null || value === "") {
    return { ok: false, error: "Buffer minutes are required." };
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n)) {
    return { ok: false, error: "Buffer must be a whole number of minutes." };
  }
  if (n < MIN_JOB_BUFFER_MINUTES) {
    return { ok: false, error: "Buffer cannot be negative." };
  }
  if (n > MAX_JOB_BUFFER_MINUTES) {
    return {
      ok: false,
      error: `Buffer cannot exceed ${MAX_JOB_BUFFER_MINUTES} minutes.`,
    };
  }
  return { ok: true, minutes: n };
}

/** Resolve buffer for capacity: snapshot first, else documented fallback. */
export function resolveEffectiveBufferMinutes(
  stored: number | null | undefined,
): number {
  if (
    typeof stored === "number" &&
    Number.isInteger(stored) &&
    stored >= MIN_JOB_BUFFER_MINUTES &&
    stored <= MAX_JOB_BUFFER_MINUTES
  ) {
    return stored;
  }
  return LEGACY_BUFFER_FALLBACK_MINUTES;
}

export type CapacityWindow = BookingWindow & {
  /** Post-job buffer minutes included in capacity end. */
  bufferMinutes: number;
  /** Exclusive service end (before buffer). */
  serviceEndMinutes: number;
  serviceEndUtc: Date;
};

/**
 * Capacity window = service start → service end + post-job buffer.
 * Half-open [capacityStart, capacityEnd).
 *
 * Service window itself is unchanged (duration_minutes only).
 * Buffer may extend past business close; same-calendar-day only.
 */
export function getCapacityWindow(input: {
  dateOnly: string;
  startTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  timeZone?: string;
}): CapacityWindow | null {
  const buffer = normalizeBufferMinutes(input.bufferMinutes);
  if (!buffer.ok) return null;

  const service = getBookingWindow({
    dateOnly: input.dateOnly,
    startTime: input.startTime,
    durationMinutes: input.durationMinutes,
    timeZone: input.timeZone,
  });
  if (!service) return null;

  const capacityEndMinutes = service.endMinutes + buffer.minutes;
  if (capacityEndMinutes > 24 * 60) return null;

  const capacityEndUtc = new Date(
    service.windowStartUtc.getTime() +
      (service.durationMinutes + buffer.minutes) * 60_000,
  );

  return {
    ...service,
    bufferMinutes: buffer.minutes,
    serviceEndMinutes: service.endMinutes,
    serviceEndUtc: service.windowEndUtc,
    endMinutes: capacityEndMinutes,
    endTime: minutesToHhMm(capacityEndMinutes % (24 * 60)),
    windowEndUtc: capacityEndUtc,
  };
}

function minutesToHhMm(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Format reserved-until for admin/staff ops (not customer-facing). */
export function formatReservedUntil(
  startTime: string | null | undefined,
  durationMinutes: number | null | undefined,
  bufferMinutes: number | null | undefined,
): string | null {
  const start = parseBookingTime(startTime ?? null);
  if (!start) return null;
  if (durationMinutes == null) return null;
  const capacity = getCapacityWindow({
    dateOnly: "2000-01-01",
    startTime: start,
    durationMinutes,
    bufferMinutes: resolveEffectiveBufferMinutes(bufferMinutes),
  });
  if (!capacity) return null;
  return capacity.endTime;
}
