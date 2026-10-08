import "server-only";

import { getSchedulingTransactionClient, sql } from "@/app/lib/db";
import {
  buildBookingScheduleValidationSnapshot,
  classifyPolicyHistorySchema,
  requirePolicyRevisionForEnforcement as requirePolicyRevision,
  type BookingScheduleValidationInput,
} from "@/app/lib/scheduling-policy-history-pure";

export type SchedulingPolicyChangeType =
  | "baseline"
  | "weekly_availability"
  | "scheduling_block_created"
  | "scheduling_block_deleted"
  | "default_buffer"
  | "service_duration_rule";

export class SchedulingPolicyHistoryError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "SchedulingPolicyHistoryError";
    this.cause = cause;
  }
}

export function isSchedulingPolicyHistoryError(error: unknown): error is SchedulingPolicyHistoryError {
  return error instanceof SchedulingPolicyHistoryError;
}

function requireSchedulingTransaction(): void {
  if (!getSchedulingTransactionClient()) {
    throw new SchedulingPolicyHistoryError("Scheduling policy history requires the existing scheduling transaction.");
  }
}

async function isPolicyHistoryInstalled(): Promise<boolean> {
  // App code may deploy before migration 031. In that state history is explicitly
  // unavailable and writers preserve existing behavior; a partial migration fails closed.
  try {
    const rows = await sql`
      SELECT
        to_regclass('public.scheduling_policy_state') IS NOT NULL AS state_present,
        to_regclass('public.scheduling_policy_revisions') IS NOT NULL AS revisions_present,
        to_regclass('public.booking_schedule_validations') IS NOT NULL AS validations_present
    `;
    const row = rows[0] as { state_present: boolean; revisions_present: boolean; validations_present: boolean } | undefined;
    const schemaState = classifyPolicyHistorySchema({
      state: Boolean(row?.state_present),
      revisions: Boolean(row?.revisions_present),
      validations: Boolean(row?.validations_present),
    });
    if (schemaState === "PARTIAL") {
      throw new SchedulingPolicyHistoryError("Scheduling policy history schema is partially installed.");
    }
    return schemaState === "READY";
  } catch (error) {
    if (isSchedulingPolicyHistoryError(error)) throw error;
    throw new SchedulingPolicyHistoryError("Scheduling policy history schema could not be checked.", error);
  }
}

export async function getCurrentSchedulingPolicyRevision(): Promise<string | null> {
  if (!(await isPolicyHistoryInstalled())) return null;
  try {
    const rows = await sql`
      SELECT revision::text AS revision
      FROM scheduling_policy_state
      WHERE id = 1
      LIMIT 1
    `;
    const revision = (rows[0] as { revision?: string } | undefined)?.revision;
    if (!revision) throw new SchedulingPolicyHistoryError("Scheduling policy baseline is missing.");
    return revision;
  } catch (error) {
    if (isSchedulingPolicyHistoryError(error)) throw error;
    throw new SchedulingPolicyHistoryError("Scheduling policy revision could not be read.", error);
  }
}

/** Future conflict enforcement must use this fail-closed accessor, never the optional capture accessor. */
export async function requireCurrentSchedulingPolicyRevision(): Promise<string> {
  const revision = await getCurrentSchedulingPolicyRevision();
  try {
    return requirePolicyRevision(revision == null ? "ABSENT" : "READY", revision);
  } catch (error) {
    throw new SchedulingPolicyHistoryError("Scheduling policy history is not ready for enforcement.", error);
  }
}

/** Must be called inside the mutation's existing scheduling transaction. */
export async function recordSchedulingPolicyChange(input: {
  changeType: Exclude<SchedulingPolicyChangeType, "baseline">;
  details: Record<string, unknown>;
  changedByAdminId?: string | null;
}): Promise<string | null> {
  requireSchedulingTransaction();
  if (!(await isPolicyHistoryInstalled())) return null;
  try {
    const rows = await sql`
      UPDATE scheduling_policy_state
      SET revision = revision + 1, updated_at = now()
      WHERE id = 1
      RETURNING revision::text AS revision
    `;
    const revision = (rows[0] as { revision?: string } | undefined)?.revision;
    if (!revision) throw new Error("Scheduling policy state row is missing.");
    await sql`
      INSERT INTO scheduling_policy_revisions (
        revision, change_type, details, changed_by_admin_id
      )
      VALUES (
        ${revision}::bigint,
        ${input.changeType},
        ${JSON.stringify(input.details)}::jsonb,
        ${input.changedByAdminId ?? null}::uuid
      )
    `;
    return revision;
  } catch (error) {
    if (isSchedulingPolicyHistoryError(error)) throw error;
    throw new SchedulingPolicyHistoryError("Scheduling policy revision could not be recorded.", error);
  }
}

/** Writes trusted evidence only after authoritative validation and in its transaction. */
export async function recordBookingScheduleValidation(
  input: Omit<BookingScheduleValidationInput, "policyRevision">,
): Promise<string | null> {
  requireSchedulingTransaction();
  // No pre-migration or legacy evidence is synthesized. Once installed, insert
  // failures propagate so the enclosing booking transaction rolls back.
  const currentRevision = await getCurrentSchedulingPolicyRevision();
  if (currentRevision == null) return null;
  let snapshot;
  try {
    snapshot = buildBookingScheduleValidationSnapshot({ ...input, policyRevision: currentRevision });
  } catch (error) {
    throw new SchedulingPolicyHistoryError("Appointment validation evidence is invalid.", error);
  }
  try {
    const rows = await sql`
      INSERT INTO booking_schedule_validations (
        booking_id, policy_revision, appointment_date, appointment_time,
        duration_minutes, buffer_minutes, validation_source,
        change_request_id, admin_user_id
      )
      VALUES (
        ${snapshot.bookingId}, ${snapshot.policyRevision}::bigint,
        ${snapshot.appointmentDate}::date, ${snapshot.appointmentTime}::time,
        ${snapshot.durationMinutes}, ${snapshot.bufferMinutes}, ${snapshot.source},
        ${snapshot.changeRequestId}, ${snapshot.adminUserId}::uuid
      )
      RETURNING id::text AS id
    `;
    const id = (rows[0] as { id?: string } | undefined)?.id;
    if (!id) throw new Error("Validation history insert returned no row.");
    return id;
  } catch (error) {
    throw new SchedulingPolicyHistoryError("Appointment validation evidence could not be recorded.", error);
  }
}
