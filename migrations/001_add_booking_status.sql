-- Add booking status workflow column
ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'new';

-- Backfill any existing rows (safe if column was just added with DEFAULT)
UPDATE booking_requests
SET status = 'new'
WHERE status IS NULL;

-- Enforce allowed status values
ALTER TABLE booking_requests
DROP CONSTRAINT IF EXISTS booking_requests_status_check;

ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_status_check
CHECK (
  status IN (
    'new',
    'contacted',
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
  )
);
