-- Phase 11.4: Customer profile phone + saved addresses
-- ADDITIVE ONLY — does not rewrite bookings or OAuth identity.

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customer_addresses_label_length_check
    CHECK (char_length(btrim(label)) >= 1 AND char_length(label) <= 60),
  CONSTRAINT customer_addresses_line1_length_check
    CHECK (char_length(btrim(address_line1)) >= 1 AND char_length(address_line1) <= 120),
  CONSTRAINT customer_addresses_line2_length_check
    CHECK (address_line2 IS NULL OR char_length(address_line2) <= 120),
  CONSTRAINT customer_addresses_city_length_check
    CHECK (char_length(btrim(city)) >= 1 AND char_length(city) <= 80),
  CONSTRAINT customer_addresses_state_length_check
    CHECK (char_length(btrim(state)) >= 2 AND char_length(state) <= 40),
  CONSTRAINT customer_addresses_postal_length_check
    CHECK (char_length(btrim(postal_code)) >= 3 AND char_length(postal_code) <= 20),
  CONSTRAINT customer_addresses_country_check
    CHECK (country = 'US')
);

CREATE INDEX IF NOT EXISTS customer_addresses_customer_id_idx
  ON customer_addresses (customer_id);

-- At most one default address per customer
CREATE UNIQUE INDEX IF NOT EXISTS customer_addresses_one_default_per_customer_idx
  ON customer_addresses (customer_id)
  WHERE is_default = true;
