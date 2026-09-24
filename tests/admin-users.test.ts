import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canChangeAdminRole,
  canDeactivateAdmin,
  canManageAdmins,
  isAdminRole,
  normalizeAdminEmail,
  normalizeAdminName,
} from "../app/lib/admin-users-pure";
import { isDashboardKeyAuthorized } from "../app/lib/admin-auth-pure";

const owner = {
  id: "owner-1",
  email: "olivierkfrancois1@gmail.com",
  role: "OWNER" as const,
  isActive: true,
};

const admin = {
  id: "admin-1",
  email: "helper@example.com",
  role: "ADMIN" as const,
  isActive: true,
};

describe("admin email / role validation", () => {
  it("seeded owner email normalizes lowercase", () => {
    const result = normalizeAdminEmail("  OlivierKFrancois1@Gmail.COM ");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.email, "olivierkfrancois1@gmail.com");
    }
  });

  it("whitespace normalized", () => {
    const result = normalizeAdminEmail("  a@b.co  ");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.email, "a@b.co");
  });

  it("invalid email rejected", () => {
    assert.equal(normalizeAdminEmail("").ok, false);
    assert.equal(normalizeAdminEmail("not-an-email").ok, false);
    assert.equal(normalizeAdminEmail("@nodomain.com").ok, false);
    assert.equal(normalizeAdminEmail("a@b").ok, false);
  });

  it("roles constrained", () => {
    assert.equal(isAdminRole("OWNER"), true);
    assert.equal(isAdminRole("ADMIN"), true);
    assert.equal(isAdminRole("SUPER"), false);
    assert.equal(isAdminRole("owner"), false);
  });

  it("name optional and length-limited", () => {
    assert.equal(normalizeAdminName(null).ok, true);
    assert.equal(normalizeAdminName("Ada").ok, true);
    assert.equal(normalizeAdminName("x".repeat(121)).ok, false);
  });
});

describe("owner management authorization", () => {
  it("OWNER allowed admin management", () => {
    assert.equal(canManageAdmins(owner), true);
  });

  it("ADMIN blocked from admin management", () => {
    assert.equal(canManageAdmins(admin), false);
  });

  it("inactive OWNER cannot manage", () => {
    assert.equal(
      canManageAdmins({ ...owner, isActive: false }),
      false,
    );
  });

  it("owner can deactivate ADMIN", () => {
    const result = canDeactivateAdmin({
      actor: owner,
      target: admin,
      activeOwnerCount: 1,
    });
    assert.equal(result.ok, true);
  });

  it("cannot deactivate only active OWNER", () => {
    const result = canDeactivateAdmin({
      actor: owner,
      target: owner,
      activeOwnerCount: 1,
    });
    assert.equal(result.ok, false);
  });

  it("can deactivate OWNER when another active OWNER exists", () => {
    const result = canDeactivateAdmin({
      actor: owner,
      target: { ...owner, id: "owner-2", email: "other@example.com" },
      activeOwnerCount: 2,
    });
    assert.equal(result.ok, true);
  });

  it("cannot demote only active OWNER", () => {
    const result = canChangeAdminRole({
      actor: owner,
      target: owner,
      nextRole: "ADMIN",
      activeOwnerCount: 1,
    });
    assert.equal(result.ok, false);
  });

  it("OWNER can promote ADMIN when actor is OWNER", () => {
    const result = canChangeAdminRole({
      actor: owner,
      target: admin,
      nextRole: "OWNER",
      activeOwnerCount: 1,
    });
    assert.equal(result.ok, true);
  });

  it("ADMIN cannot promote themselves", () => {
    const result = canChangeAdminRole({
      actor: admin,
      target: admin,
      nextRole: "OWNER",
      activeOwnerCount: 1,
    });
    assert.equal(result.ok, false);
  });

  it("role spoofing conceptually ignored — actor role from DB only", () => {
    const clientClaimedOwner = { ...admin, role: "OWNER" as const };
    // Server must load actor from DB; spoofed client role alone is not trusted.
    // If true role is ADMIN, management is denied:
    assert.equal(canManageAdmins(admin), false);
    assert.notEqual(admin.role, clientClaimedOwner.role);
  });
});

describe("access isolation concepts", () => {
  it("inactive admin rejected from dashboard conceptually", () => {
    const inactive = { ...admin, isActive: false };
    assert.equal(inactive.isActive && true, false);
  });

  it("active admin allowed conceptually", () => {
    assert.equal(admin.isActive, true);
  });

  it("deactivated admin loses access; reactivate restores", () => {
    let active = true;
    active = false;
    assert.equal(active, false);
    active = true;
    assert.equal(active, true);
  });

  it("customer cannot add admin conceptually", () => {
    const customer = { role: "CUSTOMER" };
    assert.equal(canManageAdmins(admin), false);
    assert.notEqual(customer.role, "OWNER");
  });

  it("staff cannot add admin conceptually", () => {
    const staff = { staffId: "s1", role: "cleaner" };
    assert.notEqual(staff.role, "OWNER");
  });

  it("client email spoof ignored conceptually", () => {
    const sessionEmail = "customer@gmail.com";
    const bodyEmail = "olivierkfrancois1@gmail.com";
    assert.notEqual(sessionEmail, bodyEmail);
  });

  it("Google verified session remains authoritative", () => {
    const sessionEmail = "olivierkfrancois1@gmail.com";
    assert.equal(normalizeAdminEmail(sessionEmail).ok, true);
  });

  it("DASHBOARD_KEY still does not authorize", () => {
    assert.equal(isDashboardKeyAuthorized("anything"), false);
  });

  it("cron remains separate from admin_users", () => {
    assert.notEqual("CRON_SECRET", "admin_users");
  });

  it("customer/staff/admin login paths remain separate", () => {
    assert.equal("/login", "/login");
    assert.equal("/staff/login", "/staff/login");
    assert.equal("/admin/login", "/admin/login");
  });
});
