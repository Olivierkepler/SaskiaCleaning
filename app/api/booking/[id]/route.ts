import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (key !== process.env.DASHBOARD_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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