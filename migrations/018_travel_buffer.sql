-- Phase 11.10: Global post-job handoff buffer + capacity windows
-- ADDITIVE. window_start/window_end become CAPACITY windows
-- (service duration + post-job buffer). Customer displays continue
-- using booking_time + duration_minutes for service end.

-- ── Singleton scheduling settings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheduling_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  job_buffer_minutes INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scheduling_settings_singleton_check CHECK (id = 1),
  CONSTRAINT scheduling_settings_buffer_check
    CHECK (job_buffer_minutes >= 0 AND job_buffer_minutes <= 180)
);

-- Architecture seed only (admin-editable). NOT a claimed historic business SLA.
INSERT INTO scheduling_settings (id, job_buffer_minutes)
VALUES (1, 30)
ON CONFLICT (id) DO NOTHING;

-- ── Buffer snapshot on bookings ──────────────────────────────────────────────
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER;

ALTER TABLE booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_buffer_minutes_check;

ALTER TABLE booking_requests
  ADD CONSTRAINT booking_requests_buffer_minutes_check
  CHECK (
    buffer_minutes IS NULL
    OR (buffer_minutes >= 0 AND buffer_minutes <= 180)
  );

-- Extend FUTURE active capacity windows by buffer (service window → capacity).
-- NULL buffer_minutes uses current scheduling_settings.job_buffer_minutes.
-- Historical inactive assignments are left unchanged.
UPDATE booking_assignments a
SET
  window_end = a.window_start + make_interval(
    mins =>
      COALESCE(NULLIF(b.duration_minutes, 0), 120)
      + COALESCE(
          b.buffer_minutes,
          (SELECT s.job_buffer_minutes FROM scheduling_settings s WHERE s.id = 1),
          30
        )
  ),
  updated_at = now()
FROM booking_requests b
WHERE b.id = a.booking_id
  AND a.is_active = true
  AND a.window_start IS NOT NULL
  AND a.window_end IS NOT NULL
  AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
  AND (
    b.booking_date IS NULL
    OR b.booking_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York')
  )
  -- Only widen when current end equals (or is shorter than) service-only end
  AND a.window_end <= a.window_start + make_interval(
    mins => COALESCE(NULLIF(b.duration_minutes, 0), 120)
  );

-- Snapshot buffer onto future active bookings still missing it (for reschedule safety).
UPDATE booking_requests b
SET buffer_minutes = COALESCE(
  (SELECT s.job_buffer_minutes FROM scheduling_settings s WHERE s.id = 1),
  30
)
WHERE b.buffer_minutes IS NULL
  AND b.booking_time IS NOT NULL
  AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
  AND b.booking_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York');
