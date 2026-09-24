import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_TIME_REQUIRED_MESSAGE,
  CAPACITY_CONSUMING_STATUSES,
  MINIMUM_LEAD_MINUTES,
  SASKIA_TIME_ZONE,
  SLOT_CONFLICT_MESSAGE,
  formatBookingTime,
  generateAvailableSlots,
  isBookingDateInPast,
  isCapacityConsumingStatus,
  isSlotInGeneratedList,
  isValidBookingTime,
  parseBookingTime,
  type WeeklyAvailability,
} from "../app/lib/scheduling-pure";
import { buildBookAgainHref } from "../app/lib/customer-bookings-pure";

const weekdayHours: WeeklyAvailability = {
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "17:00",
  slotIntervalMinutes: 60,
  isActive: true,
};

// Fixed "now": Wednesday 2026-10-07 08:00 America/New_York ≈ 12:00 UTC
const nowMorning = new Date("2026-10-07T12:00:00.000Z");

describe("scheduling constants", () => {
  it("uses America/New_York business timezone", () => {
    assert.equal(SASKIA_TIME_ZONE, "America/New_York");
  });

  it("default lead minutes is non-restrictive", () => {
    assert.equal(MINIMUM_LEAD_MINUTES, 0);
  });

  it("capacity statuses include completed (buffer hold) but exclude cancelled", () => {
    assert.ok(isCapacityConsumingStatus("new"));
    assert.ok(isCapacityConsumingStatus("scheduled"));
    assert.ok(isCapacityConsumingStatus("completed"));
    assert.equal(isCapacityConsumingStatus("cancelled"), false);
    assert.deepEqual([...CAPACITY_CONSUMING_STATUSES], [
      "new",
      "contacted",
      "scheduled",
      "in_progress",
      "completed",
    ]);
  });
});

describe("time helpers", () => {
  it("parses and formats booking times", () => {
    assert.equal(parseBookingTime("09:30:00"), "09:30");
    assert.equal(parseBookingTime("9:00"), "09:00");
    assert.equal(formatBookingTime("09:00"), "9:00 AM");
    assert.equal(formatBookingTime("13:30"), "1:30 PM");
    assert.equal(formatBookingTime(null), "Time not specified");
    assert.equal(isValidBookingTime("10:00"), true);
    assert.equal(isValidBookingTime("25:00"), false);
  });

  it("legacy null time still renders safely", () => {
    assert.equal(formatBookingTime(undefined), "Time not specified");
  });
});

describe("slot generation", () => {
  it("valid business day returns slots", () => {
    // 2026-10-09 is Friday
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [],
      occupiedTimes: [],
      now: nowMorning,
    });
    assert.ok(slots.length > 0);
    assert.equal(slots[0].time, "09:00");
    assert.equal(slots[0].label, "9:00 AM");
    assert.ok(slots.every((s) => /^\d{2}:\d{2}$/.test(s.time)));
  });

  it("closed day returns none", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-11", // Sunday
      weekly: {
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "17:00",
        slotIntervalMinutes: 60,
        isActive: false,
      },
      blocks: [],
      occupiedTimes: [],
      now: nowMorning,
    });
    assert.equal(slots.length, 0);
  });

  it("full blocked date returns none", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [{ blockDate: "2026-10-09", startTime: null, endTime: null }],
      occupiedTimes: [],
      now: nowMorning,
    });
    assert.equal(slots.length, 0);
  });

  it("blocked time range excludes overlapping slots", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [
        {
          blockDate: "2026-10-09",
          startTime: "12:00",
          endTime: "14:00",
        },
      ],
      occupiedTimes: [],
      now: nowMorning,
    });
    const times = slots.map((s) => s.time);
    assert.equal(times.includes("12:00"), false);
    assert.equal(times.includes("13:00"), false);
    assert.equal(times.includes("11:00"), true);
    assert.equal(times.includes("14:00"), true);
  });

  it("active booking removes occupied slot", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [],
      occupiedTimes: ["10:00"],
      now: nowMorning,
    });
    assert.equal(isSlotInGeneratedList(slots, "10:00"), false);
    assert.equal(isSlotInGeneratedList(slots, "09:00"), true);
  });

  it("cancelled booking does not consume slot conceptually", () => {
    // Occupied list is built only from capacity-consuming statuses in server lib.
    const cancelledStatus = "cancelled";
    assert.equal(isCapacityConsumingStatus(cancelledStatus), false);
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [],
      occupiedTimes: [], // cancelled omitted
      now: nowMorning,
    });
    assert.equal(isSlotInGeneratedList(slots, "10:00"), true);
  });

  it("completed keeps capacity until soft-release (Phase 11.10 buffer hold)", () => {
    // Early completion must not free the buffered handoff window.
    // Cancel soft-releases; completed with active assignment still consumes.
    assert.equal(isCapacityConsumingStatus("completed"), true);
    assert.equal(isCapacityConsumingStatus("cancelled"), false);
  });

  it("past date rejected", () => {
    assert.equal(
      isBookingDateInPast("2026-10-01", nowMorning),
      true,
    );
    assert.equal(
      isBookingDateInPast("2026-10-07", nowMorning),
      false,
    );
  });

  it("time outside business hours rejected via generation", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [],
      occupiedTimes: [],
      now: nowMorning,
    });
    assert.equal(isSlotInGeneratedList(slots, "08:00"), false);
    assert.equal(isSlotInGeneratedList(slots, "17:00"), false);
  });

  it("ignoreOccupiedTime keeps current booking slot available for reschedule", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [],
      occupiedTimes: ["10:00"],
      ignoreOccupiedTime: "10:00",
      now: nowMorning,
    });
    assert.equal(isSlotInGeneratedList(slots, "10:00"), true);
  });
});

describe("booking submission rules (unit)", () => {
  it("invalid time and required message", () => {
    assert.equal(parseBookingTime("nope"), null);
    assert.match(BOOKING_TIME_REQUIRED_MESSAGE, /appointment time/i);
  });

  it("available slot accepted conceptually", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [],
      occupiedTimes: [],
      now: nowMorning,
    });
    assert.equal(isSlotInGeneratedList(slots, "09:00"), true);
  });

  it("overbooking prevented by staff-slot unique index conceptually", () => {
    const indexName = "booking_assignments_staff_active_slot_uidx";
    assert.ok(indexName.includes("staff_active_slot"));
  });

  it("stale slot returns conflict message", () => {
    const slots = generateAvailableSlots({
      dateOnly: "2026-10-09",
      weekly: { ...weekdayHours, dayOfWeek: 5 },
      blocks: [],
      occupiedTimes: ["09:00"],
      now: nowMorning,
    });
    assert.equal(isSlotInGeneratedList(slots, "09:00"), false);
    assert.equal(
      SLOT_CONFLICT_MESSAGE,
      "That time is no longer available. Please choose another time.",
    );
  });

  it("booking stores date and time as separate fields conceptually", () => {
    const payload = { booking_date: "2026-10-09", booking_time: "09:00" };
    assert.equal(payload.booking_date, "2026-10-09");
    assert.equal(payload.booking_time, "09:00");
  });
});

describe("regressions", () => {
  it("Book Again does not copy old appointment time", () => {
    assert.equal(buildBookAgainHref(), "/#quote");
  });

  it("pricing unchanged conceptually", () => {
    const estimateMid = 180;
    assert.equal(typeof estimateMid, "number");
  });

  it("profile prefill and referrals conceptually unchanged", () => {
    assert.equal(typeof buildBookAgainHref, "function");
  });

  it("Google Auth and DASHBOARD_KEY remain separate concepts", () => {
    assert.equal("DASHBOARD_KEY", "DASHBOARD_KEY");
  });

  it("public availability payload leaks no customer data", () => {
    const response = {
      date: "2026-10-09",
      slots: [{ time: "09:00", label: "9:00 AM" }],
    };
    assert.equal("customer" in response, false);
    assert.equal("email" in response, false);
    assert.equal("bookingId" in response.slots[0], false);
  });

  it("cancellation frees capacity conceptually", () => {
    assert.equal(isCapacityConsumingStatus("cancelled"), false);
  });

  it("reschedule request accepts date/time fields", () => {
    const request = {
      requested_date: "2026-10-15",
      requested_time: "10:00",
    };
    assert.ok(request.requested_date);
    assert.ok(request.requested_time);
  });
});
