-- Link referral codes to authenticated customers while preserving guest codes.
ALTER TABLE referral_codes
  ADD COLUMN IF NOT EXISTS customer_id UUID
  REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS referral_codes_customer_id_idx
  ON referral_codes (customer_id);

-- Backfill only codes whose normalized email matches a customer row.
-- customers.email is normalized and unique, so each matching row is unambiguous.
UPDATE referral_codes AS rc
SET customer_id = c.id
FROM customers AS c
WHERE rc.customer_id IS NULL
  AND rc.referrer_email IS NOT NULL
  AND lower(btrim(rc.referrer_email)) = c.email;
