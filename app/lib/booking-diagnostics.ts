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

export const BOOKING_CAPACITY_DIAGNOSTIC_STAGES = {
  PREFLIGHT: "PREFLIGHT_CAPACITY_CHECK",
  TRANSACTION_RECHECK: "TRANSACTION_CAPACITY_RECHECK",
} as const;

export type BookingCapacityDiagnosticStage =
  (typeof BOOKING_CAPACITY_DIAGNOSTIC_STAGES)[keyof typeof BOOKING_CAPACITY_DIAGNOSTIC_STAGES];

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

const SQLSTATE_PATTERN = /^[0-9A-Z]{5}$/;

type ErrorFacts = {
  sqlState: string;
  networkFailure: boolean;
  databaseClientFailure: boolean;
};

function inspectError(error: unknown): ErrorFacts {
  const seen = new Set<object>();
  let current: unknown = error;
  let sqlState = "UNKNOWN";
  let networkFailure = false;
  let databaseClientFailure = false;

  // Drivers may wrap Postgres errors in one or more `cause` values. Bound the
  // walk and guard cycles so diagnostics cannot fail while inspecting errors.
  for (let depth = 0; depth < 8; depth += 1) {
    if (typeof current !== "object" || current === null || seen.has(current)) {
      break;
    }
    seen.add(current);

    let code: unknown;
    let name: unknown;
    let cause: unknown;
    try {
      code = "code" in current ? current.code : undefined;
      name = "name" in current ? current.name : undefined;
      cause = "cause" in current ? current.cause : undefined;
    } catch {
      // Ignore hostile/custom property accessors; never log their details.
      break;
    }

    if (typeof code === "string") {
      const normalizedCode = code.toUpperCase();
      if (sqlState === "UNKNOWN" && SQLSTATE_PATTERN.test(normalizedCode)) {
        sqlState = normalizedCode;
      }
      if (NETWORK_ERROR_CODES.has(normalizedCode)) networkFailure = true;
    }
    if (name === "NeonDbError" || name === "PostgresError") {
      databaseClientFailure = true;
    }

    current = cause;
  }

  return { sqlState, networkFailure, databaseClientFailure };
}

export function categorizeBookingFailure(
  error: unknown,
): Exclude<BookingDiagnosticCategory, "EMPTY_CLAIM_RESULT"> {
  const facts = inspectError(error);
  if (facts.sqlState !== "UNKNOWN") return "DATABASE";
  if (facts.networkFailure) return "NETWORK";
  if (facts.databaseClientFailure) return "DATABASE_CLIENT";

  return "UNKNOWN";
}

export function createBookingDiagnostic(
  event: BookingDiagnosticEvent,
  category: BookingDiagnosticCategory,
  details: {
    stage?: BookingCapacityDiagnosticStage;
    sqlState?: unknown;
  } = {},
): {
  event: BookingDiagnosticEvent;
  category: BookingDiagnosticCategory;
  sqlState: string;
  stage?: BookingCapacityDiagnosticStage;
} {
  const code =
    typeof details.sqlState === "string" ? details.sqlState.toUpperCase() : "";
  return {
    event,
    category,
    sqlState: SQLSTATE_PATTERN.test(code) ? code : "UNKNOWN",
    ...(details.stage ? { stage: details.stage } : {}),
  };
}

export function logBookingDiagnostic(
  event: BookingDiagnosticEvent,
  error: unknown,
  stage?: BookingCapacityDiagnosticStage,
): void {
  const facts = inspectError(error);
  logBookingDiagnosticCategory(event, categorizeBookingFailure(error), {
    stage,
    sqlState: facts.sqlState,
  });
}

export function logBookingDiagnosticCategory(
  event: BookingDiagnosticEvent,
  category: BookingDiagnosticCategory,
  details: {
    stage?: BookingCapacityDiagnosticStage;
    sqlState?: unknown;
  } = {},
): void {
  console.error(JSON.stringify(createBookingDiagnostic(event, category, details)));
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
