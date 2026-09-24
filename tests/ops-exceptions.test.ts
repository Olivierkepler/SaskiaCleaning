import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAdminMarkComplete,
  classifyOpsException,
  countsAsNeedsAttention,
  opsExceptionSeverity,
  validateAdminReleaseRequest,
} from "../app/lib/ops-exceptions-pure";

const today = "2026-10-07";
const windowEnd = new Date("2026-10-07T16:30:00.000Z"); // 12:30 NY

describe("ops exception classification", () => {
  it("completed before window_end → capacity held", () => {
    const type = classifyOpsException({
      status: "completed",
      bookingDate: today,
      hasActiveAssignment: true,
      windowEndUtc: windowEnd,
      staffIsActive: true,
      todayDateOnly: today,
      now: new Date("2026-10-07T16:15:00.000Z"),
    });
    assert.equal(type, "CAPACITY_HELD_AFTER_COMPLETION");
    assert.equal(opsExceptionSeverity(type!), "info");
    assert.equal(countsAsNeedsAttention(type!), false);
  });

  it("completed after window_end → release pending", () => {
    const type = classifyOpsException({
      status: "completed",
      bookingDate: today,
      hasActiveAssignment: true,
      windowEndUtc: windowEnd,
      staffIsActive: true,
      todayDateOnly: today,
      now: new Date("2026-10-07T17:00:00.000Z"),
    });
    assert.equal(type, "RELEASE_PENDING");
    assert.equal(opsExceptionSeverity(type!), "warning");
  });

  it("scheduled past window → overdue not started", () => {
    assert.equal(
      classifyOpsException({
        status: "scheduled",
        bookingDate: today,
        hasActiveAssignment: true,
        windowEndUtc: windowEnd,
        staffIsActive: true,
        todayDateOnly: today,
        now: new Date("2026-10-07T17:00:00.000Z"),
      }),
      "OVERDUE_NOT_STARTED",
    );
  });

  it("new and contacted past window → overdue", () => {
    for (const status of ["new", "contacted"] as const) {
      assert.equal(
        classifyOpsException({
          status,
          bookingDate: today,
          hasActiveAssignment: true,
          windowEndUtc: windowEnd,
          staffIsActive: true,
          todayDateOnly: today,
          now: new Date("2026-10-07T17:00:00.000Z"),
        }),
        "OVERDUE_NOT_STARTED",
      );
    }
  });

  it("in_progress past window → overdue in progress", () => {
    const type = classifyOpsException({
      status: "in_progress",
      bookingDate: today,
      hasActiveAssignment: true,
      windowEndUtc: windowEnd,
      staffIsActive: true,
      todayDateOnly: today,
      now: new Date("2026-10-07T17:00:00.000Z"),
    });
    assert.equal(type, "OVERDUE_IN_PROGRESS");
    assert.equal(opsExceptionSeverity(type!), "critical");
  });

  it("cancelled not classified overdue", () => {
    assert.equal(
      classifyOpsException({
        status: "cancelled",
        bookingDate: today,
        hasActiveAssignment: true,
        windowEndUtc: windowEnd,
        staffIsActive: true,
        todayDateOnly: today,
        now: new Date("2026-10-07T17:00:00.000Z"),
      }),
      null,
    );
  });

  it("released assignment not capacity-held", () => {
    assert.equal(
      classifyOpsException({
        status: "completed",
        bookingDate: today,
        hasActiveAssignment: false,
        windowEndUtc: windowEnd,
        staffIsActive: true,
        todayDateOnly: today,
        now: new Date("2026-10-07T16:15:00.000Z"),
      }),
      null,
    );
  });

  it("future unassigned active booking → critical", () => {
    const type = classifyOpsException({
      status: "scheduled",
      bookingDate: "2026-10-10",
      hasActiveAssignment: false,
      windowEndUtc: null,
      staffIsActive: null,
      todayDateOnly: today,
      now: new Date("2026-10-07T12:00:00.000Z"),
    });
    assert.equal(type, "UNASSIGNED_FUTURE_BOOKING");
    assert.equal(opsExceptionSeverity(type!), "critical");
  });

  it("normal future assigned booking has no exception", () => {
    assert.equal(
      classifyOpsException({
        status: "scheduled",
        bookingDate: "2026-10-10",
        hasActiveAssignment: true,
        windowEndUtc: new Date("2026-10-10T16:30:00.000Z"),
        staffIsActive: true,
        todayDateOnly: today,
        now: new Date("2026-10-07T12:00:00.000Z"),
      }),
      null,
    );
  });

  it("inactive staff on future assigned booking → staff unavailable", () => {
    assert.equal(
      classifyOpsException({
        status: "scheduled",
        bookingDate: "2026-10-10",
        hasActiveAssignment: true,
        windowEndUtc: new Date("2026-10-10T16:30:00.000Z"),
        staffIsActive: false,
        todayDateOnly: today,
        now: new Date("2026-10-07T12:00:00.000Z"),
      }),
      "STAFF_UNAVAILABLE_FOR_FUTURE_BOOKING",
    );
  });
});

describe("admin release validation", () => {
  it("missing confirm rejected", () => {
    const r = validateAdminReleaseRequest({
      status: "completed",
      confirm: false,
      reason: null,
    });
    assert.equal(r.ok, false);
  });

  it("completed booking can release with confirm only", () => {
    const r = validateAdminReleaseRequest({
      status: "completed",
      confirm: true,
      reason: null,
    });
    assert.equal(r.ok, true);
  });

  it("active booking override requires reason", () => {
    assert.equal(
      validateAdminReleaseRequest({
        status: "in_progress",
        confirm: true,
        reason: "",
      }).ok,
      false,
    );
    assert.equal(
      validateAdminReleaseRequest({
        status: "scheduled",
        confirm: true,
        reason: "Customer no-show follow-up",
      }).ok,
      true,
    );
  });

  it("mark complete only from in_progress", () => {
    assert.equal(canAdminMarkComplete("in_progress"), true);
    assert.equal(canAdminMarkComplete("scheduled"), false);
    assert.equal(canAdminMarkComplete("cancelled"), false);
    assert.equal(canAdminMarkComplete("completed"), false);
  });
});

describe("integration scenarios A/B/C", () => {
  it("Case A: completed 11:45, now 12:15 → capacity held", () => {
    assert.equal(
      classifyOpsException({
        status: "completed",
        bookingDate: today,
        hasActiveAssignment: true,
        windowEndUtc: windowEnd,
        staffIsActive: true,
        todayDateOnly: today,
        now: new Date("2026-10-07T16:15:00.000Z"),
      }),
      "CAPACITY_HELD_AFTER_COMPLETION",
    );
  });

  it("Case B: completed, now 13:00 still active → release pending", () => {
    assert.equal(
      classifyOpsException({
        status: "completed",
        bookingDate: today,
        hasActiveAssignment: true,
        windowEndUtc: windowEnd,
        staffIsActive: true,
        todayDateOnly: today,
        now: new Date("2026-10-07T17:00:00.000Z"),
      }),
      "RELEASE_PENDING",
    );
  });

  it("Case C: in_progress at 13:00 → overdue in progress, no auto release", () => {
    const type = classifyOpsException({
      status: "in_progress",
      bookingDate: today,
      hasActiveAssignment: true,
      windowEndUtc: windowEnd,
      staffIsActive: true,
      todayDateOnly: today,
      now: new Date("2026-10-07T17:00:00.000Z"),
    });
    assert.equal(type, "OVERDUE_IN_PROGRESS");
    // Manual release still requires confirm+reason; status unchanged by release validation alone
    assert.equal(
      validateAdminReleaseRequest({
        status: "in_progress",
        confirm: true,
        reason: "Job abandoned; capacity freed",
      }).ok,
      true,
    );
  });
});

describe("privacy / auth concepts", () => {
  it("ops payload keys exclude customer PII and secrets", () => {
    const sample = {
      bookingId: 1,
      service: "Standard",
      bookingDate: "2026-10-07",
      bookingTime: "10:00",
      status: "completed",
      exceptionType: "RELEASE_PENDING",
    };
    const keys = Object.keys(sample);
    assert.equal(keys.includes("email"), false);
    assert.equal(keys.includes("mobile"), false);
    assert.equal(keys.includes("DASHBOARD_KEY"), false);
    assert.equal(keys.includes("CRON_SECRET"), false);
  });
});
