import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";
import {
  ADMIN_AUTH_PORTAL_COOKIE,
  ADMIN_AUTH_PORTAL_VALUE,
  isAdminEmail,
} from "@/app/lib/admin-auth-pure";

export {
  ADMIN_AUTH_PORTAL_COOKIE,
  ADMIN_AUTH_PORTAL_VALUE,
  isAdminEmail,
  parseAdminEmails,
  canAuthorizeAdmin,
  isDashboardKeyAuthorized,
} from "@/app/lib/admin-auth-pure";

export type AdminSession = {
  email: string;
};

function adminAllowlistRaw(): string | undefined {
  return process.env.ADMIN_EMAILS;
}

/**
 * Resolve admin from Auth.js session email against ADMIN_EMAILS.
 * Never trust client-supplied email or JWT isAdmin alone.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();
  const email =
    typeof session?.user?.email === "string" ? session.user.email : null;
  if (!email) return null;
  if (!isAdminEmail(email, adminAllowlistRaw())) return null;
  return { email: normalizeCustomerEmail(email) };
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

/** API guard — 401 JSON when not an allowlisted Google admin. */
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
