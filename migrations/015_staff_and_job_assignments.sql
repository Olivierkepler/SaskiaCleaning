-- Phase 11.7: Staff members + primary booking assignments
-- ADDITIVE ONLY. Keeps Phase 11.6 one-booking-per-slot uniqueness.

-- ── Staff members (separate from customers) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cleaner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT staff_members_role_check
    CHECK (role IN ('cleaner', 'manager')),
  CONSTRAINT staff_members_name_length_check
    CHECK (char_length(btrim(name)) >= 1 AND char_length(name) <= 120),
  CONSTRAINT staff_members_phone_length_check
    CHECK (phone IS NULL OR char_length(phone) <= 40)
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_members_email_uidx
  ON staff_members (lower(btrim(email)));

CREATE INDEX IF NOT EXISTS staff_members_active_idx
  ON staff_members (is_active);

-- ── One primary assignment per booking ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id INTEGER NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_assignments_primary_check
    CHECK (is_primary = true)
);

CREATE UNIQUE INDEX IF NOT EXISTS booking_assignments_one_primary_per_booking_uidx
  ON booking_assignments (booking_id)
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS booking_assignments_staff_id_idx
  ON booking_assignments (staff_id);

CREATE INDEX IF NOT EXISTS booking_assignments_booking_id_idx
  ON booking_assignments (booking_id);

-- ── Per-staff weekly availability ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_availability (
  id SERIAL PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT staff_availability_dow_check
    CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT staff_availability_range_check
    CHECK (start_time < end_time),
  CONSTRAINT staff_availability_staff_dow_unique UNIQUE (staff_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS staff_availability_staff_id_idx
  ON staff_availability (staff_id);

-- ── Per-staff time off / blocks ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_time_off (
  id SERIAL PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  off_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT staff_time_off_reason_length_check
    CHECK (reason IS NULL OR char_length(reason) <= 200),
  CONSTRAINT staff_time_off_range_check
    CHECK (
      (start_time IS NULL AND end_time IS NULL)
      OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

CREATE INDEX IF NOT EXISTS staff_time_off_staff_date_idx
  ON staff_time_off (staff_id, off_date);
