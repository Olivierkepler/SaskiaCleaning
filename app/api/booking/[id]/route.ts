import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { sql } from "../../../lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdminApi();
    if (!gate.ok) return gate.response;

    const { id } = await params;

    await sql`
      DELETE FROM booking_requests
      WHERE id = ${Number(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete booking." },
      { status: 500 }
    );
  }
}