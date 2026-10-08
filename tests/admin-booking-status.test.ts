import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyAdminBookingStatusTransition,
  hasValidActiveBookingReservation,
  hasValidAppointmentSlot,
  type AdminBookingReservation,
} from "../app/lib/admin-booking-status-pure";
import { getCapacityWindow } from "../app/lib/booking-buffer-pure";

const bookingWindow = getCapacityWindow({
  dateOnly: "2026-10-09",
  startTime: "10:00",
  durationMinutes: 120,
  bufferMinutes: 30,
})!;

const validReservation: AdminBookingReservation = {
  isPrimary: true,
  isActive: true,
  staffIsActive: true,
  slotDate: "2026-10-09",
  slotTime: "10:00:00",
  windowStart: bookingWindow.windowStartUtc,
  windowEnd: bookingWindow.windowEndUtc,
};

function checkReservation(
  assignment: AdminBookingReservation | null = validReservation,
  bookingDate: string | Date | null = "2026-10-09",
  bookingTime: string | null = "10:00:00",
  now = new Date("2026-10-08T12:00:00.000Z"),
) {
  return hasValidActiveBookingReservation({
    bookingDate,
    bookingTime,
    durationMinutes: 120,
    bufferMinutes: 30,
    assignment,
    now,
  });
}

describe("active booking reservation validation", () => {
  it("accepts an active assignment matching the full appointment window", () => {
    assert.equal(checkReservation(), true);
  });

  it("rejects a released assignment", () => {
    assert.equal(checkReservation({ ...validReservation, isActive: false }), false);
  });

  it("rejects an assignment to inactive staff", () => {
    assert.equal(checkReservation({ ...validReservation, staffIsActive: false }), false);
  });

  it("rejects a reservation whose window start no longer matches the appointment", () => {
    assert.equal(
      checkReservation({
        ...validReservation,
        windowStart: new Date(bookingWindow.windowStartUtc.getTime() + 60_000),
      }),
      false,
    );
  });

  it("rejects invalid, expired, or too-short reservation windows", () => {
    assert.equal(
      checkReservation({
        ...validReservation,
        windowEnd: bookingWindow.windowStartUtc,
      }),
      false,
    );
    assert.equal(
      checkReservation({
        ...validReservation,
        windowEnd: new Date(bookingWindow.windowEndUtc.getTime() - 60_000),
      }),
      false,
    );
    assert.equal(
      checkReservation(validReservation, "2026-10-09", "10:00", new Date("2026-10-10T12:00:00Z")),
      false,
    );
  });

  it("rejects invalid booking dates and times", () => {
    assert.equal(hasValidAppointmentSlot({ bookingDate: "2026-02-30", bookingTime: "10:00" }), false);
    assert.equal(hasValidAppointmentSlot({ bookingDate: "2026-10-09", bookingTime: "25:00" }), false);
  });
});

describe("admin booking status reopen guard", () => {
  for (const currentStatus of ["completed", "cancelled"] as const) {
    for (const nextStatus of ["scheduled", "in_progress"] as const) {
      it(`${currentStatus} booking without an active assignment cannot reopen as ${nextStatus}`, async () => {
        const state = {
          bookingStatus: currentStatus as string,
          assignmentActive: false,
        };
        let writes = 0;

        const result = await applyAdminBookingStatusTransition({
          currentStatus,
          expectedStatus: currentStatus,
          nextStatus,
          hasValidActiveAssignment: state.assignmentActive,
          hasAppointmentSlot: true,
          update: async () => {
            writes += 1;
            state.bookingStatus = nextStatus;
            return state.bookingStatus;
          },
        });

        assert.deepEqual(result, { ok: false, reason: "assignment_required" });
        assert.equal(writes, 0);
        assert.deepEqual(state, {
          bookingStatus: currentStatus,
          assignmentActive: false,
        });
      });
    }
  }

  it("allows reopening when the booking still has an active assignment", async () => {
    const state = { bookingStatus: "completed", assignmentActive: true };
    const result = await applyAdminBookingStatusTransition({
      currentStatus: "completed",
      expectedStatus: "completed",
      nextStatus: "scheduled",
      hasValidActiveAssignment: true,
      hasAppointmentSlot: true,
      update: async () => {
        state.bookingStatus = "scheduled";
        return state.bookingStatus;
      },
    });

    assert.deepEqual(result, { ok: true, value: "scheduled" });
    assert.deepEqual(state, { bookingStatus: "scheduled", assignmentActive: true });
  });

  it("allows a terminal booking to return to the unassigned inquiry queue", async () => {
    const result = await applyAdminBookingStatusTransition({
      currentStatus: "cancelled",
      expectedStatus: "cancelled",
      nextStatus: "new",
      hasValidActiveAssignment: false,
      hasAppointmentSlot: true,
      update: async () => "new",
    });

    assert.deepEqual(result, { ok: true, value: "new" });
  });

  it("preserves the existing unassigned contact-to-scheduled admin workflow", async () => {
    const result = await applyAdminBookingStatusTransition({
      currentStatus: "contacted",
      expectedStatus: "contacted",
      nextStatus: "scheduled",
      hasValidActiveAssignment: false,
      hasAppointmentSlot: true,
      update: async () => "scheduled",
    });

    assert.deepEqual(result, { ok: true, value: "scheduled" });
  });

  it("rejects a stale admin status snapshot without writing", async () => {
    let writes = 0;
    const result = await applyAdminBookingStatusTransition({
      currentStatus: "completed",
      expectedStatus: "cancelled",
      nextStatus: "scheduled",
      hasValidActiveAssignment: false,
      hasAppointmentSlot: true,
      update: async () => {
        writes += 1;
        return "scheduled";
      },
    });

    assert.deepEqual(result, { ok: false, reason: "stale" });
    assert.equal(writes, 0);
  });

  it("reports a conditional update conflict when the row changed concurrently", async () => {
    const state = { bookingStatus: "scheduled", assignmentActive: true };
    const before = { ...state };
    const result = await applyAdminBookingStatusTransition({
      currentStatus: "scheduled",
      expectedStatus: "scheduled",
      nextStatus: "completed",
      hasValidActiveAssignment: true,
      hasAppointmentSlot: true,
      update: async () => null,
    });

    assert.deepEqual(result, { ok: false, reason: "concurrent" });
    assert.deepEqual(state, before);
  });

  it("does not reopen a terminal booking without an appointment slot", async () => {
    let writes = 0;
    const result = await applyAdminBookingStatusTransition({
      currentStatus: "cancelled",
      nextStatus: "scheduled",
      hasValidActiveAssignment: true,
      hasAppointmentSlot: false,
      update: async () => {
        writes += 1;
        return "scheduled";
      },
    });

    assert.deepEqual(result, { ok: false, reason: "assignment_required" });
    assert.equal(writes, 0);
  });
});
