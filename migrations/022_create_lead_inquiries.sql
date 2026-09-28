-- Admin-visible inquiries captured by /api/service-inquiry.
-- Booking requests remain in booking_requests and are not reused here.

CREATE TABLE IF NOT EXISTS lead_inquiries (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sheets_synced_at TIMESTAMPTZ NULL,
  CONSTRAINT lead_inquiries_idempotency_key_unique UNIQUE (idempotency_key),
  CONSTRAINT lead_inquiries_source_check
    CHECK (source IN ('hero_quote', 'service_inquiry'))
);

CREATE INDEX IF NOT EXISTS lead_inquiries_created_at_idx
  ON lead_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS lead_inquiries_email_idx
  ON lead_inquiries (lower(btrim(email)))
  WHERE email IS NOT NULL;
