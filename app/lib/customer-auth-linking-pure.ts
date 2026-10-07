import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { customerPasswordSchema } from "@/app/lib/customer-credentials-pure";

export const GOOGLE_LINK_INTENT_TTL_SECONDS = 10 * 60;
export const CUSTOMER_AUTH_LINK_INTENT_CONSUMED_RETENTION_DAYS = 30;
export const GOOGLE_LINK_INTENT_COOKIE = "saskia_google_link_intent";

export function isCustomerAuthLinkIntentPrunable(input: {
  expiresAt: Date | string;
  consumedAt: Date | string | null;
  now: Date;
}): boolean {
  const expiresAt = new Date(input.expiresAt).getTime();
  const consumedAt = input.consumedAt === null
    ? null
    : new Date(input.consumedAt).getTime();
  const oldConsumedBefore = input.now.getTime() - CUSTOMER_AUTH_LINK_INTENT_CONSUMED_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return expiresAt <= input.now.getTime() ||
    (consumedAt !== null && consumedAt <= oldConsumedBefore);
}

export type AddPasswordResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "unverified" | "exists" };

export const addPasswordSchema = z.object({
  password: customerPasswordSchema,
  confirmPassword: z.string().min(1).max(128),
}).strict().refine((input) => input.password === input.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export function generateGoogleLinkNonce(): string {
  return randomBytes(32).toString("base64url");
}

export function hashGoogleLinkNonce(nonce: string): string {
  return createHash("sha256").update(nonce, "utf8").digest("hex");
}

/** Bind a one-time linking intent to the exact Auth.js JWT cookie set. */
export function hashAuthSessionCookies(
  cookies: readonly { name: string; value: string }[],
): string | null {
  const sessionCookies = cookies
    .filter(({ name }) => /^(?:__Secure-)?(?:authjs|next-auth)\.session-token(?:\.\d+)?$/.test(name))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!sessionCookies.length) return null;
  const canonical = sessionCookies.map(({ name, value }) => `${name}=${value}`).join(";");
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function authSessionCookiePairsFromHeader(header: string | null): Array<{ name: string; value: string }> {
  if (!header) return [];
  return header.split(";").map((part) => {
    const separator = part.indexOf("=");
    if (separator < 1) return null;
    return { name: part.slice(0, separator).trim(), value: part.slice(separator + 1).trim() };
  }).filter((pair): pair is { name: string; value: string } => Boolean(pair));
}

export function isGoogleLinkEmailConsistent(input: {
  verified: boolean;
  customerEmail: string;
  googleEmail: string;
}): boolean {
  return input.verified && input.customerEmail.trim().toLowerCase() === input.googleEmail.trim().toLowerCase();
}

export function canAddPassword(input: {
  authenticated: boolean;
  authMethod: unknown;
  emailVerified: boolean;
  alreadyHasPassword: boolean;
}): boolean {
  return input.authenticated && input.authMethod === "google" && input.emailVerified && !input.alreadyHasPassword;
}

export function canLinkGoogleIdentity(input: {
  intentValid: boolean;
  intentCustomerId: string | null;
  sessionCustomerId: string | null;
  provider: string;
  emailVerified: boolean;
  customerEmail: string;
  googleEmail: string;
  existingProviderCustomerId: string | null;
}): boolean {
  return input.intentValid &&
    Boolean(input.intentCustomerId) &&
    input.intentCustomerId === input.sessionCustomerId &&
    input.provider === "google" &&
    input.emailVerified &&
    input.customerEmail.trim().toLowerCase() === input.googleEmail.trim().toLowerCase() &&
    (!input.existingProviderCustomerId || input.existingProviderCustomerId === input.intentCustomerId);
}

export function isTrustedAccountActionOrigin(input: {
  origin: string | null;
  authUrl?: string;
  vercelUrl?: string;
  nodeEnv?: string;
}): boolean {
  if (!input.origin) return false;
  let origin: string;
  try {
    origin = new URL(input.origin).origin;
  } catch {
    return false;
  }
  const allowed = new Set(["https://saskiaservices.com"]);
  if (input.authUrl) {
    try { allowed.add(new URL(input.authUrl).origin); } catch { /* invalid configured URL is ignored */ }
  }
  if (input.vercelUrl) allowed.add(`https://${input.vercelUrl.replace(/^https?:\/\//, "")}`);
  if (input.nodeEnv !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }
  return allowed.has(origin);
}
