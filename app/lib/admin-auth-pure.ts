/**
 * Pure admin-auth helpers (no DB / Next imports).
 * Safe for unit tests.
 */

import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";

/** Shared portal-intent cookie name (value distinguishes staff vs admin). */
export const ADMIN_AUTH_PORTAL_COOKIE = "saskia_auth_portal";
export const ADMIN_AUTH_PORTAL_VALUE = "admin";

export function parseAdminEmails(
  raw: string | undefined | null,
): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);
}

/**
 * Exact allowlist match after trim + lowercase.
 * No substring or domain-only matching.
 */
export function isAdminEmail(
  email: string | null | undefined,
  allowlistRaw: string | undefined | null,
): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = normalizeCustomerEmail(email);
  if (!normalized) return false;
  return parseAdminEmails(allowlistRaw).includes(normalized);
}

/**
 * Server/sign-in gate helper. Rejects missing/unverified emails when
 * provider verification data is present.
 */
export function canAuthorizeAdmin(input: {
  email?: string | null;
  emailVerified?: boolean | string | null;
  allowlistRaw?: string | null;
}): boolean {
  const email = input.email;
  if (!email || typeof email !== "string") return false;

  const verified = input.emailVerified;
  if (verified !== undefined && verified !== null) {
    if (!(verified === true || verified === "true")) {
      return false;
    }
  }

  return isAdminEmail(email, input.allowlistRaw ?? null);
}

/** ?key= must never authorize admin after Google migration. */
export function isDashboardKeyAuthorized(
  _key: string | null | undefined,
): boolean {
  return false;
}
