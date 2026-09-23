-- Phase 11.3: Customer cancel / reschedule change requests
-- ADDITIVE ONLY — does not alter existing booking rows.

CREATE TABLE IF NOT EXISTS booking_change_requests (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  requested_date DATE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_message TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT booking_change_requests_type_check
    CHECK (request_type IN ('cancel', 'reschedule')),
  CONSTRAINT booking_change_requests_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled_by_customer')),
  CONSTRAINT booking_change_requests_date_by_type_check
    CHECK (
      (request_type = 'cancel' AND requested_date IS NULL)
      OR (request_type = 'reschedule' AND requested_date IS NOT NULL)
    ),
  CONSTRAINT booking_change_requests_reason_length_check
    CHECK (reason IS NULL OR char_length(reason) <= 500),
  CONSTRAINT booking_change_requests_customer_message_length_check
    CHECK (customer_message IS NULL OR char_length(customer_message) <= 500)
);

-- One pending operational change request per booking
CREATE UNIQUE INDEX IF NOT EXISTS booking_change_requests_one_pending_per_booking_idx
  ON booking_change_requests (booking_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS booking_change_requests_booking_id_idx
  ON booking_change_requests (booking_id);

CREATE INDEX IF NOT EXISTS booking_change_requests_customer_id_idx
  ON booking_change_requests (customer_id);

CREATE INDEX IF NOT EXISTS booking_change_requests_status_idx
  ON booking_change_requests (status);

CREATE INDEX IF NOT EXISTS booking_change_requests_created_at_idx
  ON booking_change_requests (created_at DESC);
