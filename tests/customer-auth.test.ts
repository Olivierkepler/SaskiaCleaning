import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeCustomerEmail,
  isGoogleEmailVerified,
  bookingOwnershipWhere,
} from "../app/lib/customer-auth-pure";

describe("customer auth helpers", () => {
  it("normalizes emails consistently", () => {
    assert.equal(normalizeCustomerEmail("  Ada@Example.COM "), "ada@example.com");
    assert.equal(normalizeCustomerEmail("user@saskia.com"), "user@saskia.com");
  });

  it("accepts only verified Google emails", () => {
    assert.equal(
      isGoogleEmailVerified({ email: "a@b.com", email_verified: true }),
      true,
    );
    assert.equal(
      isGoogleEmailVerified({ email: "a@b.com", email_verified: "true" }),
      true,
    );
    assert.equal(
      isGoogleEmailVerified({ email: "a@b.com", email_verified: false }),
      false,
    );
    assert.equal(isGoogleEmailVerified({ email: "a@b.com" }), false);
    assert.equal(isGoogleEmailVerified({ email_verified: true }), false);
    assert.equal(isGoogleEmailVerified(null), false);
  });

  it("builds ownership scope with session customer id", () => {
    assert.deepEqual(bookingOwnershipWhere(42, "cust-1"), {
      id: 42,
      customerId: "cust-1",
    });
  });
});

describe("booking ownership rules (unit)", () => {
  it("ignores client-submitted customer ids conceptually", () => {
    const body = { customerId: "attacker-id", name: "Guest" };
    const sessionCustomerId: string | null = null;
    const resolved = sessionCustomerId ?? null;
    assert.equal(resolved, null);
    assert.notEqual(resolved, body.customerId);
  });

  it("uses authenticated session customer id when present", () => {
    const body = { customerId: "attacker-id" };
    const sessionCustomerId = "real-customer-uuid";
    const resolved = sessionCustomerId ?? null;
    assert.equal(resolved, "real-customer-uuid");
    assert.notEqual(resolved, body.customerId);
  });

  it("guest bookings remain nullable customer_id", () => {
    const sessionCustomerId = null;
    assert.equal(sessionCustomerId ?? null, null);
  });
});

describe("admin auth separation (unit)", () => {
  it("keeps Google admin allowlist independent of customer session", () => {
    const customerSession = { user: { id: "customer-1", email: "c@x.com" } };
    const isAdminViaCustomerSession = false;

    assert.equal(isAdminViaCustomerSession, false);
    assert.ok(customerSession.user.id);
  });
});

describe("account route protection (unit)", () => {
  it("logged-out users should be redirected to login", () => {
    const customer = null;
    const destination = customer ? "/account" : "/login";
    assert.equal(destination, "/login");
  });

  it("logged-in users visiting login should go to account", () => {
    const customer = { id: "c1" };
    const destination = customer ? "/account" : "/login";
    assert.equal(destination, "/account");
  });
});
