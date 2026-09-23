// app/api/booking/route.ts

import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { normalizeReferralCode, type ReferralCodeRow } from "../../lib/referrals";
import { getCurrentCustomer } from "@/app/lib/customer-auth";
import { getCustomerAddressById } from "@/app/lib/customer-profile";
import {
  formatSavedAddressForBooking,
  resolveBookingLocationSnapshot,
} from "@/app/lib/booking-prefill";
import { assertSlotAvailable } from "@/app/lib/scheduling";
import { createBookingWithCapacityClaim } from "@/app/lib/staff-capacity";
import {
  isBookingDateInPast,
  isValidBookingDateOnly,
  BOOKING_TIME_REQUIRED_MESSAGE,
} from "@/app/lib/scheduling-pure";
import { CAPACITY_CONFLICT_MESSAGE } from "@/app/lib/staff-capacity-pure";
import { resolveDurationForBooking } from "@/app/lib/booking-duration";

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
  if (!isValidBookingDateOnly(dateString)) {
    return null;
  }

  return dateString;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ignore any client-supplied customer/user ids — ownership is session-only.
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
      bookingTime,
      extras,
      estimateLow,
      estimateMid,
      estimateHigh,
      notes,
      referralCode,
      selectedAddressId,
      durationMinutes: _ignoredClientDuration,
      customerId: _ignoredCustomerId,
      userId: _ignoredUserId,
      accountId: _ignoredAccountId,
    } = body;
    void _ignoredClientDuration;

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
    if (!parsedBookingDate) {
      return NextResponse.json(
        { error: "A valid booking date is required." },
        { status: 400 }
      );
    }

    if (isBookingDateInPast(parsedBookingDate)) {
      return NextResponse.json(
        { error: "Please choose a today or future date." },
        { status: 400 }
      );
    }

    if (bookingTime == null || bookingTime === "") {
      return NextResponse.json(
        { error: BOOKING_TIME_REQUIRED_MESSAGE },
        { status: 400 }
      );
    }

    const durationResult = await resolveDurationForBooking({
      service: service || null,
      bedrooms: parsedBedrooms,
      bathrooms: parsedBathrooms,
      extras: Array.isArray(extras) ? extras : [],
    });
    if (!durationResult.ok) {
      return NextResponse.json(
        { error: durationResult.error },
        { status: 400 },
      );
    }

    const slotCheck = await assertSlotAvailable({
      dateOnly: parsedBookingDate,
      time: bookingTime,
      durationMinutes: durationResult.minutes,
    });

    if (!slotCheck.ok) {
      return NextResponse.json(
        { error: slotCheck.error },
        { status: slotCheck.status },
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

    // Authenticated customer ownership — never trust client body.customerId.
    const currentCustomer = await getCurrentCustomer();
    const customerId = currentCustomer?.id ?? null;

    const requestedAddressId =
      typeof selectedAddressId === "string" && selectedAddressId.trim()
        ? selectedAddressId.trim()
        : null;

    let ownedAddress: {
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      state: string;
      postalCode: string;
    } | null = null;

    if (customerId && requestedAddressId) {
      const address = await getCustomerAddressById(customerId, requestedAddressId);
      ownedAddress = address
        ? {
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
          }
        : null;
    }

    const locationResult = resolveBookingLocationSnapshot({
      customerId,
      selectedAddressId: requestedAddressId,
      ownedAddress,
      manualLocation:
        typeof location === "string" && location.trim()
          ? location.trim()
          : null,
      formatAddress: formatSavedAddressForBooking,
    });

    if (!locationResult.ok) {
      return NextResponse.json(
        { error: locationResult.error },
        { status: 400 },
      );
    }

    if (!locationResult.location) {
      return NextResponse.json(
        { error: "A service location is required." },
        { status: 400 },
      );
    }

    let booking: Record<string, unknown>;
    try {
      const claim = await createBookingWithCapacityClaim({
        name: String(name),
        email: String(email),
        mobile: mobile || null,
        bedrooms: parsedBedrooms,
        bathrooms: parsedBathrooms,
        service: service || null,
        frequency: frequency || null,
        location: locationResult.location,
        bookingDate: parsedBookingDate,
        bookingTime: slotCheck.time,
        durationMinutes: durationResult.minutes,
        extrasJson: JSON.stringify(extrasArray),
        estimateLow: estimateLow ?? null,
        estimateMid: estimateMid ?? null,
        estimateHigh: estimateHigh ?? null,
        notes: notes || null,
        referralCode: normalizedReferralCode,
        customerId,
      });

      if (!claim.ok) {
        return NextResponse.json(
          { error: claim.error },
          { status: claim.status },
        );
      }
      booking = claim.booking;
    } catch (insertError) {
      console.error("Booking capacity claim failed:", insertError);
      return NextResponse.json(
        { error: CAPACITY_CONFLICT_MESSAGE },
        { status: 409 },
      );
    }

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
