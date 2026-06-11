// app/api/booking/route.ts

import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, mobile, bedrooms, bathrooms } = body;

    const result = await sql`
      INSERT INTO booking_requests (
        name,
        email,
        mobile,
        bedrooms,
        bathrooms
      )
      VALUES (
        ${name},
        ${email},
        ${mobile || null},
        ${bedrooms},
        ${bathrooms}
      )
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      booking: result[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save booking." },
      { status: 500 }
    );
  }
}