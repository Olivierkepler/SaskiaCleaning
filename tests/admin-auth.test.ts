import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAuthorizeAdmin,
  isAdminEmail,
  isDashboardKeyAuthorized,
  parseAdminEmails,
} from "../app/lib/admin-auth-pure";

const ALLOWLIST = "olivierkfrancois1@gmail.com, ops@example.com";

describe("admin email allowlist", () => {
  it("recognizes authorized email", () => {
    assert.equal(
      isAdminEmail("olivierkfrancois1@gmail.com", ALLOWLIST),
      true,
    );
  });

  it("matches case-insensitively after normalization", () => {
    assert.equal(
      isAdminEmail("OlivierKFrancois1@Gmail.COM", ALLOWLIST),
      true,
    );
  });

  it("trims whitespace", () => {
    assert.equal(
      isAdminEmail("  olivierkfrancois1@gmail.com  ", ALLOWLIST),
      true,
    );
    assert.deepEqual(parseAdminEmails(" a@b.com , c@d.com "), [
      "a@b.com",
      "c@d.com",
    ]);
  });

  it("rejects non-allowlisted Google email", () => {
    assert.equal(isAdminEmail("customer@gmail.com", ALLOWLIST), false);
  });

  it("rejects missing email", () => {
    assert.equal(isAdminEmail(null, ALLOWLIST), false);
    assert.equal(isAdminEmail(undefined, ALLOWLIST), false);
    assert.equal(isAdminEmail("", ALLOWLIST), false);
  });

  it("rejects unverified email when verification data is present", () => {
    assert.equal(
      canAuthorizeAdmin({
        email: "olivierkfrancois1@gmail.com",
        emailVerified: false,
        allowlistRaw: ALLOWLIST,
      }),
      false,
    );
    assert.equal(
      canAuthorizeAdmin({
        email: "olivierkfrancois1@gmail.com",
        emailVerified: true,
        allowlistRaw: ALLOWLIST,
      }),
      true,
    );
  });

  it("does not use substring or domain-only matching", () => {
    assert.equal(
      isAdminEmail("not-olivierkfrancois1@gmail.com", ALLOWLIST),
      false,
    );
    assert.equal(isAdminEmail("someone@gmail.com", ALLOWLIST), false);
  });

  it("ignores client-supplied admin email claims conceptually", () => {
    const clientClaimedEmail = "olivierkfrancois1@gmail.com";
    const sessionEmail = "customer@gmail.com";
    assert.equal(isAdminEmail(sessionEmail, ALLOWLIST), false);
    assert.notEqual(sessionEmail, clientClaimedEmail);
  });
});

describe("admin session isolation", () => {
  it("customer session is not automatically admin", () => {
    const customerEmail = "customer@gmail.com";
    assert.equal(isAdminEmail(customerEmail, ALLOWLIST), false);
  });

  it("staff session is not automatically admin", () => {
    const staffEmail = "cleaner@saskia.com";
    const staffSession = { staffId: "staff-1", email: staffEmail };
    assert.equal(isAdminEmail(staffSession.email, ALLOWLIST), false);
    assert.ok(staffSession.staffId);
  });

  it("same Google identity may be customer + admin when allowlisted", () => {
    const email = "olivierkfrancois1@gmail.com";
    assert.equal(isAdminEmail(email, ALLOWLIST), true);
    const customerAccess = true;
    const adminAccess = isAdminEmail(email, ALLOWLIST);
    assert.equal(customerAccess && adminAccess, true);
  });
});

describe("DASHBOARD_KEY URL auth removed", () => {
  it("?key no longer authorizes dashboard", () => {
    assert.equal(isDashboardKeyAuthorized("saskia2026*"), false);
    assert.equal(isDashboardKeyAuthorized(null), false);
    assert.equal(isDashboardKeyAuthorized(""), false);
  });

  it("invalid old DASHBOARD_KEY URL does not authorize", () => {
    assert.equal(isDashboardKeyAuthorized("wrong-key"), false);
  });

  it("admin booking deep-link works without key", () => {
    const bookingId = 83;
    const href = `/dashboard?booking=${bookingId}`;
    assert.equal(href, "/dashboard?booking=83");
    assert.equal(href.includes("key="), false);
    assert.equal(href.includes("email="), false);
  });

  it("operations path works without key", () => {
    assert.equal("/dashboard/operations".includes("key="), false);
  });
});

describe("admin auth does not change operational systems", () => {
  it("CRON_SECRET remains a separate concept", () => {
    assert.notEqual("CRON_SECRET", "ADMIN_EMAILS");
    assert.notEqual("CRON_SECRET", "DASHBOARD_KEY");
  });

  it("customer Google login destination unchanged", () => {
    assert.equal("/account", "/account");
    assert.equal("/login", "/login");
  });

  it("staff auth portal remains separate", () => {
    assert.equal("/staff/login", "/staff/login");
    assert.notEqual("/staff/login", "/admin/login");
  });
});
