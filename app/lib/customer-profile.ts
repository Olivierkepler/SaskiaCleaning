import "server-only";

import { sql } from "@/app/lib/db";
import {
  MAX_CUSTOMER_ADDRESSES,
  normalizeProfileName,
  normalizeProfilePhone,
  validateCustomerAddressInput,
  buildBookingPrefillFromProfile,
} from "@/app/lib/customer-profile-pure";

export type CustomerProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  emailVerified: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function mapProfile(row: Record<string, unknown>): CustomerProfile {
  return {
    id: String(row.id),
    email: String(row.email),
    name: (row.name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    image: (row.image as string | null) ?? null,
    emailVerified: (row.email_verified as Date | string | null) ?? null,
    createdAt: row.created_at as Date | string,
    updatedAt: row.updated_at as Date | string,
  };
}

function mapAddress(row: Record<string, unknown>): CustomerAddress {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    label: String(row.label),
    addressLine1: String(row.address_line1),
    addressLine2: (row.address_line2 as string | null) ?? null,
    city: String(row.city),
    state: String(row.state),
    postalCode: String(row.postal_code),
    country: String(row.country),
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at as Date | string,
    updatedAt: row.updated_at as Date | string,
  };
}

export async function getCustomerProfile(
  customerId: string,
): Promise<CustomerProfile | null> {
  const rows = await sql`
    SELECT id, email, name, phone, image, email_verified, created_at, updated_at
    FROM customers
    WHERE id = ${customerId}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapProfile(row) : null;
}

export async function updateCustomerProfile(
  customerId: string,
  input: unknown,
): Promise<
  | { ok: true; profile: CustomerProfile }
  | { ok: false; error: string; status: number }
> {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid profile data.", status: 400 };
  }

  const record = input as Record<string, unknown>;

  // Ignore email / image / id / customerId from client
  const nameResult = normalizeProfileName(record.name);
  if (!nameResult.ok) {
    return { ok: false, error: nameResult.error, status: 400 };
  }

  const phoneResult = normalizeProfilePhone(record.phone);
  if (!phoneResult.ok) {
    return { ok: false, error: phoneResult.error, status: 400 };
  }

  const rows = await sql`
    UPDATE customers
    SET
      name = ${nameResult.name},
      phone = ${phoneResult.phone},
      updated_at = now()
    WHERE id = ${customerId}
    RETURNING id, email, name, phone, image, email_verified, created_at, updated_at
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Profile not found.", status: 404 };
  }

  return { ok: true, profile: mapProfile(row) };
}

export async function listCustomerAddresses(
  customerId: string,
): Promise<CustomerAddress[]> {
  const rows = await sql`
    SELECT *
    FROM customer_addresses
    WHERE customer_id = ${customerId}
    ORDER BY is_default DESC, created_at DESC
  `;
  return (rows as Array<Record<string, unknown>>).map(mapAddress);
}

export async function getCustomerAddressById(
  customerId: string,
  addressId: string,
): Promise<CustomerAddress | null> {
  const rows = await sql`
    SELECT *
    FROM customer_addresses
    WHERE id = ${addressId}
      AND customer_id = ${customerId}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapAddress(row) : null;
}

export async function getDefaultCustomerAddress(
  customerId: string,
): Promise<CustomerAddress | null> {
  const rows = await sql`
    SELECT *
    FROM customer_addresses
    WHERE customer_id = ${customerId}
      AND is_default = true
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapAddress(row) : null;
}

export async function createCustomerAddress(
  customerId: string,
  input: unknown,
): Promise<
  | { ok: true; address: CustomerAddress }
  | { ok: false; error: string; status: number }
> {
  const validated = validateCustomerAddressInput(input);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 400 };
  }

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM customer_addresses
    WHERE customer_id = ${customerId}
  `;
  const count = Number((countRows[0] as { count: number }).count);
  if (count >= MAX_CUSTOMER_ADDRESSES) {
    return {
      ok: false,
      error: "You've reached the maximum number of saved addresses.",
      status: 400,
    };
  }

  const makeDefault = count === 0;
  const v = validated.value;

  const rows = await sql`
    INSERT INTO customer_addresses (
      customer_id,
      label,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default
    )
    VALUES (
      ${customerId},
      ${v.label},
      ${v.addressLine1},
      ${v.addressLine2},
      ${v.city},
      ${v.state},
      ${v.postalCode},
      'US',
      ${makeDefault}
    )
    RETURNING *
  `;

  return { ok: true, address: mapAddress(rows[0] as Record<string, unknown>) };
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  input: unknown,
): Promise<
  | { ok: true; address: CustomerAddress }
  | { ok: false; error: string; status: number }
> {
  const validated = validateCustomerAddressInput(input);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 400 };
  }

  const v = validated.value;
  const rows = await sql`
    UPDATE customer_addresses
    SET
      label = ${v.label},
      address_line1 = ${v.addressLine1},
      address_line2 = ${v.addressLine2},
      city = ${v.city},
      state = ${v.state},
      postal_code = ${v.postalCode},
      country = 'US',
      updated_at = now()
    WHERE id = ${addressId}
      AND customer_id = ${customerId}
    RETURNING *
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Address not found.", status: 404 };
  }

  return { ok: true, address: mapAddress(row) };
}

export async function deleteCustomerAddress(
  customerId: string,
  addressId: string,
): Promise<
  | { ok: true }
  | { ok: false; error: string; status: number }
> {
  const rows = await sql`
    DELETE FROM customer_addresses
    WHERE id = ${addressId}
      AND customer_id = ${customerId}
    RETURNING id
  `;

  if (!rows[0]) {
    return { ok: false, error: "Address not found.", status: 404 };
  }

  return { ok: true };
}

export async function setDefaultCustomerAddress(
  customerId: string,
  addressId: string,
): Promise<
  | { ok: true; address: CustomerAddress }
  | { ok: false; error: string; status: number }
> {
  // Ownership check first
  const owned = await getCustomerAddressById(customerId, addressId);
  if (!owned) {
    return { ok: false, error: "Address not found.", status: 404 };
  }

  // Atomic default swap via CTE scoped to this customer only
  const rows = await sql`
    WITH cleared AS (
      UPDATE customer_addresses
      SET is_default = false, updated_at = now()
      WHERE customer_id = ${customerId}
        AND is_default = true
      RETURNING id
    )
    UPDATE customer_addresses
    SET is_default = true, updated_at = now()
    WHERE id = ${addressId}
      AND customer_id = ${customerId}
    RETURNING *
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Address not found.", status: 404 };
  }

  return { ok: true, address: mapAddress(row) };
}

/** Safe prefill payload for authenticated booking form wiring. */
export async function getCustomerBookingPrefill(customerId: string) {
  const profile = await getCustomerProfile(customerId);
  if (!profile) return null;

  const addresses = await listCustomerAddresses(customerId);
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? null;

  return buildBookingPrefillFromProfile({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    defaultAddress: defaultAddress
      ? {
          id: defaultAddress.id,
          label: defaultAddress.label,
          addressLine1: defaultAddress.addressLine1,
          addressLine2: defaultAddress.addressLine2,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.postalCode,
          isDefault: defaultAddress.isDefault,
        }
      : null,
    savedAddresses: addresses.map((address) => ({
      id: address.id,
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    })),
  });
}
