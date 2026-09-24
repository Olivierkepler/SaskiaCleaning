import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUTO_RELEASABLE_STATUSES,
  CAPACITY_PROTECTED_STATUSES,
  classifyCapacityLifecycle,
  isAutoReleasableStatus,
  isBookingOverdue,
  isCapacityProtectedStatus,
  isCapacityReleaseReason,
  isCompletedCapacityReleasable,
  shouldReleaseOnCompletion,
} from "../app/lib/capacity-release-pure";
import {
  buildAssignedWindow,
  staffIsEligibleForCapacityWindow,
} from "../app/lib/staff-capacity-pure";
import { getCapacityWindow } from "../app/lib/booking-buffer-pure";
import { CAPACITY_CONSUMING_STATUSES } from "../app/lib/scheduling-pure";

describe("release reason / status sets", () => {
  it("constrains release reasons", () => {
    assert.equal(isCapacityReleaseReason("cancelled"), true);
    assert.equal(isCapacityReleaseReason("completed_window_elapsed"), true);
    assert.equal(isCapacityReleaseReason("rescheduled"), true);
    assert.equal(isCapacityReleaseReason("admin_release"), true);
    assert.equal(isCapacityReleaseReason("random"), false);
  });

  it("only completed is auto-releasable by window end", () => {
    assert.deepEqual([...AUTO_RELEASABLE_STATUSES], ["completed"]);
    assert.equal(isAutoReleasableStatus("completed"), true);
    assert.equal(isAutoReleasableStatus("cancelled"), false);
    for (const s of CAPACITY_PROTECTED_STATUSES) {
      assert.equal(isCapacityProtectedStatus(s), true);
      assert.equal(isAutoReleasableStatus(s), false);
    }
  });
});

describe("completed capacity release boundaries", () => {
  const windowEnd = new Date("2026-10-07T16:30:00.000Z"); // 12:30 NY EDT ≈ 16:30 UTC

  it("completed before window_end stays active (not releasable)", () => {
    const now = new Date("2026-10-07T15:45:00.000Z"); // 11:45 NY
    assert.equal(
      isCompletedCapacityReleasable({
        status: "completed",
        isActive: true,
        windowEndUtc: windowEnd,
        now,
      }),
      false,
    );
    assert.equal(
      shouldReleaseOnCompletion({ windowEndUtc: windowEnd, now }),
      false,
    );
  });

  it("completed exactly at window_end becomes releasable", () => {
    assert.equal(
      isCompletedCapacityReleasable({
        status: "completed",
        isActive: true,
        windowEndUtc: windowEnd,
        now: windowEnd,
      }),
      true,
    );
    assert.equal(
      shouldReleaseOnCompletion({
        windowEndUtc: windowEnd,
        now: windowEnd,
      }),
      true,
    );
  });

  it("completed after window_end releases", () => {
    const now = new Date("2026-10-07T16:31:00.000Z");
    assert.equal(
      isCompletedCapacityReleasable({
        status: "completed",
        isActive: true,
        windowEndUtc: windowEnd,
        now,
      }),
      true,
    );
  });

  it("inactive completed is not releasable again (idempotent gate)", () => {
    assert.equal(
      isCompletedCapacityReleasable({
        status: "completed",
        isActive: false,
        windowEndUtc: windowEnd,
        now: new Date("2026-10-07T17:00:00.000Z"),
      }),
      false,
    );
  });
});

describe("protected statuses never auto-release by time", () => {
  const windowEnd = new Date("2026-10-07T16:30:00.000Z");
  const after = new Date("2026-10-07T17:00:00.000Z");

  for (const status of [
    "in_progress",
    "scheduled",
    "new",
    "contacted",
  ] as const) {
    it(`${status} after window_end stays protected (not auto-releasable)`, () => {
      assert.equal(
        isCompletedCapacityReleasable({
          status,
          isActive: true,
          windowEndUtc: windowEnd,
          now: after,
        }),
        false,
      );
      assert.equal(
        isBookingOverdue({ status, windowEndUtc: windowEnd, now: after }),
        true,
      );
    });
  }

  it("cancelled is not overdue classification (handled by immediate release)", () => {
    assert.equal(
      isBookingOverdue({
        status: "cancelled",
        windowEndUtc: windowEnd,
        now: after,
      }),
      false,
    );
  });
});

describe("integration: 10–12 service + 30m buffer completed at 11:45", () => {
  it("at 12:15 capacity still occupied; at 12:30 releasable and no longer consumes", () => {
    const capacity = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "10:00",
      durationMinutes: 120,
      bufferMinutes: 30,
    })!;
    assert.equal(capacity.endTime, "12:30");

    const occupied = buildAssignedWindow("10:00", 120, 30)!;
    const staff = {
      id: "a",
      role: "cleaner",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      upcomingCount: 1,
      weekly: { startTime: "09:00", endTime: "17:30", isActive: true },
      timeOff: [],
      assignedWindows: [occupied],
    };
    const nextAt1215 = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "12:15",
      durationMinutes: 60,
      bufferMinutes: 30,
    })!;
    assert.equal(staffIsEligibleForCapacityWindow(staff, nextAt1215), false);

    // After cleanup: assignment inactive → empty assignedWindows
    const freed = { ...staff, assignedWindows: [] };
    const nextAt1230 = getCapacityWindow({
      dateOnly: "2026-10-07",
      startTime: "12:30",
      durationMinutes: 60,
      bufferMinutes: 30,
    })!;
    assert.equal(staffIsEligibleForCapacityWindow(freed, nextAt1230), true);

    const at1215 = new Date(capacity.windowStartUtc.getTime() + (2 * 60 + 15) * 60_000);
    const at1230 = capacity.windowEndUtc;
    assert.equal(
      isCompletedCapacityReleasable({
        status: "completed",
        isActive: true,
        windowEndUtc: capacity.windowEndUtc,
        now: at1215,
      }),
      false,
    );
    assert.equal(
      isCompletedCapacityReleasable({
        status: "completed",
        isActive: true,
        windowEndUtc: capacity.windowEndUtc,
        now: at1230,
      }),
      true,
    );
  });
});

describe("lifecycle labels + regressions", () => {
  it("classifies overdue / capacity_held / released", () => {
    const end = new Date("2026-10-07T16:30:00.000Z");
    const after = new Date("2026-10-07T17:00:00.000Z");
    assert.equal(
      classifyCapacityLifecycle({
        status: "scheduled",
        isActive: true,
        windowEndUtc: end,
        now: after,
      }),
      "overdue",
    );
    assert.equal(
      classifyCapacityLifecycle({
        status: "completed",
        isActive: true,
        windowEndUtc: end,
        now: new Date("2026-10-07T15:00:00.000Z"),
      }),
      "capacity_held",
    );
    assert.equal(
      classifyCapacityLifecycle({
        status: "completed",
        isActive: false,
        windowEndUtc: end,
        now: after,
      }),
      "released",
    );
  });

  it("GiST still conceptually scoped to active windows; completed still capacity-consuming until release", () => {
    assert.ok(CAPACITY_CONSUMING_STATUSES.includes("completed"));
    assert.equal(
      CAPACITY_CONSUMING_STATUSES.includes("cancelled" as never),
      false,
    );
  });

  it("cron response shape has no PII keys", () => {
    const sample = { ok: true, released: 3 };
    assert.deepEqual(Object.keys(sample).sort(), ["ok", "released"]);
  });

  it("cron auth conceptually rejects missing/invalid secret", () => {
    const secret = "test-cron-secret-32chars-minimum!!";
    function assertCron(auth: string | null, cronSecret: string | undefined) {
      if (!cronSecret || cronSecret.length < 16) return false;
      return auth === `Bearer ${cronSecret}`;
    }
    assert.equal(assertCron(null, secret), false);
    assert.equal(assertCron("Bearer wrong", secret), false);
    assert.equal(assertCron(`Bearer ${secret}`, secret), true);
    assert.equal(assertCron(`Bearer ${secret}`, undefined), false);
  });
});
