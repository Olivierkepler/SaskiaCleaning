import "server-only";

import { sql } from "@/app/lib/db";
import {
  PRIVACY_DOCUMENT_VERSION,
  TERMS_DOCUMENT_VERSION,
  authenticateCredentialInput,
  credentialsSchema,
  isUniqueConstraintViolation,
  registerCustomer,
  type NewCustomerIdentity,
  type RegistrationInput,
  type RegistrationRepository,
} from "@/app/lib/customer-credentials-pure";
import {
  hashCustomerPassword,
  verifyCustomerPassword,
} from "@/app/lib/customer-password";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";

export { credentialsSchema, registerCustomer };
export type { RegistrationInput };

export class CustomerRegistrationConflictError extends Error {
  constructor() {
    super("Unable to create account.");
    this.name = "CustomerRegistrationConflictError";
  }
}

const registrationRepository: RegistrationRepository = {
  async createCustomerWithCredentials(input) {
    try {
      // One data-modifying CTE statement is one atomic Postgres transaction:
      // any credential or consent insert failure rolls back customer creation.
      const rows = await sql`
        WITH new_customer AS (
          INSERT INTO customers (email, name, email_verified)
          VALUES (${input.email}, ${input.name}, NULL)
          RETURNING id, email, name, image
        ), new_credentials AS (
          INSERT INTO customer_credentials (customer_id, password_hash)
          SELECT id, ${input.passwordHash} FROM new_customer
          RETURNING customer_id
        ), terms_acceptance AS (
          INSERT INTO customer_legal_acceptances (
            customer_id, document_type, document_version
          )
          SELECT customer_id, 'terms', ${input.termsVersion}
          FROM new_credentials
          RETURNING id
        ), privacy_acceptance AS (
          INSERT INTO customer_legal_acceptances (
            customer_id, document_type, document_version
          )
          SELECT customer_id, 'privacy', ${input.privacyVersion}
          FROM new_credentials
          RETURNING id
        )
        SELECT id, email, name, image FROM new_customer
      `;

      const customer = rows[0] as
        | { id: string; email: string; name: string; image: string | null }
        | undefined;
      if (!customer) {
        throw new Error("Customer registration did not return a customer.");
      }

      return customer;
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new CustomerRegistrationConflictError();
      }
      throw error;
    }
  },
};

export async function createRegisteredCustomer(
  input: RegistrationInput,
): Promise<NewCustomerIdentity> {
  return registerCustomer(input, registrationRepository, {
    hash: hashCustomerPassword,
  });
}

export type AuthenticatedCredentialCustomer = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerifiedAt: Date | string | null;
  authVersion: number;
};

export async function authenticateCustomerCredentials(
  rawCredentials: unknown,
): Promise<AuthenticatedCredentialCustomer | null> {
  return authenticateCredentialInput(
    rawCredentials,
    async (email) => {
      const rows = await sql`
        SELECT c.id, c.email, c.name, c.image, c.email_verified, cc.password_hash, cc.auth_version
        FROM customers c
        LEFT JOIN customer_credentials cc ON cc.customer_id = c.id
        WHERE c.email = ${normalizeCustomerEmail(email)}
        LIMIT 1
      `;
      const row = rows[0] as
        | {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
            email_verified: Date | string | null;
            password_hash: string | null;
            auth_version: number;
          }
        | undefined;
      return row
        ? {
            id: row.id,
            email: row.email,
            name: row.name,
            image: row.image,
            passwordHash: row.password_hash,
            emailVerifiedAt: row.email_verified,
            authVersion: row.auth_version,
          }
        : null;
    },
    verifyCustomerPassword,
  );
}

export async function findCustomerCredentialAuthVersion(customerId: string): Promise<number | null> {
  const rows = await sql`
    SELECT auth_version
    FROM customer_credentials
    WHERE customer_id = ${customerId}
    LIMIT 1
  `;
  const row = rows[0] as { auth_version: number } | undefined;
  return row?.auth_version ?? null;
}

export const currentLegalAcceptanceVersions = Object.freeze({
  terms: TERMS_DOCUMENT_VERSION,
  privacy: PRIVACY_DOCUMENT_VERSION,
});
