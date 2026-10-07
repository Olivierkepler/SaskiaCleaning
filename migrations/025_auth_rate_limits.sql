-- Distributed registration and Credentials throttling buckets.
-- Identifier values are HMAC-SHA-256 digests; no raw email or IP is stored.
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  action TEXT NOT NULL,
  scope TEXT NOT NULL,
  key_hash CHAR(64) NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  blocked_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT auth_rate_limits_pkey PRIMARY KEY (action, scope, key_hash),
  CONSTRAINT auth_rate_limits_action_check
    CHECK (action IN ('registration', 'credentials_login')),
  CONSTRAINT auth_rate_limits_scope_check
    CHECK (scope IN ('email_ip', 'network')),
  CONSTRAINT auth_rate_limits_attempt_count_check
    CHECK (attempt_count >= 1)
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_expires_at_idx
  ON auth_rate_limits (expires_at);

COMMENT ON TABLE auth_rate_limits IS
  'Short-lived distributed authentication throttle buckets; key_hash contains HMAC digests only.';
