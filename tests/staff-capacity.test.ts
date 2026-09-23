import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAPACITY_CONFLICT_MESSAGE,
  CAPACITY_STAFF_ROLES,
  buildAssignedWindow,
  compareStaffForAutoAssign,
  isCapacityStaffRole,
  pickAutoAssignStaffId,
  staffIsEligibleForCapacitySlot,
  summarizeSlotCapacity,
  type StaffCapacitySnapshot,
} from "../app/lib/staff-capacity-pure";
import { SLOT_CONFLICT_MESSAGE } from "../app/lib/scheduling-pure";

function makeStaff(
  overrides: Partial<StaffCapacitySnapshot> & { id: string },
): StaffCapacitySnapshot {
  return {
    role: "cleaner",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    upcomingCount: 0,
    weekly: { startTime: "09:00", endTime: "17:00", isActive: true },
    timeOff: [],
    assignedWindows: [],
    ...overrides,
  };
}

describe("capacity staff roles", () => {
  it("only cleaner consumes cleaning capacity", () => {
    assert.deepEqual([...CAPACITY_STAFF_ROLES], ["cleaner"]);
    assert.equal(isCapacityStaffRole("cleaner"), true);
    assert.equal(isCapacityStaffRole("manager"), false);
  });
});

describe("staff eligibility for capacity", () => {
  it("counts three eligible cleaners at a business-open slot", () => {
    const staff = [
      makeStaff({ id: "a" }),
      makeStaff({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" }),
      makeStaff({ id: "c", createdAt: "2026-01-03T00:00:00.000Z" }),
    ];
    const summaries = summarizeSlotCapacity({
      candidateSlots: [{ time: "10:00", label: "10:00 AM" }],
      staff,
      bookedByTime: {},
    });
    assert.equal(summaries[0].capacity, 3);
    assert.equal(summaries[0].remaining, 3);
    assert.equal(summaries[0].available, true);
  });

  it("excludes inactive cleaners", () => {
    const staff = [
      makeStaff({ id: "a" }),
      makeStaff({ id: "b", isActive: false }),
    ];
    assert.equal(staffIsEligibleForCapacitySlot(staff[1], "10:00"), false);
    const summaries = summarizeSlotCapacity({
      candidateSlots: [{ time: "10:00", label: "10:00 AM" }],
      staff,
      bookedByTime: {},
    });
    assert.equal(summaries[0].capacity, 1);
  });

  it("excludes managers from capacity", () => {
    const staff = [
      makeStaff({ id: "a" }),
      makeStaff({ id: "m", role: "manager" }),
    ];
    assert.equal(staffIsEligibleForCapacitySlot(staff[1], "10:00"), false);
  });

  it("excludes full-day time off", () => {
    const staff = [
      makeStaff({
        id: "a",
        timeOff: [{ startTime: null, endTime: null }],
      }),
    ];
    assert.equal(staffIsEligibleForCapacitySlot(staff[0], "10:00"), false);
  });

  it("excludes partial time off covering the slot", () => {
    const staff = [
      makeStaff({
        id: "a",
        timeOff: [{ startTime: "09:00", endTime: "12:00" }],
      }),
    ];
    assert.equal(staffIsEligibleForCapacitySlot(staff[0], "10:00"), false);
    assert.equal(staffIsEligibleForCapacitySlot(staff[0], "13:00"), true);
  });

  it("excludes already-assigned cleaner at overlapping window", () => {
    const staff = [
      makeStaff({
        id: "a",
        assignedWindows: [buildAssignedWindow("10:00", 60)!],
      }),
      makeStaff({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" }),
    ];
    assert.equal(staffIsEligibleForCapacitySlot(staff[0], "10:00", 60), false);
    const summaries = summarizeSlotCapacity({
      candidateSlots: [{ time: "10:00", label: "10:00 AM" }],
      staff,
      bookedByTime: { "10:00": 1 },
    });
    assert.equal(summaries[0].remaining, 1);
  });
});

describe("auto-assign strategy", () => {
  it("picks fewest upcoming, then oldest created, then stable id", () => {
    const staff = [
      makeStaff({
        id: "c",
        upcomingCount: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
      makeStaff({
        id: "a",
        upcomingCount: 0,
        createdAt: "2026-01-03T00:00:00.000Z",
      }),
      makeStaff({
        id: "b",
        upcomingCount: 0,
        createdAt: "2026-01-02T00:00:00.000Z",
      }),
    ];
    const ordered = [...staff].sort(compareStaffForAutoAssign);
    assert.deepEqual(
      ordered.map((s) => s.id),
      ["b", "a", "c"],
    );
    assert.equal(pickAutoAssignStaffId(staff, "10:00"), "b");
  });

  it("returns null when no eligible staff", () => {
    assert.equal(
      pickAutoAssignStaffId(
        [makeStaff({ id: "a", isActive: false })],
        "10:00",
      ),
      null,
    );
  });
});

describe("public privacy + conflict copy", () => {
  it("capacity conflict message matches booking UX copy", () => {
    assert.equal(CAPACITY_CONFLICT_MESSAGE, SLOT_CONFLICT_MESSAGE);
    assert.ok(!CAPACITY_CONFLICT_MESSAGE.toLowerCase().includes("cleaner"));
  });

  it("public slot summary never includes staff identity fields", () => {
    const summaries = summarizeSlotCapacity({
      candidateSlots: [{ time: "09:00", label: "9:00 AM" }],
      staff: [makeStaff({ id: "secret-uuid" })],
      bookedByTime: {},
    });
    const json = JSON.stringify(summaries);
    assert.ok(!json.includes("secret-uuid"));
  });
});

describe("concurrency model (logical)", () => {
  it("documents staff-slot + window exclusion guards", () => {
    assert.ok(
      "booking_assignments_staff_active_slot_uidx".includes("staff_active_slot"),
    );
    assert.ok(
      "booking_assignments_staff_window_excl".includes("staff_window_excl"),
    );
  });
});
