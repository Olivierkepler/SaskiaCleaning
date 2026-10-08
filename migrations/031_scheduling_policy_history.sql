-- Forward-looking policy and appointment-validation evidence.
-- This baseline is not evidence that any historical booking was validated.
-- Match app/lib/scheduling-transaction-pure.ts so the baseline cannot race a writer.
BEGIN;

SELECT pg_advisory_xact_lock(
  hashtextextended('saskia-cleaning:scheduling-mutations:v1', 0)
);

CREATE TABLE scheduling_policy_state (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  revision BIGINT NOT NULL CHECK (revision > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scheduling_policy_revisions (
  revision BIGINT PRIMARY KEY CHECK (revision > 0),
  change_type TEXT NOT NULL CHECK (change_type IN (
    'baseline',
    'weekly_availability',
    'scheduling_block_created',
    'scheduling_block_deleted',
    'default_buffer',
    'service_duration_rule'
  )),
  details JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details) = 'object'),
  changed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO scheduling_policy_state (id, revision)
VALUES (1, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO scheduling_policy_revisions (revision, change_type, details)
VALUES (
  1,
  'baseline',
  jsonb_build_object(
    'source', 'migration_031',
    'historical_booking_validation', false,
    'configuration', jsonb_build_object(
      'weekly_availability', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'day_of_week', day_of_week,
          'start_time', start_time,
          'end_time', end_time,
          'slot_interval_minutes', slot_interval_minutes,
          'is_active', is_active
        ) ORDER BY day_of_week)
        FROM scheduling_availability
      ), '[]'::jsonb),
      'scheduling_blocks', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', id,
          'block_date', block_date,
          'start_time', start_time,
          'end_time', end_time
        ) ORDER BY block_date, start_time NULLS FIRST, id)
        FROM scheduling_blocks
      ), '[]'::jsonb),
      'default_buffer_minutes', COALESCE((
        SELECT job_buffer_minutes FROM scheduling_settings WHERE id = 1
      ), 30),
      'service_duration_rules', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'service_key', service_key,
          'duration_minutes', duration_minutes
        ) ORDER BY service_key)
        FROM service_duration_rules
      ), '[]'::jsonb)
    )
  )
)
ON CONFLICT (revision) DO NOTHING;

CREATE TABLE booking_schedule_validations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Preserve validation evidence if the operational booking is later deleted.
  -- The integer type matches booking_requests.id; no customer fields are retained here.
  booking_id INTEGER NOT NULL,
  policy_revision BIGINT NOT NULL REFERENCES scheduling_policy_revisions(revision),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 720),
  buffer_minutes INTEGER NOT NULL CHECK (buffer_minutes BETWEEN 0 AND 180),
  validation_source TEXT NOT NULL CHECK (validation_source IN (
    'customer_booking', 'customer_reschedule', 'admin_appointment_move'
  )),
  change_request_id INTEGER REFERENCES booking_change_requests(id) ON DELETE SET NULL,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX booking_schedule_validations_booking_latest_idx
  ON booking_schedule_validations (booking_id, id DESC);

CREATE INDEX booking_schedule_validations_policy_revision_idx
  ON booking_schedule_validations (policy_revision);

COMMENT ON COLUMN booking_schedule_validations.booking_id IS
  'Retained integer identifier without a booking FK so validation evidence survives operational booking deletion.';

COMMIT;
