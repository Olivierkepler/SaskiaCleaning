-- Phase 11.13: Admin-only booking follow-up history
-- ADDITIVE. Customer-facing booking_requests.notes is NOT reused
-- (that field is visible on My Bookings / staff jobs).

CREATE TABLE IF NOT EXISTS booking_followups (
  id BIGSERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL
    REFERENCES booking_requests(id) ON DELETE CASCADE,
  followup_type TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  outcome TEXT NOT NULL,
  note TEXT NOT NULL,
  next_followup_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_by_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_followups_type_check
    CHECK (followup_type IN (
      'customer_contact',
      'staff_contact',
      'internal_note',
      'operations_review'
    )),
  CONSTRAINT booking_followups_method_check
    CHECK (contact_method IN (
      'phone',
      'email',
      'sms',
      'internal',
      'other'
    )),
  CONSTRAINT booking_followups_outcome_check
    CHECK (outcome IN (
      'reached',
      'voicemail',
      'no_answer',
      'confirmed',
      'needs_followup',
      'resolved',
      'other'
    )),
  CONSTRAINT booking_followups_note_check
    CHECK (char_length(note) >= 1 AND char_length(note) <= 2000)
);

CREATE INDEX IF NOT EXISTS booking_followups_booking_id_idx
  ON booking_followups (booking_id);

CREATE INDEX IF NOT EXISTS booking_followups_next_due_idx
  ON booking_followups (next_followup_at)
  WHERE resolved_at IS NULL AND next_followup_at IS NOT NULL;
