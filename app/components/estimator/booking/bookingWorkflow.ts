import { normalizeReferralCode } from "@/app/lib/referrals";
import type { PricingInputSnapshot } from "@/app/lib/booking-pricing-pure";

import type { PriceRange, ServiceIndex } from "../types";
import { formatBookingDateForApi, getBookingRoomCounts } from "../utils";

export type BookingPayload = {
  name: string;
  email: string;
  mobile: string | undefined;
  bedrooms: number;
  bathrooms: number;
  service: string;
  frequency: string;
  location: string;
  bookingDate: string | undefined;
  bookingTime: string | undefined;
  extras: string[];
  pricingInputs: PricingInputSnapshot;
  estimateLow: number;
  estimateMid: number;
  estimateHigh: number;
  notes: string | undefined;
  referralCode?: string;
  selectedAddressId?: string;
};

export type BuildBookingPayloadInput = {
  contactName: string;
  contactEmail: string;
  contactMobile: string;
  contactNotes: string;
  serviceIndex: ServiceIndex;
  serviceLabel: string;
  frequency: string;
  bookingLocationSummary: string;
  date: Date | null;
  bookingTime: string | null;
  standardBedIndex: number;
  standardBathIndex: number;
  deepCleanSizeIndex: number;
  deepCleanConditionIndex: number;
  moveOutSquareFootageIndex: number;
  commercialSquareFootageIndex: number;
  commercialScheduleIndex: number;
  standardSelectedAddons: ReadonlySet<string>;
  deepCleanSelectedAddons: ReadonlySet<string>;
  moveOutSelectedAddons: ReadonlySet<string>;
  commercialSelectedAddons: ReadonlySet<string>;
  prices: PriceRange;
  referralCode: string;
  locationMode: "saved" | "manual";
  selectedAddressId: string | null;
};

export type BookingResponseData = {
  error?: string;
};

export type BookingResponseOutcome =
  | { type: "success" }
  | { type: "invalid-referral"; message: "Invalid referral code." }
  | { type: "conflict"; message: string }
  | { type: "error"; message: string };

const BOOKING_CONFLICT_FALLBACK =
  "That time was just booked. Please choose another available time.";
const BOOKING_ERROR_FALLBACK = "Failed to submit booking request.";

export function buildBookingPayload({
  contactName,
  contactEmail,
  contactMobile,
  contactNotes,
  serviceIndex,
  serviceLabel,
  frequency,
  bookingLocationSummary,
  date,
  bookingTime,
  standardBedIndex,
  standardBathIndex,
  deepCleanSizeIndex,
  deepCleanConditionIndex,
  moveOutSquareFootageIndex,
  commercialSquareFootageIndex,
  commercialScheduleIndex,
  standardSelectedAddons,
  deepCleanSelectedAddons,
  moveOutSelectedAddons,
  commercialSelectedAddons,
  prices,
  referralCode,
  locationMode,
  selectedAddressId,
}: BuildBookingPayloadInput): BookingPayload {
  const { bedrooms, bathrooms } = getBookingRoomCounts(
    serviceIndex,
    standardBedIndex,
    standardBathIndex,
  );

  const extras =
    serviceIndex === 0
      ? Array.from(standardSelectedAddons)
      : serviceIndex === 1
        ? Array.from(deepCleanSelectedAddons)
        : serviceIndex === 2
          ? Array.from(moveOutSelectedAddons)
        : Array.from(commercialSelectedAddons);

  const pricingInputs: PricingInputSnapshot =
    serviceIndex === 0
      ? { version: 1, kind: "standard", bathroomIndex: standardBathIndex }
      : serviceIndex === 1
        ? { version: 1, kind: "deep-clean", sizeIndex: deepCleanSizeIndex, conditionIndex: deepCleanConditionIndex }
        : serviceIndex === 2
          ? { version: 1, kind: "move-out", squareFootageIndex: moveOutSquareFootageIndex }
          : { version: 1, kind: "commercial", squareFootageIndex: commercialSquareFootageIndex, scheduleIndex: commercialScheduleIndex };

  const normalizedReferralCode = referralCode.trim()
    ? normalizeReferralCode(referralCode)
    : "";

  return {
    name: contactName.trim(),
    email: contactEmail.trim(),
    mobile: contactMobile.trim() || undefined,
    bedrooms,
    bathrooms,
    service: serviceLabel,
    frequency,
    location: bookingLocationSummary,
    bookingDate: formatBookingDateForApi(date),
    bookingTime: bookingTime ?? undefined,
    extras,
    pricingInputs,
    estimateLow: prices.low,
    estimateMid: prices.mid,
    estimateHigh: prices.high,
    notes: contactNotes.trim() || undefined,
    ...(normalizedReferralCode
      ? { referralCode: normalizedReferralCode }
      : {}),
    ...(locationMode === "saved" && selectedAddressId
      ? { selectedAddressId }
      : {}),
  };
}

export function classifyBookingResponse(input: {
  ok: boolean;
  status: number;
  data: BookingResponseData;
}): BookingResponseOutcome {
  if (input.ok) {
    return { type: "success" };
  }

  if (
    input.status === 400 &&
    input.data.error === "Invalid referral code."
  ) {
    return {
      type: "invalid-referral",
      message: "Invalid referral code.",
    };
  }

  if (input.status === 409) {
    return {
      type: "conflict",
      message: input.data.error || BOOKING_CONFLICT_FALLBACK,
    };
  }

  return {
    type: "error",
    message: input.data.error || BOOKING_ERROR_FALLBACK,
  };
}
