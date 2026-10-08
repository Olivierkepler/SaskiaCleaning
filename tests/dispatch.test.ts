import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISPATCH_BOOKING_LIMIT,
  DISPATCH_MAX_RANGE_DAYS,
  DISPATCH_UNDATED_LIMIT,
  getDefaultDispatchRange,
  isDispatchBookingAssigned,
  isDispatchBookingAwaitingAssignment,
  mapDispatchBookingRow,
  mapUndatedInquiryRow,
  summarizeDispatchBookings,
  takeDispatchRows,
  validateDispatchDateRange,
  type DispatchBooking,
  type DispatchBookingRow,
} from "../app/lib/dispatch-pure";

const FIXED_NOW = new Date("2026-10-08T16:00:00.000Z");

function row(overrides: Partial<DispatchBookingRow> = {}): DispatchBookingRow {
  return {
    booking_id: 82,
    booking_date: "2026-10-09",
    booking_time: "10:00:00",
    status: "scheduled",
    service: "Standard",
    duration_minutes: 120,
    buffer_minutes: 30,
    location: "Example service area",
    assignment_active: false,
    has_assignment_history: false,
    staff_name: null,
    staff_active: null,
    window_end: null,
    ...overrides,
  };
}

function booking(overrides: Partial<DispatchBooking> = {}): DispatchBooking {
  return { ...mapDispatchBookingRow(row(), "2026-10-08", FIXED_NOW), ...overrides };
}

describe("dispatch date range", () => {
  it("defaults to the current America/New_York day and the following six days", () => {
    assert.deepEqual(getDefaultDispatchRange(FIXED_NOW), {
      from: "2026-10-08",
      to: "2026-10-14",
    });
  });

  it("accepts valid inclusive bounded date ranges", () => {
    assert.deepEqual(validateDispatchDateRange("2026-10-01", "2026-10-31"), {
      ok: true,
      range: { from: "2026-10-01", to: "2026-10-31" },
    });
    assert.equal(DISPATCH_MAX_RANGE_DAYS, 31);
  });

  it("rejects malformed, reversed, and overlong ranges", () => {
    assert.equal(validateDispatchDateRange("2026-02-30", "2026-03-01").ok, false);
    assert.equal(validateDispatchDateRange("2026-10-02", "2026-10-01").ok, false);
    assert.equal(validateDispatchDateRange("2026-10-01", "2026-11-01").ok, false);
    assert.equal(validateDispatchDateRange(["2026-10-01"], "2026-10-02").ok, false);
  });
});

describe("dispatch classification and response model", () => {
  it("distinguishes active assignment from no assignment and released history", () => {
    const active = mapDispatchBookingRow(row({
      assignment_active: true,
      has_assignment_history: true,
      staff_name: "Cleaner Example",
      staff_active: true,
    }), "2026-10-08", FIXED_NOW);
    const released = mapDispatchBookingRow(row({ has_assignment_history: true }), "2026-10-08", FIXED_NOW);
    const neverAssigned = mapDispatchBookingRow(row(), "2026-10-08", FIXED_NOW);

    assert.equal(active.assignmentState, "active");
    assert.equal(isDispatchBookingAssigned(active), true);
    assert.equal(isDispatchBookingAwaitingAssignment(active), false);
    assert.equal(released.assignmentState, "previously_released");
    assert.equal(isDispatchBookingAssigned(released), false);
    assert.equal(isDispatchBookingAwaitingAssignment(released), true);
    assert.equal(neverAssigned.assignmentState, "never_assigned");
  });

  it("marks an active assignment to inactive staff for operations review", () => {
    const item = mapDispatchBookingRow(row({
      assignment_active: true,
      has_assignment_history: true,
      staff_name: "Former Cleaner",
      staff_active: false,
      window_end: "2026-10-09T14:00:00.000Z",
    }), "2026-10-08", FIXED_NOW);
    assert.equal(item.assignmentState, "assigned_to_inactive_staff");
    assert.ok(item.exceptionType);
  });

  it("counts open assignment states, progress, completed jobs, and exceptions", () => {
    const items = [
      booking(),
      mapDispatchBookingRow(row({ booking_id: 83, assignment_active: true, has_assignment_history: true, staff_name: "Cleaner", staff_active: true }), "2026-10-08", FIXED_NOW),
      mapDispatchBookingRow(row({ booking_id: 84, status: "in_progress", assignment_active: true, has_assignment_history: true, staff_name: "Cleaner", staff_active: true }), "2026-10-08", FIXED_NOW),
      mapDispatchBookingRow(row({ booking_id: 85, status: "completed", assignment_active: true, has_assignment_history: true, staff_name: "Cleaner", staff_active: true, window_end: "2026-10-09T14:00:00.000Z" }), "2026-10-08", FIXED_NOW),
      mapDispatchBookingRow(row({ booking_id: 86, booking_date: "2026-10-07", assignment_active: true, has_assignment_history: true, staff_name: "Cleaner", staff_active: true, window_end: "2026-10-07T14:00:00.000Z" }), "2026-10-08", FIXED_NOW),
    ];
    assert.deepEqual(summarizeDispatchBookings(items), {
      awaitingAssignment: 1,
      assigned: 2,
      inProgress: 1,
      completed: 1,
      exceptions: 3,
    });
  });

  it("returns only allowlisted dispatch fields, never contact or referral data", () => {
    const result = mapDispatchBookingRow(row(), "2026-10-08", FIXED_NOW);
    assert.deepEqual(Object.keys(result).sort(), [
      "assignmentState", "bookingDate", "bookingTime", "bufferMinutes", "durationMinutes",
      "exceptionLabel", "exceptionSeverity", "exceptionType", "id", "location", "service",
      "staffName", "status",
    ].sort());
    assert.equal("email" in result, false);
    assert.equal("referralCode" in result, false);
  });

  it("keeps undated inquiries separate, minimally mapped, and enforces result bounds", () => {
    const inquiry = mapUndatedInquiryRow({
      id: 91,
      status: "new",
      service: "Deep Clean",
      created_at: new Date("2026-10-08T12:00:00.000Z"),
    });
    assert.deepEqual(Object.keys(inquiry).sort(), ["id", "service", "status", "submittedAt"].sort());
    assert.equal(DISPATCH_BOOKING_LIMIT, 500);
    assert.equal(DISPATCH_UNDATED_LIMIT, 25);
    assert.deepEqual(takeDispatchRows([1, 2, 3], 2), { rows: [1, 2], truncated: true });
    assert.deepEqual(takeDispatchRows([1, 2], 2), { rows: [1, 2], truncated: false });
    assert.deepEqual(takeDispatchRows([], 25), { rows: [], truncated: false });
    assert.deepEqual(summarizeDispatchBookings([]), {
      awaitingAssignment: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      exceptions: 0,
    });
  });
});
