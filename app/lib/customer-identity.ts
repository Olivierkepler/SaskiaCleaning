import "server-only";

import { sql } from "@/app/lib/db";
import {
  normalizeCustomerEmail,
  isGoogleEmailVerified,
} from "@/app/lib/customer-auth-pure";
import { resolveGoogleIdentity } from "@/app/lib/customer-credentials-pure";

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
  const providerCustomer =
    (existingByProvider[0] as CustomerRecord | undefined) ?? null;
  let emailCustomer = providerCustomer ? null : await findCustomerByEmail(email);
  let hasPasswordCredential = false;
  if (emailCustomer) {
    const credentials = await sql`
      SELECT customer_id
      FROM customer_credentials
      WHERE customer_id = ${emailCustomer.id}
      LIMIT 1
    `;
    hasPasswordCredential = credentials.length > 0;
  }

  const resolution = resolveGoogleIdentity({
    providerCustomerId: providerCustomer?.id ?? null,
    emailCustomerId: emailCustomer?.id ?? null,
    emailCustomerHasPassword: hasPasswordCredential,
  });

  if (resolution.kind === "reject_password_customer") {
    throw new Error("Google and password accounts are not linked automatically.");
  }

  let customer: CustomerRecord | null = null;
  if (resolution.kind === "provider") {
    customer = providerCustomer;
  } else if (resolution.kind === "email") {
    customer = emailCustomer;
  } else {
    const inserted = await sql`
      INSERT INTO customers (email, name, image, email_verified)
      VALUES (${email}, ${input.name}, ${input.image}, ${now}::timestamptz)
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `;
    customer = (inserted[0] as CustomerRecord | undefined) ?? null;

    // A concurrent registration may have won the unique-email race. Never
    // merge that password customer by email; only an already linked provider
    // identity may resolve to its existing customer.
    if (!customer) {
      emailCustomer = await findCustomerByEmail(email);
      if (emailCustomer) {
        const credentials = await sql`
          SELECT customer_id
          FROM customer_credentials
          WHERE customer_id = ${emailCustomer.id}
          LIMIT 1
        `;
        if (credentials.length > 0) {
          throw new Error("Google and password accounts are not linked automatically.");
        }
        customer = emailCustomer;
      }
    }
  }

  if (!customer) {
    throw new Error("Unable to resolve Google customer identity.");
  }

  // Preserve customer-edited preferred name and phone. An existing provider
  // identity remains attached to its original customer; email never reassigns it.
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
  customer = (updated[0] as CustomerRecord | undefined) ?? customer;

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
    ON CONFLICT (provider, provider_account_id) DO NOTHING
  `;

  const linkedIdentity = await sql`
    SELECT customer_id
    FROM customer_oauth_accounts
    WHERE provider = 'google'
      AND provider_account_id = ${input.providerAccountId}
    LIMIT 1
  `;
  if (linkedIdentity[0]?.customer_id !== customer.id) {
    throw new Error("Google identity is already linked to another customer.");
  }

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
