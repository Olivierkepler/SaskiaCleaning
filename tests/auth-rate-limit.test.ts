import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyFixedWindowAttempt,
  authRateLimitIdentifiers,
  AUTH_RATE_LIMIT_POLICIES,
  hashAuthRateLimitIdentifier,
  trustedClientIp,
  type AuthRateLimitState,
} from "../app/lib/auth-rate-limit-pure";

describe("authentication rate-limit key privacy", () => {
  it("normalizes email before deriving the same email/network key", () => {
    assert.deepEqual(
      authRateLimitIdentifiers(" ADA@Example.COM ", "203.0.113.7"),
      authRateLimitIdentifiers("ada@example.com", "203.0.113.7"),
    );
  });

  it("isolates email/network pairs while retaining a shared network bucket", () => {
    const first = authRateLimitIdentifiers("ada@example.com", "203.0.113.7");
    const second = authRateLimitIdentifiers("grace@example.com", "203.0.113.7");
    assert.notEqual(first.find((key) => key.scope === "email_ip")?.identifier,
      second.find((key) => key.scope === "email_ip")?.identifier);
    assert.equal(first.find((key) => key.scope === "network")?.identifier,
      second.find((key) => key.scope === "network")?.identifier);
  });

  it("stores no raw email or IP in its HMAC digest", () => {
    const identifier = authRateLimitIdentifiers("ada@example.com", "203.0.113.7")
      .find((key) => key.scope === "email_ip")!.identifier;
    const digest = hashAuthRateLimitIdentifier(
      "a dedicated test key with 32 bytes minimum",
      "credentials_login",
      "email_ip",
      identifier,
    );
    assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(digest.includes("ada"), false);
    assert.equal(digest.includes("203.0.113.7"), false);
    assert.notEqual(digest, identifier);
  });

  it("rejects short HMAC secrets", () => {
    assert.throws(() => hashAuthRateLimitIdentifier("short", "registration", "network", "ip"));
  });

  it("trusts the platform forwarded IP only when Vercel runtime is explicit", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.9",
      "x-real-ip": "198.51.100.4",
      "x-client-ip": "192.0.2.3",
    });
    assert.equal(trustedClientIp(headers, true), "203.0.113.9");
    assert.equal(trustedClientIp(headers, false), null);
    assert.equal(trustedClientIp(new Headers({ "x-forwarded-for": "attacker, 203.0.113.9" }), true), null);
  });

  it("uses the documented registration and login windows and limits", () => {
    assert.deepEqual(AUTH_RATE_LIMIT_POLICIES.registration, {
      windowSeconds: 3600,
      cooldownSeconds: 3600,
      emailIpLimit: 5,
      networkLimit: 30,
    });
    assert.deepEqual(AUTH_RATE_LIMIT_POLICIES.credentials_login, {
      windowSeconds: 900,
      cooldownSeconds: 900,
      emailIpLimit: 5,
      networkLimit: 30,
    });
    assert.deepEqual(AUTH_RATE_LIMIT_POLICIES.verification_resend, {
      windowSeconds: 3600,
      cooldownSeconds: 3600,
      emailIpLimit: 3,
      networkLimit: 10,
    });
  });
});

describe("atomic fixed-window throttle behavior", () => {
  const options = { windowMs: 60_000, cooldownMs: 30_000, limit: 5 };

  it("allows the configured attempts and blocks the next one", () => {
    let state: AuthRateLimitState | null = null;
    for (let index = 0; index < 5; index += 1) {
      const result = applyFixedWindowAttempt(state, 1_000 + index, options);
      assert.equal(result.allowed, true);
      state = result.state;
    }
    const blocked = applyFixedWindowAttempt(state, 2_000, options);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.state.attemptCount, 6);
  });

  it("keeps a cooldown fixed and resets after its expiry without permanent lockout", () => {
    let state: AuthRateLimitState | null = null;
    for (let index = 0; index < 6; index += 1) {
      state = applyFixedWindowAttempt(state, 1_000 + index, options).state;
    }
    const cooldown = state!.blockedUntil!;
    const repeated = applyFixedWindowAttempt(state, 10_000, options);
    assert.equal(repeated.allowed, false);
    assert.equal(repeated.state.blockedUntil, cooldown);
    const afterExpiry = applyFixedWindowAttempt(state, cooldown, options);
    assert.equal(afterExpiry.allowed, true);
    assert.equal(afterExpiry.state.attemptCount, 1);
    assert.equal(afterExpiry.state.blockedUntil, null);
  });

  it("resets an unblocked counter when its window expires", () => {
    const first = applyFixedWindowAttempt(null, 1_000, options);
    const next = applyFixedWindowAttempt(first.state, 61_000, options);
    assert.equal(next.allowed, true);
    assert.equal(next.state.attemptCount, 1);
  });

  it("does not lose concurrent increments in an atomic store", async () => {
    const bucket: { state: AuthRateLimitState | null } = { state: null };
    const attempts = await Promise.all(Array.from({ length: 40 }, async (_, index) => {
      // The callback models one indivisible DB upsert: each invocation reads
      // and replaces the bucket synchronously before yielding its result.
      const result = applyFixedWindowAttempt(bucket.state, 10_000 + index, options);
      bucket.state = result.state;
      return result.allowed;
    }));
    assert.equal(attempts.filter(Boolean).length, 5);
    assert.equal(attempts.filter((allowed) => !allowed).length, 35);
    assert.equal(bucket.state?.attemptCount, 6);
  });
});
