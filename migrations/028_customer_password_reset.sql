-- Phase 1D: one-time password reset tokens. Raw tokens and password data are never stored here.

ALTER TABLE auth_rate_limits
  DROP CONSTRAINT IF EXISTS auth_rate_limits_action_check;

ALTER TABLE auth_rate_limits
  ADD CONSTRAINT auth_rate_limits_action_check
  CHECK (action IN (
    'registration',
    'credentials_login',
    'verification_resend',
    'password_reset_request'
  ));

CREATE TABLE IF NOT EXISTS customer_password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL
    REFERENCES customers(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_password_reset_tokens_customer_idx
  ON customer_password_reset_tokens (customer_id);

CREATE INDEX IF NOT EXISTS customer_password_reset_tokens_expires_idx
  ON customer_password_reset_tokens (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS customer_password_reset_tokens_one_active_idx
  ON customer_password_reset_tokens (customer_id)
  WHERE consumed_at IS NULL;
