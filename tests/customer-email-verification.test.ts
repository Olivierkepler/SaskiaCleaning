import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  buildEmailVerificationContent,
  buildEmailVerificationUrl,
  dispatchEmailVerification,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  GENERIC_VERIFICATION_RESEND_MESSAGE,
  hashEmailVerificationToken,
  isEmailVerificationToken,
  issueEmailVerificationToken,
  redeemEmailVerificationToken,
  resendVerificationIfEligible,
  type EmailVerificationTokenRepository,
} from "../app/lib/customer-email-verification-pure";

function createRepository() {
  const tokens = new Map<string, { customerId: string; expiresAt: Date; consumedAt: Date | null }>();
  const verifiedCustomers = new Map<string, Date>();
  const repository: EmailVerificationTokenRepository = {
    async rotateActiveToken(input) {
      for (const token of tokens.values()) {
        if (token.customerId === input.customerId && token.consumedAt === null) {
          token.consumedAt = new Date(input.expiresAt.getTime() - EMAIL_VERIFICATION_TOKEN_TTL_MS);
        }
      }
      tokens.set(input.tokenHash, {
        customerId: input.customerId,
        expiresAt: input.expiresAt,
        consumedAt: null,
      });
    },
    async consumeToken({ tokenHash, now }) {
      const token = tokens.get(tokenHash);
      if (!token || token.consumedAt || token.expiresAt <= now) return false;
      token.consumedAt = now;
      verifiedCustomers.set(token.customerId, now);
      for (const active of tokens.values()) {
        if (active.customerId === token.customerId && active.consumedAt === null) {
          active.consumedAt = now;
        }
      }
      return true;
    },
  };
  return { repository, tokens, verifiedCustomers };
}

describe("customer email verification tokens", () => {
  it("generates a high-entropy URL-safe raw token and stores only its SHA-256 hash", async () => {
    const { repository, tokens } = createRepository();
    const issued = await issueEmailVerificationToken("customer-a", repository, new Date("2026-10-07T12:00:00.000Z"));
    const hash = hashEmailVerificationToken(issued.token);

    assert.equal(isEmailVerificationToken(issued.token), true);
    assert.equal(Buffer.from(issued.token, "base64url").byteLength, 32);
    assert.equal(tokens.size, 1);
    assert.equal(tokens.has(hash), true);
    assert.equal(tokens.has(issued.token), false);
    assert.equal(issued.expiresAt.toISOString(), "2026-10-08T12:00:00.000Z");
  });

  it("verifies the token's customer, sets verification, and consumes the token once", async () => {
    const { repository, tokens, verifiedCustomers } = createRepository();
    const now = new Date("2026-10-07T12:00:00.000Z");
    const issued = await issueEmailVerificationToken("customer-a", repository, now);

    assert.equal(await redeemEmailVerificationToken(issued.token, repository, now), true);
    assert.equal(verifiedCustomers.has("customer-a"), true);
    assert.equal(tokens.get(hashEmailVerificationToken(issued.token))?.consumedAt?.toISOString(), now.toISOString());
    assert.equal(await redeemEmailVerificationToken(issued.token, repository, now), false);
    assert.equal(verifiedCustomers.has("customer-b"), false);
  });

  it("rejects expired, malformed, and unknown tokens", async () => {
    const { repository } = createRepository();
    const now = new Date("2026-10-07T12:00:00.000Z");
    const issued = await issueEmailVerificationToken("customer-a", repository, now);

    assert.equal(await redeemEmailVerificationToken(issued.token, repository, issued.expiresAt), false);
    assert.equal(await redeemEmailVerificationToken("malformed", repository, now), false);
    assert.equal(await redeemEmailVerificationToken("A".repeat(43), repository, now), false);
  });

  it("invalidates the previous active token when issuing a replacement", async () => {
    const { repository, tokens } = createRepository();
    const now = new Date("2026-10-07T12:00:00.000Z");
    const first = await issueEmailVerificationToken("customer-a", repository, now);
    const second = await issueEmailVerificationToken("customer-a", repository, new Date(now.getTime() + 1000));

    assert.equal(await redeemEmailVerificationToken(first.token, repository, now), false);
    assert.equal(await redeemEmailVerificationToken(second.token, repository, now), true);
    assert.equal([...tokens.values()].filter((token) => token.customerId === "customer-a" && token.consumedAt === null).length, 0);
  });

  it("keeps verification email content branded and avoids including password or internal IDs", () => {
    const token = "A".repeat(43);
    const url = buildEmailVerificationUrl("https://saskiaservices.com/", token);
    const content = buildEmailVerificationContent({ firstName: "Ada", verificationUrl: url });

    assert.equal(url, `https://saskiaservices.com/verify-email#token=${token}`);
    assert.match(content.subject, /Saskia Cleaning/);
    assert.match(content.text, /Hi Ada/);
    assert.match(content.text, /24 hours/);
    assert.match(content.text, /If you did not create this account/);
    assert.equal(content.text.includes("customer-a"), false);
    assert.equal(content.text.includes("password"), false);
  });

  it("requests email delivery and handles provider failures without exposing provider details", async () => {
    const captured: Array<{ to: string; subject: string; text: string }> = [];
    const sent = await dispatchEmailVerification({
      to: "synthetic@example.invalid",
      firstName: "Synthetic",
      verificationUrl: "https://saskiaservices.com/verify-email#token=example-token",
    }, async (message) => { captured.push(message); return { status: "sent" }; });
    const failed = await dispatchEmailVerification({
      to: "synthetic@example.invalid",
      firstName: null,
      verificationUrl: "https://saskiaservices.com/verify-email#token=example-token",
    }, async () => { throw new Error("private provider detail"); });

    assert.equal(sent, true);
    assert.equal(captured[0]?.to, "synthetic@example.invalid");
    assert.match(captured[0]?.text ?? "", /verify your email address/i);
    assert.equal(failed, false);
  });

  it("returns the same resend response for eligible, unknown, verified, provider-only, and send-failure cases", async () => {
    let sent = 0;
    const eligible = await resendVerificationIfEligible(
      "ada@example.com",
      async () => ({ id: "customer-a", email: "ada@example.com", name: "Ada" }),
      async () => { sent += 1; return true; },
    );
    const unknown = await resendVerificationIfEligible("unknown@example.com", async () => null, async () => { sent += 1; });
    const verified = await resendVerificationIfEligible("verified@example.com", async () => null, async () => { sent += 1; });
    const googleOnly = await resendVerificationIfEligible("google@example.com", async () => null, async () => { sent += 1; });
    const deliveryFailure = await resendVerificationIfEligible(
      "ada@example.com",
      async () => ({ id: "customer-a", email: "ada@example.com", name: "Ada" }),
      async () => { throw new Error("provider error"); },
    );

    assert.equal(sent, 1);
    assert.deepEqual(eligible, { message: GENERIC_VERIFICATION_RESEND_MESSAGE });
    assert.deepEqual(unknown, eligible);
    assert.deepEqual(verified, eligible);
    assert.deepEqual(googleOnly, eligible);
    assert.deepEqual(deliveryFailure, eligible);
  });

  it("uses cascading customer ownership and one-active-token database constraints", async () => {
    const migration = await readFile("migrations/026_customer_email_verification.sql", "utf8");
    assert.match(migration, /REFERENCES customers\(id\) ON DELETE CASCADE/);
    assert.match(migration, /token_hash CHAR\(64\) NOT NULL UNIQUE/);
    assert.match(migration, /customer_email_verification_tokens_one_active_idx/);
    assert.match(migration, /WHERE consumed_at IS NULL/);
  });
});
