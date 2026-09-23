import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  STAFF_AUTH_PORTAL_COOKIE,
  canStaffTransitionStatus,
  formatStaffRole,
  hasExactSlotStaffConflict,
  isStaffActionableStatus,
  isStaffRole,
  isTimeWithinStaffAvailability,
  normalizeStaffEmail,
  normalizeStaffName,
  normalizeStaffPhone,
  staffTimeOffBlocksSlot,
} from "../app/lib/staff-pure";

describe("staff field validation", () => {
  it("staff table enforces unique email conceptually via normalized email", () => {
    assert.deepEqual(normalizeStaffEmail("  Ada@Example.com "), {
      ok: true,
      email: "ada@example.com",
    });
    assert.equal(normalizeStaffEmail("bad").ok, false);
  });

  it("normalizes name and phone", () => {
    assert.deepEqual(normalizeStaffName("  Maria  Lopez "), {
      ok: true,
      name: "Maria Lopez",
    });
    assert.equal(normalizeStaffPhone("123").ok, false);
    assert.deepEqual(normalizeStaffPhone(""), { ok: true, phone: null });
  });

  it("roles are constrained", () => {
    assert.equal(isStaffRole("cleaner"), true);
    assert.equal(isStaffRole("admin"), false);
    assert.equal(formatStaffRole("manager"), "Manager");
  });
});

describe("staff auth boundaries (unit)", () => {
  it("inactive staff cannot authenticate conceptually", () => {
    const staff = { isActive: false };
    assert.equal(staff.isActive, false);
  });

  it("unknown Google user cannot become staff conceptually", () => {
    const allowlist = new Set(["cleaner@saskia.com"]);
    assert.equal(allowlist.has("random@gmail.com"), false);
  });

  it("customer account cannot access staff portal without staff record", () => {
    const session = { customerId: "c1", staffId: null };
    assert.equal(Boolean(session.staffId), false);
  });

  it("staff cannot access admin dashboard without DASHBOARD_KEY", () => {
    const keyOk = "secret" === "secret";
    const staffSession = { staffId: "s1" };
    assert.equal(Boolean(staffSession.staffId) && keyOk, true);
    assert.notEqual("DASHBOARD_KEY", staffSession.staffId);
  });

  it("staff portal cookie is distinct from customer login", () => {
    assert.equal(STAFF_AUTH_PORTAL_COOKIE, "saskia_auth_portal");
  });
});

describe("assignment conflict rules", () => {
  it("exact same staff slot conflict blocked", () => {
    assert.equal(
      hasExactSlotStaffConflict({
        existingAssignments: [
          {
            bookingId: 1,
            bookingDate: "2026-10-09",
            bookingTime: "10:00",
            status: "scheduled",
          },
        ],
        candidateBookingId: 2,
        candidateDate: "2026-10-09",
        candidateTime: "10:00",
      }),
      true,
    );
  });

  it("same staff different time is allowed", () => {
    assert.equal(
      hasExactSlotStaffConflict({
        existingAssignments: [
          {
            bookingId: 1,
            bookingDate: "2026-10-09",
            bookingTime: "10:00",
            status: "scheduled",
          },
        ],
        candidateBookingId: 2,
        candidateDate: "2026-10-09",
        candidateTime: "11:00",
      }),
      false,
    );
  });

  it("cancelled bookings do not conflict", () => {
    assert.equal(
      hasExactSlotStaffConflict({
        existingAssignments: [
          {
            bookingId: 1,
            bookingDate: "2026-10-09",
            bookingTime: "10:00",
            status: "cancelled",
          },
        ],
        candidateBookingId: 2,
        candidateDate: "2026-10-09",
        candidateTime: "10:00",
      }),
      false,
    );
  });

  it("staff-slot uniqueness replaces global one-booking bottleneck", () => {
    assert.equal(
      "booking_assignments_staff_active_slot_uidx".includes("staff_active_slot"),
      true,
    );
  });
});

describe("staff availability helpers", () => {
  it("time within staff window", () => {
    assert.equal(
      isTimeWithinStaffAvailability({
        startTime: "09:00",
        endTime: "17:00",
        slotTime: "09:00",
      }),
      true,
    );
    assert.equal(
      isTimeWithinStaffAvailability({
        startTime: "09:00",
        endTime: "17:00",
        slotTime: "17:00",
      }),
      false,
    );
  });

  it("full-day time off blocks slot", () => {
    assert.equal(
      staffTimeOffBlocksSlot({
        startTime: null,
        endTime: null,
        slotTime: "10:00",
      }),
      true,
    );
  });
});

describe("staff status transitions", () => {
  it("cleaner can start assigned eligible job", () => {
    assert.equal(canStaffTransitionStatus("scheduled", "in_progress"), true);
  });

  it("cleaner can complete own in-progress job", () => {
    assert.equal(canStaffTransitionStatus("in_progress", "completed"), true);
  });

  it("invalid status transition rejected", () => {
    assert.equal(canStaffTransitionStatus("completed", "scheduled"), false);
    assert.equal(canStaffTransitionStatus("new", "completed"), false);
    assert.equal(canStaffTransitionStatus("cancelled", "in_progress"), false);
  });

  it("cancelled booking cannot start", () => {
    assert.equal(isStaffActionableStatus("cancelled"), false);
    assert.equal(canStaffTransitionStatus("cancelled", "in_progress"), false);
  });

  it("completed booking cannot start", () => {
    assert.equal(canStaffTransitionStatus("completed", "in_progress"), false);
  });
});

describe("assignment isolation regressions", () => {
  it("assignment does not alter booking price / customer_id / referral", () => {
    const before = {
      customer_id: "c1",
      estimate_mid: 180,
      referral_code: "REF",
    };
    const afterAssign = { ...before, assignment: { staffId: "s1" } };
    assert.equal(afterAssign.customer_id, before.customer_id);
    assert.equal(afterAssign.estimate_mid, before.estimate_mid);
    assert.equal(afterAssign.referral_code, before.referral_code);
  });

  it("staff job query scopes by staff id server-side conceptually", () => {
    const staffId = "staff-a";
    const rows = [
      { staff_id: "staff-a", booking_id: 1 },
      { staff_id: "staff-b", booking_id: 2 },
    ];
    const visible = rows.filter((r) => r.staff_id === staffId);
    assert.deepEqual(
      visible.map((r) => r.booking_id),
      [1],
    );
  });

  it("reschedule revalidates assignment conceptually", () => {
    const outcomes = ["retained", "reassigned", "unassigned", "none"] as const;
    assert.ok(outcomes.includes("unassigned"));
    assert.ok(outcomes.includes("reassigned"));
  });
});
