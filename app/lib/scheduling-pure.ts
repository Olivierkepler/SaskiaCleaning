/**
 * Pure scheduling helpers for Phase 11.6.
 * No DB / Next imports — safe for unit tests.
 */

/** Business timezone for all Saskia scheduling (MA/RI service area). */
export const SASKIA_TIME_ZONE = "America/New_York" as const;

/**
 * Same-day bookings allowed when the slot is still in the future.
 * Not a restrictive lead-time invent — past slots are simply excluded.
 * Raise this later via admin settings if needed.
 */
export const MINIMUM_LEAD_MINUTES = 0;

export const CAPACITY_CONSUMING_STATUSES = [
  "new",
  "contacted",
  "scheduled",
  "in_progress",
  // Completed keeps capacity until soft-release (cancel) so early finish
  // does not free the buffered handoff window (Phase 11.10).
  "completed",
] as const;

export type CapacityConsumingStatus =
  (typeof CAPACITY_CONSUMING_STATUSES)[number];

export function isCapacityConsumingStatus(status: string): boolean {
  return (CAPACITY_CONSUMING_STATUSES as readonly string[]).includes(status);
}

export type WeeklyAvailability = {
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string; // HH:mm
  endTime: string;
  slotIntervalMinutes: number;
  isActive: boolean;
};

export type SchedulingBlock = {
  blockDate: string; // YYYY-MM-DD
  startTime: string | null; // null + null end = full day
  endTime: string | null;
};

export type AvailableSlot = {
  time: string; // HH:mm canonical
  label: string; // 9:00 AM
};

/** Normalize Postgres TIME / client values to HH:mm. */
export function parseBookingTime(
  value: string | null | undefined,
): string | null {
  if (value == null || value === "") return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function isValidBookingTime(value: unknown): value is string {
  return typeof value === "string" && parseBookingTime(value) !== null;
}

export function formatBookingTime(
  value: string | null | undefined,
): string {
  const parsed = parseBookingTime(value);
  if (!parsed) return "Time not specified";
  const [h, m] = parsed.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function timeToMinutes(hhmm: string): number {
  const parsed = parseBookingTime(hhmm);
  if (!parsed) return NaN;
  const [h, m] = parsed.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number; // 0=Sun
  dateOnly: string;
};

/** Calendar parts in the business IANA timezone (DST-safe). */
export function getZonedDateParts(
  now: Date,
  timeZone: string = SASKIA_TIME_ZONE,
): ZonedDateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday");
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));

  return {
    year,
    month,
    day,
    hour,
    minute,
    dayOfWeek: weekdayMap[weekday] ?? 0,
    dateOnly: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

export function dayOfWeekForDateOnly(
  dateOnly: string,
  timeZone: string = SASKIA_TIME_ZONE,
): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
  // Noon UTC avoids DST edge ambiguities when reading weekday in US zones.
  const [y, m, d] = dateOnly.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return getZonedDateParts(probe, timeZone).dayOfWeek;
}

export function isValidBookingDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [y, m, d] = value.split("-").map(Number);
  const asUtc = new Date(Date.UTC(y, m - 1, d));
  return (
    asUtc.getUTCFullYear() === y &&
    asUtc.getUTCMonth() === m - 1 &&
    asUtc.getUTCDate() === d
  );
}

/** Past calendar days (business TZ) are not bookable. Today is allowed. */
export function isBookingDateInPast(
  dateOnly: string,
  now: Date = new Date(),
  timeZone: string = SASKIA_TIME_ZONE,
): boolean {
  const today = getZonedDateParts(now, timeZone).dateOnly;
  return dateOnly < today;
}

function blockOverlapsSlot(
  block: SchedulingBlock,
  slotStartMinutes: number,
  slotIntervalMinutes: number,
): boolean {
  // Full-day block
  if (block.startTime == null && block.endTime == null) return true;
  if (block.startTime == null || block.endTime == null) return true;

  const blockStart = timeToMinutes(block.startTime);
  const blockEnd = timeToMinutes(block.endTime);
  if (Number.isNaN(blockStart) || Number.isNaN(blockEnd)) return false;

  const slotEnd = slotStartMinutes + slotIntervalMinutes;
  // overlap if slot starts before block ends AND slot ends after block starts
  return slotStartMinutes < blockEnd && slotEnd > blockStart;
}

/**
 * Generate available HH:mm slots for a date.
 * Does not hit the database — pass resolved hours/blocks/occupied times.
 */
export function generateAvailableSlots(input: {
  dateOnly: string;
  weekly: WeeklyAvailability | null;
  blocks: SchedulingBlock[];
  occupiedTimes: string[];
  now?: Date;
  timeZone?: string;
  minimumLeadMinutes?: number;
  /** When rescheduling, ignore this booking's current time as occupied. */
  ignoreOccupiedTime?: string | null;
}): AvailableSlot[] {
  const {
    dateOnly,
    weekly,
    blocks,
    occupiedTimes,
    now = new Date(),
    timeZone = SASKIA_TIME_ZONE,
    minimumLeadMinutes = MINIMUM_LEAD_MINUTES,
    ignoreOccupiedTime = null,
  } = input;

  if (!isValidBookingDateOnly(dateOnly)) return [];
  if (isBookingDateInPast(dateOnly, now, timeZone)) return [];
  if (!weekly || !weekly.isActive) return [];

  const interval = weekly.slotIntervalMinutes;
  if (![15, 30, 60].includes(interval)) return [];

  const startMin = timeToMinutes(weekly.startTime);
  const endMin = timeToMinutes(weekly.endTime);
  if (
    Number.isNaN(startMin) ||
    Number.isNaN(endMin) ||
    startMin >= endMin
  ) {
    return [];
  }

  const dateBlocks = blocks.filter((b) => b.blockDate === dateOnly);
  // Full-day block short-circuit
  if (
    dateBlocks.some((b) => b.startTime == null && b.endTime == null)
  ) {
    return [];
  }

  const occupied = new Set(
    occupiedTimes
      .map((t) => parseBookingTime(t))
      .filter((t): t is string => Boolean(t)),
  );
  const ignore = parseBookingTime(ignoreOccupiedTime);
  if (ignore) occupied.delete(ignore);

  const zoned = getZonedDateParts(now, timeZone);
  const isToday = dateOnly === zoned.dateOnly;
  const nowMinutes = zoned.hour * 60 + zoned.minute;
  const earliestMinutes = isToday
    ? nowMinutes + minimumLeadMinutes
    : -Infinity;

  const slots: AvailableSlot[] = [];
  for (let cursor = startMin; cursor + interval <= endMin; cursor += interval) {
    const time = minutesToTime(cursor);
    if (cursor < earliestMinutes) continue;
    if (dateBlocks.some((b) => blockOverlapsSlot(b, cursor, interval))) {
      continue;
    }
    if (occupied.has(time)) continue;
    slots.push({ time, label: formatBookingTime(time) });
  }

  return slots;
}

export function isSlotInGeneratedList(
  slots: AvailableSlot[],
  time: string,
): boolean {
  const parsed = parseBookingTime(time);
  if (!parsed) return false;
  return slots.some((s) => s.time === parsed);
}

/** Conflict message when a slot was taken between select and submit. */
export const SLOT_CONFLICT_MESSAGE =
  "That time is no longer available. Please choose another time.";

export const SLOT_UNAVAILABLE_MESSAGE =
  "That time is not available. Please choose another available time.";

export const BOOKING_TIME_REQUIRED_MESSAGE =
  "Please select an available appointment time.";
