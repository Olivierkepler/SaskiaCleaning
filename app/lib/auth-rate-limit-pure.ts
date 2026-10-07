import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";

export type AuthRateLimitAction = "registration" | "credentials_login" | "verification_resend";
export type AuthRateLimitScope = "email_ip" | "network";

export const AUTH_RATE_LIMIT_POLICIES = Object.freeze({
  registration: Object.freeze({
    windowSeconds: 60 * 60,
    cooldownSeconds: 60 * 60,
    emailIpLimit: 5,
    networkLimit: 30,
  }),
  credentials_login: Object.freeze({
    windowSeconds: 15 * 60,
    cooldownSeconds: 15 * 60,
    emailIpLimit: 5,
    networkLimit: 30,
  }),
  verification_resend: Object.freeze({
    windowSeconds: 60 * 60,
    cooldownSeconds: 60 * 60,
    emailIpLimit: 3,
    networkLimit: 10,
  }),
});

export type AuthRateLimitState = {
  windowStartedAt: number;
  attemptCount: number;
  blockedUntil: number | null;
};

export function applyFixedWindowAttempt(
  current: AuthRateLimitState | null,
  now: number,
  options: { windowMs: number; cooldownMs: number; limit: number },
): { state: AuthRateLimitState; allowed: boolean } {
  const expired = current !== null &&
    ((current.blockedUntil !== null && current.blockedUntil <= now) ||
      (current.blockedUntil === null && current.windowStartedAt + options.windowMs <= now));

  if (!current || expired) {
    return {
      state: { windowStartedAt: now, attemptCount: 1, blockedUntil: null },
      allowed: true,
    };
  }

  if (current.blockedUntil !== null && current.blockedUntil > now) {
    return { state: current, allowed: false };
  }

  const attemptCount = current.attemptCount + 1;
  if (attemptCount > options.limit) {
    return {
      state: { ...current, attemptCount, blockedUntil: now + options.cooldownMs },
      allowed: false,
    };
  }

  return { state: { ...current, attemptCount }, allowed: true };
}

/** Only Vercel's platform-overwritten X-Forwarded-For is trusted. */
export function trustedClientIp(
  headers: Pick<Headers, "get">,
  isVercelRuntime: boolean,
): string | null {
  if (!isVercelRuntime) return null;
  const candidate = headers.get("x-forwarded-for")?.trim();
  return candidate && isIP(candidate) ? candidate : null;
}

function normalizedRateLimitEmail(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 254) return null;
  const email = normalizeCustomerEmail(value);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function authRateLimitIdentifiers(
  emailInput: unknown,
  clientIp: string | null,
): Array<{ scope: AuthRateLimitScope; identifier: string }> {
  const email = normalizedRateLimitEmail(emailInput);
  const keys: Array<{ scope: AuthRateLimitScope; identifier: string }> = [];

  if (clientIp) {
    keys.push({ scope: "network", identifier: `ip:${clientIp}` });
  }
  if (email) {
    keys.push({
      scope: "email_ip",
      identifier: `email:${email}\u0000ip:${clientIp ?? "unavailable"}`,
    });
  }
  return keys;
}

export function hashAuthRateLimitIdentifier(
  secret: string,
  action: AuthRateLimitAction,
  scope: AuthRateLimitScope,
  identifier: string,
): string {
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("AUTH_RATE_LIMIT_SECRET must be at least 32 bytes.");
  }
  return createHmac("sha256", secret)
    .update(`saskia-auth-rate-limit:v1:${action}:${scope}\u0000${identifier}`)
    .digest("hex");
}
