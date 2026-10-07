import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CustomerBooking } from "../app/lib/customer-bookings";
import {
  buildRepeatBookingPrefill,
  parseRepeatBookingId,
} from "../app/lib/repeat-booking-prefill";
import { formatSavedAddressForBooking } from "../app/lib/booking-prefill";

const address = {
  id: "owned-address-1",
  label: "Home",
  addressLine1: "1 Main St",
  addressLine2: "Unit 4",
  city: "Boston",
  state: "MA",
  postalCode: "02108",
  country: "US" as const,
  isDefault: true,
};

function makeBooking(overrides: Partial<CustomerBooking> = {}): CustomerBooking {
  return {
    id: 90,
    name: "Historical Name",
    email: "historical@example.com",
    mobile: "5555550100",
    bedrooms: 2,
    bathrooms: 1,
    status: "completed",
    service: "Standard",
    frequency: "Weekly",
    location: "1 Main St, Unit 4, Boston, MA 02108",
    booking_date: "2026-10-03",
    booking_time: "09:00:00",
    duration_minutes: 120,
    buffer_minutes: 30,
    extras: ["Inside oven", "Windows", "Obsolete addon"],
    estimate_low: 130,
    estimate_mid: 160,
    estimate_high: 190,
    notes: "Old notes",
    referral_code: null,
    created_at: "2026-10-01T12:00:00.000Z",
    customer_id: "customer-a",
    ...overrides,
  };
}

describe("repeat booking reference validation", () => {
  it("accepts only a positive safe integer query value", () => {
    assert.equal(parseRepeatBookingId("90"), 90);
    assert.equal(parseRepeatBookingId(undefined), null);
    assert.equal(parseRepeatBookingId(""), null);
    assert.equal(parseRepeatBookingId("0"), null);
    assert.equal(parseRepeatBookingId("90x"), null);
    assert.equal(parseRepeatBookingId(["90"]), null);
    assert.equal(parseRepeatBookingId("9007199254740992"), null);
  });
});

describe("repeat booking prefill", () => {
  it("accepts an owned booking and restores supported service selections", () => {
    const result = buildRepeatBookingPrefill(makeBooking(), "customer-a", []);
    assert.ok(result);
    assert.equal(result.bookingId, 90);
    assert.equal(result.serviceIndex, 0);
    assert.equal(result.standardBedroomIndex, 2);
    assert.equal(result.standardBathroomIndex, 0);
    assert.equal(result.frequency, "Weekly");
    assert.deepEqual(result.selectedAddons.standard, ["Inside oven", "Windows"]);
  });

  it("does not return another customer's booking or a missing booking", () => {
    assert.equal(
      buildRepeatBookingPrefill(makeBooking(), "customer-b", []),
      null,
    );
    assert.equal(buildRepeatBookingPrefill(null, "customer-a", []), null);
  });

  it("restores current deep-clean add-ons and ignores unsupported options", () => {
    const result = buildRepeatBookingPrefill(
      makeBooking({
        service: "Deep clean",
        extras: ["Wall Trim", "Carpet steam", "Old deep-clean option"],
      }),
      "customer-a",
      [],
    );
    assert.ok(result);
    assert.equal(result.serviceIndex, 1);
    assert.deepEqual(result.selectedAddons.deepClean, ["Wall Trim", "Carpet steam"]);
    assert.equal(result.frequency, null);
  });

  it("matches only an exact current customer-owned saved address", () => {
    const result = buildRepeatBookingPrefill(
      makeBooking({ location: formatSavedAddressForBooking(address) }),
      "customer-a",
      [address],
    );
    assert.equal(result?.savedAddressId, address.id);

    const noOwnedMatch = buildRepeatBookingPrefill(
      makeBooking({ location: formatSavedAddressForBooking(address) }),
      "customer-a",
      [],
    );
    assert.equal(noOwnedMatch?.savedAddressId, null);
  });

  it("does not parse ambiguous manual address text or copy personal or appointment data", () => {
    const result = buildRepeatBookingPrefill(
      makeBooking({ location: "55 Long Address, Apt 2, Boston, MA 02108" }),
      "customer-a",
      [],
    );
    assert.ok(result);
    assert.equal(result.savedAddressId, null);
    assert.equal("location" in result, false);
    assert.equal("name" in result, false);
    assert.equal("email" in result, false);
    assert.equal("mobile" in result, false);
    assert.equal("booking_date" in result, false);
    assert.equal("booking_time" in result, false);
    assert.equal("estimate_mid" in result, false);
  });

  it("ignores an obsolete service and leaves estimator selections at current defaults", () => {
    const result = buildRepeatBookingPrefill(
      makeBooking({ service: "Legacy service", extras: ["Old add-on"] }),
      "customer-a",
      [],
    );
    assert.ok(result);
    assert.equal(result.serviceIndex, null);
    assert.equal(result.standardBedroomIndex, null);
    assert.deepEqual(result.selectedAddons.standard, []);
    assert.deepEqual(result.selectedAddons.deepClean, []);
  });

  it("does not guess a half-bath choice from the rounded stored count", () => {
    const result = buildRepeatBookingPrefill(
      makeBooking({ bathrooms: 2 }),
      "customer-a",
      [],
    );
    assert.equal(result?.standardBathroomIndex, null);
  });
});
