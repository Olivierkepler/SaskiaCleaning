// app/api/booking/route.ts

import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { normalizeReferralCode, type ReferralCodeRow } from "../../lib/referrals";

function parseNonNegativeInteger(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function normalizeBookingDate(value: unknown): string | null {
  if (value == null || value === "") {
    return null;
  }

  const dateString = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  return dateString;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      mobile,
      bedrooms,
      bathrooms,
      service,
      frequency,
      location,
      bookingDate,
      extras,
      estimateLow,
      estimateMid,
      estimateHigh,
      notes,
      referralCode,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (
      bedrooms === undefined ||
      bedrooms === null ||
      bathrooms === undefined ||
      bathrooms === null
    ) {
      return NextResponse.json(
        { error: "Bedrooms and bathrooms are required." },
        { status: 400 }
      );
    }

    const parsedBedrooms = parseNonNegativeInteger(bedrooms);
    const parsedBathrooms = parseNonNegativeInteger(bathrooms);

    if (parsedBedrooms === null || parsedBathrooms === null) {
      return NextResponse.json(
        { error: "Bedrooms and bathrooms must be non-negative integers." },
        { status: 400 }
      );
    }

    const parsedBookingDate = normalizeBookingDate(bookingDate);
    if (bookingDate != null && bookingDate !== "" && parsedBookingDate === null) {
      return NextResponse.json(
        { error: "Invalid booking date." },
        { status: 400 }
      );
    }

    const extrasArray = Array.isArray(extras) ? extras : [];

    const normalizedReferralCode =
      referralCode != null && String(referralCode).trim() !== ""
        ? normalizeReferralCode(String(referralCode))
        : null;

    let activeReferralCode: ReferralCodeRow | null = null;

    if (normalizedReferralCode) {
      const referralRows = await sql`
        SELECT *
        FROM referral_codes
        WHERE code = ${normalizedReferralCode}
          AND is_active = true
        LIMIT 1
      `;

      activeReferralCode = (referralRows[0] as ReferralCodeRow | undefined) ?? null;

      if (!activeReferralCode) {
        return NextResponse.json(
          { error: "Invalid referral code." },
          { status: 400 }
        );
      }
    }

    const result = await sql`
      INSERT INTO booking_requests (
        name,
        email,
        mobile,
        bedrooms,
        bathrooms,
        service,
        frequency,
        location,
        booking_date,
        extras,
        estimate_low,
        estimate_mid,
        estimate_high,
        notes,
        referral_code,
        seen
      )
      VALUES (
        ${name},
        ${email},
        ${mobile || null},
        ${parsedBedrooms},
        ${parsedBathrooms},
        ${service || null},
        ${frequency || null},
        ${location || null},
        ${parsedBookingDate},
        ${JSON.stringify(extrasArray)},
        ${estimateLow ?? null},
        ${estimateMid ?? null},
        ${estimateHigh ?? null},
        ${notes || null},
        ${normalizedReferralCode},
        false
      )
      RETURNING *;
    `;

    const booking = result[0];

    if (activeReferralCode && booking) {
      try {
        await sql`
          INSERT INTO referrals (
            referral_code_id,
            code,
            booking_request_id,
            referred_name,
            referred_email,
            reward_amount,
            friend_discount_amount,
            status
          )
          VALUES (
            ${activeReferralCode.id},
            ${activeReferralCode.code},
            ${booking.id},
            ${name},
            ${email},
            ${activeReferralCode.reward_amount},
            ${activeReferralCode.friend_discount_amount},
            'pending'
          )
        `;

        await sql`
          UPDATE referral_codes
          SET
            usage_count = usage_count + 1,
            updated_at = now()
          WHERE id = ${activeReferralCode.id}
        `;
      } catch (referralError) {
        console.error("Referral tracking failed after booking insert:", referralError);

        return NextResponse.json(
          { error: "Failed to save booking referral tracking." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save booking." },
      { status: 500 }
    );
  }
}
