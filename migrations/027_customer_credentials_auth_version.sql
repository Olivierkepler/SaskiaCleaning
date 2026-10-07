-- Session provenance for password customers. Existing credentials receive version 1.
-- Google-only customers have no customer_credentials row and are unaffected.

ALTER TABLE customer_credentials
  ADD COLUMN IF NOT EXISTS auth_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE customer_credentials
  ADD CONSTRAINT customer_credentials_auth_version_check
  CHECK (auth_version >= 1);
