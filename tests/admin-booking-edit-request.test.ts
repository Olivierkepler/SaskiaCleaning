import assert from "node:assert/strict";
import test from "node:test";
import { executeAdminBookingEditRequest } from "../app/lib/admin-booking-edit-request-pure";

const moveBody = { bookingDate: "2026-11-12", bookingTime: "10:30" };

test("admin appointment edit rejects unauthorized callers before transaction or mutation", async () => {
  let calls = 0;
  const result = await executeAdminBookingEditRequest(moveBody, {
    authorized: false,
    bookingId: 12,
    withTransaction: async (operation) => { calls += 1; return operation(); },
    updateDetails: async () => { calls += 1; return { status: 200, booking: {} }; },
    moveAppointment: async () => { calls += 1; return { ok: true, bookingDate: "2026-11-12", bookingTime: "10:30" }; },
  });
  assert.deepEqual(result, { status: 401, error: "Unauthorized" });
  assert.equal(calls, 0);
});

test("admin appointment edit delegates to the authoritative move and returns its appointment", async () => {
  const calls: unknown[] = [];
  const result = await executeAdminBookingEditRequest(moveBody, {
    authorized: true,
    bookingId: 12,
    withTransaction: async (operation) => operation(),
    updateDetails: async () => { throw new Error("must not update details"); },
    moveAppointment: async (input) => {
      calls.push(input);
      return { ok: true, bookingDate: input.bookingDate, bookingTime: input.bookingTime };
    },
  });
  assert.deepEqual(calls, [{ bookingDate: "2026-11-12", bookingTime: "10:30" }]);
  assert.deepEqual(result, {
    status: 200,
    booking: { id: 12, booking_date: "2026-11-12", booking_time: "10:30" },
  });
});

test("unchanged appointment values still delegate to the move authority for its no-op behavior", async () => {
  let called = false;
  const result = await executeAdminBookingEditRequest(moveBody, {
    authorized: true,
    bookingId: 12,
    withTransaction: async (operation) => operation(),
    updateDetails: async () => ({ status: 200, booking: {} }),
    moveAppointment: async (input) => {
      called = true;
      return { ok: true, bookingDate: input.bookingDate, bookingTime: input.bookingTime };
    },
  });
  assert.equal(result.status, 200);
  assert.equal(called, true);
});

test("appointment conflict result becomes a controlled conflict response", async () => {
  const result = await executeAdminBookingEditRequest(moveBody, {
    authorized: true,
    bookingId: 12,
    withTransaction: async (operation) => operation(),
    updateDetails: async () => ({ status: 200, booking: {} }),
    moveAppointment: async () => ({ ok: false, reason: "TRAVEL_BUFFER_CONFLICT" }),
  });
  assert.deepEqual(result, {
    status: 409,
    error: "This appointment is too close to another assigned booking.",
  });
});

test("service and appointment changes are rejected before either operation runs", async () => {
  let calls = 0;
  const result = await executeAdminBookingEditRequest({
    ...moveBody,
    service: "Standard",
  }, {
    authorized: true,
    bookingId: 12,
    withTransaction: async (operation) => { calls += 1; return operation(); },
    updateDetails: async () => { calls += 1; return { status: 200, booking: {} }; },
    moveAppointment: async () => { calls += 1; return { ok: true, bookingDate: "2026-11-12", bookingTime: "10:30" }; },
  });
  assert.equal(result.status, 400);
  assert.match((result as { error: string }).error, /Save the service change first/);
  assert.equal(calls, 0);
});

test("a location edit rolls back when its paired appointment move conflicts", async () => {
  let location = "Old address";
  const result = await executeAdminBookingEditRequest({ ...moveBody, location: "New address" }, {
    authorized: true,
    bookingId: 12,
    withTransaction: async (operation) => {
      const before = location;
      try {
        return await operation();
      } catch (error) {
        location = before;
        throw error;
      }
    },
    updateDetails: async () => { location = "New address"; return { status: 200, booking: { id: 12, location } }; },
    moveAppointment: async () => ({ ok: false, reason: "NO_CAPACITY" }),
  });
  assert.equal(result.status, 409);
  assert.equal(location, "Old address");
});
