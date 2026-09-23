-- Phase 11.1: Google customer identity + optional booking ownership
-- ADDITIVE ONLY — does not alter or drop existing columns/tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  image TEXT,
  email_verified TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customers_email_normalized_check
    CHECK (email = lower(btrim(email)))
);

CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique_idx
  ON customers (email);

CREATE TABLE IF NOT EXISTS customer_oauth_accounts (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customer_oauth_accounts_provider_account_unique
    UNIQUE (provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS customer_oauth_accounts_customer_id_idx
  ON customer_oauth_accounts (customer_id);

ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS booking_requests_customer_id_idx
  ON booking_requests (customer_id);

CREATE INDEX IF NOT EXISTS booking_requests_email_lower_idx
  ON booking_requests (lower(btrim(email)));
