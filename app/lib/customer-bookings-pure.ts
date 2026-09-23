/**
 * Pure helpers for customer booking presentation & classification.
 * No DB / Next imports — safe for unit tests.
 */

import {
  BOOKING_STATUS_LABELS,
  isBookingStatus,
  type BookingStatus,
} from "@/app/lib/booking-status";
import {
  formatBookingTime,
  getZonedDateParts,
  parseBookingTime,
  SASKIA_TIME_ZONE,
} from "@/app/lib/scheduling-pure";

export { formatBookingTime, parseBookingTime };

export type CustomerBookingStatus = BookingStatus;

/** Customer-facing labels (DB values unchanged). */
export const CUSTOMER_BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Received",
  contacted: "Contacted",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const CUSTOMER_BOOKING_STATUS_BADGE_CLASS: Record<BookingStatus, string> =
  {
    new: "bg-sky-100 text-sky-800 border-sky-200",
    contacted: "bg-violet-100 text-violet-800 border-violet-200",
    scheduled: "bg-amber-100 text-amber-800 border-amber-200",
    in_progress: "bg-orange-100 text-orange-800 border-orange-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  };

export function formatCustomerBookingStatus(status: string): string {
  if (isBookingStatus(status)) {
    return CUSTOMER_BOOKING_STATUS_LABELS[status];
  }
  return BOOKING_STATUS_LABELS[status as BookingStatus] ?? status;
}

export function getCustomerBookingStatusBadgeClass(status: string): string {
  if (isBookingStatus(status)) {
    return CUSTOMER_BOOKING_STATUS_BADGE_CLASS[status];
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
}

/** Parse booking_date (DATE) as YYYY-MM-DD without timezone shift. */
export function parseBookingDateOnly(
  date: string | Date | null | undefined,
): string | null {
  if (date == null || date === "") return null;
  const dateOnly =
    date instanceof Date
      ? date.toISOString().slice(0, 10)
      : String(date).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
  return dateOnly;
}

export function formatCustomerBookingDate(
  date: string | Date | null | undefined,
): string {
  const dateOnly = parseBookingDateOnly(date);
  if (!dateOnly) return "Date TBD";

  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatUsdAmount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCustomerEstimate(
  low: number | null | undefined,
  mid: number | null | undefined,
  high: number | null | undefined,
): string {
  if (mid != null) return formatUsdAmount(mid);
  if (low != null && high != null) {
    return `${formatUsdAmount(low)}–${formatUsdAmount(high)}`;
  }
  if (low != null) return formatUsdAmount(low);
  if (high != null) return formatUsdAmount(high);
  return "Estimate TBD";
}

export function normalizeBookingExtras(extras: unknown): string[] {
  if (!extras) return [];
  if (Array.isArray(extras)) return extras.map(String);
  if (typeof extras === "string") {
    try {
      const parsed = JSON.parse(extras) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : extras ? [extras] : [];
    } catch {
      return extras ? [extras] : [];
    }
  }
  return [];
}

/**
 * Upcoming vs past using booking_date (date-only) and terminal statuses.
 * - completed / cancelled → past
 * - booking_date < today (business timezone) → past
 * - otherwise → upcoming (includes requests with no date yet)
 */
export function isPastCustomerBooking(input: {
  status: string;
  booking_date: string | Date | null | undefined;
  now?: Date;
}): boolean {
  if (input.status === "completed" || input.status === "cancelled") {
    return true;
  }

  const dateOnly = parseBookingDateOnly(input.booking_date);
  if (!dateOnly) return false;

  const now = input.now ?? new Date();
  const today = getZonedDateParts(now, SASKIA_TIME_ZONE).dateOnly;
  return dateOnly < today;
}

export function formatCustomerBookingDateTime(
  date: string | Date | null | undefined,
  time: string | null | undefined,
): string {
  const dateLabel = formatCustomerBookingDate(date);
  const timeLabel = formatBookingTime(time);
  if (dateLabel === "Date TBD") return dateLabel;
  return `${dateLabel} · ${timeLabel}`;
}

export function partitionCustomerBookings<
  T extends { status: string; booking_date: string | Date | null | undefined },
>(bookings: T[], now?: Date): { upcoming: T[]; past: T[] } {
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const booking of bookings) {
    if (isPastCustomerBooking({ ...booking, now })) {
      past.push(booking);
    } else {
      upcoming.push(booking);
    }
  }

  return { upcoming, past };
}

/** Book Again must never create a booking by itself — navigation only. */
export function buildBookAgainHref(input?: {
  service?: string | null;
}): string {
  // Prefill deferred — estimator does not accept safe query prefill yet.
  void input;
  return "/#quote";
}
