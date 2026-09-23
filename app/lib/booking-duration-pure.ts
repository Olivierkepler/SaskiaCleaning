/**
 * Pure booking duration + overlap helpers for Phase 11.9.
 * No DB / Next imports — safe for unit tests.
 */

import {
  SASKIA_TIME_ZONE,
  formatBookingTime,
  getZonedDateParts,
  parseBookingTime,
  timeToMinutes,
  minutesToTime,
} from "@/app/lib/scheduling-pure";

/** Hard ceiling for a single visit (12 hours). */
export const MAX_DURATION_MINUTES = 720;

/**
 * Conservative fallback when a FUTURE active booking has null duration_minutes.
 * Documented — not a silent invent of historical truth. Used only for
 * conflict/capacity evaluation so null durations cannot create overbooking holes.
 */
export const LEGACY_DURATION_FALLBACK_MINUTES = 120;

export type ServiceDurationRule = {
  serviceKey: string;
  durationMinutes: number;
};

export type BookingWindow = {
  dateOnly: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  /** Inclusive start as minutes from local midnight. */
  startMinutes: number;
  /** Exclusive end as minutes from local midnight. */
  endMinutes: number;
  /** UTC instants for DB exclusion ranges. */
  windowStartUtc: Date;
  windowEndUtc: Date;
};

/**
 * Convert America/New_York (or other IANA) local date+time to a UTC Date.
 */
export function zonedLocalDateTimeToUtc(
  dateOnly: string,
  timeHhmm: string,
  timeZone: string = SASKIA_TIME_ZONE,
): Date {
  const time = parseBookingTime(timeHhmm);
  if (!time) throw new Error("Invalid time");
  const [y, m, d] = dateOnly.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  // Iteratively correct UTC guess so zoned parts match desired local wall time.
  let utcMs = Date.UTC(y, m - 1, d, hh, mm, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  for (let i = 0; i < 4; i++) {
    const parts = formatter.formatToParts(new Date(utcMs));
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "0";
    let hour = Number(get("hour"));
    if (hour === 24) hour = 0;
    const asUtc = Date.UTC(
      Number(get("year")),
      Number(get("month")) - 1,
      Number(get("day")),
      hour,
      Number(get("minute")),
      Number(get("second")),
    );
    const desired = Date.UTC(y, m - 1, d, hh, mm, 0);
    utcMs += desired - asUtc;
  }
  return new Date(utcMs);
}

export function normalizeDurationMinutes(
  value: unknown,
): { ok: true; minutes: number } | { ok: false; error: string } {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return { ok: false, error: "Duration must be a positive whole number of minutes." };
  }
  if (n > MAX_DURATION_MINUTES) {
    return {
      ok: false,
      error: `Duration cannot exceed ${MAX_DURATION_MINUTES} minutes.`,
    };
  }
  return { ok: true, minutes: n };
}

/**
 * Server-side duration from configured rules + service key.
 * Does not invent per-bedroom/extra timing unless rules encode it.
 * Frequency is intentionally ignored.
 */
export function calculateBookingDuration(input: {
  service: string | null | undefined;
  rules: ServiceDurationRule[];
  /** Ignored for Phase 11.9 simple model — reserved for future rule fields. */
  bedrooms?: number | null;
  bathrooms?: number | null;
  extras?: unknown;
}): { ok: true; minutes: number; serviceKey: string } | { ok: false; error: string } {
  void input.bedrooms;
  void input.bathrooms;
  void input.extras;

  const serviceKey =
    typeof input.service === "string" ? input.service.trim() : "";
  if (!serviceKey) {
    return { ok: false, error: "A service type is required to schedule duration." };
  }

  const match = input.rules.find(
    (r) => r.serviceKey.toLowerCase() === serviceKey.toLowerCase(),
  );
  if (!match) {
    return {
      ok: false,
      error: "No duration rule configured for this service. Please contact Saskia.",
    };
  }
  const normalized = normalizeDurationMinutes(match.durationMinutes);
  if (!normalized.ok) return normalized;
  return { ok: true, minutes: normalized.minutes, serviceKey: match.serviceKey };
}

/** Resolve duration for conflict checks: snapshot first, else documented fallback. */
export function resolveEffectiveDurationMinutes(
  stored: number | null | undefined,
): number {
  if (
    typeof stored === "number" &&
    Number.isInteger(stored) &&
    stored > 0 &&
    stored <= MAX_DURATION_MINUTES
  ) {
    return stored;
  }
  return LEGACY_DURATION_FALLBACK_MINUTES;
}

export function getBookingWindow(input: {
  dateOnly: string;
  startTime: string;
  durationMinutes: number;
  timeZone?: string;
}): BookingWindow | null {
  const time = parseBookingTime(input.startTime);
  if (!time) return null;
  const duration = normalizeDurationMinutes(input.durationMinutes);
  if (!duration.ok) return null;

  const startMinutes = timeToMinutes(time);
  if (Number.isNaN(startMinutes)) return null;
  const endMinutes = startMinutes + duration.minutes;
  // Same-calendar-day visits only in Phase 11.9.
  if (endMinutes > 24 * 60) return null;

  const timeZone = input.timeZone ?? SASKIA_TIME_ZONE;
  const windowStartUtc = zonedLocalDateTimeToUtc(input.dateOnly, time, timeZone);
  const windowEndUtc = new Date(
    windowStartUtc.getTime() + duration.minutes * 60_000,
  );

  return {
    dateOnly: input.dateOnly,
    startTime: time,
    endTime: minutesToTime(endMinutes % (24 * 60)),
    durationMinutes: duration.minutes,
    startMinutes,
    endMinutes,
    windowStartUtc,
    windowEndUtc,
  };
}

export function getBookingStart(window: BookingWindow): Date {
  return window.windowStartUtc;
}

export function getBookingEnd(window: BookingWindow): Date {
  return window.windowEndUtc;
}

/** Half-open interval overlap: [aStart, aEnd) ∩ [bStart, bEnd) ≠ ∅ */
export function windowsOverlapMinutes(
  a: { startMinutes: number; endMinutes: number },
  b: { startMinutes: number; endMinutes: number },
): boolean {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

export function windowsOverlapUtc(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date },
): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

/** Business hours must contain the full [start, end) window. */
export function bookingFitsBusinessHours(input: {
  window: BookingWindow;
  businessStartTime: string;
  businessEndTime: string;
}): boolean {
  const bizStart = timeToMinutes(input.businessStartTime);
  const bizEnd = timeToMinutes(input.businessEndTime);
  if ([bizStart, bizEnd].some((n) => Number.isNaN(n))) return false;
  return (
    input.window.startMinutes >= bizStart &&
    input.window.endMinutes <= bizEnd
  );
}

/** Scheduling block overlaps booking window (full-day or partial). */
export function schedulingBlockOverlapsWindow(input: {
  blockStartTime: string | null;
  blockEndTime: string | null;
  window: BookingWindow;
}): boolean {
  // Full-day block
  if (input.blockStartTime == null && input.blockEndTime == null) return true;
  if (input.blockStartTime == null || input.blockEndTime == null) return true;
  const blockStart = timeToMinutes(input.blockStartTime);
  const blockEnd = timeToMinutes(input.blockEndTime);
  if ([blockStart, blockEnd].some((n) => Number.isNaN(n))) return false;
  return windowsOverlapMinutes(
    { startMinutes: input.window.startMinutes, endMinutes: input.window.endMinutes },
    { startMinutes: blockStart, endMinutes: blockEnd },
  );
}

/** Staff weekly availability must cover the full booking window. */
export function staffAvailabilityCoversWindow(input: {
  availStartTime: string;
  availEndTime: string;
  window: BookingWindow;
}): boolean {
  const start = timeToMinutes(input.availStartTime);
  const end = timeToMinutes(input.availEndTime);
  if ([start, end].some((n) => Number.isNaN(n))) return false;
  return (
    input.window.startMinutes >= start && input.window.endMinutes <= end
  );
}

/** Staff time off overlaps booking window (full-day or partial). */
export function staffTimeOffOverlapsWindow(input: {
  offStartTime: string | null;
  offEndTime: string | null;
  window: BookingWindow;
}): boolean {
  if (input.offStartTime == null && input.offEndTime == null) return true;
  if (input.offStartTime == null || input.offEndTime == null) return true;
  const offStart = timeToMinutes(input.offStartTime);
  const offEnd = timeToMinutes(input.offEndTime);
  if ([offStart, offEnd].some((n) => Number.isNaN(n))) return false;
  return windowsOverlapMinutes(
    { startMinutes: input.window.startMinutes, endMinutes: input.window.endMinutes },
    { startMinutes: offStart, endMinutes: offEnd },
  );
}

export function formatEstimatedDuration(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) {
    return "Duration not specified";
  }
  if (minutes < 60) return `About ${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? "About 1 hour" : `About ${hours} hours`;
  }
  const whole = Math.floor(hours);
  const rem = minutes % 60;
  if (whole === 0) return `About ${rem} min`;
  return `About ${whole} hr ${rem} min`;
}

export function formatBookingTimeRange(
  startTime: string | null | undefined,
  durationMinutes: number | null | undefined,
): string {
  const start = parseBookingTime(startTime ?? null);
  if (!start) return "Time not specified";
  const effective = resolveEffectiveDurationMinutes(durationMinutes ?? null);
  if (durationMinutes == null) {
    return `${formatBookingTime(start)} · ${formatEstimatedDuration(null)}`;
  }
  const window = getBookingWindow({
    dateOnly: "2000-01-01",
    startTime: start,
    durationMinutes: effective,
  });
  if (!window) return formatBookingTime(start);
  return `${formatBookingTime(window.startTime)}–${formatBookingTime(window.endTime)}`;
}

/** Display helper that avoids claiming exact completion for customers. */
export function formatCustomerDurationLabel(
  durationMinutes: number | null | undefined,
): string | null {
  if (durationMinutes == null) return null;
  return formatEstimatedDuration(durationMinutes);
}

export function verifyZonedRoundTrip(
  dateOnly: string,
  time: string,
  timeZone: string = SASKIA_TIME_ZONE,
): boolean {
  const utc = zonedLocalDateTimeToUtc(dateOnly, time, timeZone);
  const parts = getZonedDateParts(utc, timeZone);
  return (
    parts.dateOnly === dateOnly &&
    `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}` ===
      parseBookingTime(time)
  );
}
