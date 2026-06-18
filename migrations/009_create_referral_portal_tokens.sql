-- Secure magic-link tokens for the customer referral portal

CREATE TABLE IF NOT EXISTS referral_portal_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_portal_tokens_email_idx
  ON referral_portal_tokens (email);

CREATE INDEX IF NOT EXISTS referral_portal_tokens_token_hash_idx
  ON referral_portal_tokens (token_hash);

CREATE INDEX IF NOT EXISTS referral_portal_tokens_expires_at_idx
  ON referral_portal_tokens (expires_at);
