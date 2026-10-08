import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  buildBookingScheduleValidationSnapshot,
  classifyPolicyHistorySchema,
  hasPolicyValueChanged,
  nextPolicyRevision,
  requirePolicyRevisionForEnforcement,
} from "../app/lib/scheduling-policy-history-pure";
import {
  runSchedulingTransaction,
  type SchedulingTransactionClient,
} from "../app/lib/scheduling-transaction-pure";
import { createTransactionBoundAppointmentMove } from "../app/lib/appointment-move-pure";

test("scheduling policy revision increments monotonically without number precision loss", () => {
  assert.equal(nextPolicyRevision("1"), "2");
  assert.equal(nextPolicyRevision("9223372036854775806"), "9223372036854775807");
  assert.throws(() => nextPolicyRevision("0"), /Invalid scheduling policy revision/);
  assert.throws(() => nextPolicyRevision("not-a-revision"), /Invalid scheduling policy revision/);
});

test("policy history supports pre-migration absence and rejects partial schema installation", () => {
  assert.equal(classifyPolicyHistorySchema({ state: false, revisions: false, validations: false }), "ABSENT");
  assert.equal(classifyPolicyHistorySchema({ state: true, revisions: true, validations: true }), "READY");
  assert.equal(classifyPolicyHistorySchema({ state: true, revisions: false, validations: true }), "PARTIAL");
  assert.throws(() => requirePolicyRevisionForEnforcement("ABSENT", null), /not ready for enforcement/);
  assert.throws(() => requirePolicyRevisionForEnforcement("PARTIAL", "2"), /not ready for enforcement/);
  assert.equal(requirePolicyRevisionForEnforcement("READY", "2"), "2");
});

test("policy revisions are only needed for semantic configuration changes", () => {
  assert.equal(hasPolicyValueChanged({ duration: 120 }, { duration: 120 }), false);
  assert.equal(hasPolicyValueChanged({ duration: 120 }, { duration: 150 }), true);
  assert.equal(hasPolicyValueChanged(null, { day: 1, active: true }), true);
});

test("validation snapshot contains only trusted canonical appointment evidence", () => {
  assert.deepEqual(buildBookingScheduleValidationSnapshot({
    bookingId: 82,
    policyRevision: "7",
    appointmentDate: "2026-10-12",
    appointmentTime: "9:30:00",
    durationMinutes: 150,
    bufferMinutes: 30,
    source: "customer_reschedule",
    changeRequestId: 24,
    adminUserId: "0f7e7a3d-7ce7-4e12-890f-a80e4030d00f",
  }), {
    bookingId: 82,
    policyRevision: "7",
    appointmentDate: "2026-10-12",
    appointmentTime: "09:30",
    durationMinutes: 150,
    bufferMinutes: 30,
    source: "customer_reschedule",
    changeRequestId: 24,
    adminUserId: "0f7e7a3d-7ce7-4e12-890f-a80e4030d00f",
  });
  assert.throws(() => buildBookingScheduleValidationSnapshot({
    bookingId: 82,
    policyRevision: "7",
    appointmentDate: "not-a-date",
    appointmentTime: "09:30",
    durationMinutes: 150,
    bufferMinutes: 30,
    source: "customer_booking",
  }), /appointment date/);
});

test("appointment move actor context stays server-side and remains in the shared transaction wrapper", async () => {
  const calls: string[] = [];
  const move = createTransactionBoundAppointmentMove(
    async (operation) => {
      calls.push("transaction");
      return operation();
    },
    async (input, adminUserId) => {
      calls.push(`${input.bookingId}:${adminUserId}`);
      return {
        ok: true,
        bookingId: Number(input.bookingId),
        bookingDate: String(input.bookingDate),
        bookingTime: String(input.bookingTime),
        assigned: false,
        changed: true,
      };
    },
  );
  await move({ bookingId: 82, bookingDate: "2026-10-12", bookingTime: "09:30" }, "admin-uuid");
  assert.deepEqual(calls, ["transaction", "82:admin-uuid"]);
});

test("failed policy-history writes roll back their enclosing scheduling transaction", async () => {
  const calls: string[] = [];
  const client: SchedulingTransactionClient = {
    query: async () => ({ rows: [] }),
    release: () => calls.push("release"),
  };
  await assert.rejects(() => runSchedulingTransaction({
    connect: async () => client,
    begin: async () => { calls.push("begin"); },
    acquireLock: async () => { calls.push("lock"); },
    operation: async () => {
      calls.push("configuration-write");
      calls.push("policy-history-write");
      throw new Error("history insert failed");
    },
    commit: async () => { calls.push("commit"); },
    rollback: async () => { calls.push("rollback"); },
  }), /history insert failed/);
  assert.deepEqual(calls, ["begin", "lock", "configuration-write", "policy-history-write", "rollback", "release"]);
  assert.equal(calls.includes("commit"), false);
});

test("a later parent-operation failure rolls back an already inserted validation snapshot", async () => {
  const calls: string[] = [];
  const client: SchedulingTransactionClient = {
    query: async () => ({ rows: [] }),
    release: () => calls.push("release"),
  };
  await assert.rejects(() => runSchedulingTransaction({
    connect: async () => client,
    begin: async () => { calls.push("begin"); },
    acquireLock: async () => { calls.push("lock"); },
    operation: async () => {
      calls.push("booking-write");
      calls.push("validation-snapshot-write");
      calls.push("later-parent-step");
      throw new Error("parent operation failed");
    },
    commit: async () => { calls.push("commit"); },
    rollback: async () => { calls.push("rollback"); },
  }), /parent operation failed/);
  assert.deepEqual(calls, ["begin", "lock", "booking-write", "validation-snapshot-write", "later-parent-step", "rollback", "release"]);
});

test("migration seeds a policy baseline but does not fabricate legacy booking validations", () => {
  const migration = readFileSync(join(process.cwd(), "migrations/031_scheduling_policy_history.sql"), "utf8");
  assert.match(migration, /'historical_booking_validation', false/);
  assert.doesNotMatch(migration, /INSERT\s+INTO\s+booking_schedule_validations[\s\S]*?SELECT[\s\S]*?FROM\s+booking_requests/i);
  assert.match(migration, /booking_id INTEGER NOT NULL/);
  assert.doesNotMatch(migration, /booking_id INTEGER NOT NULL REFERENCES booking_requests/);
  assert.match(migration, /change_request_id INTEGER REFERENCES booking_change_requests\(id\) ON DELETE SET NULL/);
  assert.match(migration, /admin_user_id UUID REFERENCES admin_users\(id\) ON DELETE SET NULL/);
  assert.match(migration, /validation evidence survives operational booking deletion/);
});

test("migration and writer vocabulary cover the configured policy domains", () => {
  const migration = readFileSync(join(process.cwd(), "migrations/031_scheduling_policy_history.sql"), "utf8");
  for (const changeType of [
    "weekly_availability",
    "scheduling_block_created",
    "scheduling_block_deleted",
    "default_buffer",
    "service_duration_rule",
  ]) assert.ok(migration.includes(changeType), `missing ${changeType}`);
  assert.ok(migration.includes("customer_booking"));
  assert.ok(migration.includes("customer_reschedule"));
  assert.ok(migration.includes("admin_appointment_move"));
});

test("all identified policy and appointment writers call the shared history helper", () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
  assert.match(read("app/lib/scheduling.ts"), /recordSchedulingPolicyChange/);
  assert.match(read("app/lib/booking-buffer.ts"), /recordSchedulingPolicyChange/);
  assert.match(read("app/lib/booking-duration.ts"), /recordSchedulingPolicyChange/);
  assert.equal((read("app/lib/staff-capacity.ts").match(/recordBookingScheduleValidation\(/g) ?? []).length, 2);
  assert.match(read("app/lib/appointment-move.ts"), /recordBookingScheduleValidation/);
  assert.match(read("app/lib/booking-change-requests.ts"), /recordBookingScheduleValidation/);
  assert.match(read("app/lib/booking-change-requests.ts"), /rescheduleBookingWithCapacityClaim/);
});
