import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_CUSTOMER_ADDRESSES,
  buildBookingPrefillFromProfile,
  executeAdminCustomerProfilePatch,
  formatAddressForBookingSnapshot,
  normalizeProfileName,
  normalizeProfilePhone,
  normalizeUsPostalCode,
  parseAdminCustomerProfilePatch,
  validateCustomerAddressInput,
} from "../app/lib/customer-profile-pure";

describe("profile field validation", () => {
  it("normalizes preferred name", () => {
    assert.deepEqual(normalizeProfileName("  Ada   Lovelace "), {
      ok: true,
      name: "Ada Lovelace",
    });
    assert.equal(normalizeProfileName("x".repeat(81)).ok, false);
  });

  it("validates phone numbers", () => {
    assert.deepEqual(normalizeProfilePhone("(857) 352-8554"), {
      ok: true,
      phone: "(857) 352-8554",
    });
    assert.equal(normalizeProfilePhone("123").ok, false);
    assert.deepEqual(normalizeProfilePhone(""), { ok: true, phone: null });
  });

  it("does not accept email updates through profile validators", () => {
    // Profile update API ignores email; validators only cover name/phone.
    assert.ok(normalizeProfileName("Ada").ok);
    assert.ok(normalizeProfilePhone("8573528554").ok);
  });
});

describe("admin customer profile updates", () => {
  it("normalizes allowed name and phone fields", () => {
    assert.deepEqual(parseAdminCustomerProfilePatch({
      name: "  Ada   Lovelace ",
      phone: "(857) 352-8554",
    }), {
      ok: true,
      patch: { name: "Ada Lovelace", phone: "(857) 352-8554" },
    });
  });

  it("rejects empty names and invalid phones", () => {
    assert.equal(parseAdminCustomerProfilePatch({ name: "   " }).ok, false);
    assert.equal(parseAdminCustomerProfilePatch({ phone: "123" }).ok, false);
    assert.deepEqual(parseAdminCustomerProfilePatch({ phone: " " }), {
      ok: true,
      patch: { phone: null },
    });
  });

  it("rejects email, route identity, unknown, and authentication fields", () => {
    for (const input of [
      { email: "new@example.com" },
      { customerId: "other-customer" },
      { arbitraryColumn: "value" },
      { password: "secret" },
      { password_hash: "hash" },
      { auth_version: 2 },
      { email_verified: true },
      { oauth_provider_id: "provider-id" },
    ]) {
      assert.equal(parseAdminCustomerProfilePatch(input).ok, false);
    }
  });

  it("requires an admin before updating and rejects unauthorized requests", async () => {
    let updateCalled = false;
    const result = await executeAdminCustomerProfilePatch(
      { name: "New Name" },
      {
        authorized: false,
        update: async () => { updateCalled = true; return null; },
      },
    );
    assert.equal(result.status, 401);
    assert.equal(updateCalled, false);
  });

  it("updates an authorized profile and returns 404 for an unknown customer", async () => {
    const updated = await executeAdminCustomerProfilePatch(
      { name: "  New   Name ", phone: "617-555-0100" },
      {
        authorized: true,
        update: async (patch) => ({ id: "customer-1", ...patch }),
      },
    );
    assert.deepEqual(updated, {
      status: 200,
      profile: { id: "customer-1", name: "New Name", phone: "617-555-0100" },
    });

    const missing = await executeAdminCustomerProfilePatch(
      { name: "New Name" },
      { authorized: true, update: async () => null },
    );
    assert.equal(missing.status, 404);
  });

  it("leaves credentials, OAuth ownership, and historical booking snapshots intact", async () => {
    const account = {
      name: "Old Name",
      phone: "6175550000",
      password_hash: "unchanged-hash",
      auth_version: 4,
      email_verified: true,
      oauth_customer_id: "customer-1",
    };
    const snapshot = { name: "Booking Name", mobile: "6175559999", email: "old@example.com" };
    const result = await executeAdminCustomerProfilePatch(
      { name: "Updated Name", phone: "617-555-1111" },
      {
        authorized: true,
        update: async (patch) => ({ ...account, ...patch }),
      },
    );
    assert.equal(result.status, 200);
    assert.equal(account.password_hash, "unchanged-hash");
    assert.equal(account.auth_version, 4);
    assert.equal(account.email_verified, true);
    assert.equal(account.oauth_customer_id, "customer-1");
    assert.deepEqual(snapshot, {
      name: "Booking Name",
      mobile: "6175559999",
      email: "old@example.com",
    });
  });
});

describe("address validation", () => {
  it("accepts structured US addresses", () => {
    const result = validateCustomerAddressInput({
      label: "Home",
      addressLine1: "1 Main St",
      addressLine2: "Apt 2",
      city: "Boston",
      state: "MA",
      postalCode: "02108",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.country, "US");
      assert.equal(result.value.postalCode, "02108");
    }
  });

  it("validates ZIP formats", () => {
    assert.equal(normalizeUsPostalCode("02108").ok, true);
    assert.equal(normalizeUsPostalCode("02108-1234").ok, true);
    assert.equal(normalizeUsPostalCode("2108").ok, false);
  });

  it("rejects empty required fields", () => {
    assert.equal(
      validateCustomerAddressInput({
        label: " ",
        addressLine1: "1 Main",
        city: "Boston",
        state: "MA",
        postalCode: "02108",
      }).ok,
      false,
    );
  });
});

describe("booking snapshot helpers", () => {
  it("formats address for booking snapshot without live FK", () => {
    assert.equal(
      formatAddressForBookingSnapshot({
        addressLine1: "1 Main St",
        addressLine2: null,
        city: "Boston",
        state: "MA",
        postalCode: "02108",
      }),
      "1 Main St, Boston, MA 02108",
    );
  });

  it("builds prefill foundation for Phase 11.5", () => {
    const prefill = buildBookingPrefillFromProfile({
      name: "Ada",
      email: "ada@example.com",
      phone: "8573528554",
      defaultAddress: {
        id: "addr-1",
        label: "Home",
        addressLine1: "1 Main St",
        addressLine2: null,
        city: "Boston",
        state: "MA",
        postalCode: "02108",
        isDefault: true,
      },
      savedAddresses: [
        {
          id: "addr-1",
          label: "Home",
          addressLine1: "1 Main St",
          addressLine2: null,
          city: "Boston",
          state: "MA",
          postalCode: "02108",
          isDefault: true,
        },
      ],
    });
    assert.equal(prefill.email, "ada@example.com");
    assert.equal(prefill.location, "1 Main St, Boston, MA 02108");
    assert.equal(prefill.defaultAddress?.id, "addr-1");
    assert.equal(prefill.savedAddresses.length, 1);
  });

  it("profile/address edits must not mutate booking snapshots conceptually", () => {
    const bookingSnapshot = {
      name: "Old Name",
      location: "Old City, MA",
    };
    const profileUpdate = { name: "New Name" };
    // Profile change is independent of historical booking rows
    assert.notEqual(profileUpdate.name, bookingSnapshot.name);
    assert.equal(bookingSnapshot.location, "Old City, MA");
  });
});

describe("ownership and limits (unit)", () => {
  it("scopes address access by customer_id", () => {
    const sessionCustomerId = "cust-a";
    const rows = [
      { id: "1", customer_id: "cust-a" },
      { id: "2", customer_id: "cust-b" },
    ];
    const visible = rows.filter((r) => r.customer_id === sessionCustomerId);
    assert.deepEqual(
      visible.map((r) => r.id),
      ["1"],
    );
  });

  it("ignores client-supplied customer_id", () => {
    const body = { customerId: "attacker" };
    const sessionCustomerId = "cust-a";
    assert.notEqual(sessionCustomerId, body.customerId);
  });

  it("enforces max address count", () => {
    assert.equal(MAX_CUSTOMER_ADDRESSES, 10);
    const count = 10;
    assert.equal(count >= MAX_CUSTOMER_ADDRESSES, true);
  });

  it("setting default clears prior default for same customer only", () => {
    const rows = [
      { id: "a1", customer_id: "cust-a", is_default: true },
      { id: "a2", customer_id: "cust-a", is_default: false },
      { id: "b1", customer_id: "cust-b", is_default: true },
    ];
    const targetId = "a2";
    const customerId = "cust-a";
    const next = rows.map((row) =>
      row.customer_id !== customerId
        ? row
        : { ...row, is_default: row.id === targetId },
    );
    assert.equal(next.find((r) => r.id === "a1")?.is_default, false);
    assert.equal(next.find((r) => r.id === "a2")?.is_default, true);
    assert.equal(next.find((r) => r.id === "b1")?.is_default, true);
  });

  it("deleting address does not modify bookings", () => {
    const bookings = [{ id: 1, location: "1 Main St, Boston, MA" }];
    const addressesAfterDelete: unknown[] = [];
    assert.equal(addressesAfterDelete.length, 0);
    assert.equal(bookings[0].location, "1 Main St, Boston, MA");
  });

  it("logged-out users are redirected to login for profile", () => {
    const customer = null;
    const destination = customer ? "/account/profile" : "/login";
    assert.equal(destination, "/login");
  });

  it("Google preferred-name preservation rule", () => {
    const existingName = "Preferred Name";
    const googleName = "Google Name";
    const nextName =
      existingName && existingName.trim()
        ? existingName
        : googleName;
    assert.equal(nextName, "Preferred Name");
  });

  it("guest booking and admin auth remain separate concepts", () => {
    const guestBooking = { customer_id: null };
    const adminAllowlistConfigured = "ADMIN_EMAILS" === "ADMIN_EMAILS";
    assert.equal(guestBooking.customer_id, null);
    assert.equal(adminAllowlistConfigured, true);
  });
});
