import "server-only";

import { sql } from "@/app/lib/db";
import { hashCustomerPassword } from "@/app/lib/customer-password";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";
import {
  addPasswordSchema,
  generateGoogleLinkNonce,
  hashGoogleLinkNonce,
  GOOGLE_LINK_INTENT_TTL_SECONDS,
  type AddPasswordResult,
} from "@/app/lib/customer-auth-linking-pure";

export async function getCustomerSignInMethods(customerId: string): Promise<{ google: boolean; password: boolean }> {
  const rows = await sql`
    SELECT
      EXISTS (SELECT 1 FROM customer_oauth_accounts WHERE customer_id = ${customerId} AND provider = 'google') AS google,
      EXISTS (SELECT 1 FROM customer_credentials WHERE customer_id = ${customerId}) AS password
  `;
  return {
    google: Boolean((rows[0] as { google?: boolean } | undefined)?.google),
    password: Boolean((rows[0] as { password?: boolean } | undefined)?.password),
  };
}

export async function addPasswordMethod(customerId: string, rawInput: unknown): Promise<AddPasswordResult> {
  const parsed = addPasswordSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const customerRows = await sql`
    SELECT email_verified FROM customers WHERE id = ${customerId} LIMIT 1
  `;
  if (!customerRows[0] || !(customerRows[0] as { email_verified: Date | string | null }).email_verified) {
    return { ok: false, reason: "unverified" };
  }
  const passwordHash = await hashCustomerPassword(parsed.data.password);
  const rows = await sql`
    INSERT INTO customer_credentials (customer_id, password_hash, auth_version)
    SELECT id, ${passwordHash}, 1
    FROM customers
    WHERE id = ${customerId} AND email_verified IS NOT NULL
    ON CONFLICT (customer_id) DO NOTHING
    RETURNING customer_id
  `;
  return rows.length === 1 ? { ok: true } : { ok: false, reason: "exists" };
}

export async function createGoogleLinkIntent(input: {
  customerId: string;
  sessionBindingHash: string;
}): Promise<{ nonce: string; expiresAt: Date }> {
  const nonce = generateGoogleLinkNonce();
  const expiresAt = new Date(Date.now() + GOOGLE_LINK_INTENT_TTL_SECONDS * 1000);
  const rows = await sql`
    WITH locked_customer AS MATERIALIZED (
      SELECT id FROM customers
      WHERE id = ${input.customerId} AND email_verified IS NOT NULL
      FOR UPDATE
    ), invalidated AS (
      UPDATE customer_auth_link_intents AS intents
      SET consumed_at = now()
      FROM locked_customer
      WHERE intents.customer_id = locked_customer.id
        AND intents.provider = 'google'
        AND intents.consumed_at IS NULL
      RETURNING intents.id
    ), inserted AS (
      INSERT INTO customer_auth_link_intents (
        customer_id, provider, nonce_hash, session_binding_hash, expires_at
      )
      SELECT id, 'google', ${hashGoogleLinkNonce(nonce)}, ${input.sessionBindingHash}, ${expiresAt}
      FROM locked_customer
      WHERE (SELECT count(*) FROM invalidated) >= 0
      RETURNING id
    )
    SELECT id FROM inserted
  `;
  if (!rows[0]) throw new Error("Could not create Google linking intent.");
  return { nonce, expiresAt };
}

export async function completeGoogleLinkIntent(input: {
  nonce: string;
  sessionBindingHash: string | null;
  providerAccountId: string;
  googleEmail: string;
  emailVerified: boolean;
}): Promise<boolean> {
  if (!input.sessionBindingHash || !input.emailVerified || !input.providerAccountId) return false;
  const normalizedEmail = normalizeCustomerEmail(input.googleEmail);
  const rows = await sql`
    WITH intent AS MATERIALIZED (
      SELECT i.id, i.customer_id, customer.email
      FROM customer_auth_link_intents AS i
      INNER JOIN customers AS customer ON customer.id = i.customer_id
      WHERE i.nonce_hash = ${hashGoogleLinkNonce(input.nonce)}
        AND i.session_binding_hash = ${input.sessionBindingHash}
        AND i.provider = 'google'
        AND i.consumed_at IS NULL
        AND i.expires_at > now()
      FOR UPDATE OF i, customer
    ), existing AS MATERIALIZED (
      SELECT account.customer_id
      FROM customer_oauth_accounts AS account
      WHERE account.provider = 'google'
        AND account.provider_account_id = ${input.providerAccountId}
    ), decision AS MATERIALIZED (
      SELECT intent.id, intent.customer_id,
        (intent.email = ${normalizedEmail}
          AND (NOT EXISTS (SELECT 1 FROM existing)
            OR EXISTS (SELECT 1 FROM existing WHERE customer_id = intent.customer_id))) AS allowed
      FROM intent
    ), inserted AS (
      INSERT INTO customer_oauth_accounts (customer_id, provider, provider_account_id)
      SELECT decision.customer_id, 'google', ${input.providerAccountId}
      FROM decision
      WHERE decision.allowed
      ON CONFLICT (provider, provider_account_id) DO NOTHING
      RETURNING customer_id
    ), confirmed AS MATERIALIZED (
      SELECT inserted.customer_id FROM inserted
      UNION
      SELECT decision.customer_id
      FROM decision
      INNER JOIN existing ON existing.customer_id = decision.customer_id
      WHERE decision.allowed
    ), consumed AS (
      UPDATE customer_auth_link_intents AS link_intent
      SET consumed_at = now()
      FROM decision
      WHERE link_intent.id = decision.id
      RETURNING link_intent.customer_id
    )
    SELECT EXISTS (
      SELECT 1 FROM confirmed
      INNER JOIN consumed USING (customer_id)
    ) AS linked
  `;
  return Boolean((rows[0] as { linked?: boolean } | undefined)?.linked);
}
