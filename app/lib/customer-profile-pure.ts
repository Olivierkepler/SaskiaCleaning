/**
 * Pure validation helpers for customer profile + saved addresses.
 */

export const MAX_CUSTOMER_ADDRESSES = 10;
export const MAX_PROFILE_NAME_LENGTH = 80;
export const MAX_PHONE_LENGTH = 30;

export type CustomerAddressInput = {
  label: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};

export function normalizeProfileName(
  value: unknown,
): { ok: true; name: string | null } | { ok: false; error: string } {
  if (value == null) {
    return { ok: true, name: null };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "Invalid name." };
  }
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { ok: true, name: null };
  }
  if (trimmed.length > MAX_PROFILE_NAME_LENGTH) {
    return {
      ok: false,
      error: `Name must be ${MAX_PROFILE_NAME_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, name: trimmed };
}

/** Keep digits and leading +, strip other chars for storage consistency. */
export function normalizeProfilePhone(
  value: unknown,
): { ok: true; phone: string | null } | { ok: false; error: string } {
  if (value == null || value === "") {
    return { ok: true, phone: null };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "Invalid phone number." };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, phone: null };
  }

  if (trimmed.length > MAX_PHONE_LENGTH) {
    return {
      ok: false,
      error: `Phone must be ${MAX_PHONE_LENGTH} characters or fewer.`,
    };
  }

  // Allow common US formats; require at least 7 digits.
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  if (!/^[+]?[\d\s().-]{7,30}$/.test(trimmed)) {
    return { ok: false, error: "Please enter a valid phone number." };
  }

  return { ok: true, phone: trimmed };
}

export function normalizeUsPostalCode(
  value: string,
): { ok: true; postalCode: string } | { ok: false; error: string } {
  const trimmed = value.trim();
  if (!/^\d{5}(-\d{4})?$/.test(trimmed)) {
    return {
      ok: false,
      error: "Enter a valid US ZIP code (12345 or 12345-6789).",
    };
  }
  return { ok: true, postalCode: trimmed };
}

function requireTrimmedText(
  value: unknown,
  field: string,
  max: number,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string") {
    return { ok: false, error: `${field} is required.` };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: `${field} is required.` };
  }
  if (trimmed.length > max) {
    return {
      ok: false,
      error: `${field} must be ${max} characters or fewer.`,
    };
  }
  return { ok: true, value: trimmed };
}

export function validateCustomerAddressInput(
  input: unknown,
):
  | {
      ok: true;
      value: {
        label: string;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: "US";
      };
    }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid address." };
  }

  const record = input as Record<string, unknown>;

  const label = requireTrimmedText(record.label, "Label", 60);
  if (!label.ok) return label;

  const line1 = requireTrimmedText(record.addressLine1, "Address", 120);
  if (!line1.ok) return line1;

  let addressLine2: string | null = null;
  if (record.addressLine2 != null && record.addressLine2 !== "") {
    const line2 = requireTrimmedText(record.addressLine2, "Address line 2", 120);
    if (!line2.ok) return line2;
    addressLine2 = line2.value;
  }

  const city = requireTrimmedText(record.city, "City", 80);
  if (!city.ok) return city;

  const state = requireTrimmedText(record.state, "State", 40);
  if (!state.ok) return state;

  if (typeof record.postalCode !== "string") {
    return { ok: false, error: "ZIP code is required." };
  }
  const postal = normalizeUsPostalCode(record.postalCode);
  if (!postal.ok) return postal;

  const countryRaw =
    typeof record.country === "string" && record.country.trim()
      ? record.country.trim().toUpperCase()
      : "US";
  if (countryRaw !== "US") {
    return { ok: false, error: "Only US addresses are supported." };
  }

  return {
    ok: true,
    value: {
      label: label.value,
      addressLine1: line1.value,
      addressLine2,
      city: city.value,
      state: state.value,
      postalCode: postal.postalCode,
      country: "US",
    },
  };
}

/** Format structured address into a single booking-snapshot style string. */
export function formatAddressForBookingSnapshot(address: {
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

/** Prefill helper foundation for booking form wiring. */
export function buildBookingPrefillFromProfile(input: {
  name: string | null;
  email: string;
  phone: string | null;
  defaultAddress: {
    id: string;
    label: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  } | null;
  savedAddresses: Array<{
    id: string;
    label: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }>;
}) {
  return {
    name: input.name,
    email: input.email,
    phone: input.phone,
    location: input.defaultAddress
      ? formatAddressForBookingSnapshot(input.defaultAddress)
      : null,
    defaultAddress: input.defaultAddress
      ? {
          ...input.defaultAddress,
          country: "US" as const,
        }
      : null,
    savedAddresses: input.savedAddresses.map((address) => ({
      ...address,
      country: "US" as const,
    })),
    address: input.defaultAddress
      ? {
          addressLine1: input.defaultAddress.addressLine1,
          addressLine2: input.defaultAddress.addressLine2,
          city: input.defaultAddress.city,
          state: input.defaultAddress.state,
          postalCode: input.defaultAddress.postalCode,
        }
      : null,
  };
}
