import { NextResponse } from "next/server";
import { markStaffAuthPortalIntent } from "@/app/lib/staff-auth";

/** Marks the next Google OAuth attempt as a staff-portal login. */
export async function POST() {
  await markStaffAuthPortalIntent();
  return NextResponse.json({ ok: true });
}
