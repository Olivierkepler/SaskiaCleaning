import { sql } from "./db";
import { sendEmail } from "./email";
import {
  hasSentReferralNotification,
  recordReferralNotification,
  type ReferralNotificationResult,
  type ReferralNotificationStatus,
} from "./referral-notifications";
import {
  serializeReferralTracking,
  type ReferralTracking,
  type ReferralTrackingRow,
} from "./referrals";

export type AdminReferralReminderType =
  | "admin_reward_eligible"
  | "admin_rewards_summary";

export type AdminReferralReminderResult = ReferralNotificationResult & {
  type: AdminReferralReminderType;
  logged?: boolean;
};

const ELIGIBLE_SUBJECT = "Saskia Cleaning: Referral reward eligible";
const SUMMARY_SUBJECT = "Saskia Cleaning: Outstanding referral rewards summary";

const TOP_UNPAID_LIMIT = 5;

function getAdminNotificationEmail(): string | null {
  return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || null;
}

function buildReferralsDashboardUrl(): string {
  const key = process.env.DASHBOARD_KEY?.trim();
  const keyQuery = key ? `?key=${encodeURIComponent(key)}` : "";

  const explicitBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicitBase) {
    return `${explicitBase.replace(/\/$/, "")}/dashboard/referrals${keyQuery}`;
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost}/dashboard/referrals${keyQuery}`;
  }

  return `http://localhost:3000/dashboard/referrals${keyQuery}`;
}

async function loadReferralTrackingById(
  referralId: number,
): Promise<ReferralTracking | null> {
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

async function loadUnpaidReferrals(): Promise<ReferralTracking[]> {
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
    WHERE r.status = 'completed'
    ORDER BY r.reward_amount DESC, r.updated_at DESC, r.id DESC
  `;

  return (rows as ReferralTrackingRow[]).map(serializeReferralTracking);
}

export function buildRewardEligibleAdminEmail(
  referral: ReferralTracking,
): { subject: string; text: string } {
  const dashboardUrl = buildReferralsDashboardUrl();
  const text = [
    "A referral reward is now eligible for payout review.",
    "",
    `Referrer: ${referral.referrerName ?? "—"}`,
    `Referral code: ${referral.code}`,
    `Customer: ${referral.referredName}`,
    `Reward amount: $${referral.rewardAmount}`,
    `Referral status: ${referral.status}`,
    "",
    `Review in the referral dashboard: ${dashboardUrl}`,
  ].join("\n");

  return { subject: ELIGIBLE_SUBJECT, text };
}

export function buildOutstandingRewardsSummaryEmail(input: {
  unpaidReferrals: ReferralTracking[];
}): { subject: string; text: string } {
  const dashboardUrl = buildReferralsDashboardUrl();
  const count = input.unpaidReferrals.length;
  const totalLiability = input.unpaidReferrals.reduce(
    (sum, referral) => sum + referral.rewardAmount,
    0,
  );
  const topUnpaid = input.unpaidReferrals.slice(0, TOP_UNPAID_LIMIT);

  const topLines =
    topUnpaid.length === 0
      ? ["None"]
      : topUnpaid.map(
          (referral, index) =>
            `${index + 1}. ${referral.referrerName ?? "—"} / ${referral.code} / ${referral.referredName} — $${referral.rewardAmount}`,
        );

  const text = [
    "Outstanding referral rewards summary",
    "",
    `Unpaid rewards: ${count}`,
    `Total liability: $${totalLiability}`,
    "",
    "Top unpaid rewards:",
    ...topLines,
    "",
    `Open the referral dashboard: ${dashboardUrl}`,
  ].join("\n");

  return { subject: SUMMARY_SUBJECT, text };
}

async function deliverAdminReminder(input: {
  referralId: number;
  type: AdminReferralReminderType;
  subject: string;
  text: string;
  skipDuplicateCheck?: boolean;
}): Promise<AdminReferralReminderResult> {
  const adminEmail = getAdminNotificationEmail();

  if (!adminEmail) {
    await recordReferralNotification({
      referralId: input.referralId,
      type: input.type,
      recipientEmail: "",
      subject: input.subject,
      status: "skipped",
      errorMessage: "ADMIN_NOTIFICATION_EMAIL not configured",
    });

    return {
      type: input.type,
      status: "skipped",
      recipientEmail: null,
      subject: input.subject,
      providerMessageId: null,
      errorMessage: "ADMIN_NOTIFICATION_EMAIL not configured",
      skippedReason: "missing_admin_email",
    };
  }

  if (
    !input.skipDuplicateCheck &&
    (await hasSentReferralNotification(input.referralId, input.type))
  ) {
    return {
      type: input.type,
      status: "skipped",
      recipientEmail: adminEmail,
      subject: input.subject,
      providerMessageId: null,
      errorMessage: null,
      skippedReason: "duplicate_sent",
    };
  }

  const sendResult = await sendEmail({
    to: adminEmail,
    subject: input.subject,
    text: input.text,
  });

  if (sendResult.status === "sent") {
    await recordReferralNotification({
      referralId: input.referralId,
      type: input.type,
      recipientEmail: adminEmail,
      subject: input.subject,
      status: "sent",
      providerMessageId: sendResult.messageId,
    });

    return {
      type: input.type,
      status: "sent",
      recipientEmail: adminEmail,
      subject: input.subject,
      providerMessageId: sendResult.messageId,
      errorMessage: null,
      logged: true,
    };
  }

  const status: ReferralNotificationStatus =
    sendResult.status === "skipped" ? "skipped" : "failed";

  await recordReferralNotification({
    referralId: input.referralId,
    type: input.type,
    recipientEmail: adminEmail,
    subject: input.subject,
    status,
    errorMessage:
      sendResult.status === "skipped" ? sendResult.reason : sendResult.error,
  });

  return {
    type: input.type,
    status,
    recipientEmail: adminEmail,
    subject: input.subject,
    providerMessageId: null,
    errorMessage:
      sendResult.status === "skipped" ? sendResult.reason : sendResult.error,
    skippedReason:
      sendResult.status === "skipped" ? "email_provider_skipped" : undefined,
  };
}

export async function sendRewardEligibleAdminNotification(
  referralId: number,
): Promise<AdminReferralReminderResult> {
  const referral = await loadReferralTrackingById(referralId);
  if (!referral) {
    return {
      type: "admin_reward_eligible",
      status: "failed",
      recipientEmail: null,
      subject: ELIGIBLE_SUBJECT,
      providerMessageId: null,
      errorMessage: "Referral not found.",
    };
  }

  if (referral.status !== "completed") {
    return {
      type: "admin_reward_eligible",
      status: "skipped",
      recipientEmail: getAdminNotificationEmail(),
      subject: ELIGIBLE_SUBJECT,
      providerMessageId: null,
      errorMessage: "Referral is not in completed status.",
      skippedReason: "not_payable",
    };
  }

  const email = buildRewardEligibleAdminEmail(referral);

  return deliverAdminReminder({
    referralId,
    type: "admin_reward_eligible",
    subject: email.subject,
    text: email.text,
  });
}

export async function sendOutstandingRewardsSummary(): Promise<AdminReferralReminderResult> {
  const unpaidReferrals = await loadUnpaidReferrals();
  const email = buildOutstandingRewardsSummaryEmail({ unpaidReferrals });

  if (unpaidReferrals.length === 0) {
    const adminEmail = getAdminNotificationEmail();

    if (!adminEmail) {
      return {
        type: "admin_rewards_summary",
        status: "skipped",
        recipientEmail: null,
        subject: email.subject,
        providerMessageId: null,
        errorMessage: "ADMIN_NOTIFICATION_EMAIL not configured",
        skippedReason: "missing_admin_email",
        logged: false,
      };
    }

    const sendResult = await sendEmail({
      to: adminEmail,
      subject: email.subject,
      text: email.text,
    });

    if (sendResult.status === "sent") {
      return {
        type: "admin_rewards_summary",
        status: "sent",
        recipientEmail: adminEmail,
        subject: email.subject,
        providerMessageId: sendResult.messageId,
        errorMessage: null,
        logged: false,
        skippedReason: "not_logged_no_unpaid",
      };
    }

    if (sendResult.status === "skipped") {
      return {
        type: "admin_rewards_summary",
        status: "skipped",
        recipientEmail: adminEmail,
        subject: email.subject,
        providerMessageId: null,
        errorMessage: sendResult.reason,
        skippedReason: "email_provider_skipped",
        logged: false,
      };
    }

    return {
      type: "admin_rewards_summary",
      status: "failed",
      recipientEmail: adminEmail,
      subject: email.subject,
      providerMessageId: null,
      errorMessage: sendResult.error,
      logged: false,
    };
  }

  return deliverAdminReminder({
    referralId: unpaidReferrals[0].id,
    type: "admin_rewards_summary",
    subject: email.subject,
    text: email.text,
    skipDuplicateCheck: true,
  });
}
