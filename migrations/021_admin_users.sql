-- Phase 11.13.2: Database-backed Google admin accounts
-- ADDITIVE ONLY. Does not modify customers or staff_members.

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMPTZ,
  CONSTRAINT admin_users_role_check
    CHECK (role IN ('OWNER', 'ADMIN')),
  CONSTRAINT admin_users_email_length_check
    CHECK (char_length(btrim(email)) >= 3 AND char_length(email) <= 254),
  CONSTRAINT admin_users_name_length_check
    CHECK (
      name IS NULL
      OR (char_length(btrim(name)) >= 1 AND char_length(name) <= 120)
    )
);

-- Store emails normalized; uniqueness on lower(trim(email)).
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_uidx
  ON admin_users (lower(btrim(email)));

CREATE INDEX IF NOT EXISTS admin_users_active_idx
  ON admin_users (is_active);

CREATE INDEX IF NOT EXISTS admin_users_role_active_idx
  ON admin_users (role, is_active);

-- Bootstrap initial owner (idempotent).
INSERT INTO admin_users (email, name, role, is_active)
SELECT
  'olivierkfrancois1@gmail.com',
  'Olivier Francois',
  'OWNER',
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM admin_users
  WHERE lower(btrim(email)) = 'olivierkfrancois1@gmail.com'
);
