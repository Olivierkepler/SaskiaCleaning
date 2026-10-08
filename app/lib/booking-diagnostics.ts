export const BOOKING_DIAGNOSTIC_EVENTS = [
  "BOOKING_CAPACITY_QUERY_FAILED",
  "BOOKING_STAFF_CAPACITY_FAILED",
  "BOOKING_CLAIM_FAILED",
  "BOOKING_TRANSACTION_FAILED",
  "BOOKING_ASSIGNMENT_NOTIFICATION_FAILED",
  "BOOKING_REFERRAL_TRACKING_FAILED",
  "BOOKING_REQUEST_FAILED",
  "SCHEDULING_CAPACITY_QUERY_FAILED",
] as const;

export type BookingDiagnosticEvent =
  (typeof BOOKING_DIAGNOSTIC_EVENTS)[number];

export type BookingDiagnosticCategory =
  | "DATABASE"
  | "NETWORK"
  | "DATABASE_CLIENT"
  | "UNKNOWN"
  | "EMPTY_CLAIM_RESULT";

const NETWORK_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EPIPE",
]);

function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  const code = error.code;
  return typeof code === "string" ? code.toUpperCase() : null;
}

export function categorizeBookingFailure(
  error: unknown,
): Exclude<BookingDiagnosticCategory, "EMPTY_CLAIM_RESULT"> {
  const code = getErrorCode(error);
  if (code && /^[0-9A-Z]{5}$/.test(code)) return "DATABASE";
  if (code && NETWORK_ERROR_CODES.has(code)) return "NETWORK";

  if (typeof error === "object" && error !== null && "name" in error) {
    const name = error.name;
    if (name === "NeonDbError" || name === "PostgresError") {
      return "DATABASE_CLIENT";
    }
  }

  return "UNKNOWN";
}

export function createBookingDiagnostic(
  event: BookingDiagnosticEvent,
  category: BookingDiagnosticCategory,
): { event: BookingDiagnosticEvent; category: BookingDiagnosticCategory } {
  return { event, category };
}

export function logBookingDiagnostic(
  event: BookingDiagnosticEvent,
  error: unknown,
): void {
  logBookingDiagnosticCategory(event, categorizeBookingFailure(error));
}

export function logBookingDiagnosticCategory(
  event: BookingDiagnosticEvent,
  category: BookingDiagnosticCategory,
): void {
  console.error(JSON.stringify(createBookingDiagnostic(event, category)));
}

/**
 * Notification lookup/delivery happens after persistence and must not turn a
 * successful booking into an error response.
 */
export async function runBookingNotificationSafely(
  operation: () => Promise<void>,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    logBookingDiagnostic("BOOKING_ASSIGNMENT_NOTIFICATION_FAILED", error);
  }
}
