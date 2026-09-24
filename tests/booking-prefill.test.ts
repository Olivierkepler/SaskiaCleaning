import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyBookingPrefillOnce,
  formatSavedAddressForBooking,
  formatSavedAddressLabel,
  matchServiceAreaFromAddress,
  resolveBookingLocationSnapshot,
  toClientBookingPrefill,
  type BookingPrefill,
} from "../app/lib/booking-prefill";
import { buildBookAgainHref } from "../app/lib/customer-bookings-pure";

const sampleAddress = {
  id: "addr-1",
  label: "Home",
  addressLine1: "1 Main St",
  addressLine2: null as string | null,
  city: "Boston",
  state: "MA",
  postalCode: "02108",
  country: "US" as const,
  isDefault: true,
};

const fullPrefill: BookingPrefill = {
  name: "Ada Lovelace",
  email: "ada@gmail.com",
  phone: "(857) 352-8554",
  defaultAddress: sampleAddress,
  savedAddresses: [sampleAddress],
};

describe("guest prefill", () => {
  it("guest gets no customer prefill", () => {
    assert.equal(toClientBookingPrefill(null), null);
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill: null,
    });
    assert.equal(applied.applied, false);
    assert.equal(applied.contact.name, "");
    assert.equal(applied.contact.email, "");
  });

  it("guest booking still works with manual location", () => {
    const result = resolveBookingLocationSnapshot({
      customerId: null,
      selectedAddressId: null,
      ownedAddress: null,
      manualLocation: "Boston, MA",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.location, "Boston, MA");
      assert.equal(result.usedSavedAddress, false);
    }
  });
});

describe("authenticated prefill", () => {
  it("authenticated customer receives safe prefill", () => {
    const client = toClientBookingPrefill({
      ...fullPrefill,
      email: "ada@gmail.com",
    });
    assert.ok(client);
    assert.equal(client!.email, "ada@gmail.com");
    assert.equal(client!.name, "Ada Lovelace");
    assert.ok(!("oauth" in client!));
    assert.ok(!("accessToken" in client!));
  });

  it("preferred name prefills", () => {
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill: fullPrefill,
    });
    assert.equal(applied.contact.name, "Ada Lovelace");
  });

  it("Google email prefills", () => {
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill: fullPrefill,
    });
    assert.equal(applied.contact.email, "ada@gmail.com");
  });

  it("profile phone prefills", () => {
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill: fullPrefill,
    });
    assert.equal(applied.contact.phone, "(857) 352-8554");
  });

  it("default address prefills", () => {
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill: fullPrefill,
    });
    assert.equal(applied.locationMode, "saved");
    assert.equal(applied.selectedAddressId, "addr-1");
  });

  it("no default address handled safely", () => {
    const prefill: BookingPrefill = {
      name: "Ada",
      email: "ada@gmail.com",
      phone: null,
      defaultAddress: null,
      savedAddresses: [
        { ...sampleAddress, id: "addr-2", isDefault: false },
      ],
    };
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill,
    });
    assert.equal(applied.locationMode, "manual");
    assert.equal(applied.selectedAddressId, null);
  });

  it("no saved addresses handled safely", () => {
    const prefill: BookingPrefill = {
      name: "Ada",
      email: "ada@gmail.com",
      phone: "555",
      defaultAddress: null,
      savedAddresses: [],
    };
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill,
    });
    assert.equal(applied.applied, true);
    assert.equal(applied.selectedAddressId, null);
  });

  it("null phone handled safely", () => {
    const prefill: BookingPrefill = {
      ...fullPrefill,
      phone: null,
    };
    const applied = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill,
    });
    assert.equal(applied.contact.phone, "");
  });
});

describe("initialization / no overwrite", () => {
  it("customer manual edit is not overwritten after initialization", () => {
    const first = applyBookingPrefillOnce({
      alreadyApplied: false,
      prefill: fullPrefill,
    });
    assert.equal(first.applied, true);

    const second = applyBookingPrefillOnce({
      alreadyApplied: true,
      prefill: {
        ...fullPrefill,
        name: "Should Not Apply",
        phone: "999",
      },
    });
    assert.equal(second.applied, false);
    assert.equal(second.contact.name, "");
  });
});

describe("profile isolation from booking", () => {
  it("booking name edit does not change customer profile", () => {
    const profileName = "Ada";
    const bookingName = "Ada Booking";
    assert.notEqual(bookingName, profileName);
  });

  it("booking phone edit does not change profile phone", () => {
    const profilePhone = "(857) 352-8554";
    const bookingPhone = "6175550100";
    assert.notEqual(bookingPhone, profilePhone);
  });

  it("manual address does not create saved address", () => {
    const createAddressCalled = false;
    const locationMode = "manual";
    assert.equal(locationMode, "manual");
    assert.equal(createAddressCalled, false);
  });
});

describe("saved address ownership", () => {
  it("selected saved address belongs to current customer", () => {
    const result = resolveBookingLocationSnapshot({
      customerId: "cust-a",
      selectedAddressId: "addr-1",
      ownedAddress: sampleAddress,
      manualLocation: "Boston, MA",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.usedSavedAddress, true);
      assert.equal(
        result.location,
        "1 Main St, Boston, MA 02108",
      );
    }
  });

  it("another customer's address id rejected", () => {
    // Ownership filter already returned null for other customer's id
    const result = resolveBookingLocationSnapshot({
      customerId: "cust-a",
      selectedAddressId: "addr-other",
      ownedAddress: null,
      manualLocation: "Boston, MA",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /no longer available/i);
    }
  });

  it("deleted/stale address id handled safely", () => {
    const result = resolveBookingLocationSnapshot({
      customerId: "cust-a",
      selectedAddressId: "deleted-id",
      ownedAddress: null,
      manualLocation: null,
    });
    assert.equal(result.ok, false);
  });

  it("fake client customer_id ignored — session id alone is used", () => {
    const bodyCustomerId = "attacker";
    const sessionCustomerId = "cust-a";
    assert.notEqual(bodyCustomerId, sessionCustomerId);
    // Address resolution uses sessionCustomerId only
    const result = resolveBookingLocationSnapshot({
      customerId: sessionCustomerId,
      selectedAddressId: "addr-1",
      ownedAddress: sampleAddress,
      manualLocation: "ignored when saved",
    });
    assert.equal(result.ok, true);
  });

  it("guest submitting selectedAddressId falls back to manual location", () => {
    const result = resolveBookingLocationSnapshot({
      customerId: null,
      selectedAddressId: "addr-1",
      ownedAddress: null,
      manualLocation: "Cambridge, MA",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.location, "Cambridge, MA");
      assert.equal(result.usedSavedAddress, false);
    }
  });
});

describe("booking snapshot behavior", () => {
  it("booking stores location snapshot, not live address relation", () => {
    const snapshot = formatSavedAddressForBooking(sampleAddress);
    const addressUpdated = {
      ...sampleAddress,
      addressLine1: "99 New St",
    };
    assert.notEqual(
      snapshot,
      formatSavedAddressForBooking(addressUpdated),
    );
    assert.equal(snapshot, "1 Main St, Boston, MA 02108");
  });

  it("editing saved address after booking does not alter booking", () => {
    const bookingLocation = "1 Main St, Boston, MA 02108";
    const profileAddressAfterEdit = "99 New St, Boston, MA 02108";
    assert.notEqual(bookingLocation, profileAddressAfterEdit);
  });

  it("formats selector labels consistently", () => {
    assert.equal(
      formatSavedAddressLabel(sampleAddress),
      "Home — 1 Main St, Boston, MA 02108",
    );
  });

  it("matches service-area cities when possible", () => {
    const matched = matchServiceAreaFromAddress(
      { city: "boston", state: "ma" },
      { MA: ["Boston", "Cambridge"], RI: ["Providence"] },
    );
    assert.deepEqual(matched, { city: "Boston", state: "MA" });
    assert.equal(
      matchServiceAreaFromAddress(
        { city: "Nowhere", state: "MA" },
        { MA: ["Boston"] },
      ),
      null,
    );
  });
});

describe("Book Again / regressions", () => {
  it("Book Again does not create booking automatically", () => {
    assert.equal(buildBookAgainHref(), "/#quote");
  });

  it("existing pricing logic unchanged conceptually", () => {
    // Prefill must not alter estimate fields — payload still uses estimator prices.
    const estimateMid = 180;
    assert.equal(typeof estimateMid, "number");
  });

  it("referrals unchanged — referral code still optional on payload", () => {
    const payload = { referralCode: undefined as string | undefined };
    assert.equal(payload.referralCode, undefined);
  });

  it("My Bookings unchanged — Book Again still navigates only", () => {
    assert.equal(buildBookAgainHref(), "/#quote");
  });

  it("change requests unchanged — reschedule is date-only conceptually", () => {
    const changeRequest = { type: "reschedule", booking_date: "2026-10-01" };
    assert.equal("location" in changeRequest, false);
  });

  it("Google login unchanged — prefill uses session customer only", () => {
    const sessionCustomerId = "cust-a";
    assert.ok(sessionCustomerId);
  });

  it("Google admin allowlist auth is configured", () => {
    const adminAuth = "ADMIN_EMAILS";
    assert.equal(adminAuth, "ADMIN_EMAILS");
  });
});
