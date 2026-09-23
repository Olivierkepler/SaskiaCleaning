/**
 * Booking prefill types + pure formatters for Phase 11.5.
 */

export type BookingPrefillAddress = {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
  isDefault: boolean;
};

export type BookingPrefill = {
  name: string | null;
  email: string | null;
  phone: string | null;
  defaultAddress: BookingPrefillAddress | null;
  savedAddresses: BookingPrefillAddress[];
};

export function formatSavedAddressForBooking(address: {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
}): string {
  const street = [address.addressLine1, address.addressLine2]
    .filter(Boolean)
    .join(", ");
  return `${street}, ${address.city}, ${address.state} ${address.postalCode}`;
}

export function formatSavedAddressLabel(address: {
  label: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
}): string {
  return `${address.label} — ${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}`;
}

/** Match MA/RI service-area city picker when possible. */
export function matchServiceAreaFromAddress(
  address: { city: string; state: string },
  citiesByState: Record<
    string,
    readonly string[] | readonly { city: string }[]
  >,
): { city: string; state: string } | null {
  const state = address.state.trim().toUpperCase();
  const city = address.city.trim();
  const cities = citiesByState[state];
  if (!cities) return null;
  const names = cities.map((entry) =>
    typeof entry === "string" ? entry : entry.city,
  );
  const match = names.find(
    (entry) => entry.toLowerCase() === city.toLowerCase(),
  );
  if (!match) return null;
  return { city: match, state };
}

/**
 * Apply server prefill into local contact fields once.
 * Subsequent calls are no-ops so customer edits are never overwritten.
 */
export function applyBookingPrefillOnce(options: {
  alreadyApplied: boolean;
  prefill: BookingPrefill | null | undefined;
}): {
  applied: boolean;
  contact: { name: string; email: string; phone: string };
  selectedAddressId: string | null;
  locationMode: "saved" | "manual";
} {
  if (options.alreadyApplied || !options.prefill) {
    return {
      applied: false,
      contact: { name: "", email: "", phone: "" },
      selectedAddressId: null,
      locationMode: "manual",
    };
  }

  const { prefill } = options;
  const hasDefault = Boolean(prefill.defaultAddress);
  return {
    applied: true,
    contact: {
      name: prefill.name ?? "",
      email: prefill.email ?? "",
      phone: prefill.phone ?? "",
    },
    selectedAddressId: hasDefault ? prefill.defaultAddress!.id : null,
    locationMode: hasDefault ? "saved" : "manual",
  };
}

/**
 * Model A: when an authenticated customer selects a saved address id,
 * server must resolve ownership and copy an authoritative location snapshot.
 * Guests and manual entry use the client-provided location string.
 */
export function resolveBookingLocationSnapshot(input: {
  customerId: string | null;
  selectedAddressId: string | null;
  ownedAddress: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  manualLocation: string | null;
  formatAddress?: typeof formatSavedAddressForBooking;
}):
  | { ok: true; location: string | null; usedSavedAddress: boolean }
  | { ok: false; error: string } {
  const format = input.formatAddress ?? formatSavedAddressForBooking;

  // Guests (or no address id): never resolve another customer's address.
  if (!input.selectedAddressId) {
    return {
      ok: true,
      location: input.manualLocation,
      usedSavedAddress: false,
    };
  }

  // Address id without a session — ignore id, use manual fields only.
  if (!input.customerId) {
    return {
      ok: true,
      location: input.manualLocation,
      usedSavedAddress: false,
    };
  }

  // Stale, deleted, or not owned — same safe message (no existence leak).
  if (!input.ownedAddress) {
    return {
      ok: false,
      error:
        "That saved address is no longer available. Please choose or enter a location again.",
    };
  }

  return {
    ok: true,
    location: format(input.ownedAddress),
    usedSavedAddress: true,
  };
}

/** Strip internal ids from confirmation display. */
export function bookingLocationForDisplay(location: string | null): string | null {
  return location;
}

export function toClientBookingPrefill(
  prefill: {
    name: string | null;
    email: string;
    phone: string | null;
    defaultAddress: BookingPrefillAddress | null;
    savedAddresses: BookingPrefillAddress[];
    [key: string]: unknown;
  } | null,
): BookingPrefill | null {
  if (!prefill) return null;
  return {
    name: prefill.name,
    email: prefill.email,
    phone: prefill.phone,
    defaultAddress: prefill.defaultAddress,
    savedAddresses: prefill.savedAddresses,
  };
}
