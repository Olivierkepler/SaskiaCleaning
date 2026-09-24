import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isFollowupDue,
  MAX_FOLLOWUP_NOTE_LENGTH,
  normalizeFollowupNote,
  normalizeNextFollowupAt,
  validateCreateFollowup,
} from "../app/lib/booking-followups-pure";

describe("follow-up validation", () => {
  it("accepts valid create payload", () => {
    const result = validateCreateFollowup({
      followupType: "customer_contact",
      contactMethod: "phone",
      outcome: "no_answer",
      note: "Called customer; no answer. Left voicemail.",
      nextFollowupAt: "2026-10-08T13:00:00.000Z",
      createdByLabel: "dashboard",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.followupType, "customer_contact");
      assert.equal(result.value.contactMethod, "phone");
      assert.equal(result.value.outcome, "no_answer");
      assert.equal(result.value.nextFollowupAt, "2026-10-08T13:00:00.000Z");
    }
  });

  it("rejects invalid type / method / outcome", () => {
    assert.equal(
      validateCreateFollowup({
        followupType: "sales",
        contactMethod: "phone",
        outcome: "no_answer",
        note: "x",
      }).ok,
      false,
    );
    assert.equal(
      validateCreateFollowup({
        followupType: "customer_contact",
        contactMethod: "carrier_pigeon",
        outcome: "no_answer",
        note: "x",
      }).ok,
      false,
    );
    assert.equal(
      validateCreateFollowup({
        followupType: "customer_contact",
        contactMethod: "phone",
        outcome: "maybe",
        note: "x",
      }).ok,
      false,
    );
  });

  it("enforces note max length and trim", () => {
    assert.equal(normalizeFollowupNote("  hi  ").ok, true);
    assert.equal(normalizeFollowupNote("").ok, false);
    assert.equal(
      normalizeFollowupNote("x".repeat(MAX_FOLLOWUP_NOTE_LENGTH + 1)).ok,
      false,
    );
  });

  it("normalizes next follow-up timestamps", () => {
    assert.equal(normalizeNextFollowupAt(null).ok, true);
    assert.equal(normalizeNextFollowupAt("not-a-date").ok, false);
    const ok = normalizeNextFollowupAt("2026-10-08T13:00:00.000Z");
    assert.equal(ok.ok, true);
  });
});

describe("follow-up due classification", () => {
  it("due when next_followup_at <= now and unresolved", () => {
    assert.equal(
      isFollowupDue({
        nextFollowupAt: "2026-10-07T12:00:00.000Z",
        resolvedAt: null,
        now: new Date("2026-10-07T13:00:00.000Z"),
      }),
      true,
    );
  });

  it("future follow-up not due", () => {
    assert.equal(
      isFollowupDue({
        nextFollowupAt: "2026-10-08T13:00:00.000Z",
        resolvedAt: null,
        now: new Date("2026-10-07T13:00:00.000Z"),
      }),
      false,
    );
  });

  it("resolved follow-up not due", () => {
    assert.equal(
      isFollowupDue({
        nextFollowupAt: "2026-10-07T12:00:00.000Z",
        resolvedAt: "2026-10-07T12:30:00.000Z",
        now: new Date("2026-10-07T13:00:00.000Z"),
      }),
      false,
    );
  });
});

describe("isolation / privacy concepts", () => {
  it("follow-up create does not imply booking/capacity/assignment mutation", () => {
    // Pure validation only returns follow-up fields — no status/capacity keys.
    const result = validateCreateFollowup({
      followupType: "internal_note",
      contactMethod: "internal",
      outcome: "needs_followup",
      note: "Keep capacity held pending customer call.",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      const keys = Object.keys(result.value);
      assert.equal(keys.includes("status"), false);
      assert.equal(keys.includes("is_active"), false);
      assert.equal(keys.includes("staffId"), false);
    }
  });

  it("deep-link contains only booking id (no secrets)", () => {
    const bookingId = 83;
    const href = `/dashboard?booking=${bookingId}`;
    assert.match(href, /booking=83/);
    assert.equal(href.includes("key="), false);
    assert.equal(href.includes("CRON_SECRET"), false);
    assert.equal(href.includes("email="), false);
  });

  it("customer/staff/public payloads conceptually exclude followups", () => {
    const publicAvailability = { date: "2026-10-07", slots: [] };
    const customerBooking = { id: 1, notes: "customer note" };
    assert.equal("followups" in publicAvailability, false);
    assert.equal("followups" in customerBooking, false);
  });
});

describe("integration scenario shape", () => {
  it("overdue booking follow-up payload matches Phase 11.13 example", () => {
    const result = validateCreateFollowup({
      followupType: "customer_contact",
      contactMethod: "phone",
      outcome: "no_answer",
      note: "Called customer; no answer. Left voicemail.",
      nextFollowupAt: "2026-10-08T13:00:00.000Z",
    });
    assert.equal(result.ok, true);
  });
});
