-- Phase 12.1: Persist versioned inputs needed to reproduce estimator pricing.
-- Nullable for legacy rows; no historical selections are inferred or backfilled.
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS pricing_inputs JSONB;
