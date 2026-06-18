-- Referral email notification log

CREATE TABLE IF NOT EXISTS referral_notifications (
  id SERIAL PRIMARY KEY,
  referral_id INTEGER NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  CONSTRAINT referral_notifications_type_check
    CHECK (type IN ('referral_completed', 'referral_rewarded')),
  CONSTRAINT referral_notifications_status_check
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped'))
);

CREATE UNIQUE INDEX IF NOT EXISTS referral_notifications_sent_unique_idx
  ON referral_notifications (referral_id, type)
  WHERE status = 'sent';

CREATE INDEX IF NOT EXISTS referral_notifications_referral_id_idx
  ON referral_notifications (referral_id);
