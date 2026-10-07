-- Phase 1C: one-time email verification tokens for password customers.
-- Existing Google-authenticated customers continue using customers.email_verified.

ALTER TABLE auth_rate_limits
  DROP CONSTRAINT IF EXISTS auth_rate_limits_action_check;

ALTER TABLE auth_rate_limits
  ADD CONSTRAINT auth_rate_limits_action_check
  CHECK (action IN ('registration', 'credentials_login', 'verification_resend'));

CREATE TABLE IF NOT EXISTS customer_email_verification_tokens (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL
    REFERENCES customers(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_email_verification_tokens_customer_idx
  ON customer_email_verification_tokens (customer_id);

CREATE INDEX IF NOT EXISTS customer_email_verification_tokens_expires_idx
  ON customer_email_verification_tokens (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS customer_email_verification_tokens_one_active_idx
  ON customer_email_verification_tokens (customer_id)
  WHERE consumed_at IS NULL;
