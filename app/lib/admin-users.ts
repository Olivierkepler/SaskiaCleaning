import "server-only";

import { sql } from "@/app/lib/db";
import {
  canChangeAdminRole,
  canDeactivateAdmin,
  canManageAdmins,
  isAdminRole,
  normalizeAdminEmail,
  normalizeAdminName,
  type AdminRole,
  type AdminUserSnapshot,
} from "@/app/lib/admin-users-pure";
import { isAdminEmail } from "@/app/lib/admin-auth-pure";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdByAdminId: string | null;
  lastLoginAt: Date | string | null;
};

function mapAdmin(row: Record<string, unknown>): AdminUser {
  const role = row.role;
  if (!isAdminRole(role)) {
    throw new Error("Invalid admin role in database.");
  }
  return {
    id: String(row.id),
    email: String(row.email),
    name: (row.name as string | null) ?? null,
    role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as Date | string,
    updatedAt: row.updated_at as Date | string,
    createdByAdminId: row.created_by_admin_id
      ? String(row.created_by_admin_id)
      : null,
    lastLoginAt: (row.last_login_at as Date | string | null) ?? null,
  };
}

function toSnapshot(admin: AdminUser): AdminUserSnapshot {
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
  };
}

export async function findAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  const normalized = normalizeAdminEmail(email);
  if (!normalized.ok) return null;
  const rows = await sql`
    SELECT *
    FROM admin_users
    WHERE lower(btrim(email)) = ${normalized.email}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapAdmin(row) : null;
}

export async function findActiveAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  const admin = await findAdminByEmail(email);
  if (!admin?.isActive) return null;
  return admin;
}

export async function findAdminById(id: string): Promise<AdminUser | null> {
  if (!id || typeof id !== "string") return null;
  const rows = await sql`
    SELECT *
    FROM admin_users
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapAdmin(row) : null;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const rows = await sql`
    SELECT *
    FROM admin_users
    ORDER BY
      CASE role WHEN 'OWNER' THEN 0 ELSE 1 END,
      created_at ASC,
      email ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapAdmin);
}

export async function countActiveOwners(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM admin_users
    WHERE role = 'OWNER' AND is_active = true
  `;
  return Number((rows[0] as { n: number } | undefined)?.n ?? 0);
}

/**
 * If email is in ADMIN_EMAILS but missing from DB, ensure an OWNER row exists.
 * Idempotent bootstrap during ADMIN_EMAILS → DB transition.
 */
export async function ensureBootstrapOwnerFromEnv(
  email: string,
): Promise<AdminUser | null> {
  const normalized = normalizeAdminEmail(email);
  if (!normalized.ok) return null;
  if (!isAdminEmail(normalized.email, process.env.ADMIN_EMAILS)) {
    return null;
  }

  const existing = await findAdminByEmail(normalized.email);
  if (existing) {
    if (!existing.isActive) {
      // Env bootstrap must not silently reactivate a deactivated owner.
      return null;
    }
    return existing;
  }

  await sql`
    INSERT INTO admin_users (email, name, role, is_active)
    VALUES (${normalized.email}, NULL, 'OWNER', true)
  `;
  return findActiveAdminByEmail(normalized.email);
}

/**
 * Resolve authorized admin for a verified Google email.
 * Database active row is authoritative; ADMIN_EMAILS only bootstraps missing OWNER.
 */
export async function resolveAuthorizedAdmin(
  email: string,
): Promise<AdminUser | null> {
  const active = await findActiveAdminByEmail(email);
  if (active) return active;
  return ensureBootstrapOwnerFromEnv(email);
}

export async function touchAdminLastLogin(adminId: string): Promise<void> {
  await sql`
    UPDATE admin_users
    SET last_login_at = now(), updated_at = now()
    WHERE id = ${adminId}
  `;
}

export async function createAdminUser(input: {
  email: string;
  name?: string | null;
  role: unknown;
  createdByAdminId: string;
}): Promise<
  | { ok: true; admin: AdminUser }
  | { ok: false; error: string; status: number }
> {
  const actor = await findAdminById(input.createdByAdminId);
  if (!actor || !canManageAdmins(toSnapshot(actor))) {
    return { ok: false, error: "Forbidden.", status: 403 };
  }

  const email = normalizeAdminEmail(input.email);
  if (!email.ok) {
    return { ok: false, error: email.error, status: 400 };
  }
  const name = normalizeAdminName(input.name);
  if (!name.ok) {
    return { ok: false, error: name.error, status: 400 };
  }
  if (!isAdminRole(input.role)) {
    return { ok: false, error: "Invalid role.", status: 400 };
  }

  const duplicate = await findAdminByEmail(email.email);
  if (duplicate) {
    return {
      ok: false,
      error: "An admin with this email already exists.",
      status: 409,
    };
  }

  try {
    const rows = await sql`
      INSERT INTO admin_users (
        email,
        name,
        role,
        is_active,
        created_by_admin_id
      )
      VALUES (
        ${email.email},
        ${name.name},
        ${input.role},
        true,
        ${input.createdByAdminId}
      )
      RETURNING *
    `;
    const row = rows[0] as Record<string, unknown> | undefined;
    if (!row) {
      return { ok: false, error: "Failed to create admin.", status: 500 };
    }
    return { ok: true, admin: mapAdmin(row) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("admin_users_email_uidx") || message.includes("duplicate")) {
      return {
        ok: false,
        error: "An admin with this email already exists.",
        status: 409,
      };
    }
    console.error("createAdminUser failed:", error);
    return { ok: false, error: "Failed to create admin.", status: 500 };
  }
}

export async function setAdminActive(input: {
  actorId: string;
  targetId: string;
  isActive: boolean;
}): Promise<
  | { ok: true; admin: AdminUser }
  | { ok: false; error: string; status: number }
> {
  const actor = await findAdminById(input.actorId);
  const target = await findAdminById(input.targetId);
  if (!actor || !canManageAdmins(toSnapshot(actor))) {
    return { ok: false, error: "Forbidden.", status: 403 };
  }
  if (!target) {
    return { ok: false, error: "Admin not found.", status: 404 };
  }

  if (!input.isActive) {
    const owners = await countActiveOwners();
    const gate = canDeactivateAdmin({
      actor: toSnapshot(actor),
      target: toSnapshot(target),
      activeOwnerCount: owners,
    });
    if (!gate.ok) {
      return { ok: false, error: gate.error, status: 400 };
    }
  }

  const rows = await sql`
    UPDATE admin_users
    SET is_active = ${input.isActive}, updated_at = now()
    WHERE id = ${input.targetId}
    RETURNING *
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Admin not found.", status: 404 };
  }
  return { ok: true, admin: mapAdmin(row) };
}

export async function changeAdminRole(input: {
  actorId: string;
  targetId: string;
  role: unknown;
}): Promise<
  | { ok: true; admin: AdminUser }
  | { ok: false; error: string; status: number }
> {
  const actor = await findAdminById(input.actorId);
  const target = await findAdminById(input.targetId);
  if (!actor || !canManageAdmins(toSnapshot(actor))) {
    return { ok: false, error: "Forbidden.", status: 403 };
  }
  if (!target) {
    return { ok: false, error: "Admin not found.", status: 404 };
  }
  if (!isAdminRole(input.role)) {
    return { ok: false, error: "Invalid role.", status: 400 };
  }

  const owners = await countActiveOwners();
  const gate = canChangeAdminRole({
    actor: toSnapshot(actor),
    target: toSnapshot(target),
    nextRole: input.role,
    activeOwnerCount: owners,
  });
  if (!gate.ok) {
    return { ok: false, error: gate.error, status: 400 };
  }

  const rows = await sql`
    UPDATE admin_users
    SET role = ${input.role}, updated_at = now()
    WHERE id = ${input.targetId}
    RETURNING *
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Admin not found.", status: 404 };
  }
  return { ok: true, admin: mapAdmin(row) };
}

export async function updateAdminName(input: {
  actorId: string;
  targetId: string;
  name: string | null;
}): Promise<
  | { ok: true; admin: AdminUser }
  | { ok: false; error: string; status: number }
> {
  const actor = await findAdminById(input.actorId);
  if (!actor || !canManageAdmins(toSnapshot(actor))) {
    return { ok: false, error: "Forbidden.", status: 403 };
  }
  const name = normalizeAdminName(input.name);
  if (!name.ok) {
    return { ok: false, error: name.error, status: 400 };
  }
  const rows = await sql`
    UPDATE admin_users
    SET name = ${name.name}, updated_at = now()
    WHERE id = ${input.targetId}
    RETURNING *
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Admin not found.", status: 404 };
  }
  return { ok: true, admin: mapAdmin(row) };
}

export function serializeAdminUser(admin: AdminUser) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    isActive: admin.isActive,
    createdAt:
      admin.createdAt instanceof Date
        ? admin.createdAt.toISOString()
        : String(admin.createdAt),
    updatedAt:
      admin.updatedAt instanceof Date
        ? admin.updatedAt.toISOString()
        : String(admin.updatedAt),
    lastLoginAt: admin.lastLoginAt
      ? admin.lastLoginAt instanceof Date
        ? admin.lastLoginAt.toISOString()
        : String(admin.lastLoginAt)
      : null,
  };
}
