import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  addPasswordSchema,
  authSessionCookiePairsFromHeader,
  canAddPassword,
  canLinkGoogleIdentity,
  CUSTOMER_AUTH_LINK_INTENT_CONSUMED_RETENTION_DAYS,
  generateGoogleLinkNonce,
  GOOGLE_LINK_INTENT_TTL_SECONDS,
  hashAuthSessionCookies,
  hashGoogleLinkNonce,
  isCustomerAuthLinkIntentPrunable,
  isTrustedAccountActionOrigin,
} from "../app/lib/customer-auth-linking-pure";

const validLink = {
  intentValid: true,
  intentCustomerId: "customer-a",
  sessionCustomerId: "customer-a",
  provider: "google",
  emailVerified: true,
  customerEmail: "one@example.com",
  googleEmail: "ONE@example.com",
  existingProviderCustomerId: null as string | null,
};

describe("explicit Google and password linking", () => {
  it("creates a 32-byte URL-safe one-time nonce and stores only a SHA-256 digest", () => {
    const nonce = generateGoogleLinkNonce();
    assert.equal(Buffer.from(nonce, "base64url").byteLength, 32);
    assert.match(nonce, /^[A-Za-z0-9_-]{43}$/);
    const digest = hashGoogleLinkNonce(nonce);
    assert.match(digest, /^[a-f0-9]{64}$/);
    assert.notEqual(digest, nonce);
    assert.equal(GOOGLE_LINK_INTENT_TTL_SECONDS, 600);
  });

  it("prunes expired intents and consumed intents older than 30 days only", () => {
    const now = new Date("2026-10-07T12:00:00.000Z");
    const recent = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const old = new Date(now.getTime() - (CUSTOMER_AUTH_LINK_INTENT_CONSUMED_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000);

    assert.equal(isCustomerAuthLinkIntentPrunable({
      expiresAt: new Date(now.getTime() - 1),
      consumedAt: null,
      now,
    }), true);
    assert.equal(isCustomerAuthLinkIntentPrunable({
      expiresAt: new Date(now.getTime() + 60_000),
      consumedAt: old,
      now,
    }), true);
    assert.equal(isCustomerAuthLinkIntentPrunable({
      expiresAt: new Date(now.getTime() + 60_000),
      consumedAt: null,
      now,
    }), false);
    assert.equal(isCustomerAuthLinkIntentPrunable({
      expiresAt: new Date(now.getTime() + 60_000),
      consumedAt: recent,
      now,
    }), false);
  });

  it("uses bounded, repeat-safe cleanup without touching active intents", async () => {
    const implementation = await readFile("app/lib/customer-auth-linking.ts", "utf8");
    const maintenance = await readFile("app/api/internal/release-expired-capacity/route.ts", "utf8");
    assert.match(implementation, /export async function pruneCustomerAuthLinkIntents/);
    assert.match(implementation, /expires_at <= now\(\)/);
    assert.match(implementation, /consumed_at <= now\(\) - make_interval\(days => \$\{CUSTOMER_AUTH_LINK_INTENT_CONSUMED_RETENTION_DAYS\}\)/);
    assert.match(implementation, /LIMIT 5000\s+FOR UPDATE SKIP LOCKED/);
    assert.match(implementation, /DELETE FROM customer_auth_link_intents/);
    assert.match(maintenance, /pruneCustomerAuthLinkIntents\(\)/);
    assert.match(maintenance, /customerAuthLinkIntentRowsPruned/);
  });

  it("binds the intent to Auth.js session cookies without storing the raw cookie", () => {
    const pairs = authSessionCookiePairsFromHeader("theme=light; __Secure-authjs.session-token.0=part-a; __Secure-authjs.session-token.1=part-b; x=y");
    assert.equal(pairs.length, 4);
    const binding = hashAuthSessionCookies(pairs);
    assert.match(binding ?? "", /^[a-f0-9]{64}$/);
    assert.equal(binding?.includes("part-a"), false);
    assert.equal(hashAuthSessionCookies([{ name: "theme", value: "light" }]), null);
    assert.equal(binding, hashAuthSessionCookies([...pairs].reverse()));
  });

  it("allows adding a password only from a verified Google session without existing credentials", () => {
    assert.equal(canAddPassword({ authenticated: true, authMethod: "google", emailVerified: true, alreadyHasPassword: false }), true);
    assert.equal(canAddPassword({ authenticated: false, authMethod: "google", emailVerified: true, alreadyHasPassword: false }), false);
    assert.equal(canAddPassword({ authenticated: true, authMethod: "credentials", emailVerified: true, alreadyHasPassword: false }), false);
    assert.equal(canAddPassword({ authenticated: true, authMethod: "google", emailVerified: false, alreadyHasPassword: false }), false);
    assert.equal(canAddPassword({ authenticated: true, authMethod: "google", emailVerified: true, alreadyHasPassword: true }), false);
  });

  it("validates password policy and rejects browser-supplied identity fields", () => {
    const password = "this is a valid long passphrase";
    assert.equal(addPasswordSchema.safeParse({ password, confirmPassword: password }).success, true);
    assert.equal(addPasswordSchema.safeParse({ password: "too short", confirmPassword: "too short" }).success, false);
    assert.equal(addPasswordSchema.safeParse({ password, confirmPassword: "other passphrase" }).success, false);
    assert.equal(addPasswordSchema.safeParse({ password, confirmPassword: password, customerId: "customer-b" }).success, false);
  });

  it("requires an authenticated one-time Google intent, verified matching email, and no other owner", () => {
    assert.equal(canLinkGoogleIdentity(validLink), true);
    assert.equal(canLinkGoogleIdentity({ ...validLink, existingProviderCustomerId: "customer-a" }), true);
    assert.equal(canLinkGoogleIdentity({ ...validLink, existingProviderCustomerId: "customer-b" }), false);
    assert.equal(canLinkGoogleIdentity({ ...validLink, intentValid: false }), false);
    assert.equal(canLinkGoogleIdentity({ ...validLink, sessionCustomerId: "customer-b" }), false);
    assert.equal(canLinkGoogleIdentity({ ...validLink, provider: "credentials" }), false);
    assert.equal(canLinkGoogleIdentity({ ...validLink, emailVerified: false }), false);
    assert.equal(canLinkGoogleIdentity({ ...validLink, googleEmail: "other@example.com" }), false);
  });

  it("requires trusted same-origin account actions and limits them in migration 029", async () => {
    assert.equal(isTrustedAccountActionOrigin({ origin: "https://saskiaservices.com", nodeEnv: "production" }), true);
    assert.equal(isTrustedAccountActionOrigin({ origin: "https://attacker.example", nodeEnv: "production" }), false);
    assert.equal(isTrustedAccountActionOrigin({ origin: null, nodeEnv: "development" }), false);
    const migration = await readFile("migrations/029_customer_auth_link_intents.sql", "utf8");
    assert.match(migration, /REFERENCES customers\(id\) ON DELETE CASCADE/);
    assert.match(migration, /provider TEXT NOT NULL CHECK \(provider = 'google'\)/);
    assert.match(migration, /nonce_hash CHAR\(64\) NOT NULL UNIQUE/);
    assert.match(migration, /session_binding_hash CHAR\(64\) NOT NULL/);
    assert.match(migration, /customer_auth_link_intents_one_active_idx/);
    assert.match(migration, /'password_method_add'/);
    assert.match(migration, /'google_link_intent'/);
    assert.doesNotMatch(migration, /DROP TABLE|DELETE FROM customer_oauth_accounts/i);
  });
});
