import { createHash, randomBytes } from "node:crypto";

export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const EMAIL_VERIFICATION_CONSUMED_RETENTION_DAYS = 30;

export type EmailVerificationTokenRepository = {
  rotateActiveToken(input: {
    customerId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  consumeToken(input: { tokenHash: string; now: Date }): Promise<boolean>;
};

export const GENERIC_VERIFICATION_RESEND_MESSAGE =
  "If an eligible account exists, a verification email has been sent.";

export type EmailVerificationRecipient = {
  id: string;
  email: string;
  name: string | null;
};

export function buildEmailVerificationUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/verify-email#token=${encodeURIComponent(token)}`;
}

export function buildEmailVerificationContent(input: {
  firstName: string | null;
  verificationUrl: string;
}): { subject: string; text: string } {
  const firstName = input.firstName?.trim() || "there";
  return {
    subject: "Verify your Saskia Cleaning email",
    text: [
      "Saskia Cleaning",
      "",
      `Hi ${firstName},`,
      "",
      "Please verify your email address to finish setting up your Saskia Cleaning account:",
      input.verificationUrl,
      "",
      "This link expires in 24 hours.",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
  };
}

export async function dispatchEmailVerification(input: {
  to: string;
  firstName: string | null;
  verificationUrl: string;
}, send: (message: { to: string; subject: string; text: string }) => Promise<{
  status: "sent" | "skipped" | "failed";
}>): Promise<boolean> {
  try {
    const result = await send({ to: input.to, ...buildEmailVerificationContent(input) });
    return result.status === "sent";
  } catch {
    return false;
  }
}

export async function resendVerificationIfEligible(
  email: string,
  lookupEligible: (email: string) => Promise<EmailVerificationRecipient | null>,
  send: (customer: EmailVerificationRecipient) => Promise<unknown>,
): Promise<{ message: string }> {
  try {
    const customer = await lookupEligible(email);
    if (customer) await send(customer);
  } catch {
    // Preserve the same response for unknown, verified, provider-only, and delivery-failure cases.
  }
  return { message: GENERIC_VERIFICATION_RESEND_MESSAGE };
}

export function generateEmailVerificationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isEmailVerificationToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function hashEmailVerificationToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function issueEmailVerificationToken(
  customerId: string,
  repository: EmailVerificationTokenRepository,
  now = new Date(),
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateEmailVerificationToken();
  const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TOKEN_TTL_MS);
  await repository.rotateActiveToken({
    customerId,
    tokenHash: hashEmailVerificationToken(token),
    expiresAt,
  });
  return { token, expiresAt };
}

export async function redeemEmailVerificationToken(
  token: unknown,
  repository: EmailVerificationTokenRepository,
  now = new Date(),
): Promise<boolean> {
  if (!isEmailVerificationToken(token)) return false;
  return repository.consumeToken({ tokenHash: hashEmailVerificationToken(token), now });
}
