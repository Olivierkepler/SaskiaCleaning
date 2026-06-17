-- Add CleaningEstimator booking detail columns
-- Compatible with POST /api/booking (service, frequency, location, booking_date,
-- extras, estimate_low, estimate_mid, estimate_high, notes)

ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS service TEXT,
  ADD COLUMN IF NOT EXISTS frequency TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS booking_date DATE,
  ADD COLUMN IF NOT EXISTS extras JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS estimate_low INTEGER,
  ADD COLUMN IF NOT EXISTS estimate_mid INTEGER,
  ADD COLUMN IF NOT EXISTS estimate_high INTEGER,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Backfill extras for any rows created before this migration
UPDATE booking_requests
SET extras = '[]'::jsonb
WHERE extras IS NULL;
