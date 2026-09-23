import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  findActiveStaffByEmail,
  findStaffById,
  type StaffMember,
} from "@/app/lib/staff";
import {
  STAFF_AUTH_PORTAL_COOKIE,
  STAFF_AUTH_PORTAL_VALUE,
} from "@/app/lib/staff-pure";

export { STAFF_AUTH_PORTAL_COOKIE, STAFF_AUTH_PORTAL_VALUE };

export type StaffSessionUser = {
  id: string;
  name: string;
  email: string;
  role: StaffMember["role"];
};

/**
 * Resolve the authenticated staff member from the session, then re-check
 * the database (active flag). Never trust JWT alone for authorization.
 */
export async function getCurrentStaff(): Promise<StaffMember | null> {
  const session = await auth();
  const staffId =
    typeof (session as { staffId?: unknown } | null)?.staffId === "string"
      ? ((session as { staffId: string }).staffId as string)
      : null;
  const email =
    typeof session?.user?.email === "string" ? session.user.email : null;

  if (staffId) {
    const byId = await findStaffById(staffId);
    if (byId?.isActive) return byId;
  }

  if (email) {
    return findActiveStaffByEmail(email);
  }

  return null;
}

export async function requireStaff(
  loginRedirect = "/staff/login",
): Promise<StaffMember> {
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect(loginRedirect);
  }
  return staff;
}

export async function requireStaffRole(
  roles: Array<StaffMember["role"]>,
  loginRedirect = "/staff/login",
): Promise<StaffMember> {
  const staff = await requireStaff(loginRedirect);
  if (!roles.includes(staff.role)) {
    redirect("/staff");
  }
  return staff;
}

export async function markStaffAuthPortalIntent(): Promise<void> {
  const jar = await cookies();
  jar.set(STAFF_AUTH_PORTAL_COOKIE, STAFF_AUTH_PORTAL_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function clearStaffAuthPortalIntent(): Promise<void> {
  const jar = await cookies();
  jar.delete(STAFF_AUTH_PORTAL_COOKIE);
}

export async function isStaffAuthPortalIntent(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(STAFF_AUTH_PORTAL_COOKIE)?.value === STAFF_AUTH_PORTAL_VALUE;
}
