import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";
import { customerPasswordSchema } from "@/app/lib/customer-credentials-pure";

export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const PASSWORD_RESET_CONSUMED_RETENTION_DAYS = 30;
export const GENERIC_PASSWORD_RESET_REQUEST_MESSAGE =
  "If an eligible account exists, password reset instructions have been sent.";
export const GENERIC_PASSWORD_RESET_INVALID_MESSAGE =
  "This password reset link is invalid or has expired.";

const emailSchema = z.string().trim().min(1).max(254).email();
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export const passwordResetRequestSchema = z.object({ email: emailSchema }).strict();
export const passwordResetSchema = z.object({
  token: tokenSchema,
  password: customerPasswordSchema,
  confirmPassword: z.string().min(1).max(128),
}).strict().refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export type PasswordResetRecipient = { id: string; email: string; name: string | null };

export type PasswordResetTokenRepository = {
  rotateActiveToken(input: { customerId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findEligibleActiveToken(input: { tokenHash: string; now: Date }): Promise<{ customerId: string } | null>;
  completeResetAtomically(input: {
    customerId: string;
    tokenHash: string;
    passwordHash: string;
    now: Date;
  }): Promise<boolean>;
};

export type PasswordHasher = { hash(password: string): Promise<string> };

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isPasswordResetToken(value: unknown): value is string {
  return typeof value === "string" && tokenSchema.safeParse(value).success;
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function buildPasswordResetUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/reset-password#token=${encodeURIComponent(token)}`;
}

export function buildPasswordResetEmail(input: {
  firstName: string | null;
  resetUrl: string;
}): { subject: string; text: string } {
  const firstName = input.firstName?.trim() || "there";
  return {
    subject: "Reset your Saskia Cleaning password",
    text: [
      "Saskia Cleaning",
      "",
      `Hi ${firstName},`,
      "",
      "Use the secure link below to reset your password:",
      input.resetUrl,
      "",
      "This link expires in 60 minutes.",
      "If you did not request this password reset, you can ignore this email.",
    ].join("\n"),
  };
}

export async function issuePasswordResetToken(
  customerId: string,
  repository: PasswordResetTokenRepository,
  now = new Date(),
): Promise<{ token: string; expiresAt: Date }> {
  const token = generatePasswordResetToken();
  const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MS);
  await repository.rotateActiveToken({
    customerId,
    tokenHash: hashPasswordResetToken(token),
    expiresAt,
  });
  return { token, expiresAt };
}

export async function requestPasswordResetIfEligible(
  email: string,
  lookupEligible: (normalizedEmail: string) => Promise<PasswordResetRecipient | null>,
  send: (customer: PasswordResetRecipient) => Promise<unknown>,
): Promise<{ message: string }> {
  try {
    const parsedEmail = emailSchema.safeParse(email);
    if (parsedEmail.success) {
      const customer = await lookupEligible(normalizeCustomerEmail(parsedEmail.data));
      if (customer) await send(customer);
    }
  } catch {
    // Unknown, provider-only, unverified, and delivery-failure cases stay identical.
  }
  return { message: GENERIC_PASSWORD_RESET_REQUEST_MESSAGE };
}

export async function resetPasswordWithToken(
  input: unknown,
  repository: PasswordResetTokenRepository,
  hasher: PasswordHasher,
  now = new Date(),
): Promise<boolean> {
  const parsed = passwordResetSchema.safeParse(input);
  if (!parsed.success) return false;

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const eligible = await repository.findEligibleActiveToken({ tokenHash, now });
  if (!eligible) return false;

  const passwordHash = await hasher.hash(parsed.data.password);
  return repository.completeResetAtomically({
    customerId: eligible.customerId,
    tokenHash,
    passwordHash,
    now,
  });
}
