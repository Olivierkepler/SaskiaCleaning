import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_JOB_BUFFER_MINUTES,
  MAX_JOB_BUFFER_MINUTES,
  getCapacityWindow,
  normalizeBufferMinutes,
  resolveEffectiveBufferMinutes,
} from "../app/lib/booking-buffer-pure";
import { getBookingWindow } from "../app/lib/booking-duration-pure";
import { bookingFitsBusinessHours } from "../app/lib/booking-duration-pure";
import {
  buildAssignedWindow,
  pickAutoAssignStaffIdForWindow,
  staffIsEligibleForCapacityWindow,
  summarizeSlotCapacityForDuration,
  type StaffCapacitySnapshot,
} from "../app/lib/staff-capacity-pure";
import { hasOverlappingStaffConflict } from "../app/lib/staff-pure";

function cleaner(partial: Partial<StaffCapacitySnapshot> & { id: string }): StaffCapacitySnapshot {
  return {
    id: partial.id,
    role: partial.role ?? "cleaner",
    isActive: partial.isActive ?? true,
    createdAt: partial.createdAt ?? "2026-01-01T00:00:00.000Z",
    upcomingCount: partial.upcomingCount ?? 0,
    weekly: partial.weekly ?? {
      startTime: "09:00",
      endTime: "17:30",
      isActive: true,
    },
    timeOff: partial.timeOff ?? [],
    assignedWindows: partial.assignedWindows ?? [],
  };
}

describe("buffer config", () => {
  it("loads architecture default of 30 minutes", () => {
    assert.equal(DEFAULT_JOB_BUFFER_MINUTES, 30);
  });

  it("normalizes integer buffers and rejects out of range", () => {
    assert.deepEqual(normalizeBufferMinutes(0), { ok: true, minutes: 0 });
    assert.deepEqual(normalizeBufferMinutes(30), { ok: true, minutes: 30 });
    assert.deepEqual(normalizeBufferMinutes(MAX_JOB_BUFFER_MINUTES), {
      ok: true,
      minutes: MAX_JOB_BUFFER_MINUTES,
    });
    assert.equal(normalizeBufferMinutes(-1).ok, false);
    assert.equal(normalizeBufferMinutes(181).ok, false);
    assert.equal(normalizeBufferMinutes(30.5).ok, false);
  });

  it("server-style resolve prefers snapshot then fallback", () => {
    assert.equal(resolveEffectiveBufferMinutes(45), 45);
    assert.equal(resolveEffectiveBufferMinutes(null), 30);
    assert.equal(resolveEffectiveBufferMinutes(undefined), 30);
  });
});

describe("capacity vs service windows", () => {
  it("keeps service window as duration only", () => {
    const service = getBookingWindow({
      dateOnly: "2026-10-07",
      startTime: "10:00",
      durationMinutes: 120,
    })!;
    assert.equal(service.endTime, "12:00");
    assert.equal(service.endMinutes, 12 * 60);
  });

  it("extends capacity window by post-job buffer", () => {
    const capacity = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "10:00",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    assert.equal(capacity.serviceEndMinutes, 12 * 60);
    assert.equal(capacity.endMinutes, 12 * 60 + 30);
    assert.equal(capacity.endTime, "12:30");
    assert.equal(capacity.bufferMinutes, 30);
  });

  it("10–12 service + 30m buffer blocks 12:00 and 12:15, allows 12:30", () => {
    const occupied = buildAssignedWindow("10:00", 120, 30)!;
    const staff = [cleaner({ id: "a", assignedWindows: [occupied] })];

    const at1200 = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "12:00",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    const at1215 = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "12:15",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    const at1230 = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "12:30",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;

    assert.equal(staffIsEligibleForCapacityWindow(staff[0], at1200), false);
    assert.equal(staffIsEligibleForCapacityWindow(staff[0], at1215), false);
    assert.equal(staffIsEligibleForCapacityWindow(staff[0], at1230), true);
  });

  it("zero buffer preserves Phase 11.9 adjacency", () => {
    const occupied = buildAssignedWindow("10:00", 120, 0)!;
    const staff = [cleaner({ id: "a", assignedWindows: [occupied] })];
    const adjacent = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "12:00",
      durationMinutes: 120,
      bufferMinutes: 0,
    })!;
    assert.equal(staffIsEligibleForCapacityWindow(staff[0], adjacent), true);
  });
});

describe("business hours vs staff availability", () => {
  it("business hours validate service window only (3–5 OK with buffer past close)", () => {
    const service = getBookingWindow({
      dateOnly: "2026-10-07",
      startTime: "15:00",
      durationMinutes: 120,
    })!;
    assert.equal(
      bookingFitsBusinessHours({
        window: service,
        businessStartTime: "09:00",
        businessEndTime: "17:00",
      }),
      true,
    );

    const capacity = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "15:00",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    assert.equal(capacity.endMinutes, 17 * 60 + 30);
  });

  it("staff weekly availability must cover capacity window", () => {
    const capacity = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "15:00",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    const untilFive = cleaner({
      id: "a",
      weekly: { startTime: "09:00", endTime: "17:00", isActive: true },
    });
    const untilFiveThirty = cleaner({
      id: "b",
      weekly: { startTime: "09:00", endTime: "17:30", isActive: true },
    });
    assert.equal(staffIsEligibleForCapacityWindow(untilFive, capacity), false);
    assert.equal(
      staffIsEligibleForCapacityWindow(untilFiveThirty, capacity),
      true,
    );
  });

  it("staff time off overlapping buffer blocks eligibility", () => {
    const capacity = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "10:00",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    const staff = cleaner({
      id: "a",
      timeOff: [{ startTime: "12:15", endTime: "13:00" }],
    });
    assert.equal(staffIsEligibleForCapacityWindow(staff, capacity), false);
  });
});

describe("multi-cleaner buffered capacity", () => {
  it("one cleaner buffered overlap unavailable; two allow second job", () => {
    const occupied = buildAssignedWindow("10:00", 120, 30)!;
    const one = [
      cleaner({ id: "a", assignedWindows: [occupied], upcomingCount: 1 }),
    ];
    const two = [
      cleaner({ id: "a", assignedWindows: [occupied], upcomingCount: 1 }),
      cleaner({ id: "b", upcomingCount: 0 }),
    ];
    const candidate = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "10:00",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    assert.equal(pickAutoAssignStaffIdForWindow(one, candidate), null);
    assert.equal(pickAutoAssignStaffIdForWindow(two, candidate), "b");
  });

  it("both occupied removes slot", () => {
    const occupied = buildAssignedWindow("10:00", 120, 30)!;
    const staff = [
      cleaner({ id: "a", assignedWindows: [occupied] }),
      cleaner({ id: "b", assignedWindows: [occupied] }),
    ];
    const summary = summarizeSlotCapacityForDuration({
      candidateSlots: [{ time: "10:00", label: "10:00 AM" }],
      staff,
      durationMinutes: 120,
      bufferMinutes: 30,
      dateOnly: "2026-10-07",
    });
    assert.equal(summary[0].available, false);
    assert.equal(summary[0].remaining, 0);
  });
});

describe("manual assignment buffer conflict", () => {
  it("rejects overlapping buffered assignment; allows at capacity end", () => {
    const existing = [
      {
        bookingId: 1,
        bookingDate: "2026-10-07",
        bookingTime: "10:00",
        durationMinutes: 120,
        bufferMinutes: 30,
        status: "scheduled",
      },
    ];
    assert.equal(
      hasOverlappingStaffConflict({
        existingAssignments: existing,
        candidateBookingId: 2,
        candidateDate: "2026-10-07",
        candidateTime: "12:00",
        candidateDurationMinutes: 120,
        candidateBufferMinutes: 30,
      }),
      true,
    );
    assert.equal(
      hasOverlappingStaffConflict({
        existingAssignments: existing,
        candidateBookingId: 2,
        candidateDate: "2026-10-07",
        candidateTime: "12:15",
        candidateDurationMinutes: 120,
        candidateBufferMinutes: 30,
      }),
      true,
    );
    assert.equal(
      hasOverlappingStaffConflict({
        existingAssignments: existing,
        candidateBookingId: 2,
        candidateDate: "2026-10-07",
        candidateTime: "12:30",
        candidateDurationMinutes: 120,
        candidateBufferMinutes: 30,
      }),
      false,
    );
  });

  it("policy change does not alter old snapshot math when bufferMinutes stored", () => {
    // Booking snapshotted at 30; global policy later becomes 60 — reschedule
    // uses stored 30.
    const stored = resolveEffectiveBufferMinutes(30);
    assert.equal(stored, 30);
    const capacity = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "10:00",
      durationMinutes: 120,
      bufferMinutes: stored,
    })!;
    assert.equal(capacity.endTime, "12:30");
  });
});

describe("public privacy / snapshot semantics", () => {
  it("omitted buffer on assigned window keeps adjacency for legacy tests", () => {
    const w = buildAssignedWindow("10:00", 120);
    assert.ok(w);
    assert.equal(w!.bufferMinutes, 0);
    assert.equal(w!.endMinutes, 12 * 60);
  });

  it("null buffer on assigned window uses legacy fallback", () => {
    const w = buildAssignedWindow("10:00", 120, null);
    assert.ok(w);
    assert.equal(w!.bufferMinutes, 30);
    assert.equal(w!.endMinutes, 12 * 60 + 30);
  });
});
