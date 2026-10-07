-- Phase 1A: password credentials and append-only registration consent records.
-- Additive only. Existing Google-only customers have no credentials row.

CREATE TABLE IF NOT EXISTS customer_credentials (
  customer_id UUID PRIMARY KEY
    REFERENCES customers(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_legal_acceptances (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL
    REFERENCES customers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT customer_legal_acceptances_document_type_check
    CHECK (document_type IN ('terms', 'privacy'))
);

CREATE INDEX IF NOT EXISTS customer_legal_acceptances_customer_accepted_idx
  ON customer_legal_acceptances (customer_id, accepted_at DESC);

CREATE OR REPLACE FUNCTION prevent_customer_legal_acceptance_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Permit FK-driven deletion when a customer is removed while blocking
  -- direct mutation of the append-only acceptance history.
  IF pg_trigger_depth() > 1 THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Customer legal acceptance records are append-only';
END;
$$;

CREATE TRIGGER customer_legal_acceptances_append_only
  BEFORE UPDATE OR DELETE ON customer_legal_acceptances
  FOR EACH ROW
  EXECUTE FUNCTION prevent_customer_legal_acceptance_mutation();
