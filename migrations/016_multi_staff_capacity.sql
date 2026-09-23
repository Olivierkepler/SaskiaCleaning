-- Phase 11.8: Multi-cleaner capacity via atomic primary staff claim
-- ADDITIVE FIRST. Drops booking_requests_active_slot_uidx ONLY when every
-- future capacity-consuming timed booking already has an active primary
-- assignment (so capacity cannot leak through unassigned rows).

-- ── Denormalized slot + soft-release on assignments ──────────────────────────
ALTER TABLE booking_assignments
  ADD COLUMN IF NOT EXISTS slot_date DATE,
  ADD COLUMN IF NOT EXISTS slot_time TIME,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Backfill slot fields from the linked booking for existing assignments.
UPDATE booking_assignments a
SET
  slot_date = b.booking_date,
  slot_time = b.booking_time,
  is_active = CASE
    WHEN b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
      AND b.booking_time IS NOT NULL
      THEN true
    ELSE false
  END,
  updated_at = now()
FROM booking_requests b
WHERE b.id = a.booking_id
  AND (a.slot_date IS DISTINCT FROM b.booking_date
    OR a.slot_time IS DISTINCT FROM b.booking_time
    OR a.is_active IS DISTINCT FROM (
      b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
      AND b.booking_time IS NOT NULL
    ));

-- One active primary assignment per booking (retain existing + is_active).
DROP INDEX IF EXISTS booking_assignments_one_primary_per_booking_uidx;
CREATE UNIQUE INDEX IF NOT EXISTS booking_assignments_one_active_primary_uidx
  ON booking_assignments (booking_id)
  WHERE is_primary = true AND is_active = true;

-- Exact staff/date/time conflict prevention (DB-enforced capacity unit).
CREATE UNIQUE INDEX IF NOT EXISTS booking_assignments_staff_active_slot_uidx
  ON booking_assignments (staff_id, slot_date, slot_time)
  WHERE is_active = true
    AND is_primary = true
    AND slot_date IS NOT NULL
    AND slot_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS booking_assignments_active_slot_idx
  ON booking_assignments (slot_date, slot_time)
  WHERE is_active = true AND slot_time IS NOT NULL;

-- Retire global one-booking-per-slot bottleneck only when safe.
DO $$
DECLARE
  unassigned_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO unassigned_count
  FROM booking_requests b
  WHERE b.booking_time IS NOT NULL
    AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
    AND b.booking_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York')
    AND NOT EXISTS (
      SELECT 1
      FROM booking_assignments a
      WHERE a.booking_id = b.id
        AND a.is_primary = true
        AND a.is_active = true
    );

  IF unassigned_count > 0 THEN
    RAISE EXCEPTION
      'Phase 11.8 blocked: % future active timed booking(s) lack an active primary assignment. Backfill/assign them before dropping booking_requests_active_slot_uidx.',
      unassigned_count;
  END IF;

  DROP INDEX IF EXISTS booking_requests_active_slot_uidx;
  RAISE NOTICE 'Dropped booking_requests_active_slot_uidx — staff-slot uniqueness is now the capacity guard.';
END $$;
