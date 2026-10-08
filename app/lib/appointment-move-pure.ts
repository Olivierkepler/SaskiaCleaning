import {
  isValidBookingDateOnly,
  parseBookingTime,
} from "@/app/lib/scheduling-pure";
import {
  resolveEffectiveDurationMinutes,
} from "@/app/lib/booking-duration-pure";
import {
  getCapacityWindow,
  resolveEffectiveBufferMinutes,
  type CapacityWindow,
} from "@/app/lib/booking-buffer-pure";
import { hasOverlappingStaffConflict } from "@/app/lib/staff-pure";
import { windowsOverlapMinutes } from "@/app/lib/booking-duration-pure";
import { timeToMinutes } from "@/app/lib/scheduling-pure";

export type AppointmentMoveFailure =
  | "NOT_FOUND"
  | "INVALID_APPOINTMENT"
  | "BLOCKED_TIME"
  | "NO_CAPACITY"
  | "STAFF_UNAVAILABLE"
  | "STAFF_TIME_OFF"
  | "ASSIGNMENT_OVERLAP"
  | "TRAVEL_BUFFER_CONFLICT"
  | "STALE_ASSIGNMENT"
  | "CONCURRENT_CONFLICT"
  | "PERSISTENCE_FAILURE";

export type AppointmentMoveResult =
  | {
      ok: true;
      bookingId: number;
      bookingDate: string;
      bookingTime: string;
      assigned: boolean;
      changed: boolean;
    }
  | { ok: false; reason: AppointmentMoveFailure };

export function mapAppointmentMoveFailure(reason: AppointmentMoveFailure): {
  status: 400 | 404 | 409 | 500;
  error: string;
} {
  switch (reason) {
    case "INVALID_APPOINTMENT": return { status: 400, error: "Choose a valid appointment date and time." };
    case "NOT_FOUND": return { status: 404, error: "Booking not found." };
    case "BLOCKED_TIME": return { status: 409, error: "This time is blocked for scheduling." };
    case "NO_CAPACITY": return { status: 409, error: "No cleaning team is available for this appointment." };
    case "STAFF_UNAVAILABLE": return { status: 409, error: "The assigned cleaner is not available at this time." };
    case "STAFF_TIME_OFF": return { status: 409, error: "The assigned cleaner is unavailable on this date." };
    case "ASSIGNMENT_OVERLAP": return { status: 409, error: "The assigned cleaner already has another booking at this time." };
    case "TRAVEL_BUFFER_CONFLICT": return { status: 409, error: "This appointment is too close to another assigned booking." };
    case "STALE_ASSIGNMENT": return { status: 409, error: "The assignment changed while you were editing. Review the booking and try again." };
    case "CONCURRENT_CONFLICT": return { status: 409, error: "The schedule changed while you were editing. Review the booking and try again." };
    case "PERSISTENCE_FAILURE": return { status: 500, error: "The appointment could not be saved." };
  }
}

export type AppointmentMoveInput = {
  bookingId: unknown;
  bookingDate: unknown;
  bookingTime: unknown;
};

export type AppointmentMoveBooking = {
  id: number;
  bookingDate: string | null;
  bookingTime: string | null;
  durationMinutes: number | null;
  bufferMinutes: number | null;
  status: string;
};

export type ActiveAppointmentAssignment = {
  id: string;
  staffId: string;
};

export type MoveAssignmentRow = {
  bookingId: number;
  bookingDate: string | null;
  bookingTime: string | null;
  durationMinutes: number | null;
  bufferMinutes: number | null;
  status: string;
};

export type AppointmentMoveDependencies = {
  loadBookingForUpdate: (bookingId: number) => Promise<AppointmentMoveBooking | null>;
  loadAssignmentForUpdate: (bookingId: number) => Promise<ActiveAppointmentAssignment | null>;
  validateSchedulingWindow: (input: {
    bookingDate: string;
    bookingTime: string;
    window: CapacityWindow;
  }) => Promise<{ ok: true } | { ok: false; reason: "INVALID_APPOINTMENT" | "BLOCKED_TIME" | "PERSISTENCE_FAILURE" }>;
  validateAssignedCleaner: (input: {
    bookingId: number;
    assignment: ActiveAppointmentAssignment;
    bookingDate: string;
    bookingTime: string;
    window: CapacityWindow;
  }) => Promise<{ ok: true } | { ok: false; reason: "STAFF_UNAVAILABLE" | "STAFF_TIME_OFF" | "ASSIGNMENT_OVERLAP" | "TRAVEL_BUFFER_CONFLICT" | "PERSISTENCE_FAILURE" }>;
  hasCapacity: (input: {
    bookingDate: string;
    bookingTime: string;
    window: CapacityWindow;
  }) => Promise<boolean>;
  persistMove: (input: {
    booking: AppointmentMoveBooking;
    assignment: ActiveAppointmentAssignment | null;
    bookingDate: string;
    bookingTime: string;
    window: CapacityWindow;
  }) => Promise<"UPDATED" | "STALE_BOOKING" | "STALE_ASSIGNMENT">;
};

export function validateAppointmentMoveInput(input: AppointmentMoveInput):
  | { ok: true; bookingId: number; bookingDate: string; bookingTime: string }
  | { ok: false; reason: "INVALID_APPOINTMENT" } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "INVALID_APPOINTMENT" };
  }
  const allowedKeys = new Set(["bookingId", "bookingDate", "bookingTime"]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    return { ok: false, reason: "INVALID_APPOINTMENT" };
  }
  if (!Number.isSafeInteger(input.bookingId) || Number(input.bookingId) <= 0) {
    return { ok: false, reason: "INVALID_APPOINTMENT" };
  }
  if (!isValidBookingDateOnly(input.bookingDate)) {
    return { ok: false, reason: "INVALID_APPOINTMENT" };
  }
  if (
    typeof input.bookingTime !== "string" ||
    !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(input.bookingTime.trim())
  ) {
    return { ok: false, reason: "INVALID_APPOINTMENT" };
  }
  const bookingTime = parseBookingTime(input.bookingTime.trim());
  if (!bookingTime) return { ok: false, reason: "INVALID_APPOINTMENT" };
  return {
    ok: true,
    bookingId: Number(input.bookingId),
    bookingDate: input.bookingDate,
    bookingTime,
  };
}

export async function executeAppointmentMove(
  input: AppointmentMoveInput,
  dependencies: AppointmentMoveDependencies,
): Promise<AppointmentMoveResult> {
  const parsed = validateAppointmentMoveInput(input);
  if (!parsed.ok) return parsed;

  const booking = await dependencies.loadBookingForUpdate(parsed.bookingId);
  if (!booking) return { ok: false, reason: "NOT_FOUND" };

  const assignment = await dependencies.loadAssignmentForUpdate(parsed.bookingId);
  const currentDate = booking.bookingDate;
  const currentTime = booking.bookingTime == null
    ? null
    : parseBookingTime(booking.bookingTime);

  if (currentDate === parsed.bookingDate && currentTime === parsed.bookingTime) {
    return {
      ok: true,
      bookingId: parsed.bookingId,
      bookingDate: parsed.bookingDate,
      bookingTime: parsed.bookingTime,
      assigned: assignment !== null,
      changed: false,
    };
  }
  if (booking.status === "cancelled") {
    return { ok: false, reason: "INVALID_APPOINTMENT" };
  }

  const durationMinutes = resolveEffectiveDurationMinutes(booking.durationMinutes);
  const bufferMinutes = resolveEffectiveBufferMinutes(booking.bufferMinutes);
  const window = getCapacityWindow({
    dateOnly: parsed.bookingDate,
    startTime: parsed.bookingTime,
    durationMinutes,
    bufferMinutes,
  });
  if (!window) return { ok: false, reason: "INVALID_APPOINTMENT" };

  const scheduling = await dependencies.validateSchedulingWindow({
    bookingDate: parsed.bookingDate,
    bookingTime: parsed.bookingTime,
    window,
  });
  if (!scheduling.ok) return { ok: false, reason: scheduling.reason };

  if (assignment) {
    const cleaner = await dependencies.validateAssignedCleaner({
      bookingId: parsed.bookingId,
      assignment,
      bookingDate: parsed.bookingDate,
      bookingTime: parsed.bookingTime,
      window,
    });
    if (!cleaner.ok) return { ok: false, reason: cleaner.reason };
  } else if (!(await dependencies.hasCapacity({
    bookingDate: parsed.bookingDate,
    bookingTime: parsed.bookingTime,
    window,
  }))) {
    return { ok: false, reason: "NO_CAPACITY" };
  }

  const persisted = await dependencies.persistMove({
    booking,
    assignment,
    bookingDate: parsed.bookingDate,
    bookingTime: parsed.bookingTime,
    window,
  });
  if (persisted === "STALE_BOOKING") {
    return { ok: false, reason: "CONCURRENT_CONFLICT" };
  }
  if (persisted === "STALE_ASSIGNMENT") {
    return { ok: false, reason: "STALE_ASSIGNMENT" };
  }
  return {
    ok: true,
    bookingId: parsed.bookingId,
    bookingDate: parsed.bookingDate,
    bookingTime: parsed.bookingTime,
    assigned: assignment !== null,
    changed: true,
  };
}

export function classifyAssignmentConflict(input: {
  bookingId: number;
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  existingAssignments: MoveAssignmentRow[];
}): "ASSIGNMENT_OVERLAP" | "TRAVEL_BUFFER_CONFLICT" | null {
  const candidateStart = timeToMinutes(input.bookingTime);
  const candidateServiceEnd = candidateStart + input.durationMinutes;
  const candidateCapacityEnd = candidateServiceEnd + input.bufferMinutes;
  if ([candidateStart, candidateServiceEnd, candidateCapacityEnd].some(Number.isNaN)) {
    return "ASSIGNMENT_OVERLAP";
  }

  const hasConflict = hasOverlappingStaffConflict({
    existingAssignments: input.existingAssignments,
    candidateBookingId: input.bookingId,
    candidateDate: input.bookingDate,
    candidateTime: input.bookingTime,
    candidateDurationMinutes: input.durationMinutes,
    candidateBufferMinutes: input.bufferMinutes,
  });
  if (!hasConflict) return null;

  const isServiceOverlap = input.existingAssignments.some((row) => {
    if (row.bookingId === input.bookingId || row.bookingDate !== input.bookingDate) return false;
    if (!["new", "contacted", "scheduled", "in_progress", "completed"].includes(row.status)) return false;
    const start = row.bookingTime == null ? NaN : timeToMinutes(row.bookingTime);
    if (Number.isNaN(start)) return false;
    const end = start + (row.durationMinutes && row.durationMinutes > 0 ? row.durationMinutes : 120);
    return windowsOverlapMinutes(
      { startMinutes: candidateStart, endMinutes: candidateServiceEnd },
      { startMinutes: start, endMinutes: end },
    );
  });
  return isServiceOverlap ? "ASSIGNMENT_OVERLAP" : "TRAVEL_BUFFER_CONFLICT";
}

export function createTransactionBoundAppointmentMove(
  withTransaction: <T>(operation: () => Promise<T>) => Promise<T>,
  execute: (input: AppointmentMoveInput) => Promise<AppointmentMoveResult>,
): (input: AppointmentMoveInput) => Promise<AppointmentMoveResult> {
  return (input) => withTransaction(() => execute(input));
}
