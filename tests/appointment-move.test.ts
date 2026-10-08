import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyAssignmentConflict,
  createTransactionBoundAppointmentMove,
  executeAppointmentMove,
  mapAppointmentMoveFailure,
  type AppointmentMoveDependencies,
  type AppointmentMoveInput,
} from "../app/lib/appointment-move-pure";

const initialBooking = {
  id: 42,
  bookingDate: "2026-10-07",
  bookingTime: "10:00",
  durationMinutes: 120,
  bufferMinutes: 30,
  status: "scheduled",
};
const activeAssignment = { id: "assignment-1", staffId: "cleaner-1" };
const input: AppointmentMoveInput = {
  bookingId: 42,
  bookingDate: "2026-10-08",
  bookingTime: "11:00",
};

function fixture(overrides: Partial<AppointmentMoveDependencies> = {}) {
  const state = {
    booking: { ...initialBooking },
    assignment: { ...activeAssignment } as typeof activeAssignment | null,
    estimateLow: 180,
    estimateMid: 220,
    estimateHigh: 260,
    pricingInputs: { version: 1, kind: "standard", bathroomIndex: 2 },
    pendingChangeRequest: { status: "pending", requestedDate: "2026-10-09" },
    bookingLoads: 0,
    assignmentLoads: 0,
    cleanerValidations: 0,
    capacityChecks: 0,
    persistCalls: 0,
    persistedInput: null as Parameters<NonNullable<AppointmentMoveDependencies["persistMove"]>>[0] | null,
  };
  const dependencies: AppointmentMoveDependencies = {
    loadBookingForUpdate: async () => { state.bookingLoads += 1; return { ...state.booking }; },
    loadAssignmentForUpdate: async () => { state.assignmentLoads += 1; return state.assignment ? { ...state.assignment } : null; },
    validateSchedulingWindow: async () => ({ ok: true }),
    validateAssignedCleaner: async () => { state.cleanerValidations += 1; return { ok: true }; },
    hasCapacity: async () => { state.capacityChecks += 1; return true; },
    persistMove: async (move) => {
      state.persistCalls += 1;
      state.persistedInput = move;
      state.booking.bookingDate = move.bookingDate;
      state.booking.bookingTime = move.bookingTime;
      return "UPDATED";
    },
    ...overrides,
  };
  return { state, dependencies };
}

test("assigned appointment move preserves the same cleaner and leaves other booking state alone", async () => {
  const { state, dependencies } = fixture();
  const result = await executeAppointmentMove(input, dependencies);
  assert.deepEqual(result, {
    ok: true,
    bookingId: 42,
    bookingDate: "2026-10-08",
    bookingTime: "11:00",
    assigned: true,
    changed: true,
  });
  assert.equal(state.assignment?.id, "assignment-1");
  assert.equal(state.assignment?.staffId, "cleaner-1");
  assert.equal(state.booking.status, "scheduled");
  assert.deepEqual([state.estimateLow, state.estimateMid, state.estimateHigh], [180, 220, 260]);
  assert.deepEqual(state.pricingInputs, { version: 1, kind: "standard", bathroomIndex: 2 });
  assert.deepEqual(state.pendingChangeRequest, { status: "pending", requestedDate: "2026-10-09" });
  assert.equal(state.persistCalls, 1);
  assert.equal(state.persistedInput?.assignment?.id, "assignment-1");
  assert.equal(state.persistedInput?.assignment?.staffId, "cleaner-1");
  assert.deepEqual(
    Object.keys(state.persistedInput?.window ?? {}).sort(),
    ["bufferMinutes", "dateOnly", "durationMinutes", "endMinutes", "endTime", "serviceEndMinutes", "serviceEndUtc", "startMinutes", "startTime", "windowEndUtc", "windowStartUtc"].sort(),
  );
});

for (const [label, reason] of [
  ["cleaner unavailable", "STAFF_UNAVAILABLE"],
  ["cleaner time off", "STAFF_TIME_OFF"],
  ["assignment overlap", "ASSIGNMENT_OVERLAP"],
  ["travel buffer conflict", "TRAVEL_BUFFER_CONFLICT"],
] as const) {
  test(`assigned move fails without writes when there is a ${label}`, async () => {
    const { state, dependencies } = fixture({
      validateAssignedCleaner: async () => ({ ok: false, reason }),
    });
    const result = await executeAppointmentMove(input, dependencies);
    assert.deepEqual(result, { ok: false, reason });
    assert.deepEqual(state.booking, initialBooking);
    assert.equal(state.persistCalls, 0);
    assert.equal(state.assignment?.id, "assignment-1");
  });
}

test("scheduling block conflict fails before any write", async () => {
  const { state, dependencies } = fixture({
    validateSchedulingWindow: async () => ({ ok: false, reason: "BLOCKED_TIME" }),
  });
  assert.deepEqual(await executeAppointmentMove(input, dependencies), { ok: false, reason: "BLOCKED_TIME" });
  assert.deepEqual(state.booking, initialBooking);
  assert.equal(state.persistCalls, 0);
});

test("unassigned booking uses aggregate capacity and does not create an assignment", async () => {
  const { state, dependencies } = fixture({
    loadAssignmentForUpdate: async () => { state.assignmentLoads += 1; return null; },
  });
  state.assignment = null;
  const result = await executeAppointmentMove(input, dependencies);
  assert.equal(result.ok, true);
  assert.equal(state.capacityChecks, 1);
  assert.equal(state.cleanerValidations, 0);
  assert.equal(state.assignmentLoads, 1);
  assert.equal(Boolean(state.assignment), false);
});

test("unassigned booking fails closed when capacity is unavailable", async () => {
  const { state, dependencies } = fixture({
    loadAssignmentForUpdate: async () => { state.assignmentLoads += 1; return null; },
    hasCapacity: async () => false,
  });
  state.assignment = null;
  assert.deepEqual(await executeAppointmentMove(input, dependencies), { ok: false, reason: "NO_CAPACITY" });
  assert.deepEqual(state.booking, initialBooking);
  assert.equal(state.persistCalls, 0);
});

test("assignment appearing or changing after load fails closed without partial state", async () => {
  const { state, dependencies } = fixture({
    persistMove: async () => "STALE_ASSIGNMENT",
  });
  assert.deepEqual(await executeAppointmentMove(input, dependencies), {
    ok: false,
    reason: "STALE_ASSIGNMENT",
  });
  assert.deepEqual(state.booking, initialBooking);
  assert.equal(state.persistCalls, 0);
});

test("booking changing after validation is reported as a concurrent conflict", async () => {
  const { state, dependencies } = fixture({
    persistMove: async () => "STALE_BOOKING",
  });
  assert.deepEqual(await executeAppointmentMove(input, dependencies), {
    ok: false,
    reason: "CONCURRENT_CONFLICT",
  });
  assert.deepEqual(state.booking, initialBooking);
  assert.equal(state.persistCalls, 0);
});

test("same appointment is a no-op and does not rewrite assignment", async () => {
  const { state, dependencies } = fixture();
  const result = await executeAppointmentMove({
    bookingId: 42,
    bookingDate: "2026-10-07",
    bookingTime: "10:00",
  }, dependencies);
  assert.deepEqual(result, {
    ok: true,
    bookingId: 42,
    bookingDate: "2026-10-07",
    bookingTime: "10:00",
    assigned: true,
    changed: false,
  });
  assert.equal(state.persistCalls, 0);
  assert.equal(state.cleanerValidations, 0);
});

test("invalid date and time fail before reads", async () => {
  const { state, dependencies } = fixture();
  assert.deepEqual(await executeAppointmentMove({ ...input, bookingDate: "10/08/2026" }, dependencies), {
    ok: false,
    reason: "INVALID_APPOINTMENT",
  });
  assert.deepEqual(await executeAppointmentMove({ ...input, bookingTime: "25:99" }, dependencies), {
    ok: false,
    reason: "INVALID_APPOINTMENT",
  });
  assert.equal(state.bookingLoads, 0);
});

test("move input rejects client-supplied derived or unrelated fields", async () => {
  const { state, dependencies } = fixture();
  assert.deepEqual(await executeAppointmentMove(
    { ...input, staffId: "other-cleaner" } as unknown as AppointmentMoveInput,
    dependencies,
  ), {
    ok: false,
    reason: "INVALID_APPOINTMENT",
  });
  assert.equal(state.bookingLoads, 0);
});

test("move orchestration runs inside the supplied shared transaction boundary", async () => {
  const { dependencies } = fixture();
  const trace: string[] = [];
  const move = createTransactionBoundAppointmentMove(
    async (operation) => {
      trace.push("transaction:start");
      const result = await operation();
      trace.push("transaction:commit");
      return result;
    },
    (value) => executeAppointmentMove(value, dependencies),
  );
  const result = await move(input);
  assert.equal(result.ok, true);
  assert.deepEqual(trace, ["transaction:start", "transaction:commit"]);
});

test("unknown booking is returned without attempting assignment or writes", async () => {
  const { state, dependencies } = fixture({ loadBookingForUpdate: async () => null });
  assert.deepEqual(await executeAppointmentMove(input, dependencies), { ok: false, reason: "NOT_FOUND" });
  assert.equal(state.assignmentLoads, 0);
  assert.equal(state.persistCalls, 0);
});

test("assignment conflict classifier distinguishes service overlap from buffer-only conflict", () => {
  const common = {
    bookingId: 42,
    bookingDate: "2026-10-08",
    bookingTime: "11:00",
    durationMinutes: 120,
    bufferMinutes: 30,
  };
  assert.equal(classifyAssignmentConflict({
    ...common,
    existingAssignments: [{
      bookingId: 43,
      bookingDate: "2026-10-08",
      bookingTime: "12:00",
      durationMinutes: 60,
      bufferMinutes: 30,
      status: "scheduled",
    }],
  }), "ASSIGNMENT_OVERLAP");
  assert.equal(classifyAssignmentConflict({
    ...common,
    existingAssignments: [{
      bookingId: 43,
      bookingDate: "2026-10-08",
      bookingTime: "13:00",
      durationMinutes: 60,
      bufferMinutes: 30,
      status: "scheduled",
    }],
  }), "TRAVEL_BUFFER_CONFLICT");
});

test("appointment move conflicts map to controlled client-safe HTTP responses", () => {
  for (const reason of [
    "BLOCKED_TIME", "NO_CAPACITY", "STAFF_UNAVAILABLE", "STAFF_TIME_OFF",
    "ASSIGNMENT_OVERLAP", "TRAVEL_BUFFER_CONFLICT", "STALE_ASSIGNMENT", "CONCURRENT_CONFLICT",
  ] as const) {
    const mapped = mapAppointmentMoveFailure(reason);
    assert.equal(mapped.status, 409);
    assert.ok(mapped.error.length > 0);
    assert.doesNotMatch(mapped.error, /sql|postgres|constraint/i);
  }
  assert.equal(mapAppointmentMoveFailure("INVALID_APPOINTMENT").status, 400);
  assert.equal(mapAppointmentMoveFailure("NOT_FOUND").status, 404);
  assert.equal(mapAppointmentMoveFailure("PERSISTENCE_FAILURE").status, 500);
});
