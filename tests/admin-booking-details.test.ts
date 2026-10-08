import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  executeAdminBookingDetailsPatch,
  MAX_ADMIN_BOOKING_LOCATION_LENGTH,
  MAX_ADMIN_BOOKING_NOTES_LENGTH,
  parseAdminBookingDetailsPatch,
  type AdminBookingForEdit,
  type PreparedAdminBookingUpdate,
} from "../app/lib/admin-booking-details-pure";

const baseBooking: AdminBookingForEdit = {
  id: 42,
  location: "Old address",
  notes: "Old notes",
  service: "Standard",
  frequency: "One-time",
  bedrooms: 2,
  bathrooms: 2,
  extras: [],
  pricing_inputs: { version: 1, kind: "standard", bathroomIndex: 1 },
  duration_minutes: 120,
  has_active_assignment: false,
  can_be_assigned: true,
};

function dependencies<T = PreparedAdminBookingUpdate>(
  current: AdminBookingForEdit | null = baseBooking,
  options: {
    authorized?: boolean;
    duration?: number | null;
    update?: (update: PreparedAdminBookingUpdate) => Promise<
      | { ok: true; booking: T }
      | { ok: false; reason: "not-found" | "assignment-conflict" }
    >;
  } = {},
) {
  return {
    authorized: options.authorized ?? true,
    load: async () => current,
    resolveDuration: async () => options.duration ?? 120,
    update: options.update ?? (async (update: PreparedAdminBookingUpdate) => ({ ok: true as const, booking: update as unknown as T })),
  };
}

describe("admin booking details validation", () => {
  it("normalizes booking location and notes", () => {
    assert.deepEqual(parseAdminBookingDetailsPatch({
      location: "  12   Main Street, Boston, MA  ",
      notes: "  Please use the side entrance.  ",
    }), { ok: true, patch: { location: "12 Main Street, Boston, MA", notes: "Please use the side entrance." } });
  });

  it("allows notes to be cleared and requires a non-empty location", () => {
    assert.deepEqual(parseAdminBookingDetailsPatch({ notes: "   " }), { ok: true, patch: { notes: null } });
    assert.deepEqual(parseAdminBookingDetailsPatch({ notes: null }), { ok: true, patch: { notes: null } });
    assert.equal(parseAdminBookingDetailsPatch({ location: " " }).ok, false);
  });

  it("enforces text types and bounded lengths", () => {
    assert.equal(parseAdminBookingDetailsPatch({ location: 42 }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ notes: { text: "x" } }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ location: "x".repeat(MAX_ADMIN_BOOKING_LOCATION_LENGTH + 1) }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ notes: "x".repeat(MAX_ADMIN_BOOKING_NOTES_LENGTH + 1) }).ok, false);
  });

  it("accepts safe editable fields with valid shapes", () => {
    assert.equal(parseAdminBookingDetailsPatch({ service: "Deep clean", extras: ["Wall scrub"] }).ok, true);
    assert.equal(parseAdminBookingDetailsPatch({ service: "Move-in" }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ frequency: "Every day" }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ bedrooms: 5 }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ bathrooms: 4 }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ extras: "Inside fridge" }).ok, false);
  });

  it("accepts appointment date and time together but rejects partial or combined pricing edits", () => {
    assert.deepEqual(parseAdminBookingDetailsPatch({ bookingDate: "2026-11-12", bookingTime: "10:30" }), {
      ok: true,
      patch: { bookingDate: "2026-11-12", bookingTime: "10:30" },
    });
    assert.equal(parseAdminBookingDetailsPatch({ bookingDate: "2026-11-12" }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ bookingDate: "2026-02-31", bookingTime: "10:30" }).ok, false);
    assert.equal(parseAdminBookingDetailsPatch({ bookingDate: "2026-11-12", bookingTime: "25:30" }).ok, false);
    const combined = parseAdminBookingDetailsPatch({
      bookingDate: "2026-11-12", bookingTime: "10:30", service: "Standard",
    });
    assert.equal(combined.ok, false);
    if (!combined.ok) assert.match(combined.error, /Save the service change first/);
  });

  it("rejects unknown and protected properties", () => {
    for (const input of [
      { bookingDate: "2027-01-01" },
      { bookingTime: "10:00" },
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
      { estimate_low: 1 },
      { estimate_mid: 1 },
      { estimate_high: 1 },
      { estimateLow: 1 },
      { estimateMid: 1 },
      { estimateHigh: 1 },
      { price: 1 },
      { email: "other@example.com" },
      { mobile: "5555555555" },
    ]) assert.equal(parseAdminBookingDetailsPatch(input).ok, false);
  });
});

describe("admin booking details mutation boundary", () => {
  it("rejects unauthorized updates without loading or writing", async () => {
    let called = false;
    const deps = dependencies(baseBooking, { authorized: false, update: async () => { called = true; return { ok: true, booking: null }; } });
    const result = await executeAdminBookingDetailsPatch({ notes: "changed" }, { ...deps, load: async () => { called = true; return baseBooking; } });
    assert.equal(result.status, 401);
    assert.equal(called, false);
  });

  it("updates location and notes without touching pricing or booking operations", async () => {
    const result = await executeAdminBookingDetailsPatch({ location: "New address", notes: "New notes" }, dependencies());
    assert.equal(result.status, 200);
    if (result.status === 200) {
      assert.equal(result.booking.location, "New address");
      assert.equal(result.booking.notes, "New notes");
      assert.equal(result.booking.pricing, null);
      assert.equal(result.booking.durationChanged, false);
    }
  });

  it("returns 404 when the booking is missing", async () => {
    const result = await executeAdminBookingDetailsPatch({ notes: "Update" }, dependencies(null));
    assert.equal(result.status, 404);
  });

  it("does not let the booking details executor bypass the appointment move authority", async () => {
    let writes = 0;
    const result = await executeAdminBookingDetailsPatch({
      bookingDate: "2026-11-12", bookingTime: "10:30",
    }, dependencies(baseBooking, { update: async () => { writes += 1; return { ok: true, booking: null }; } }));
    assert.equal(result.status, 400);
    assert.equal(writes, 0);
  });

  it("reprices Standard edits and persists the canonical bathroom snapshot", async () => {
    const result = await executeAdminBookingDetailsPatch({
      service: "Standard", frequency: "Weekly", bedrooms: 3, bathrooms: 2,
      extras: ["Inside fridge"], pricingInputs: { version: 1, kind: "standard", bathroomIndex: 1 },
    }, dependencies());
    assert.equal(result.status, 200);
    if (result.status === 200) {
      assert.deepEqual(result.booking.pricing?.estimate, { low: 147, mid: 173, high: 204 });
      assert.deepEqual(result.booking.pricing?.pricingInputs, { version: 1, kind: "standard", bathroomIndex: 1 });
    }
  });

  it("reprices Deep Clean, Move-out, and Commercial edits with their snapshots", async () => {
    const cases = [
      {
        service: "Deep clean", extras: [],
        pricingInputs: { version: 1, kind: "deep-clean", sizeIndex: 0, conditionIndex: 0 },
        expectedMid: 160,
      },
      {
        service: "Move-out", extras: [],
        pricingInputs: { version: 1, kind: "move-out", squareFootageIndex: 0 },
        expectedMid: 180,
      },
      {
        service: "Commercial", extras: [],
        pricingInputs: { version: 1, kind: "commercial", squareFootageIndex: 0, scheduleIndex: 3 },
        expectedMid: 100,
      },
    ];
    for (const testCase of cases) {
      const current = { ...baseBooking, service: testCase.service, bedrooms: 0, bathrooms: 0, pricing_inputs: testCase.pricingInputs };
      const result = await executeAdminBookingDetailsPatch({
        service: testCase.service, extras: testCase.extras, pricingInputs: testCase.pricingInputs,
      }, dependencies(current));
      assert.equal(result.status, 200);
      if (result.status === 200) {
        assert.equal(result.booking.pricing?.estimate.mid, testCase.expectedMid);
        assert.deepEqual(result.booking.pricing?.pricingInputs, testCase.pricingInputs);
      }
    }
  });

  it("fails closed for legacy snapshots that cannot be recovered, but allows exact Standard recovery", async () => {
    const safeStandardLegacy = { ...baseBooking, bathrooms: 1, pricing_inputs: null };
    const safe = await executeAdminBookingDetailsPatch({
      service: "Standard", frequency: "One-time", bedrooms: 2, bathrooms: 1,
      extras: [], pricingInputs: { version: 1, kind: "standard", bathroomIndex: 0 },
    }, dependencies(safeStandardLegacy));
    assert.equal(safe.status, 200);

    for (const legacy of [
      { ...baseBooking, pricing_inputs: null }, // stored 2 bathrooms is 1.5 or 2.0
      { ...baseBooking, service: "Deep clean", bedrooms: 0, bathrooms: 0, pricing_inputs: null },
      { ...baseBooking, service: "Move-out", bedrooms: 0, bathrooms: 0, pricing_inputs: null },
      { ...baseBooking, service: "Commercial", bedrooms: 0, bathrooms: 0, pricing_inputs: null },
    ]) {
      const result = await executeAdminBookingDetailsPatch({ extras: [] }, dependencies(legacy));
      assert.equal(result.status, 409);
    }
    const locationOnly = await executeAdminBookingDetailsPatch(
      { location: "Updated" }, dependencies({ ...baseBooking, pricing_inputs: null }),
    );
    assert.equal(locationOnly.status, 200);
  });

  it("rejects tampered snapshots and mismatched extra catalogs", async () => {
    const tampered = await executeAdminBookingDetailsPatch({
      service: "Standard", extras: ["Unlisted extra"], frequency: "One-time",
      bedrooms: 2, bathrooms: 2,
      pricingInputs: { version: 1, kind: "standard", bathroomIndex: 1 },
    }, dependencies());
    assert.equal(tampered.status, 400);
    const unknownSnapshotField = await executeAdminBookingDetailsPatch({
      service: "Standard", extras: [], frequency: "One-time", bedrooms: 2, bathrooms: 2,
      pricingInputs: { version: 1, kind: "standard", bathroomIndex: 1, estimateMid: 1 },
    }, dependencies());
    assert.equal(unknownSnapshotField.status, 400);
  });

  it("blocks duration-changing service edits for active assignments without writing", async () => {
    let writes = 0;
    const current = { ...baseBooking, has_active_assignment: true, duration_minutes: 120 };
    const result = await executeAdminBookingDetailsPatch({
      service: "Deep clean", extras: [], bedrooms: 0, bathrooms: 0,
      pricingInputs: { version: 1, kind: "deep-clean", sizeIndex: 1, conditionIndex: 0 },
    }, dependencies(current, { duration: 180, update: async () => { writes += 1; return { ok: true, booking: null }; } }));
    assert.equal(result.status, 409);
    assert.equal(writes, 0);
  });

  it("keeps the assignment when service duration is unchanged", async () => {
    const current = { ...baseBooking, has_active_assignment: true, duration_minutes: 120 };
    const result = await executeAdminBookingDetailsPatch({
      service: "Deep clean", extras: [], bedrooms: 0, bathrooms: 0,
      pricingInputs: { version: 1, kind: "deep-clean", sizeIndex: 1, conditionIndex: 0 },
    }, dependencies(current, { duration: 120 }));
    assert.equal(result.status, 200);
    if (result.status === 200) assert.equal(result.booking.durationChanged, false);
  });

  it("fails closed for a duration change while the appointment can still be assigned", async () => {
    let writes = 0;
    const current = { ...baseBooking, has_active_assignment: false, can_be_assigned: true, duration_minutes: 120 };
    const result = await executeAdminBookingDetailsPatch({
      service: "Deep clean", extras: [], bedrooms: 0, bathrooms: 0,
      pricingInputs: { version: 1, kind: "deep-clean", sizeIndex: 1, conditionIndex: 0 },
    }, dependencies(current, { duration: 180, update: async () => { writes += 1; return { ok: true, booking: null }; } }));
    assert.equal(result.status, 409);
    assert.equal(writes, 0);
  });

  it("sends price, snapshot, and duration as one prepared write", async () => {
    const captured: { current: PreparedAdminBookingUpdate | null } = { current: null };
    const current = { ...baseBooking, duration_minutes: 120, can_be_assigned: false };
    const result = await executeAdminBookingDetailsPatch({
      service: "Deep clean", extras: [], bedrooms: 0, bathrooms: 0,
      pricingInputs: { version: 1, kind: "deep-clean", sizeIndex: 0, conditionIndex: 0 },
      location: "New location",
    }, dependencies(current, {
      duration: 180,
      update: async (update) => { captured.current = update; return { ok: true, booking: update }; },
    }));
    assert.equal(result.status, 200);
    assert.equal(captured.current?.durationMinutes, 180);
    assert.equal(captured.current?.pricing?.estimate.mid, 160);
    assert.deepEqual(captured.current?.pricing?.pricingInputs, { version: 1, kind: "deep-clean", sizeIndex: 0, conditionIndex: 0 });
  });
});
