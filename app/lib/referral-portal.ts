import { sql } from "./db";
import {
  buildReferralLink,
  getPublicReferredLabel,
  isValidReferralEmail,
  normalizeReferralCode,
  normalizeReferralLookupEmail,
  type ReferralCodeRow,
  type ReferralRow,
  type ReferralStatus,
} from "./referrals";

export type ReferralPortalStatusCounts = Record<ReferralStatus, number>;

export type ReferralPortalPayoutSummary = {
  pendingRewards: number;
  totalEarned: number;
  totalPaid: number;
  outstandingRewards: number;
};

export type ReferralPortalRewardWallet = {
  pendingRewards: number;
  availableRewards: number;
  paidRewards: number;
  lifetimeEarnings: number;
  outstandingRewards: number;
  totalReferrals: number;
  completedReferrals: number;
  rewardedReferrals: number;
  referralsStarted: number;
  completedCleanings: number;
  rewardsPaid: number;
};

export type ReferralPortalMilestoneKey =
  | "first_referral"
  | "referral_champion"
  | "vip_referrer";

export type ReferralPortalMilestone = {
  key: ReferralPortalMilestoneKey;
  label: string;
  requiredCompletedReferrals: number;
  description: string;
  completed: boolean;
  currentProgress: number;
  remaining: number;
  progressPercent: number;
};

export type ReferralPortalMilestones = {
  completedCleanings: number;
  nextMilestone: ReferralPortalMilestone | null;
  milestones: ReferralPortalMilestone[];
  allComplete: boolean;
};

const PORTAL_MILESTONE_DEFINITIONS: Array<{
  key: ReferralPortalMilestoneKey;
  label: string;
  requiredCompletedReferrals: number;
  description: string;
}> = [
  {
    key: "first_referral",
    label: "First Referral",
    requiredCompletedReferrals: 1,
    description: "Complete your first successful referral.",
  },
  {
    key: "referral_champion",
    label: "Referral Champion",
    requiredCompletedReferrals: 5,
    description: "Complete 5 successful referrals.",
  },
  {
    key: "vip_referrer",
    label: "Saskia VIP Referrer",
    requiredCompletedReferrals: 10,
    description: "Complete 10 successful referrals.",
  },
];

export type ReferralPortalHistoryItem = {
  referredLabel: string;
  status: ReferralStatus;
  createdAt: string;
  rewardedAt: string | null;
};

export type ReferralPortalCodeSummary = {
  code: string;
  referralLink: string;
  rewardAmount: number;
  friendDiscountAmount: number;
  usageCount: number;
  isActive: boolean;
  statusCounts: ReferralPortalStatusCounts;
  payoutSummary: ReferralPortalPayoutSummary;
  referrals: ReferralPortalHistoryItem[];
};

export type ReferralPortalLookupResult =
  | { found: false; message: string }
  | {
      found: true;
      codes: ReferralPortalCodeSummary[];
      wallet: ReferralPortalRewardWallet;
      milestones: ReferralPortalMilestones;
    };

function emptyStatusCounts(): ReferralPortalStatusCounts {
  return {
    pending: 0,
    completed: 0,
    rewarded: 0,
    cancelled: 0,
  };
}

export function computeRewardWallet(
  referrals: ReferralRow[],
): ReferralPortalRewardWallet {
  let pendingRewards = 0;
  let availableRewards = 0;
  let paidRewards = 0;
  let lifetimeEarnings = 0;
  let outstandingRewards = 0;
  let pendingReferrals = 0;
  let completedReferrals = 0;
  let rewardedReferrals = 0;

  for (const referral of referrals) {
    if (referral.status === "cancelled") continue;

    if (referral.status === "pending") {
      pendingRewards += referral.reward_amount;
      pendingReferrals += 1;
    } else if (referral.status === "completed") {
      availableRewards += referral.reward_amount;
      outstandingRewards += referral.reward_amount;
      lifetimeEarnings += referral.reward_amount;
      completedReferrals += 1;
    } else if (referral.status === "rewarded") {
      paidRewards += referral.payout_amount ?? referral.reward_amount;
      lifetimeEarnings += referral.reward_amount;
      rewardedReferrals += 1;
    }
  }

  const totalReferrals = pendingReferrals + completedReferrals + rewardedReferrals;
  const completedCleanings = completedReferrals + rewardedReferrals;

  return {
    pendingRewards,
    availableRewards,
    paidRewards,
    lifetimeEarnings,
    outstandingRewards,
    totalReferrals,
    completedReferrals,
    rewardedReferrals,
    referralsStarted: totalReferrals,
    completedCleanings,
    rewardsPaid: rewardedReferrals,
  };
}

export function computeReferralMilestones(
  completedCleanings: number,
): ReferralPortalMilestones {
  const milestones: ReferralPortalMilestone[] = PORTAL_MILESTONE_DEFINITIONS.map(
    (definition) => {
      const completed =
        completedCleanings >= definition.requiredCompletedReferrals;
      const currentProgress = Math.min(
        completedCleanings,
        definition.requiredCompletedReferrals,
      );
      const remaining = Math.max(
        0,
        definition.requiredCompletedReferrals - completedCleanings,
      );
      const progressPercent = Math.min(
        100,
        Math.round(
          (completedCleanings / definition.requiredCompletedReferrals) * 100,
        ),
      );

      return {
        key: definition.key,
        label: definition.label,
        requiredCompletedReferrals: definition.requiredCompletedReferrals,
        description: definition.description,
        completed,
        currentProgress,
        remaining,
        progressPercent,
      };
    },
  );

  const nextMilestone =
    milestones.find((milestone) => !milestone.completed) ?? null;
  const allComplete = milestones.every((milestone) => milestone.completed);

  return {
    completedCleanings,
    nextMilestone,
    milestones,
    allComplete,
  };
}

function computePortalPayoutSummary(
  referrals: ReferralRow[],
): ReferralPortalPayoutSummary {
  let pendingRewards = 0;
  let totalEarned = 0;
  let totalPaid = 0;
  let outstandingRewards = 0;

  for (const referral of referrals) {
    if (referral.status === "pending") {
      pendingRewards += referral.reward_amount;
      outstandingRewards += referral.reward_amount;
    } else if (referral.status === "completed") {
      totalEarned += referral.reward_amount;
      outstandingRewards += referral.reward_amount;
    } else if (referral.status === "rewarded") {
      totalEarned += referral.reward_amount;
      totalPaid += referral.payout_amount ?? referral.reward_amount;
    }
  }

  return { pendingRewards, totalEarned, totalPaid, outstandingRewards };
}

function buildCodeSummary(
  codeRow: ReferralCodeRow,
  referrals: ReferralRow[],
): ReferralPortalCodeSummary {
  const statusCounts = emptyStatusCounts();

  for (const referral of referrals) {
    statusCounts[referral.status] += 1;
  }

  const payoutSummary = computePortalPayoutSummary(referrals);

  return {
    code: codeRow.code,
    referralLink: buildReferralLink(codeRow.code),
    rewardAmount: codeRow.reward_amount,
    friendDiscountAmount: codeRow.friend_discount_amount,
    usageCount: codeRow.usage_count,
    isActive: codeRow.is_active,
    statusCounts,
    payoutSummary,
    referrals: referrals.map((referral) => ({
      referredLabel: getPublicReferredLabel(
        referral.referred_name,
        referral.referred_email,
      ),
      status: referral.status,
      createdAt: referral.created_at,
      rewardedAt: referral.rewarded_at,
    })),
  };
}

export function parseReferralLookupInput(body: unknown):
  | { data: { email: string; code: string | null } }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const emailRaw =
    typeof record.email === "string" ? record.email.trim() : "";
  const codeRaw =
    typeof record.code === "string"
      ? record.code.trim()
      : typeof record.referralCode === "string"
        ? record.referralCode.trim()
        : typeof record.referral_code === "string"
          ? record.referral_code.trim()
          : "";

  if (!emailRaw) {
    return { error: "Email address is required." };
  }

  if (!isValidReferralEmail(emailRaw)) {
    return { error: "Please enter a valid email address." };
  }

  const normalizedCode = codeRaw ? normalizeReferralCode(codeRaw) : null;
  if (codeRaw && !normalizedCode) {
    return { error: "Please enter a valid referral code." };
  }

  return {
    data: {
      email: normalizeReferralLookupEmail(emailRaw),
      code: normalizedCode,
    },
  };
}

export async function lookupReferrerPortal(input: {
  email: string;
  code: string | null;
}): Promise<ReferralPortalLookupResult> {
  const codeRows = input.code
    ? await sql`
        SELECT *
        FROM referral_codes
        WHERE lower(trim(referrer_email)) = ${input.email}
          AND code = ${input.code}
        ORDER BY created_at DESC, id DESC
      `
    : await sql`
        SELECT *
        FROM referral_codes
        WHERE lower(trim(referrer_email)) = ${input.email}
        ORDER BY created_at DESC, id DESC
      `;

  const codes = codeRows as ReferralCodeRow[];
  if (codes.length === 0) {
    return {
      found: false,
      message: "No referral codes found.",
    };
  }

  const summaries: ReferralPortalCodeSummary[] = [];
  const allReferrals: ReferralRow[] = [];

  for (const codeRow of codes) {
    const referralRows = await sql`
      SELECT
        id,
        referral_code_id,
        code,
        booking_request_id,
        referred_name,
        referred_email,
        reward_amount,
        friend_discount_amount,
        status,
        payout_amount,
        payout_method,
        payout_notes,
        rewarded_at,
        created_at,
        updated_at
      FROM referrals
      WHERE code = ${codeRow.code}
      ORDER BY created_at DESC, id DESC
    `;

    const typedReferrals = referralRows as ReferralRow[];
    allReferrals.push(...typedReferrals);
    summaries.push(buildCodeSummary(codeRow, typedReferrals));
  }

  const wallet = computeRewardWallet(allReferrals);

  return {
    found: true,
    codes: summaries,
    wallet,
    milestones: computeReferralMilestones(wallet.completedCleanings),
  };
}
