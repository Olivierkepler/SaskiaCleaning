import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (key !== process.env.DASHBOARD_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
