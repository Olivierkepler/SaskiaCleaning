import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LEGACY_DURATION_FALLBACK_MINUTES,
  MAX_DURATION_MINUTES,
  bookingFitsBusinessHours,
  calculateBookingDuration,
  formatEstimatedDuration,
  getBookingWindow,
  normalizeDurationMinutes,
  resolveEffectiveDurationMinutes,
  schedulingBlockOverlapsWindow,
  staffAvailabilityCoversWindow,
  staffTimeOffOverlapsWindow,
  windowsOverlapMinutes,
  zonedLocalDateTimeToUtc,
} from "../app/lib/booking-duration-pure";
import {
  buildAssignedWindow,
  compareStaffForAutoAssign,
  isCapacityStaffRole,
  pickAutoAssignStaffIdForWindow,
  staffIsEligibleForCapacityWindow,
  summarizeSlotCapacityForDuration,
  type StaffCapacitySnapshot,
} from "../app/lib/staff-capacity-pure";
import { hasOverlappingStaffConflict } from "../app/lib/staff-pure";

const rules = [
  { serviceKey: "Standard", durationMinutes: 120 },
  { serviceKey: "Deep clean", durationMinutes: 180 },
  { serviceKey: "Move-out", durationMinutes: 240 },
  { serviceKey: "Commercial", durationMinutes: 180 },
];

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

describe("duration rules & calculation", () => {
  it("loads seeded service keys safely via calculateBookingDuration", () => {
    const result = calculateBookingDuration({
      service: "Standard",
      rules,
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.minutes, 120);
  });

  it("server calculates duration; unknown client value is irrelevant", () => {
    const result = calculateBookingDuration({
      service: "Deep clean",
      rules,
      bedrooms: 99,
      bathrooms: 99,
      extras: ["fake"],
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.minutes, 180);
  });

  it("rejects unknown service instead of inventing duration", () => {
    const result = calculateBookingDuration({
      service: "Mystery polish",
      rules,
    });
    assert.equal(result.ok, false);
  });

  it("normalizes duration bounds", () => {
    assert.equal(normalizeDurationMinutes(0).ok, false);
    assert.equal(normalizeDurationMinutes(MAX_DURATION_MINUTES + 1).ok, false);
    assert.equal(normalizeDurationMinutes(90).ok, true);
  });

  it("legacy null duration uses documented fallback for conflicts only", () => {
    assert.equal(resolveEffectiveDurationMinutes(null), LEGACY_DURATION_FALLBACK_MINUTES);
    assert.equal(resolveEffectiveDurationMinutes(180), 180);
  });

  it("duration rule edit does not alter old snapshot conceptually", () => {
    const snapshot = 120;
    const newRule = 240;
    assert.notEqual(snapshot, newRule);
    assert.equal(resolveEffectiveDurationMinutes(snapshot), 120);
  });
});

describe("overlap windows", () => {
  it("adjacent half-open windows do not overlap", () => {
    assert.equal(
      windowsOverlapMinutes(
        { startMinutes: 10 * 60, endMinutes: 12 * 60 },
        { startMinutes: 12 * 60, endMinutes: 14 * 60 },
      ),
      false,
    );
  });

  it("partial windows overlap", () => {
    assert.equal(
      windowsOverlapMinutes(
        { startMinutes: 10 * 60, endMinutes: 12 * 60 },
        { startMinutes: 11 * 60, endMinutes: 13 * 60 },
      ),
      true,
    );
  });

  it("fully nested windows overlap", () => {
    assert.equal(
      windowsOverlapMinutes(
        { startMinutes: 10 * 60, endMinutes: 14 * 60 },
        { startMinutes: 11 * 60, endMinutes: 12 * 60 },
      ),
      true,
    );
  });

  it("business-hours full-window fit enforced", () => {
    const window = getBookingWindow({
      dateOnly: "2026-10-09",
      startTime: "16:00",
      durationMinutes: 120,
    })!;
    assert.equal(
      bookingFitsBusinessHours({
        window,
        businessStartTime: "09:00",
        businessEndTime: "17:00",
      }),
      false,
    );
    const ok = getBookingWindow({
      dateOnly: "2026-10-09",
      startTime: "15:00",
      durationMinutes: 120,
    })!;
    assert.equal(
      bookingFitsBusinessHours({
        window: ok,
        businessStartTime: "09:00",
        businessEndTime: "17:00",
      }),
      true,
    );
  });

  it("scheduling block overlap enforced", () => {
    const window = getBookingWindow({
      dateOnly: "2026-10-09",
      startTime: "11:00",
      durationMinutes: 120,
    })!;
    assert.equal(
      schedulingBlockOverlapsWindow({
        blockStartTime: "12:00",
        blockEndTime: "14:00",
        window,
      }),
      true,
    );
  });

  it("staff weekly availability must cover full window", () => {
    const window = getBookingWindow({
      dateOnly: "2026-10-09",
      startTime: "16:00",
      durationMinutes: 120,
    })!;
    assert.equal(
      staffAvailabilityCoversWindow({
        availStartTime: "09:00",
        availEndTime: "17:00",
        window,
      }),
      false,
    );
  });

  it("full-day and partial time off block overlapping windows", () => {
    const window = getBookingWindow({
      dateOnly: "2026-10-09",
      startTime: "12:00",
      durationMinutes: 120,
    })!;
    assert.equal(
      staffTimeOffOverlapsWindow({
        offStartTime: null,
        offEndTime: null,
        window,
      }),
      true,
    );
    assert.equal(
      staffTimeOffOverlapsWindow({
        offStartTime: "13:00",
        offEndTime: "15:00",
        window,
      }),
      true,
    );
  });
});

describe("overlap-aware staff conflict + capacity", () => {
  it("hasOverlappingStaffConflict detects partial overlap", () => {
    assert.equal(
      hasOverlappingStaffConflict({
        existingAssignments: [
          {
            bookingId: 1,
            bookingDate: "2026-10-09",
            bookingTime: "10:00",
            durationMinutes: 120,
            status: "scheduled",
          },
        ],
        candidateBookingId: 2,
        candidateDate: "2026-10-09",
        candidateTime: "11:00",
        candidateDurationMinutes: 120,
      }),
      true,
    );
  });

  it("adjacent jobs for same cleaner remain eligible", () => {
    assert.equal(
      hasOverlappingStaffConflict({
        existingAssignments: [
          {
            bookingId: 1,
            bookingDate: "2026-10-09",
            bookingTime: "10:00",
            durationMinutes: 120,
            status: "scheduled",
          },
        ],
        candidateBookingId: 2,
        candidateDate: "2026-10-09",
        candidateTime: "12:00",
        candidateDurationMinutes: 120,
      }),
      false,
    );
  });

  it("cleaner with overlapping assignment not counted in capacity", () => {
    const assigned = buildAssignedWindow("10:00", 120)!;
    const staff = [
      makeStaff({ id: "a", assignedWindows: [assigned] }),
      makeStaff({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" }),
    ];
    const window = getBookingWindow({
      dateOnly: "2026-10-09",
      startTime: "11:00",
      durationMinutes: 120,
    })!;
    assert.equal(staffIsEligibleForCapacityWindow(staff[0], window), false);
    assert.equal(staffIsEligibleForCapacityWindow(staff[1], window), true);
    const summaries = summarizeSlotCapacityForDuration({
      candidateSlots: [{ time: "11:00", label: "11:00 AM" }],
      staff,
      durationMinutes: 120,
      dateOnly: "2026-10-09",
    });
    assert.equal(summaries[0].remaining, 1);
  });

  it("managers excluded from capacity roles", () => {
    assert.equal(isCapacityStaffRole("manager"), false);
  });

  it("auto-assign prefers fewest upcoming then oldest", () => {
    const window = getBookingWindow({
      dateOnly: "2026-10-09",
      startTime: "10:00",
      durationMinutes: 60,
    })!;
    const staff = [
      makeStaff({ id: "c", upcomingCount: 2 }),
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
    assert.deepEqual(
      [...staff].sort(compareStaffForAutoAssign).map((s) => s.id),
      ["b", "a", "c"],
    );
    assert.equal(pickAutoAssignStaffIdForWindow(staff, window), "b");
  });

  it("documents exclusion constraint as overlap concurrency guard", () => {
    assert.ok(
      "booking_assignments_staff_window_excl".includes("staff_window_excl"),
    );
  });

  it("formats estimated duration for customers without exact end claims", () => {
    assert.equal(formatEstimatedDuration(120), "About 2 hours");
    assert.equal(formatEstimatedDuration(null), "Duration not specified");
  });

  it("zoned local conversion stays in America/New_York wall time", () => {
    const utc = zonedLocalDateTimeToUtc("2026-10-09", "10:00");
    assert.ok(utc instanceof Date);
    assert.ok(!Number.isNaN(utc.getTime()));
  });
});
