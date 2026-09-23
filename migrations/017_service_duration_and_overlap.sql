-- Phase 11.9: Service duration snapshots + overlap-aware staff reservations
-- ADDITIVE. Keeps Phase 11.8 exact staff-slot unique index.
-- EXCLUDE constraint requires btree_gist (Neon-supported).

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ── Duration snapshot on bookings ────────────────────────────────────────────
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

ALTER TABLE booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_duration_minutes_check;

ALTER TABLE booking_requests
  ADD CONSTRAINT booking_requests_duration_minutes_check
  CHECK (
    duration_minutes IS NULL
    OR (duration_minutes > 0 AND duration_minutes <= 720)
  );

-- ── Configurable duration rules (admin-editable) ─────────────────────────────
CREATE TABLE IF NOT EXISTS service_duration_rules (
  id SERIAL PRIMARY KEY,
  service_key TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT service_duration_rules_key_length_check
    CHECK (char_length(btrim(service_key)) >= 1 AND char_length(service_key) <= 80),
  CONSTRAINT service_duration_rules_duration_check
    CHECK (duration_minutes > 0 AND duration_minutes <= 720)
);

CREATE UNIQUE INDEX IF NOT EXISTS service_duration_rules_service_key_uidx
  ON service_duration_rules (lower(btrim(service_key)));

-- INITIAL SEEDS — admin-editable architecture defaults, NOT claimed business SLAs.
-- Reported in Phase 11.9 final report. Edit via /dashboard/service-durations.
INSERT INTO service_duration_rules (service_key, duration_minutes)
SELECT v.service_key, v.duration_minutes
FROM (
  VALUES
    ('Standard', 120),
    ('Deep clean', 180),
    ('Move-out', 240),
    ('Commercial', 180)
) AS v(service_key, duration_minutes)
WHERE NOT EXISTS (
  SELECT 1 FROM service_duration_rules r
  WHERE lower(btrim(r.service_key)) = lower(btrim(v.service_key))
);

-- ── Overlap windows on assignments ───────────────────────────────────────────
ALTER TABLE booking_assignments
  ADD COLUMN IF NOT EXISTS window_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS window_end TIMESTAMPTZ;

-- Backfill windows for active assignments from slot + booking duration
-- (legacy null duration → 120 minute fallback for FUTURE capacity safety only).
UPDATE booking_assignments a
SET
  window_start = (
    (a.slot_date::text || ' ' || a.slot_time::text)::timestamp
    AT TIME ZONE 'America/New_York'
  ),
  window_end = (
    (a.slot_date::text || ' ' || a.slot_time::text)::timestamp
    AT TIME ZONE 'America/New_York'
  ) + make_interval(
    mins => COALESCE(
      NULLIF(b.duration_minutes, 0),
      120
    )
  ),
  updated_at = now()
FROM booking_requests b
WHERE b.id = a.booking_id
  AND a.is_active = true
  AND a.slot_date IS NOT NULL
  AND a.slot_time IS NOT NULL
  AND (a.window_start IS NULL OR a.window_end IS NULL);

-- Half-open [start, end) exclusion: same staff cannot hold overlapping active windows.
ALTER TABLE booking_assignments
  DROP CONSTRAINT IF EXISTS booking_assignments_staff_window_excl;

ALTER TABLE booking_assignments
  ADD CONSTRAINT booking_assignments_staff_window_excl
  EXCLUDE USING gist (
    staff_id WITH =,
    tstzrange(window_start, window_end, '[)') WITH &&
  )
  WHERE (
    is_active = true
    AND window_start IS NOT NULL
    AND window_end IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS booking_assignments_window_start_idx
  ON booking_assignments (window_start)
  WHERE is_active = true AND window_start IS NOT NULL;
