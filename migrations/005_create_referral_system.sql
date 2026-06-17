-- Referral system: codes, tracking, and booking linkage

ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

CREATE TABLE IF NOT EXISTS referral_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  referrer_name TEXT NOT NULL,
  referrer_email TEXT,
  reward_amount INTEGER NOT NULL DEFAULT 20,
  friend_discount_amount INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referral_code_id INTEGER REFERENCES referral_codes(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  booking_request_id INTEGER NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  referred_name TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 20,
  friend_discount_amount INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT referrals_status_check
    CHECK (status IN ('pending', 'completed', 'rewarded', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS referrals_booking_request_id_idx
  ON referrals (booking_request_id);

CREATE INDEX IF NOT EXISTS referrals_referral_code_id_idx
  ON referrals (referral_code_id);
