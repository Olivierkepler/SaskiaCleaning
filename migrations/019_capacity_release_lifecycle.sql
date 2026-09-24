-- Phase 11.11: Capacity release lifecycle metadata
-- ADDITIVE. Soft-release only (never delete assignment history).

ALTER TABLE booking_assignments
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

ALTER TABLE booking_assignments
  ADD COLUMN IF NOT EXISTS release_reason TEXT;

ALTER TABLE booking_assignments
  DROP CONSTRAINT IF EXISTS booking_assignments_release_reason_check;

ALTER TABLE booking_assignments
  ADD CONSTRAINT booking_assignments_release_reason_check
  CHECK (
    release_reason IS NULL
    OR release_reason IN (
      'cancelled',
      'completed_window_elapsed',
      'rescheduled',
      'admin_release'
    )
  );

-- Optional consistency: inactive rows may carry release metadata;
-- active rows should not claim a release timestamp.
ALTER TABLE booking_assignments
  DROP CONSTRAINT IF EXISTS booking_assignments_release_active_check;

ALTER TABLE booking_assignments
  ADD CONSTRAINT booking_assignments_release_active_check
  CHECK (
    (is_active = true AND released_at IS NULL AND release_reason IS NULL)
    OR (is_active = false)
  );

CREATE INDEX IF NOT EXISTS booking_assignments_release_cleanup_idx
  ON booking_assignments (window_end)
  WHERE is_active = true AND window_end IS NOT NULL;
