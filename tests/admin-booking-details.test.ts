import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  executeAdminBookingDetailsPatch,
  MAX_ADMIN_BOOKING_LOCATION_LENGTH,
  MAX_ADMIN_BOOKING_NOTES_LENGTH,
  parseAdminBookingDetailsPatch,
} from "../app/lib/admin-booking-details-pure";

describe("admin booking details validation", () => {
  it("normalizes booking location and notes", () => {
    assert.deepEqual(
      parseAdminBookingDetailsPatch({
        location: "  12   Main Street, Boston, MA  ",
        notes: "  Please use the side entrance.  ",
      }),
      {
        ok: true,
        patch: {
          location: "12 Main Street, Boston, MA",
          notes: "Please use the side entrance.",
        },
      },
    );
  });

  it("allows notes to be cleared and requires a non-empty location", () => {
    assert.deepEqual(parseAdminBookingDetailsPatch({ notes: "   " }), {
      ok: true,
      patch: { notes: null },
    });
    assert.deepEqual(parseAdminBookingDetailsPatch({ notes: null }), {
      ok: true,
      patch: { notes: null },
    });
    assert.equal(parseAdminBookingDetailsPatch({ location: " " }).ok, false);
  });

  it("enforces text types and bounded lengths", () => {
    assert.equal(parseAdminBookingDetailsPatch({ location: 42 }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ notes: { text: "x" } }).ok, false);
    assert.equal(
      parseAdminBookingDetailsPatch({ location: "x".repeat(MAX_ADMIN_BOOKING_LOCATION_LENGTH + 1) }).ok,
      false,
    );
    assert.equal(
      parseAdminBookingDetailsPatch({ notes: "x".repeat(MAX_ADMIN_BOOKING_NOTES_LENGTH + 1) }).ok,
      false,
    );
  });

  it("rejects fields outside the location and notes allowlist", () => {
    for (const input of [
      { service: "Deep clean" },
      { bedrooms: 3 },
      { bathrooms: 2 },
      { frequency: "Weekly" },
      { bookingDate: "2027-01-01" },
      { bookingTime: "10:00" },
      { extras: ["Inside fridge"] },
      { estimateLow: 1 },
      { estimateMid: 1 },
      { estimateHigh: 1 },
      { price: 1 },
      { status: "completed" },
      { assignment: "staff-id" },
      { staffId: "staff-id" },
      { customerId: "customer-id" },
      { customer_id: "customer-id" },
      { id: 1 },
      { name: "Customer snapshot" },
      { created_at: "2027-01-01" },
      { submitted_at: "2027-01-01" },
      { referral_code: "CODE" },
      { friend_discount_amount: 20 },
      { duration_minutes: 120 },
      { buffer_minutes: 30 },
      { email: "other@example.com" },
      { mobile: "5555555555" },
    ]) {
      assert.equal(parseAdminBookingDetailsPatch(input).ok, false);
    }
  });
});

describe("admin booking details mutation boundary", () => {
  it("rejects unauthorized updates without calling the writer", async () => {
    let updateCalled = false;
    const result = await executeAdminBookingDetailsPatch(
      { notes: "changed" },
      {
        authorized: false,
        update: async () => {
          updateCalled = true;
          return null;
        },
      },
    );
    assert.equal(result.status, 401);
    assert.equal(updateCalled, false);
  });

  it("updates only the booking record fields and returns 404 when absent", async () => {
    const booking = {
      id: 42,
      location: "Old address",
      notes: "Old notes",
      service: "Standard",
      bedrooms: 2,
      estimate_mid: 180,
      status: "scheduled",
      customer_id: "customer-1",
      created_at: "2026-01-01",
    };
    const result = await executeAdminBookingDetailsPatch(
      { location: "New address", notes: "New notes" },
      {
        authorized: true,
        update: async (patch) => ({ ...booking, ...patch }),
      },
    );
    assert.equal(result.status, 200);
    if (result.status === 200) {
      assert.equal(result.booking.location, "New address");
      assert.equal(result.booking.notes, "New notes");
      assert.equal(result.booking.service, "Standard");
      assert.equal(result.booking.bedrooms, 2);
      assert.equal(result.booking.estimate_mid, 180);
      assert.equal(result.booking.status, "scheduled");
      assert.equal(result.booking.customer_id, "customer-1");
      assert.equal(result.booking.created_at, "2026-01-01");
    }
    assert.equal(booking.location, "Old address");
    assert.equal(booking.notes, "Old notes");
    assert.equal(booking.service, "Standard");
    assert.equal(booking.bedrooms, 2);
    assert.equal(booking.estimate_mid, 180);
    assert.equal(booking.status, "scheduled");
    assert.equal(booking.customer_id, "customer-1");
    assert.equal(booking.created_at, "2026-01-01");

    const missing = await executeAdminBookingDetailsPatch(
      { notes: "Update" },
      { authorized: true, update: async () => null },
    );
    assert.equal(missing.status, 404);
  });
});
