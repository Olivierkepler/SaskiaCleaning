import type { CustomerBooking } from "@/app/lib/customer-bookings";
import {
  formatSavedAddressForBooking,
  type BookingPrefillAddress,
} from "@/app/lib/booking-prefill";
import {
  BATH_VALS,
  COMMERCIAL_ADDONS,
  DEEP_CLEAN_ADDONS,
  MOVE_OUT_ADDONS,
  STANDARD_ADDONS,
  STANDARD_BEDROOM_VALUES,
} from "@/app/components/estimator/constants";
import { SERVICES } from "@/app/components/estimator/services";
import type { ServiceIndex } from "@/app/components/estimator/types";

const STANDARD_FREQUENCIES = ["One-time", "Bi-weekly", "Weekly", "Monthly"];

export type RepeatBookingPrefill = {
  bookingId: number;
  serviceIndex: ServiceIndex | null;
  standardBedroomIndex: number | null;
  standardBathroomIndex: number | null;
  frequency: string | null;
  selectedAddons: {
    standard: string[];
    deepClean: string[];
    moveOut: string[];
    commercial: string[];
  };
  savedAddressId: string | null;
};

export function parseRepeatBookingId(
  value: string | string[] | undefined,
): number | null {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function buildRepeatBookingPrefill(
  booking: CustomerBooking | null,
  customerId: string,
  savedAddresses: readonly BookingPrefillAddress[],
): RepeatBookingPrefill | null {
  if (!booking || booking.customer_id !== customerId) return null;

  const foundServiceIndex = SERVICES.findIndex(
    (service) => service.label === booking.service?.trim(),
  );
  const serviceIndex =
    foundServiceIndex >= 0 && foundServiceIndex <= 3
      ? (foundServiceIndex as ServiceIndex)
      : null;
  const selectedAddons = {
    standard: [] as string[],
    deepClean: [] as string[],
    moveOut: [] as string[],
    commercial: [] as string[],
  };

  if (serviceIndex !== null) {
    const currentOptions =
      serviceIndex === 0
        ? STANDARD_ADDONS
        : serviceIndex === 1
          ? DEEP_CLEAN_ADDONS
          : serviceIndex === 2
            ? MOVE_OUT_ADDONS
            : COMMERCIAL_ADDONS;
    const safeLabels = new Set<string>(
      currentOptions.map((option) => option.label),
    );
    const restored = booking.extras.filter((extra) => safeLabels.has(extra));
    if (serviceIndex === 0) selectedAddons.standard = restored;
    if (serviceIndex === 1) selectedAddons.deepClean = restored;
    if (serviceIndex === 2) selectedAddons.moveOut = restored;
    if (serviceIndex === 3) selectedAddons.commercial = restored;
  }

  const standardBedroomIndex =
    serviceIndex === 0
      ? STANDARD_BEDROOM_VALUES.findIndex(
          (bedroomCount) => bedroomCount === booking.bedrooms,
        )
      : -1;

  // The booking payload stores bathroom counts rounded up, so only a stored
  // value of 1 identifies one bathroom without ambiguity (1 vs. 1.5 etc.).
  const standardBathroomIndex =
    serviceIndex === 0 && booking.bathrooms === Math.ceil(BATH_VALS[0])
      ? 0
      : null;

  const formattedSavedAddress = savedAddresses.find(
    (address) =>
      booking.location != null &&
      formatSavedAddressForBooking(address) === booking.location,
  );

  return {
    bookingId: booking.id,
    serviceIndex,
    standardBedroomIndex:
      standardBedroomIndex >= 0 ? standardBedroomIndex : null,
    standardBathroomIndex,
    frequency:
      serviceIndex === 0 &&
      booking.frequency != null &&
      STANDARD_FREQUENCIES.includes(booking.frequency)
        ? booking.frequency
        : null,
    selectedAddons,
    savedAddressId: formattedSavedAddress?.id ?? null,
  };
}
