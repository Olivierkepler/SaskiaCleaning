export const REFERRAL_STATUSES = [
  "pending",
  "completed",
  "rewarded",
  "cancelled",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export type ReferralCodeRow = {
  id: number;
  code: string;
  referrer_name: string;
  referrer_email: string | null;
  reward_amount: number;
  friend_discount_amount: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export type ReferralRow = {
  id: number;
  referral_code_id: number | null;
  code: string;
  booking_request_id: number;
  referred_name: string;
  referred_email: string;
  reward_amount: number;
  friend_discount_amount: number;
  status: ReferralStatus;
  created_at: string;
  updated_at: string;
};

export type ReferralCode = {
  id: number;
  code: string;
  referrerName: string;
  referrerEmail: string | null;
  rewardAmount: number;
  friendDiscountAmount: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ReferralTrackingRow = {
  id: number;
  code: string;
  status: ReferralStatus;
  reward_amount: number;
  friend_discount_amount: number;
  referred_name: string;
  referred_email: string;
  booking_request_id: number;
  booking_created_at: string | null;
  booking_service: string | null;
  booking_estimate_mid: number | null;
  referrer_name: string | null;
  referrer_email: string | null;
  created_at: string;
  updated_at: string;
};

export type ReferralTracking = {
  id: number;
  code: string;
  status: ReferralStatus;
  rewardAmount: number;
  friendDiscountAmount: number;
  referredName: string;
  referredEmail: string;
  bookingRequestId: number;
  bookingCreatedAt: string | null;
  bookingService: string | null;
  bookingEstimateMid: number | null;
  referrerName: string | null;
  referrerEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReferralCodeInput = {
  code?: string;
  referrerName: string;
  referrerEmail: string | null;
  rewardAmount: number;
  friendDiscountAmount: number;
  isActive: boolean;
};

export type ReferralCodePatch = Partial<ReferralCodeInput>;

export type ReferralDashboardMetrics = {
  totalCodes: number;
  activeCodes: number;
  pendingReferrals: number;
  rewardedReferrals: number;
  totalPendingRewards: number;
  totalRewardedAmount: number;
};

export const EMPTY_REFERRAL_CODE_FORM: ReferralCodeInput = {
  referrerName: "",
  referrerEmail: null,
  rewardAmount: 20,
  friendDiscountAmount: 20,
  isActive: true,
};

export function parseReferralId(id: string): number | null {
  if (!/^\d+$/.test(id)) return null;
  const parsed = Number.parseInt(id, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function isDuplicateReferralCodeError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("referral_codes_code_key") ||
      error.message.includes("duplicate key"))
  );
}

export function isDashboardAuthorized(key: string | null): boolean {
  return key === process.env.DASHBOARD_KEY;
}

export function isReferralStatus(value: string): value is ReferralStatus {
  return (REFERRAL_STATUSES as readonly string[]).includes(value);
}

export function normalizeReferralCode(code: string): string {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

function referralNameBase(name: string): string {
  const base = name
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  return base && base.length > 0 ? base.slice(0, 12) : "REFERRAL";
}

export function generateReferralCode(name: string): string {
  const base = referralNameBase(name);
  const randomSuffix = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `${base}${randomSuffix}`;
}

export function generateReferralCodeWithRewardSuffix(name: string): string {
  return `${referralNameBase(name)}20`;
}

export const PUBLIC_REFERRAL_SITE_ORIGIN = "https://saskiaservices.com";

export function buildReferralLink(code: string): string {
  const normalizedCode = normalizeReferralCode(code);
  return `${PUBLIC_REFERRAL_SITE_ORIGIN}/?ref=${encodeURIComponent(normalizedCode)}#quote`;
}

export function buildReferralShareMessage(code: string): string {
  const normalizedCode = normalizeReferralCode(code);
  return `Use my Saskia Cleaning referral code ${normalizedCode} for $20 off your first cleaning: ${buildReferralLink(normalizedCode)}`;
}

export function parseReferralCodeFromSearchParams(search: string): string | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search : `?${search}`,
  );
  const ref = params.get("ref");
  if (!ref?.trim()) return null;

  const normalized = normalizeReferralCode(ref);
  return normalized || null;
}

export function isValidReferralEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generatePublicReferralCodeCandidates(name: string): string[] {
  return [
    generateReferralCodeWithRewardSuffix(name),
    generateReferralCode(name),
    generateReferralCode(name),
    generateReferralCode(name),
  ];
}

export function parsePublicReferralCodeInput(body: unknown):
  | { data: { referrerName: string; referrerEmail: string | null } }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const referrerName = readString(record, "referrerName", "referrer_name");
  const referrerEmailRaw = readString(record, "referrerEmail", "referrer_email");

  if (!referrerName) {
    return { error: "Your name is required." };
  }

  if (referrerEmailRaw && !isValidReferralEmail(referrerEmailRaw)) {
    return { error: "Please enter a valid email address." };
  }

  return {
    data: {
      referrerName,
      referrerEmail: referrerEmailRaw ?? null,
    },
  };
}

export function serializeReferralCode(row: ReferralCodeRow): ReferralCode {
  return {
    id: row.id,
    code: row.code,
    referrerName: row.referrer_name,
    referrerEmail: row.referrer_email,
    rewardAmount: row.reward_amount,
    friendDiscountAmount: row.friend_discount_amount,
    isActive: row.is_active,
    usageCount: row.usage_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeReferralTracking(
  row: ReferralTrackingRow,
): ReferralTracking {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    rewardAmount: row.reward_amount,
    friendDiscountAmount: row.friend_discount_amount,
    referredName: row.referred_name,
    referredEmail: row.referred_email,
    bookingRequestId: row.booking_request_id,
    bookingCreatedAt: row.booking_created_at,
    bookingService: row.booking_service,
    bookingEstimateMid: row.booking_estimate_mid,
    referrerName: row.referrer_name,
    referrerEmail: row.referrer_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function computeReferralMetrics(
  codes: ReferralCode[],
  referrals: ReferralTracking[],
): ReferralDashboardMetrics {
  return {
    totalCodes: codes.length,
    activeCodes: codes.filter((code) => code.isActive).length,
    pendingReferrals: referrals.filter((referral) => referral.status === "pending")
      .length,
    rewardedReferrals: referrals.filter((referral) => referral.status === "rewarded")
      .length,
    totalPendingRewards: referrals
      .filter((referral) => referral.status === "pending")
      .reduce((sum, referral) => sum + referral.rewardAmount, 0),
    totalRewardedAmount: referrals
      .filter((referral) => referral.status === "rewarded")
      .reduce((sum, referral) => sum + referral.rewardAmount, 0),
  };
}

function toReferralCodeInput(row: ReferralCodeRow): ReferralCodeInput {
  return {
    code: row.code,
    referrerName: row.referrer_name,
    referrerEmail: row.referrer_email,
    rewardAmount: row.reward_amount,
    friendDiscountAmount: row.friend_discount_amount,
    isActive: row.is_active,
  };
}

export function mergeReferralCodeInput(
  existing: ReferralCodeRow,
  patch: ReferralCodePatch,
): ReferralCodeInput {
  const current = toReferralCodeInput(existing);

  return {
    code: patch.code ?? current.code,
    referrerName: patch.referrerName ?? current.referrerName,
    referrerEmail:
      patch.referrerEmail !== undefined
        ? patch.referrerEmail
        : current.referrerEmail,
    rewardAmount: patch.rewardAmount ?? current.rewardAmount,
    friendDiscountAmount:
      patch.friendDiscountAmount ?? current.friendDiscountAmount,
    isActive: patch.isActive ?? current.isActive,
  };
}

function readString(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): string | undefined {
  const value = body[camelKey] ?? body[snakeKey];
  return typeof value === "string" ? value.trim() : undefined;
}

function readBoolean(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): boolean | undefined {
  const value = body[camelKey] ?? body[snakeKey];
  return typeof value === "boolean" ? value : undefined;
}

function readPositiveInteger(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): number | undefined {
  const value = body[camelKey] ?? body[snakeKey];
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return undefined;
}

export function parseReferralCodeInput(body: unknown):
  | {
      data: {
        code?: string;
        referrerName: string;
        referrerEmail: string | null;
        rewardAmount: number;
        friendDiscountAmount: number;
        isActive: boolean;
      };
    }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const referrerName = readString(record, "referrerName", "referrer_name");
  const referrerEmailRaw = readString(record, "referrerEmail", "referrer_email");
  const codeRaw = readString(record, "code", "code");
  const rewardAmount = readPositiveInteger(
    record,
    "rewardAmount",
    "reward_amount",
  );
  const friendDiscountAmount = readPositiveInteger(
    record,
    "friendDiscountAmount",
    "friend_discount_amount",
  );
  const isActive = readBoolean(record, "isActive", "is_active");

  if (!referrerName) {
    return { error: "referrerName is required." };
  }

  if (codeRaw !== undefined && normalizeReferralCode(codeRaw).length === 0) {
    return { error: "code cannot be empty." };
  }

  return {
    data: {
      code: codeRaw ? normalizeReferralCode(codeRaw) : undefined,
      referrerName,
      referrerEmail: referrerEmailRaw ?? null,
      rewardAmount: rewardAmount ?? 20,
      friendDiscountAmount: friendDiscountAmount ?? 20,
      isActive: isActive ?? true,
    },
  };
}

export function parseReferralCodePatch(body: unknown):
  | { data: ReferralCodePatch }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const patch: ReferralCodePatch = {};

  if (record.referrerName !== undefined || record.referrer_name !== undefined) {
    const referrerName = readString(record, "referrerName", "referrer_name");
    if (!referrerName) {
      return { error: "referrerName cannot be empty." };
    }
    patch.referrerName = referrerName;
  }

  if (record.referrerEmail !== undefined || record.referrer_email !== undefined) {
    const referrerEmail = readString(record, "referrerEmail", "referrer_email");
    patch.referrerEmail = referrerEmail ?? null;
  }

  if (record.code !== undefined) {
    const codeRaw = readString(record, "code", "code");
    if (!codeRaw || normalizeReferralCode(codeRaw).length === 0) {
      return { error: "code cannot be empty." };
    }
    patch.code = normalizeReferralCode(codeRaw);
  }

  if (record.rewardAmount !== undefined || record.reward_amount !== undefined) {
    const rewardAmount = readPositiveInteger(
      record,
      "rewardAmount",
      "reward_amount",
    );
    if (rewardAmount === undefined) {
      return { error: "rewardAmount must be a non-negative integer." };
    }
    patch.rewardAmount = rewardAmount;
  }

  if (
    record.friendDiscountAmount !== undefined ||
    record.friend_discount_amount !== undefined
  ) {
    const friendDiscountAmount = readPositiveInteger(
      record,
      "friendDiscountAmount",
      "friend_discount_amount",
    );
    if (friendDiscountAmount === undefined) {
      return {
        error: "friendDiscountAmount must be a non-negative integer.",
      };
    }
    patch.friendDiscountAmount = friendDiscountAmount;
  }

  if (record.isActive !== undefined || record.is_active !== undefined) {
    const isActive = readBoolean(record, "isActive", "is_active");
    if (isActive === undefined) {
      return { error: "isActive must be a boolean." };
    }
    patch.isActive = isActive;
  }

  if (Object.keys(patch).length === 0) {
    return { error: "No valid fields to update." };
  }

  return { data: patch };
}

export function parseReferralStatusUpdate(body: unknown):
  | { data: { status: ReferralStatus } }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const statusRaw = readString(record, "status", "status");

  if (!statusRaw || !isReferralStatus(statusRaw)) {
    return {
      error: "status must be one of: pending, completed, rewarded, cancelled.",
    };
  }

  return { data: { status: statusRaw } };
}
