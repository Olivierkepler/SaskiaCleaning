-- Referral payout tracking for admin reward fulfillment

ALTER TABLE referrals
  ADD COLUMN IF NOT EXISTS payout_amount INTEGER,
  ADD COLUMN IF NOT EXISTS payout_method TEXT,
  ADD COLUMN IF NOT EXISTS payout_notes TEXT,
  ADD COLUMN IF NOT EXISTS rewarded_at TIMESTAMPTZ;
