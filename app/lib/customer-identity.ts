import "server-only";

import { sql } from "@/app/lib/db";
import {
  normalizeCustomerEmail,
  isGoogleEmailVerified,
} from "@/app/lib/customer-auth-pure";

export type CustomerRecord = {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  image: string | null;
  email_verified: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export { normalizeCustomerEmail, isGoogleEmailVerified };

export async function findCustomerByEmail(
  email: string,
): Promise<CustomerRecord | null> {
  const normalized = normalizeCustomerEmail(email);
  const rows = await sql`
    SELECT *
    FROM customers
    WHERE email = ${normalized}
    LIMIT 1
  `;
  return (rows[0] as CustomerRecord | undefined) ?? null;
}

export async function findCustomerById(
  id: string,
): Promise<CustomerRecord | null> {
  const rows = await sql`
    SELECT *
    FROM customers
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as CustomerRecord | undefined) ?? null;
}

export async function upsertCustomerFromGoogle(input: {
  email: string;
  name: string | null;
  image: string | null;
  providerAccountId: string;
  emailVerified: boolean;
}): Promise<CustomerRecord> {
  if (!input.emailVerified) {
    throw new Error("Google email is not verified.");
  }

  const email = normalizeCustomerEmail(input.email);
  const now = new Date().toISOString();

  const existingByProvider = await sql`
    SELECT c.*
    FROM customer_oauth_accounts a
    INNER JOIN customers c ON c.id = a.customer_id
    WHERE a.provider = 'google'
      AND a.provider_account_id = ${input.providerAccountId}
    LIMIT 1
  `;

  let customer = (existingByProvider[0] as CustomerRecord | undefined) ?? null;

  if (!customer) {
    customer = await findCustomerByEmail(email);
  }

  if (customer) {
    // Preserve customer-edited preferred name and phone.
    // Google may refresh the provider image; never overwrite non-empty name.
    const updated = await sql`
      UPDATE customers
      SET
        name = CASE
          WHEN name IS NULL OR btrim(name) = '' THEN COALESCE(${input.name}, name)
          ELSE name
        END,
        image = COALESCE(${input.image}, image),
        email_verified = COALESCE(email_verified, ${now}::timestamptz),
        updated_at = now()
      WHERE id = ${customer.id}
      RETURNING *
    `;
    customer = updated[0] as CustomerRecord;
  } else {
    const inserted = await sql`
      INSERT INTO customers (email, name, image, email_verified)
      VALUES (
        ${email},
        ${input.name},
        ${input.image},
        ${now}::timestamptz
      )
      ON CONFLICT (email) DO UPDATE SET
        name = CASE
          WHEN customers.name IS NULL OR btrim(customers.name) = ''
            THEN COALESCE(EXCLUDED.name, customers.name)
          ELSE customers.name
        END,
        image = COALESCE(EXCLUDED.image, customers.image),
        email_verified = COALESCE(customers.email_verified, EXCLUDED.email_verified),
        updated_at = now()
      RETURNING *
    `;
    customer = inserted[0] as CustomerRecord;
  }

  await sql`
    INSERT INTO customer_oauth_accounts (
      customer_id,
      provider,
      provider_account_id
    )
    VALUES (
      ${customer.id},
      'google',
      ${input.providerAccountId}
    )
    ON CONFLICT (provider, provider_account_id) DO UPDATE SET
      customer_id = EXCLUDED.customer_id,
      updated_at = now()
  `;

  return customer;
}

/**
 * Link guest bookings that match a verified Google email.
 * Only updates rows where customer_id IS NULL.
 * Never reassigns bookings already owned by another customer.
 */
export async function linkGuestBookingsByEmail(
  customerId: string,
  verifiedEmail: string,
): Promise<number> {
  const email = normalizeCustomerEmail(verifiedEmail);

  const result = await sql`
    UPDATE booking_requests
    SET customer_id = ${customerId}
    WHERE customer_id IS NULL
      AND lower(btrim(email)) = ${email}
    RETURNING id
  `;

  return result.length;
}
