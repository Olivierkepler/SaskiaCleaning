import { NextResponse } from "next/server";
import { markAdminAuthPortalIntent } from "@/app/lib/admin-auth";

/** Marks the next Google OAuth attempt as an admin-portal login. */
export async function POST() {
  await markAdminAuthPortalIntent();
  return NextResponse.json({ ok: true });
}
