import { sql } from "./db";
import { sendEmail } from "./email";
import {
  recordReferralNotification,
  type ReferralNotificationResult,
  type ReferralNotificationType,
} from "./referral-notifications";
import { PUBLIC_REFERRAL_SITE_ORIGIN } from "./referrals";

export type ReferralMilestoneNotificationType =
  | "referral_milestone_first"
  | "referral_milestone_champion"
  | "referral_milestone_vip";

export type ReferralMilestoneDefinition = {
  key: "first_referral" | "referral_champion" | "vip_referrer";
  label: string;
  requiredCompletedReferrals: number;
  notificationType: ReferralMilestoneNotificationType;
};

type ReferralMilestoneContext = {
  referralId: number;
  code: string;
  referrerName: string | null;
  referrerEmail: string;
  completedCleanings: number;
};

const MILESTONE_DEFINITIONS: ReferralMilestoneDefinition[] = [
  {
    key: "first_referral",
    label: "First Referral",
    requiredCompletedReferrals: 1,
    notificationType: "referral_milestone_first",
  },
  {
    key: "referral_champion",
    label: "Referral Champion",
    requiredCompletedReferrals: 5,
    notificationType: "referral_milestone_champion",
  },
  {
    key: "vip_referrer",
    label: "Saskia VIP Referrer",
    requiredCompletedReferrals: 10,
    notificationType: "referral_milestone_vip",
  },
];

export function getMilestoneDefinitions(): ReferralMilestoneDefinition[] {
  return MILESTONE_DEFINITIONS.map((definition) => ({ ...definition }));
}

function normalizeReferrerEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildReferralPortalPageUrl(): string {
  const explicitBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicitBase) {
    return `${explicitBase.replace(/\/$/, "")}/referrals`;
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost}/referrals`;
  }

  return `${PUBLIC_REFERRAL_SITE_ORIGIN}/referrals`;
}

export async function getCompletedCleaningCountForReferrer(
  email: string,
): Promise<number> {
  const normalizedEmail = normalizeReferrerEmail(email);
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM referrals r
    INNER JOIN referral_codes rc ON rc.id = r.referral_code_id
    WHERE lower(trim(rc.referrer_email)) = ${normalizedEmail}
      AND r.status IN ('completed', 'rewarded')
  `;

  return Number(rows[0]?.count ?? 0);
}

export function getReachedMilestonesForCount(
  count: number,
): ReferralMilestoneDefinition[] {
  return getMilestoneDefinitions().filter(
    (definition) => count >= definition.requiredCompletedReferrals,
  );
}

async function hasSentMilestoneNotification(
  recipientEmail: string,
  type: ReferralMilestoneNotificationType,
): Promise<boolean> {
  const normalizedEmail = normalizeReferrerEmail(recipientEmail);
  const rows = await sql`
    SELECT id
    FROM referral_notifications
    WHERE lower(trim(recipient_email)) = ${normalizedEmail}
      AND type = ${type}
      AND status = 'sent'
    LIMIT 1
  `;

  return rows.length > 0;
}

async function loadReferralMilestoneContext(
  referralId: number,
): Promise<ReferralMilestoneContext | null> {
  const rows = await sql`
    SELECT
      r.id,
      r.code,
      rc.referrer_name,
      rc.referrer_email
    FROM referrals r
    LEFT JOIN referral_codes rc ON rc.id = r.referral_code_id
    WHERE r.id = ${referralId}
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        id: number;
        code: string;
        referrer_name: string | null;
        referrer_email: string | null;
      }
    | undefined;

  if (!row) return null;

  const referrerEmail = row.referrer_email?.trim() || "";
  if (!referrerEmail) {
    return {
      referralId: row.id,
      code: row.code,
      referrerName: row.referrer_name,
      referrerEmail: "",
      completedCleanings: 0,
    };
  }

  const completedCleanings =
    await getCompletedCleaningCountForReferrer(referrerEmail);

  return {
    referralId: row.id,
    code: row.code,
    referrerName: row.referrer_name,
    referrerEmail,
    completedCleanings,
  };
}

export function buildReferralMilestoneEmail(
  type: ReferralMilestoneNotificationType,
  context: Pick<
    ReferralMilestoneContext,
    "code" | "referrerName" | "completedCleanings"
  >,
): { subject: string; text: string } {
  const portalUrl = buildReferralPortalPageUrl();
  const greetingName = context.referrerName?.trim() || "there";

  switch (type) {
    case "referral_milestone_first": {
      const subject = "You made your first Saskia Cleaning referral!";
      const codeLine = context.code
        ? `Your referral code: ${context.code}\n\n`
        : "";
      const text = `Hi ${greetingName},

Congratulations! You made your first Saskia Cleaning referral.

Completed referrals: 1

${codeLine}View your referral rewards and progress here:
${portalUrl}

Thank you for sharing Saskia Cleaning with someone you know.`;

      return { subject, text };
    }
    case "referral_milestone_champion": {
      const subject = "You reached Referral Champion status!";
      const text = `Hi ${greetingName},

Congratulations! You reached Referral Champion status.

Completed referrals: ${context.completedCleanings}

Keep sharing your referral link with friends, family, and neighbors so they can save on their first cleaning too.

View your referral rewards here:
${portalUrl}

Thank you for helping Saskia Cleaning grow.`;

      return { subject, text };
    }
    case "referral_milestone_vip": {
      const subject = "You're a Saskia VIP Referrer!";
      const text = `Hi ${greetingName},

Congratulations! You're a Saskia VIP Referrer.

Completed referrals: ${context.completedCleanings}

We truly appreciate your trust and the customers you've sent our way. You're one of our most valued referrers.

View your referral rewards here:
${portalUrl}

Thank you for being part of the Saskia Cleaning community.`;

      return { subject, text };
    }
  }
}

async function sendSingleMilestoneNotification(
  context: ReferralMilestoneContext,
  definition: ReferralMilestoneDefinition,
): Promise<ReferralNotificationResult> {
  const { notificationType } = definition;
  const emailContent = buildReferralMilestoneEmail(notificationType, context);
  const recipientEmail = context.referrerEmail.trim();

  if (!recipientEmail) {
    await recordReferralNotification({
      referralId: context.referralId,
      type: notificationType,
      recipientEmail: "",
      subject: emailContent.subject,
      status: "skipped",
      errorMessage: "No referrer email on file.",
    });

    return {
      type: notificationType,
      status: "skipped",
      recipientEmail: null,
      subject: emailContent.subject,
      providerMessageId: null,
      errorMessage: "No referrer email on file.",
      skippedReason: "missing_referrer_email",
    };
  }

  if (await hasSentMilestoneNotification(recipientEmail, notificationType)) {
    return {
      type: notificationType,
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
    await recordReferralNotification({
      referralId: context.referralId,
      type: notificationType,
      recipientEmail,
      subject: emailContent.subject,
      status: "sent",
      providerMessageId: sendResult.messageId,
    });

    return {
      type: notificationType,
      status: "sent",
      recipientEmail,
      subject: emailContent.subject,
      providerMessageId: sendResult.messageId,
      errorMessage: null,
    };
  }

  if (sendResult.status === "skipped") {
    await recordReferralNotification({
      referralId: context.referralId,
      type: notificationType,
      recipientEmail,
      subject: emailContent.subject,
      status: "skipped",
      errorMessage: sendResult.reason,
    });

    return {
      type: notificationType,
      status: "skipped",
      recipientEmail,
      subject: emailContent.subject,
      providerMessageId: null,
      errorMessage: sendResult.reason,
      skippedReason: "email_provider_skipped",
    };
  }

  await recordReferralNotification({
    referralId: context.referralId,
    type: notificationType,
    recipientEmail,
    subject: emailContent.subject,
    status: "failed",
    errorMessage: sendResult.error,
  });

  return {
    type: notificationType,
    status: "failed",
    recipientEmail,
    subject: emailContent.subject,
    providerMessageId: null,
    errorMessage: sendResult.error,
  };
}

export async function sendReferralMilestoneNotifications(
  referralId: number,
): Promise<ReferralNotificationResult[]> {
  const context = await loadReferralMilestoneContext(referralId);
  if (!context) {
    return [];
  }

  const reachedMilestones = getReachedMilestonesForCount(
    context.completedCleanings,
  );

  if (reachedMilestones.length === 0) {
    return [];
  }

  const results: ReferralNotificationResult[] = [];

  for (const definition of reachedMilestones) {
    try {
      results.push(await sendSingleMilestoneNotification(context, definition));
    } catch (error) {
      console.error("Referral milestone notification error:", error);
    }
  }

  return results;
}

export function isReferralMilestoneNotificationType(
  type: ReferralNotificationType,
): type is ReferralMilestoneNotificationType {
  return (
    type === "referral_milestone_first" ||
    type === "referral_milestone_champion" ||
    type === "referral_milestone_vip"
  );
}
