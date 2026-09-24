import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { sql } from "../../../lib/db";

export async function PATCH(req: Request) {
  try {
    const gate = await requireAdminApi();
    if (!gate.ok) return gate.response;

    const result = await sql`
      UPDATE booking_requests
      SET seen = true
      WHERE seen = false
      RETURNING id;
    `;

    return NextResponse.json({
      success: true,
      updated: result.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to mark bookings as seen." },
      { status: 500 }
    );
  }
}
