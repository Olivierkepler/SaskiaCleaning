-- Phase 11.6: Appointment time + simple availability / blocks
-- ADDITIVE ONLY — existing bookings keep booking_time = NULL.

-- ── Booking appointment time ─────────────────────────────────────────────────
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS booking_time TIME;

ALTER TABLE booking_change_requests
  ADD COLUMN IF NOT EXISTS requested_time TIME;

-- One active booking may occupy a given date+time slot.
-- Null times (legacy) are excluded. Cancelled/completed do not consume capacity.
CREATE UNIQUE INDEX IF NOT EXISTS booking_requests_active_slot_uidx
  ON booking_requests (booking_date, booking_time)
  WHERE booking_time IS NOT NULL
    AND status IN ('new', 'contacted', 'scheduled', 'in_progress');

CREATE INDEX IF NOT EXISTS booking_requests_booking_date_time_idx
  ON booking_requests (booking_date, booking_time);

-- ── Weekly business availability ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheduling_availability (
  id SERIAL PRIMARY KEY,
  day_of_week SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_interval_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scheduling_availability_dow_check
    CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT scheduling_availability_interval_check
    CHECK (slot_interval_minutes IN (15, 30, 60)),
  CONSTRAINT scheduling_availability_range_check
    CHECK (start_time < end_time),
  CONSTRAINT scheduling_availability_dow_unique UNIQUE (day_of_week)
);

-- ── Date / partial-day blocks ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheduling_blocks (
  id SERIAL PRIMARY KEY,
  block_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scheduling_blocks_reason_length_check
    CHECK (reason IS NULL OR char_length(reason) <= 200),
  CONSTRAINT scheduling_blocks_range_check
    CHECK (
      (start_time IS NULL AND end_time IS NULL)
      OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

CREATE INDEX IF NOT EXISTS scheduling_blocks_block_date_idx
  ON scheduling_blocks (block_date);

-- Default hours (editable by admin): Mon–Fri 09:00–17:00, 60-minute slots.
-- Sat/Sun inactive. Chosen because no existing business-hours config was found;
-- service area is MA/RI (America/New_York).
INSERT INTO scheduling_availability (
  day_of_week, start_time, end_time, slot_interval_minutes, is_active
)
VALUES
  (0, '09:00', '17:00', 60, false), -- Sunday closed
  (1, '09:00', '17:00', 60, true),  -- Monday
  (2, '09:00', '17:00', 60, true),  -- Tuesday
  (3, '09:00', '17:00', 60, true),  -- Wednesday
  (4, '09:00', '17:00', 60, true),  -- Thursday
  (5, '09:00', '17:00', 60, true),  -- Friday
  (6, '09:00', '17:00', 60, false)  -- Saturday closed
ON CONFLICT (day_of_week) DO NOTHING;
