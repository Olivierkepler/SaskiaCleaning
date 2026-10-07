import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  buildPasswordResetEmail,
  buildPasswordResetUrl,
  GENERIC_PASSWORD_RESET_REQUEST_MESSAGE,
  hashPasswordResetToken,
  isPasswordResetToken,
  issuePasswordResetToken,
  PASSWORD_RESET_TOKEN_TTL_MS,
  passwordResetRequestSchema,
  passwordResetSchema,
  requestPasswordResetIfEligible,
  resetPasswordWithToken,
  type PasswordResetRecipient,
  type PasswordResetTokenRepository,
} from "../app/lib/customer-password-reset-pure";

type TokenRecord = {
  customerId: string;
  expiresAt: Date;
  consumedAt: Date | null;
};

function createRepository() {
  const tokens = new Map<string, TokenRecord>();
  const passwords = new Map<string, { hash: string; authVersion: number }>([
    ["customer-a", { hash: "old-argon-hash", authVersion: 1 }],
    ["customer-b", { hash: "other-customer-hash", authVersion: 1 }],
  ]);
  const repository: PasswordResetTokenRepository = {
    async rotateActiveToken({ customerId, tokenHash, expiresAt }) {
      for (const token of tokens.values()) {
        if (token.customerId === customerId && token.consumedAt === null) token.consumedAt = new Date();
      }
      tokens.set(tokenHash, { customerId, expiresAt, consumedAt: null });
    },
    async findEligibleActiveToken({ tokenHash, now }) {
      const token = tokens.get(tokenHash);
      if (!token || token.consumedAt || token.expiresAt <= now || !passwords.has(token.customerId)) return null;
      return { customerId: token.customerId };
    },
    async completeResetAtomically({ customerId, tokenHash, passwordHash, now }) {
      const token = tokens.get(tokenHash);
      const password = passwords.get(customerId);
      if (!token || token.customerId !== customerId || token.consumedAt || token.expiresAt <= now || !password) return false;
      token.consumedAt = now;
      passwords.set(customerId, { hash: passwordHash, authVersion: password.authVersion + 1 });
      for (const other of tokens.values()) {
        if (other.customerId === customerId && other.consumedAt === null) other.consumedAt = now;
      }
      return true;
    },
  };
  return { repository, tokens, passwords };
}

describe("password reset tokens", () => {
  it("generates 32 random bytes in URL-safe form and stores only the SHA-256 hash", async () => {
    const { repository, tokens } = createRepository();
    const now = new Date("2026-10-07T12:00:00.000Z");
    const issued = await issuePasswordResetToken("customer-a", repository, now);
    const hash = hashPasswordResetToken(issued.token);

    assert.equal(Buffer.from(issued.token, "base64url").byteLength, 32);
    assert.equal(isPasswordResetToken(issued.token), true);
    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.equal(tokens.has(hash), true);
    assert.equal(tokens.has(issued.token), false);
    assert.equal(issued.expiresAt.getTime() - now.getTime(), PASSWORD_RESET_TOKEN_TTL_MS);
  });

  it("rejects malformed, unknown, expired, consumed, and replaced tokens", async () => {
    const { repository } = createRepository();
    const now = new Date("2026-10-07T12:00:00.000Z");
    const first = await issuePasswordResetToken("customer-a", repository, now);
    const second = await issuePasswordResetToken("customer-a", repository, new Date(now.getTime() + 1));
    const hashPassword = { hash: async (password: string) => `argon2id:${password}` };
    const payload = (token: string) => ({ token, password: "a long and valid passphrase", confirmPassword: "a long and valid passphrase" });

    assert.equal(await resetPasswordWithToken(payload(first.token), repository, hashPassword, now), false);
    assert.equal(await resetPasswordWithToken(payload("bad"), repository, hashPassword, now), false);
    assert.equal(await resetPasswordWithToken(payload("A".repeat(43)), repository, hashPassword, now), false);
    assert.equal(await resetPasswordWithToken(payload(second.token), repository, hashPassword, second.expiresAt), false);
    assert.equal(await resetPasswordWithToken(payload(second.token), repository, hashPassword, now), true);
    assert.equal(await resetPasswordWithToken(payload(second.token), repository, hashPassword, now), false);
  });

  it("accepts passphrases and enforces the shared 15–128 character password policy without trimming", () => {
    const good = "correct horse battery staple";
    assert.equal(passwordResetSchema.safeParse({ token: "A".repeat(43), password: good, confirmPassword: good }).success, true);
    assert.equal(passwordResetSchema.safeParse({ token: "A".repeat(43), password: "short", confirmPassword: "short" }).success, false);
    assert.equal(passwordResetSchema.safeParse({ token: "A".repeat(43), password: "x".repeat(129), confirmPassword: "x".repeat(129) }).success, false);
    assert.equal(passwordResetSchema.safeParse({ token: "A".repeat(43), password: good, confirmPassword: "different passphrase" }).success, false);
    assert.equal(passwordResetSchema.safeParse({ token: "A".repeat(43), password: ` ${good} `, confirmPassword: ` ${good} ` }).success, true);
    assert.equal(passwordResetSchema.safeParse({ token: "A".repeat(43), password: good, confirmPassword: good, customerId: "customer-b" }).success, false);
  });

  it("replaces the old hash, increments authVersion once, and never stores plaintext", async () => {
    const { repository, tokens, passwords } = createRepository();
    const issued = await issuePasswordResetToken("customer-a", repository);
    const password = "a newly chosen long passphrase";
    const result = await resetPasswordWithToken({
      token: issued.token,
      password,
      confirmPassword: password,
    }, repository, { hash: async (value) => `$argon2id$test$${value.length}` });

    assert.equal(result, true);
    assert.deepEqual(passwords.get("customer-a"), { hash: `$argon2id$test$${password.length}`, authVersion: 2 });
    assert.equal([...passwords.values()].some((record) => record.hash === password), false);
    assert.equal([...tokens.values()].filter((record) => record.customerId === "customer-a" && record.consumedAt === null).length, 0);
  });

  it("derives the target customer from the token and cannot reset an unrelated customer's credential", async () => {
    const { repository, passwords } = createRepository();
    const issued = await issuePasswordResetToken("customer-a", repository);
    const password = "a different long passphrase";
    assert.equal(await resetPasswordWithToken({ token: issued.token, password, confirmPassword: password }, repository, {
      hash: async (value) => `argon2id:${value}`,
    }), true);
    assert.equal(passwords.get("customer-b")?.authVersion, 1);
    assert.equal(passwords.get("customer-b")?.hash, "other-customer-hash");
  });

  it("returns the same request message for eligible and ineligible account states", async () => {
    const recipient: PasswordResetRecipient = { id: "customer-a", email: "ada@example.com", name: "Ada Lovelace" };
    const cases = [
      async () => requestPasswordResetIfEligible(" ADA@example.com ", async () => recipient, async () => undefined),
      async () => requestPasswordResetIfEligible("unknown@example.com", async () => null, async () => undefined),
      async () => requestPasswordResetIfEligible("google@example.com", async () => null, async () => undefined),
      async () => requestPasswordResetIfEligible("unverified@example.com", async () => null, async () => undefined),
      async () => requestPasswordResetIfEligible("ada@example.com", async () => recipient, async () => { throw new Error("provider detail"); }),
    ];
    const responses = await Promise.all(cases.map((run) => run()));
    assert.deepEqual(responses, responses.map(() => ({ message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE })));
  });

  it("builds a canonical-fragment URL and branded email without internal identifiers or hashes", () => {
    const token = "A".repeat(43);
    const url = buildPasswordResetUrl("https://saskiaservices.com/", token);
    const email = buildPasswordResetEmail({ firstName: "Ada", resetUrl: url });
    assert.equal(url, `https://saskiaservices.com/reset-password#token=${token}`);
    assert.match(email.text, /Saskia Cleaning/);
    assert.match(email.text, /60 minutes/);
    assert.match(email.text, /If you did not request this password reset/);
    assert.doesNotMatch(email.text, /customer-a|password_hash/i);
  });

  it("validates strict request fields and migration ownership/cascade/index design", async () => {
    assert.equal(passwordResetRequestSchema.safeParse({ email: "ada@example.com" }).success, true);
    assert.equal(passwordResetRequestSchema.safeParse({ email: "ada@example.com", customerId: "customer-b" }).success, false);
    const migration = await readFile("migrations/028_customer_password_reset.sql", "utf8");
    assert.match(migration, /REFERENCES customers\(id\) ON DELETE CASCADE/);
    assert.match(migration, /token_hash CHAR\(64\) NOT NULL UNIQUE/);
    assert.match(migration, /customer_password_reset_tokens_customer_idx/);
    assert.match(migration, /customer_password_reset_tokens_expires_idx/);
    assert.match(migration, /customer_password_reset_tokens_one_active_idx/);
    assert.match(migration, /password_reset_request/);
    assert.doesNotMatch(migration, /password_hash|email TEXT|token TEXT/i);
  });
});
