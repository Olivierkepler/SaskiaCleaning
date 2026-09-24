import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  ADMIN_AUTH_PORTAL_COOKIE,
  ADMIN_AUTH_PORTAL_VALUE,
} from "@/app/lib/admin-auth-pure";
import {
  resolveAuthorizedAdmin,
  type AdminUser,
} from "@/app/lib/admin-users";
import type { AdminRole } from "@/app/lib/admin-users-pure";
import { canManageAdmins } from "@/app/lib/admin-users-pure";

export {
  ADMIN_AUTH_PORTAL_COOKIE,
  ADMIN_AUTH_PORTAL_VALUE,
  isAdminEmail,
  parseAdminEmails,
  canAuthorizeAdmin,
  isDashboardKeyAuthorized,
} from "@/app/lib/admin-auth-pure";

export type AdminSession = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  isActive: true;
};

function toSession(admin: AdminUser): AdminSession {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    isActive: true,
  };
}

/**
 * Resolve admin from verified Auth.js session email + active admin_users row.
 * ADMIN_EMAILS only bootstraps a missing OWNER row (transition fallback).
 * Never trust client-supplied email/role or JWT isAdmin alone.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();
  const email =
    typeof session?.user?.email === "string" ? session.user.email : null;
  if (!email) return null;

  const admin = await resolveAuthorizedAdmin(email);
  if (!admin) return null;
  return toSession(admin);
}

export async function isAdminSession(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

/** Page guard — redirect logged-out / non-admin to admin login. */
export async function requireAdmin(
  loginRedirect = "/admin/login",
): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) {
    redirect(loginRedirect);
  }
  return admin;
}

/** API guard — 401 JSON when not an active Google admin. */
export async function requireAdminApi(): Promise<
  { ok: true; admin: AdminSession } | { ok: false; response: NextResponse }
> {
  const admin = await getAdminSession();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, admin };
}

/** Page guard — OWNER only. Non-owners redirect to dashboard. */
export async function requireOwner(
  loginRedirect = "/admin/login",
): Promise<AdminSession> {
  const admin = await requireAdmin(loginRedirect);
  if (!canManageAdmins(admin)) {
    redirect("/dashboard");
  }
  return admin;
}

/** API guard — OWNER only (403 for ADMIN, 401 for unauthenticated). */
export async function requireOwnerApi(): Promise<
  { ok: true; admin: AdminSession } | { ok: false; response: NextResponse }
> {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate;
  if (!canManageAdmins(gate.admin)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }
  return gate;
}

export async function markAdminAuthPortalIntent(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_AUTH_PORTAL_COOKIE, ADMIN_AUTH_PORTAL_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function clearAdminAuthPortalIntent(): Promise<void> {
  const jar = await cookies();
  const current = jar.get(ADMIN_AUTH_PORTAL_COOKIE)?.value;
  if (current === ADMIN_AUTH_PORTAL_VALUE) {
    jar.delete(ADMIN_AUTH_PORTAL_COOKIE);
  }
}

export async function isAdminAuthPortalIntent(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_AUTH_PORTAL_COOKIE)?.value === ADMIN_AUTH_PORTAL_VALUE;
}
