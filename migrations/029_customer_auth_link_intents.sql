-- Phase 1E: short-lived, one-time intents for explicit Google account linking.
-- Existing customer and OAuth ownership rows are not modified.

ALTER TABLE auth_rate_limits
  DROP CONSTRAINT IF EXISTS auth_rate_limits_action_check;

ALTER TABLE auth_rate_limits
  ADD CONSTRAINT auth_rate_limits_action_check
  CHECK (action IN (
    'registration',
    'credentials_login',
    'verification_resend',
    'password_reset_request',
    'password_method_add',
    'google_link_intent'
  ));

CREATE TABLE IF NOT EXISTS customer_auth_link_intents (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider = 'google'),
  nonce_hash CHAR(64) NOT NULL UNIQUE,
  session_binding_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_auth_link_intents_customer_idx
  ON customer_auth_link_intents (customer_id);

CREATE INDEX IF NOT EXISTS customer_auth_link_intents_expires_idx
  ON customer_auth_link_intents (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS customer_auth_link_intents_one_active_idx
  ON customer_auth_link_intents (customer_id, provider)
  WHERE consumed_at IS NULL;
