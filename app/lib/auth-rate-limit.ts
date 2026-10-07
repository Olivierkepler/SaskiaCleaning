import "server-only";

import { sql } from "@/app/lib/db";
import {
  AUTH_RATE_LIMIT_POLICIES,
  authRateLimitIdentifiers,
  hashAuthRateLimitIdentifier,
  type AuthRateLimitAction,
  type AuthRateLimitScope,
} from "@/app/lib/auth-rate-limit-pure";

export class AuthRateLimitUnavailableError extends Error {
  constructor() {
    super("Authentication rate limiting is unavailable.");
    this.name = "AuthRateLimitUnavailableError";
  }
}

export type AuthRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number | null;
};

function rateLimitSecret(): string {
  const secret = process.env.AUTH_RATE_LIMIT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new AuthRateLimitUnavailableError();
  }
  return secret;
}

async function consumeBucket(input: {
  action: AuthRateLimitAction;
  scope: AuthRateLimitScope;
  keyHash: string;
  windowSeconds: number;
  cooldownSeconds: number;
  limit: number;
}): Promise<AuthRateLimitResult> {
  try {
    const rows = await sql`
      INSERT INTO auth_rate_limits (
        action, scope, key_hash, window_started_at, attempt_count,
        blocked_until, expires_at, updated_at
      ) VALUES (
        ${input.action}, ${input.scope}, ${input.keyHash}, now(), 1, NULL,
        now() + make_interval(secs => ${input.windowSeconds + input.cooldownSeconds + 86_400}),
        now()
      )
      ON CONFLICT (action, scope, key_hash) DO UPDATE SET
        window_started_at = CASE
          WHEN (
            auth_rate_limits.blocked_until IS NOT NULL
            AND auth_rate_limits.blocked_until <= now()
          ) OR (
            auth_rate_limits.blocked_until IS NULL
            AND auth_rate_limits.window_started_at <= now() - make_interval(secs => ${input.windowSeconds})
          ) THEN now()
          ELSE auth_rate_limits.window_started_at
        END,
        attempt_count = CASE
          WHEN (
            auth_rate_limits.blocked_until IS NOT NULL
            AND auth_rate_limits.blocked_until <= now()
          ) OR (
            auth_rate_limits.blocked_until IS NULL
            AND auth_rate_limits.window_started_at <= now() - make_interval(secs => ${input.windowSeconds})
          ) THEN 1
          WHEN auth_rate_limits.blocked_until > now() THEN auth_rate_limits.attempt_count
          ELSE auth_rate_limits.attempt_count + 1
        END,
        blocked_until = CASE
          WHEN (
            auth_rate_limits.blocked_until IS NOT NULL
            AND auth_rate_limits.blocked_until <= now()
          ) OR (
            auth_rate_limits.blocked_until IS NULL
            AND auth_rate_limits.window_started_at <= now() - make_interval(secs => ${input.windowSeconds})
          ) THEN NULL
          WHEN auth_rate_limits.blocked_until > now() THEN auth_rate_limits.blocked_until
          WHEN auth_rate_limits.attempt_count + 1 > ${input.limit}
            THEN now() + make_interval(secs => ${input.cooldownSeconds})
          ELSE NULL
        END,
        expires_at = CASE
          WHEN auth_rate_limits.blocked_until > now()
            THEN GREATEST(auth_rate_limits.expires_at, auth_rate_limits.blocked_until + interval '1 day')
          ELSE now() + make_interval(secs => ${input.windowSeconds + input.cooldownSeconds + 86_400})
        END,
        updated_at = now()
      RETURNING attempt_count, blocked_until, now() AS checked_at
    `;

    const row = rows[0] as
      | { attempt_count: number; blocked_until: Date | string | null; checked_at: Date | string }
      | undefined;
    if (!row) throw new Error("No rate-limit bucket returned.");

    const blockedUntil = row.blocked_until ? new Date(row.blocked_until).getTime() : null;
    const checkedAt = new Date(row.checked_at).getTime();
    const allowed = row.attempt_count <= input.limit && (blockedUntil === null || blockedUntil <= checkedAt);
    return {
      allowed,
      retryAfterSeconds: allowed || blockedUntil === null
        ? null
        : Math.max(1, Math.ceil((blockedUntil - checkedAt) / 1000)),
    };
  } catch {
    throw new AuthRateLimitUnavailableError();
  }
}

export async function checkAuthRateLimit(input: {
  action: AuthRateLimitAction;
  email: unknown;
  clientIp: string | null;
  scopes?: AuthRateLimitScope[];
}): Promise<AuthRateLimitResult> {
  let secret: string;
  try {
    secret = rateLimitSecret();
  } catch {
    throw new AuthRateLimitUnavailableError();
  }

  const policy = AUTH_RATE_LIMIT_POLICIES[input.action];
  const identifiers = authRateLimitIdentifiers(input.email, input.clientIp)
    .filter(({ scope }) => !input.scopes || input.scopes.includes(scope));
  if (identifiers.length === 0) return { allowed: true, retryAfterSeconds: null };

  const results = await Promise.all(identifiers.map(({ scope, identifier }) =>
    consumeBucket({
      action: input.action,
      scope,
      keyHash: hashAuthRateLimitIdentifier(secret, input.action, scope, identifier),
      windowSeconds: policy.windowSeconds,
      cooldownSeconds: policy.cooldownSeconds,
      limit: scope === "network" ? policy.networkLimit : policy.emailIpLimit,
    }),
  ));

  const blocked = results.filter((result) => !result.allowed);
  return blocked.length
    ? {
        allowed: false,
        retryAfterSeconds: Math.max(...blocked.map((result) => result.retryAfterSeconds ?? 1)),
      }
    : { allowed: true, retryAfterSeconds: null };
}

export async function resetSuccessfulLoginBucket(input: {
  email: unknown;
  clientIp: string | null;
}): Promise<void> {
  const secret = rateLimitSecret();
  const key = authRateLimitIdentifiers(input.email, input.clientIp)
    .find(({ scope }) => scope === "email_ip");
  if (!key) return;

  try {
    await sql`
      DELETE FROM auth_rate_limits
      WHERE action = 'credentials_login'
        AND scope = 'email_ip'
        AND key_hash = ${hashAuthRateLimitIdentifier(secret, "credentials_login", key.scope, key.identifier)}
    `;
  } catch {
    throw new AuthRateLimitUnavailableError();
  }
}

export async function pruneExpiredAuthRateLimits(): Promise<number> {
  try {
    const rows = await sql`
      WITH expired AS (
        SELECT action, scope, key_hash
        FROM auth_rate_limits
        WHERE expires_at <= now()
        ORDER BY expires_at
        LIMIT 5000
        FOR UPDATE SKIP LOCKED
      ), deleted AS (
        DELETE FROM auth_rate_limits AS rate_limits
        USING expired
        WHERE rate_limits.action = expired.action
          AND rate_limits.scope = expired.scope
          AND rate_limits.key_hash = expired.key_hash
        RETURNING 1
      )
      SELECT count(*)::int AS deleted_count FROM deleted
    `;
    return Number((rows[0] as { deleted_count?: number } | undefined)?.deleted_count ?? 0);
  } catch {
    throw new AuthRateLimitUnavailableError();
  }
}
