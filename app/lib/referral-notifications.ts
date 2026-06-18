import { sql } from "./db";
import { sendEmail } from "./email";
import { serializeReferralTracking, type ReferralTrackingRow } from "./referrals";

export type ReferralNotificationType =
  | "referral_completed"
  | "referral_rewarded";

export type ReferralNotificationStatus =
  | "pending"
  | "sent"
  | "failed"
  | "skipped";

export type ReferralNotificationResult = {
  type: ReferralNotificationType;
  status: ReferralNotificationStatus;
  recipientEmail: string | null;
  subject: string;
  providerMessageId: string | null;
  errorMessage: string | null;
  skippedReason?: string;
};

export type ReferralNotificationRow = {
  id: number;
  referral_id: number;
  type: ReferralNotificationType;
  recipient_email: string;
  subject: string;
  status: ReferralNotificationStatus;
  provider_message_id: string | null;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
  code: string;
  referred_name: string;
  referred_email: string;
  referrer_name: string | null;
  referrer_email: string | null;
};

export type ReferralNotification = {
  id: number;
  referralId: number;
  type: ReferralNotificationType;
  recipientEmail: string;
  subject: string;
  status: ReferralNotificationStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
  code: string;
  referredName: string;
  referredEmail: string;
  referrerName: string | null;
  referrerEmail: string | null;
};

export function serializeReferralNotification(
  row: ReferralNotificationRow,
): ReferralNotification {
  return {
    id: row.id,
    referralId: row.referral_id,
    type: row.type,
    recipientEmail: row.recipient_email,
    subject: row.subject,
    status: row.status,
    providerMessageId: row.provider_message_id,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    sentAt: row.sent_at,
    code: row.code,
    referredName: row.referred_name,
    referredEmail: row.referred_email,
    referrerName: row.referrer_name,
    referrerEmail: row.referrer_email,
  };
}

export function formatReferralNotificationType(
  type: ReferralNotificationType,
): string {
  switch (type) {
    case "referral_completed":
      return "Referral completed";
    case "referral_rewarded":
      return "Referral rewarded";
  }
}

type ReferralEmailContext = ReturnType<typeof serializeReferralTracking>;

async function loadReferralNotificationContext(
  referralId: number,
): Promise<ReferralEmailContext | null> {
  const rows = await sql`
    SELECT
      r.id,
      r.code,
      r.status,
      r.reward_amount,
      r.friend_discount_amount,
      r.payout_amount,
      r.payout_method,
      r.payout_notes,
      r.rewarded_at,
      r.referred_name,
      r.referred_email,
      r.booking_request_id,
      br.created_at AS booking_created_at,
      br.service AS booking_service,
      br.estimate_mid AS booking_estimate_mid,
      rc.referrer_name,
      rc.referrer_email,
      r.created_at,
      r.updated_at
    FROM referrals r
    LEFT JOIN booking_requests br ON br.id = r.booking_request_id
    LEFT JOIN referral_codes rc ON rc.id = r.referral_code_id
    WHERE r.id = ${referralId}
    LIMIT 1
  `;

  const row = rows[0] as ReferralTrackingRow | undefined;
  if (!row) return null;

  return serializeReferralTracking(row);
}

async function hasSentNotification(
  referralId: number,
  type: ReferralNotificationType,
): Promise<boolean> {
  const rows = await sql`
    SELECT id
    FROM referral_notifications
    WHERE referral_id = ${referralId}
      AND type = ${type}
      AND status = 'sent'
    LIMIT 1
  `;

  return rows.length > 0;
}

async function logReferralNotification(input: {
  referralId: number;
  type: ReferralNotificationType;
  recipientEmail: string;
  subject: string;
  status: ReferralNotificationStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  const sentAt = input.status === "sent" ? new Date().toISOString() : null;

  await sql`
    INSERT INTO referral_notifications (
      referral_id,
      type,
      recipient_email,
      subject,
      status,
      provider_message_id,
      error_message,
      sent_at
    )
    VALUES (
      ${input.referralId},
      ${input.type},
      ${input.recipientEmail},
      ${input.subject},
      ${input.status},
      ${input.providerMessageId ?? null},
      ${input.errorMessage ?? null},
      ${sentAt}
    )
  `;
}

export function buildReferralCompletedEmail(
  referral: ReferralEmailContext,
): { subject: string; text: string } {
  const subject = "Your Saskia Cleaning referral reward is now eligible";
  const text = `Good news! Your referral has completed their cleaning service. Your referral reward is now eligible for review. Reward amount: $${referral.rewardAmount}. Saskia Cleaning will review and process your reward soon.`;

  return { subject, text };
}

export function buildReferralRewardedEmail(
  referral: ReferralEmailContext,
): { subject: string; text: string } {
  const amount = referral.payoutAmount ?? referral.rewardAmount;
  const method = referral.payoutMethod?.trim() || "Not specified";
  const subject = "Your Saskia Cleaning referral reward has been marked as paid";
  const text = `Your referral reward has been marked as paid. Amount: $${amount}. Method: ${method}. Thank you for referring Saskia Cleaning.`;

  return { subject, text };
}

export async function sendReferralNotification(
  referralId: number,
  type: ReferralNotificationType,
): Promise<ReferralNotificationResult> {
  const referral = await loadReferralNotificationContext(referralId);
  if (!referral) {
    return {
      type,
      status: "failed",
      recipientEmail: null,
      subject: "",
      providerMessageId: null,
      errorMessage: "Referral not found.",
    };
  }

  const emailContent =
    type === "referral_completed"
      ? buildReferralCompletedEmail(referral)
      : buildReferralRewardedEmail(referral);

  const recipientEmail = referral.referrerEmail?.trim() || null;

  if (!recipientEmail) {
    await logReferralNotification({
      referralId,
      type,
      recipientEmail: "",
      subject: emailContent.subject,
      status: "skipped",
      errorMessage: "No referrer email on file.",
    });

    return {
      type,
      status: "skipped",
      recipientEmail: null,
      subject: emailContent.subject,
      providerMessageId: null,
      errorMessage: "No referrer email on file.",
      skippedReason: "missing_referrer_email",
    };
  }

  if (await hasSentNotification(referralId, type)) {
    return {
      type,
      status: "skipped",
      recipientEmail,
      subject: emailContent.subject,
      providerMessageId: null,
      errorMessage: null,
      skippedReason: "duplicate_sent",
    };
  }

  const sendResult = await sendEmail({
    to: recipientEmail,
    subject: emailContent.subject,
    text: emailContent.text,
  });

  if (sendResult.status === "sent") {
    await logReferralNotification({
      referralId,
      type,
      recipientEmail,
      subject: emailContent.subject,
      status: "sent",
      providerMessageId: sendResult.messageId,
    });

    return {
      type,
      status: "sent",
      recipientEmail,
      subject: emailContent.subject,
      providerMessageId: sendResult.messageId,
      errorMessage: null,
    };
  }

  if (sendResult.status === "skipped") {
    await logReferralNotification({
      referralId,
      type,
      recipientEmail,
      subject: emailContent.subject,
      status: "skipped",
      errorMessage: sendResult.reason,
    });

    return {
      type,
      status: "skipped",
      recipientEmail,
      subject: emailContent.subject,
      providerMessageId: null,
      errorMessage: sendResult.reason,
      skippedReason: "email_provider_skipped",
    };
  }

  await logReferralNotification({
    referralId,
    type,
    recipientEmail,
    subject: emailContent.subject,
    status: "failed",
    errorMessage: sendResult.error,
  });

  return {
    type,
    status: "failed",
    recipientEmail,
    subject: emailContent.subject,
    providerMessageId: null,
    errorMessage: sendResult.error,
  };
}
