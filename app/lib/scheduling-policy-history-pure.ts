import { isValidBookingDateOnly, parseBookingTime } from "@/app/lib/scheduling-pure";

export type PolicyHistorySchemaState = "ABSENT" | "READY" | "PARTIAL";

export function classifyPolicyHistorySchema(tables: {
  state: boolean;
  revisions: boolean;
  validations: boolean;
}): PolicyHistorySchemaState {
  const present = Number(tables.state) + Number(tables.revisions) + Number(tables.validations);
  return present === 0 ? "ABSENT" : present === 3 ? "READY" : "PARTIAL";
}

export function requirePolicyRevisionForEnforcement(
  schemaState: PolicyHistorySchemaState,
  revision: string | null,
): string {
  if (schemaState !== "READY" || revision == null) {
    throw new Error("Scheduling policy history is not ready for enforcement.");
  }
  return revision;
}

export function nextPolicyRevision(current: string | number | bigint): string {
  let revision: bigint;
  try {
    revision = BigInt(current);
  } catch {
    throw new Error("Invalid scheduling policy revision.");
  }
  if (revision < BigInt(1)) throw new Error("Invalid scheduling policy revision.");
  return (revision + BigInt(1)).toString();
}

export type BookingScheduleValidationInput = {
  bookingId: number;
  policyRevision: string | number | bigint;
  appointmentDate: unknown;
  appointmentTime: unknown;
  durationMinutes: number;
  bufferMinutes: number;
  source: "customer_booking" | "customer_reschedule" | "admin_appointment_move";
  changeRequestId?: number | null;
  adminUserId?: string | null;
};

export type BookingScheduleValidationSnapshot = {
  bookingId: number;
  policyRevision: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  source: BookingScheduleValidationInput["source"];
  changeRequestId: number | null;
  adminUserId: string | null;
};

export function buildBookingScheduleValidationSnapshot(
  input: BookingScheduleValidationInput,
): BookingScheduleValidationSnapshot {
  if (!Number.isSafeInteger(input.bookingId) || input.bookingId <= 0) {
    throw new Error("Invalid booking ID for scheduling validation history.");
  }
  const policyRevision = BigInt(input.policyRevision).toString();
  if (BigInt(policyRevision) < BigInt(1)) throw new Error("Invalid scheduling policy revision.");
  if (!isValidBookingDateOnly(input.appointmentDate)) {
    throw new Error("Invalid appointment date for scheduling validation history.");
  }
  if (typeof input.appointmentTime !== "string") {
    throw new Error("Invalid appointment time for scheduling validation history.");
  }
  const appointmentTime = parseBookingTime(input.appointmentTime);
  if (!appointmentTime) throw new Error("Invalid appointment time for scheduling validation history.");
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 1 || input.durationMinutes > 720) {
    throw new Error("Invalid appointment duration for scheduling validation history.");
  }
  if (!Number.isInteger(input.bufferMinutes) || input.bufferMinutes < 0 || input.bufferMinutes > 180) {
    throw new Error("Invalid appointment buffer for scheduling validation history.");
  }
  if (input.changeRequestId != null && (!Number.isSafeInteger(input.changeRequestId) || input.changeRequestId <= 0)) {
    throw new Error("Invalid change request ID for scheduling validation history.");
  }
  return {
    bookingId: input.bookingId,
    policyRevision,
    appointmentDate: input.appointmentDate,
    appointmentTime,
    durationMinutes: input.durationMinutes,
    bufferMinutes: input.bufferMinutes,
    source: input.source,
    changeRequestId: input.changeRequestId ?? null,
    adminUserId: input.adminUserId ?? null,
  };
}

export function hasPolicyValueChanged<T>(before: T, after: T): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}
