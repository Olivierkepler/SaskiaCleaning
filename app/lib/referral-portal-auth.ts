import { createHash, randomBytes } from "crypto";
import { sql } from "./db";
import { sendEmail } from "./email";
import { PUBLIC_REFERRAL_SITE_ORIGIN } from "./referrals";

const PORTAL_TOKEN_TTL_MS = 30 * 60 * 1000;

export type ReferralPortalTokenRow = {
  id: number;
  email: string;
  code: string | null;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export type VerifiedReferralPortalToken = {
  id: number;
  email: string;
  code: string | null;
};

export function generatePortalToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPortalToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function buildPortalBaseUrl(): string {
  const explicitBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicitBase) {
    return explicitBase.replace(/\/$/, "");
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  return PUBLIC_REFERRAL_SITE_ORIGIN;
}

export function buildReferralPortalMagicLink(token: string): string {
  return `${buildPortalBaseUrl()}/referrals?token=${encodeURIComponent(token)}`;
}

export async function createReferralPortalToken(
  email: string,
  code?: string | null,
): Promise<{ token: string; id: number }> {
  const token = generatePortalToken();
  const tokenHash = hashPortalToken(token);
  const expiresAt = new Date(Date.now() + PORTAL_TOKEN_TTL_MS).toISOString();

  const rows = await sql`
    INSERT INTO referral_portal_tokens (email, code, token_hash, expires_at)
    VALUES (${email}, ${code ?? null}, ${tokenHash}, ${expiresAt})
    RETURNING id
  `;

  const row = rows[0] as { id: number } | undefined;
  if (!row) {
    throw new Error("Failed to create referral portal token.");
  }

  return { token, id: row.id };
}

export async function verifyReferralPortalToken(
  token: string,
): Promise<VerifiedReferralPortalToken | null> {
  const tokenHash = hashPortalToken(token);
  const rows = await sql`
    SELECT id, email, code
    FROM referral_portal_tokens
    WHERE token_hash = ${tokenHash}
      AND expires_at > now()
      AND used_at IS NULL
    LIMIT 1
  `;

  const row = rows[0] as VerifiedReferralPortalToken | undefined;
  return row ?? null;
}

export async function markReferralPortalTokenUsed(tokenId: number): Promise<void> {
  await sql`
    UPDATE referral_portal_tokens
    SET used_at = now()
    WHERE id = ${tokenId}
      AND used_at IS NULL
  `;
}

export async function sendReferralPortalMagicLink(
  email: string,
  link: string,
): Promise<void> {
  const sendResult = await sendEmail({
    to: email,
    subject: "Your Saskia Cleaning referral rewards link",
    text: `Use this secure link to view your referral rewards. This link expires in 30 minutes: ${link}`,
  });

  if (sendResult.status === "failed") {
    throw new Error(sendResult.error);
  }

  if (sendResult.status === "skipped") {
    throw new Error(sendResult.reason);
  }
}
