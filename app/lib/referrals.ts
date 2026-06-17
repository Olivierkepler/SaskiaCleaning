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
