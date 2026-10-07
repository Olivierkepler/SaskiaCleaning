import "server-only";

import { sql } from "@/app/lib/db";
import { sendEmail } from "@/app/lib/email";
import { PUBLIC_REFERRAL_SITE_ORIGIN } from "@/app/lib/referrals";
import { hashCustomerPassword } from "@/app/lib/customer-password";
import {
  buildPasswordResetEmail,
  buildPasswordResetUrl,
  PASSWORD_RESET_CONSUMED_RETENTION_DAYS,
  issuePasswordResetToken,
  requestPasswordResetIfEligible,
  resetPasswordWithToken,
  type PasswordResetRecipient,
  type PasswordResetTokenRepository,
} from "@/app/lib/customer-password-reset-pure";

const passwordResetRepository: PasswordResetTokenRepository = {
  async rotateActiveToken({ customerId, tokenHash, expiresAt }) {
    const rows = await sql`
      WITH locked_customer AS MATERIALIZED (
        SELECT id FROM customers WHERE id = ${customerId} FOR UPDATE
      ), invalidated AS (
        UPDATE customer_password_reset_tokens AS tokens
        SET consumed_at = now()
        FROM locked_customer
        WHERE tokens.customer_id = locked_customer.id
          AND tokens.consumed_at IS NULL
        RETURNING tokens.id
      ), inserted AS (
        INSERT INTO customer_password_reset_tokens (customer_id, token_hash, expires_at)
        SELECT id, ${tokenHash}, ${expiresAt}
        FROM locked_customer
        WHERE (SELECT count(*) FROM invalidated) >= 0
        RETURNING id
      )
      SELECT id FROM inserted
    `;
    if (!rows[0]) throw new Error("Password reset token could not be issued.");
  },

  async findEligibleActiveToken({ tokenHash, now }) {
    const rows = await sql`
      SELECT tokens.customer_id
      FROM customer_password_reset_tokens AS tokens
      INNER JOIN customers AS customer ON customer.id = tokens.customer_id
      INNER JOIN customer_credentials AS credentials ON credentials.customer_id = customer.id
      WHERE tokens.token_hash = ${tokenHash}
        AND tokens.consumed_at IS NULL
        AND tokens.expires_at > ${now}
        AND customer.email_verified IS NOT NULL
      LIMIT 1
    `;
    return (rows[0] as { customer_id: string } | undefined)
      ? { customerId: (rows[0] as { customer_id: string }).customer_id }
      : null;
  },

  async completeResetAtomically({ customerId, tokenHash, passwordHash, now }) {
    const rows = await sql`
      WITH locked AS MATERIALIZED (
        SELECT tokens.id AS token_id, tokens.customer_id
        FROM customer_password_reset_tokens AS tokens
        INNER JOIN customers AS customer ON customer.id = tokens.customer_id
        INNER JOIN customer_credentials AS credentials ON credentials.customer_id = customer.id
        WHERE tokens.token_hash = ${tokenHash}
          AND tokens.customer_id = ${customerId}
          AND tokens.consumed_at IS NULL
          AND tokens.expires_at > ${now}
          AND customer.email_verified IS NOT NULL
        FOR UPDATE OF tokens, customer, credentials
      ), consumed AS (
        UPDATE customer_password_reset_tokens AS tokens
        SET consumed_at = ${now}
        FROM locked
        WHERE tokens.id = locked.token_id
          AND tokens.consumed_at IS NULL
          AND tokens.expires_at > ${now}
        RETURNING tokens.id, tokens.customer_id
      ), credentials_updated AS (
        UPDATE customer_credentials AS credentials
        SET password_hash = ${passwordHash},
            auth_version = credentials.auth_version + 1,
            updated_at = ${now}
        FROM consumed
        WHERE credentials.customer_id = consumed.customer_id
        RETURNING credentials.customer_id
      ), invalidated AS (
        UPDATE customer_password_reset_tokens AS tokens
        SET consumed_at = ${now}
        FROM credentials_updated
        WHERE tokens.customer_id = credentials_updated.customer_id
          AND tokens.consumed_at IS NULL
          AND tokens.id <> (SELECT id FROM consumed)
        RETURNING tokens.id
      )
      SELECT customer_id FROM credentials_updated
    `;
    return rows.length === 1;
  },
};

async function findEligiblePasswordCustomer(email: string): Promise<PasswordResetRecipient | null> {
  const rows = await sql`
    SELECT customer.id, customer.email, customer.name
    FROM customers AS customer
    INNER JOIN customer_credentials AS credentials ON credentials.customer_id = customer.id
    WHERE customer.email = ${email}
      AND customer.email_verified IS NOT NULL
    LIMIT 1
  `;
  return (rows[0] as PasswordResetRecipient | undefined) ?? null;
}

async function sendPasswordResetEmail(customer: PasswordResetRecipient): Promise<void> {
  const issued = await issuePasswordResetToken(customer.id, passwordResetRepository);
  const resetUrl = buildPasswordResetUrl(PUBLIC_REFERRAL_SITE_ORIGIN, issued.token);
  const firstName = customer.name?.trim().split(/\s+/)[0] || null;
  const content = buildPasswordResetEmail({ firstName, resetUrl });
  await sendEmail({ to: customer.email, ...content });
}

export async function requestCustomerPasswordReset(email: string): Promise<{ message: string }> {
  return requestPasswordResetIfEligible(email, findEligiblePasswordCustomer, sendPasswordResetEmail);
}

export async function resetCustomerPassword(input: unknown): Promise<boolean> {
  return resetPasswordWithToken(input, passwordResetRepository, {
    hash: hashCustomerPassword,
  });
}

export async function prunePasswordResetTokens(): Promise<number> {
  const rows = await sql`
    WITH expired AS (
      SELECT id
      FROM customer_password_reset_tokens
      WHERE expires_at <= now()
         OR consumed_at <= now() - make_interval(days => ${PASSWORD_RESET_CONSUMED_RETENTION_DAYS})
      ORDER BY expires_at
      LIMIT 5000
      FOR UPDATE SKIP LOCKED
    ), deleted AS (
      DELETE FROM customer_password_reset_tokens AS tokens
      USING expired
      WHERE tokens.id = expired.id
      RETURNING 1
    )
    SELECT count(*)::int AS deleted_count FROM deleted
  `;
  return Number((rows[0] as { deleted_count?: number } | undefined)?.deleted_count ?? 0);
}
