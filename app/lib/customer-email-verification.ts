import "server-only";

import { sql } from "@/app/lib/db";
import { sendEmail } from "@/app/lib/email";
import { PUBLIC_REFERRAL_SITE_ORIGIN } from "@/app/lib/referrals";
import {
  buildEmailVerificationUrl,
  dispatchEmailVerification,
  EMAIL_VERIFICATION_CONSUMED_RETENTION_DAYS,
  issueEmailVerificationToken,
  resendVerificationIfEligible,
  redeemEmailVerificationToken,
  type EmailVerificationTokenRepository,
} from "@/app/lib/customer-email-verification-pure";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";

const verificationRepository: EmailVerificationTokenRepository = {
  async rotateActiveToken({ customerId, tokenHash, expiresAt }) {
    const rows = await sql`
      WITH locked_customer AS MATERIALIZED (
        SELECT id FROM customers WHERE id = ${customerId} FOR UPDATE
      ), invalidated AS (
        UPDATE customer_email_verification_tokens AS tokens
        SET consumed_at = now()
        FROM locked_customer
        WHERE tokens.customer_id = locked_customer.id
          AND tokens.consumed_at IS NULL
        RETURNING tokens.id
      ), inserted AS (
        INSERT INTO customer_email_verification_tokens (
          customer_id, token_hash, expires_at
        )
        SELECT id, ${tokenHash}, ${expiresAt}
        FROM locked_customer
        WHERE (SELECT count(*) FROM invalidated) >= 0
        RETURNING id
      )
      SELECT id FROM inserted
    `;
    if (!rows[0]) throw new Error("Verification token could not be issued.");
  },

  async consumeToken({ tokenHash, now }) {
    const rows = await sql`
      WITH consumed AS (
        UPDATE customer_email_verification_tokens
        SET consumed_at = ${now}
        WHERE token_hash = ${tokenHash}
          AND consumed_at IS NULL
          AND expires_at > ${now}
        RETURNING customer_id
      ), verified AS (
        UPDATE customers
        SET email_verified = COALESCE(email_verified, ${now}), updated_at = now()
        WHERE id = (SELECT customer_id FROM consumed)
        RETURNING id
      ), invalidated AS (
        UPDATE customer_email_verification_tokens
        SET consumed_at = ${now}
        WHERE customer_id = (SELECT id FROM verified)
          AND consumed_at IS NULL
          AND token_hash <> ${tokenHash}
        RETURNING id
      )
      SELECT id FROM verified
    `;
    return rows.length === 1;
  },
};

function verificationUrl(token: string): string {
  // Use the repository's canonical, server-defined public site origin. Never use request headers.
  return buildEmailVerificationUrl(PUBLIC_REFERRAL_SITE_ORIGIN, token);
}

async function sendVerificationEmail(input: {
  email: string;
  name: string | null;
  token: string;
}): Promise<boolean> {
  const firstName = input.name?.trim().split(/\s+/)[0] || null;
  return dispatchEmailVerification({
    to: input.email,
    firstName,
    verificationUrl: verificationUrl(input.token),
  }, sendEmail);
}

export async function sendCustomerVerificationEmail(customer: {
  id: string;
  email: string;
  name: string | null;
}): Promise<boolean> {
  const issued = await issueEmailVerificationToken(customer.id, verificationRepository);
  return sendVerificationEmail({
    email: customer.email,
    name: customer.name,
    token: issued.token,
  });
}

export async function resendCustomerVerificationEmail(email: string): Promise<void> {
  const normalizedEmail = normalizeCustomerEmail(email);
  await resendVerificationIfEligible(
    normalizedEmail,
    async (candidateEmail) => {
      const rows = await sql`
        SELECT c.id, c.email, c.name
        FROM customers AS c
        INNER JOIN customer_credentials AS credentials
          ON credentials.customer_id = c.id
        WHERE c.email = ${candidateEmail}
          AND c.email_verified IS NULL
        LIMIT 1
      `;
      return (rows[0] as
        | { id: string; email: string; name: string | null }
        | undefined) ?? null;
    },
    async (customer) => { await sendCustomerVerificationEmail(customer); },
  );
}

export async function verifyCustomerEmailToken(token: unknown): Promise<boolean> {
  return redeemEmailVerificationToken(token, verificationRepository);
}

export async function pruneEmailVerificationTokens(): Promise<number> {
  const rows = await sql`
    WITH expired AS (
      SELECT id
      FROM customer_email_verification_tokens
      WHERE expires_at <= now()
         OR consumed_at <= now() - make_interval(days => ${EMAIL_VERIFICATION_CONSUMED_RETENTION_DAYS})
      ORDER BY expires_at
      LIMIT 5000
      FOR UPDATE SKIP LOCKED
    ), deleted AS (
      DELETE FROM customer_email_verification_tokens AS tokens
      USING expired
      WHERE tokens.id = expired.id
      RETURNING 1
    )
    SELECT count(*)::int AS deleted_count FROM deleted
  `;
  return Number((rows[0] as { deleted_count?: number } | undefined)?.deleted_count ?? 0);
}
