/**
 * Pure admin-user helpers (no DB / Next imports).
 */

import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";

export const ADMIN_ROLES = ["OWNER", "ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(value)
  );
}

export function normalizeAdminEmail(
  email: string | null | undefined,
): { ok: true; email: string } | { ok: false; error: string } {
  if (!email || typeof email !== "string") {
    return { ok: false, error: "Email is required." };
  }
  const normalized = normalizeCustomerEmail(email);
  if (!normalized || !normalized.includes("@") || normalized.length < 3) {
    return { ok: false, error: "Invalid email." };
  }
  if (normalized.length > 254) {
    return { ok: false, error: "Email is too long." };
  }
  // Basic shape: local@domain with a dot in domain
  const at = normalized.indexOf("@");
  if (at <= 0 || at === normalized.length - 1) {
    return { ok: false, error: "Invalid email." };
  }
  const domain = normalized.slice(at + 1);
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) {
    return { ok: false, error: "Invalid email." };
  }
  return { ok: true, email: normalized };
}

export function normalizeAdminName(
  name: string | null | undefined,
): { ok: true; name: string | null } | { ok: false; error: string } {
  if (name === null || name === undefined || name === "") {
    return { ok: true, name: null };
  }
  if (typeof name !== "string") {
    return { ok: false, error: "Invalid name." };
  }
  const trimmed = name.trim();
  if (trimmed.length < 1) {
    return { ok: true, name: null };
  }
  if (trimmed.length > 120) {
    return { ok: false, error: "Name must be 120 characters or fewer." };
  }
  return { ok: true, name: trimmed };
}

export type AdminUserSnapshot = {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
};

/**
 * Can we deactivate target without leaving zero active OWNERs?
 */
export function canDeactivateAdmin(input: {
  actor: AdminUserSnapshot;
  target: AdminUserSnapshot;
  activeOwnerCount: number;
}): { ok: true } | { ok: false; error: string } {
  if (input.actor.role !== "OWNER" || !input.actor.isActive) {
    return { ok: false, error: "Only an active OWNER can manage admins." };
  }
  if (!input.target.isActive) {
    return { ok: true }; // already inactive — idempotent
  }
  if (input.target.role === "OWNER" && input.activeOwnerCount <= 1) {
    return {
      ok: false,
      error: "Cannot deactivate the only active OWNER.",
    };
  }
  return { ok: true };
}

/**
 * Can we demote OWNER → ADMIN without leaving zero active OWNERs?
 */
export function canChangeAdminRole(input: {
  actor: AdminUserSnapshot;
  target: AdminUserSnapshot;
  nextRole: AdminRole;
  activeOwnerCount: number;
}): { ok: true } | { ok: false; error: string } {
  if (input.actor.role !== "OWNER" || !input.actor.isActive) {
    return { ok: false, error: "Only an active OWNER can change roles." };
  }
  if (input.target.role === input.nextRole) {
    return { ok: true };
  }
  if (
    input.target.role === "OWNER" &&
    input.nextRole === "ADMIN" &&
    input.target.isActive &&
    input.activeOwnerCount <= 1
  ) {
    return {
      ok: false,
      error: "Cannot demote the only active OWNER.",
    };
  }
  return { ok: true };
}

/** ADMIN cannot manage admins; client role spoofing ignored. */
export function canManageAdmins(actor: {
  role: AdminRole;
  isActive: boolean;
}): boolean {
  return actor.isActive && actor.role === "OWNER";
}
