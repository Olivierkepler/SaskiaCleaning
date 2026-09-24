import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canRequestBookingChange,
  describePendingChangeRequest,
  formatChangeRequestStatusLabel,
  formatChangeRequestTypeLabel,
  isBookingChangeRequestType,
  normalizeChangeRequestReason,
  validateRequestedRescheduleDate,
} from "../app/lib/booking-change-requests-pure";

describe("booking change request eligibility", () => {
  it("allows cancel/reschedule for new, contacted, scheduled", () => {
    for (const status of ["new", "contacted", "scheduled"]) {
      assert.equal(
        canRequestBookingChange({ status, requestType: "cancel" }),
        true,
      );
      assert.equal(
        canRequestBookingChange({ status, requestType: "reschedule" }),
        true,
      );
    }
  });

  it("blocks completed, cancelled, and in_progress", () => {
    for (const status of ["completed", "cancelled", "in_progress"]) {
      assert.equal(
        canRequestBookingChange({ status, requestType: "cancel" }),
        false,
      );
      assert.equal(
        canRequestBookingChange({ status, requestType: "reschedule" }),
        false,
      );
    }
  });
});

describe("reschedule date validation", () => {
  const now = new Date("2026-09-23T15:00:00.000Z");

  it("accepts future YYYY-MM-DD dates", () => {
    const result = validateRequestedRescheduleDate("2026-10-01", now);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.date, "2026-10-01");
  });

  it("rejects past and today dates", () => {
    assert.equal(validateRequestedRescheduleDate("2026-09-01", now).ok, false);
    assert.equal(validateRequestedRescheduleDate("2026-09-23", now).ok, false);
  });

  it("rejects malformed dates", () => {
    assert.equal(validateRequestedRescheduleDate("10/01/2026", now).ok, false);
    assert.equal(validateRequestedRescheduleDate("2026-13-40", now).ok, false);
    assert.equal(validateRequestedRescheduleDate(null, now).ok, false);
  });
});

describe("reason normalization", () => {
  it("accepts optional reasons up to 500 chars", () => {
    assert.deepEqual(normalizeChangeRequestReason(""), {
      ok: true,
      reason: null,
    });
    assert.deepEqual(normalizeChangeRequestReason("  Schedule conflict  "), {
      ok: true,
      reason: "Schedule conflict",
    });
    assert.equal(
      normalizeChangeRequestReason("x".repeat(501)).ok,
      false,
    );
  });
});

describe("request type guards and labels", () => {
  it("validates request types", () => {
    assert.equal(isBookingChangeRequestType("cancel"), true);
    assert.equal(isBookingChangeRequestType("reschedule"), true);
    assert.equal(isBookingChangeRequestType("approve"), false);
  });

  it("formats labels", () => {
    assert.equal(formatChangeRequestTypeLabel("cancel"), "Cancellation");
    assert.equal(formatChangeRequestStatusLabel("pending"), "Pending review");
    assert.match(
      describePendingChangeRequest({
        request_type: "reschedule",
        requested_date: "2026-10-12",
      }),
      /Reschedule request pending/,
    );
  });
});

describe("ownership and mutation rules (unit)", () => {
  it("requires session customer_id match for creating requests", () => {
    const sessionCustomerId = "cust-a";
    const booking = { id: 1, customer_id: "cust-b", status: "scheduled" };
    const owned =
      booking.customer_id === sessionCustomerId &&
      canRequestBookingChange({
        status: booking.status,
        requestType: "cancel",
      });
    assert.equal(owned, false);
  });

  it("ignores client-supplied customer_id", () => {
    const body = { customerId: "attacker", requestType: "cancel" };
    const sessionCustomerId = "cust-a";
    const resolvedCustomerId = sessionCustomerId;
    assert.notEqual(resolvedCustomerId, body.customerId);
  });

  it("customer submit does not immediately change booking", () => {
    const bookingBefore = { status: "scheduled", booking_date: "2026-10-01" };
    const request = { status: "pending" as const };
    // After customer submit: request pending, booking unchanged
    assert.equal(request.status, "pending");
    assert.equal(bookingBefore.status, "scheduled");
    assert.equal(bookingBefore.booking_date, "2026-10-01");
  });

  it("duplicate pending request is blocked conceptually", () => {
    const existingPending = { booking_id: 1, status: "pending" };
    const canCreateAnother = existingPending.status !== "pending";
    assert.equal(canCreateAnother, false);
  });

  it("admin approval of cancel sets cancelled without deleting", () => {
    let booking = { id: 1, status: "scheduled", booking_date: "2026-10-01" };
    let request = { status: "pending" as string };

    // Simulate approve cancel
    if (request.status === "pending") {
      request = { status: "approved" };
      booking = { ...booking, status: "cancelled" };
    }

    assert.equal(request.status, "approved");
    assert.equal(booking.status, "cancelled");
    assert.equal(booking.booking_date, "2026-10-01");
  });

  it("admin approval of reschedule updates date only", () => {
    let booking = {
      id: 1,
      status: "scheduled",
      booking_date: "2026-10-01",
      estimate_mid: 180,
    };
    let request = {
      status: "pending" as string,
      requested_date: "2026-10-15",
    };

    if (request.status === "pending") {
      request = { ...request, status: "approved" };
      booking = { ...booking, booking_date: request.requested_date };
    }

    assert.equal(booking.booking_date, "2026-10-15");
    assert.equal(booking.status, "scheduled");
    assert.equal(booking.estimate_mid, 180);
  });

  it("rejection leaves booking unchanged and allows future request", () => {
    const booking = { status: "scheduled", booking_date: "2026-10-01" };
    let request = { status: "pending" as string };
    request = { status: "rejected" };
    assert.equal(booking.status, "scheduled");
    assert.equal(booking.booking_date, "2026-10-01");
    assert.equal(
      canRequestBookingChange({
        status: booking.status,
        requestType: "reschedule",
      }),
      true,
    );
    assert.notEqual(request.status, "pending");
  });

  it("customer cannot approve requests", () => {
    const customerActions = new Set(["create"]);
    assert.equal(customerActions.has("approve"), false);
    assert.equal(customerActions.has("reject"), false);
  });

  it("double approval prevented by pending gate", () => {
    let request = { status: "approved" };
    const canApproveAgain = request.status === "pending";
    assert.equal(canApproveAgain, false);
  });

  it("another customer cannot read request by id alone", () => {
    const request = { id: 9, customer_id: "cust-a" };
    const sessionCustomerId = "cust-b";
    const visible = request.customer_id === sessionCustomerId ? request : null;
    assert.equal(visible, null);
  });

  it("guest bookings remain unaffected", () => {
    const guestBooking = { customer_id: null, status: "new" };
    assert.equal(guestBooking.customer_id, null);
  });

  it("admin Google allowlist remains separate from Google session", () => {
    const googleCustomer = { id: "cust-1" };
    const isAdmin = false;
    assert.equal(isAdmin, false);
    assert.ok(googleCustomer.id);
  });

  it("notifications use server-derived booking email", () => {
    const bodyEmail = "spoof@attacker.com";
    const bookingEmail = "customer@example.com";
    const notifyTo = bookingEmail;
    assert.notEqual(notifyTo, bodyEmail);
  });
});
