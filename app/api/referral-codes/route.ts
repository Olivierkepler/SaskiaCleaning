import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import {
  generateReferralCode,
  generateReferralCodeWithRewardSuffix,
  isDashboardAuthorized,
  parseReferralCodeInput,
  serializeReferralCode,
  type ReferralCodeRow,
} from "../../lib/referrals";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT *
      FROM referral_codes
      ORDER BY created_at DESC, id DESC
    `;

    return NextResponse.json({
      success: true,
      referralCodes: (rows as ReferralCodeRow[]).map(serializeReferralCode),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load referral codes." },
      { status: 500 },
    );
  }
}

async function insertReferralCode(data: {
  code: string;
  referrerName: string;
  referrerEmail: string | null;
  rewardAmount: number;
  friendDiscountAmount: number;
  isActive: boolean;
}) {
  const result = await sql`
    INSERT INTO referral_codes (
      code,
      referrer_name,
      referrer_email,
      reward_amount,
      friend_discount_amount,
      is_active
    )
    VALUES (
      ${data.code},
      ${data.referrerName},
      ${data.referrerEmail},
      ${data.rewardAmount},
      ${data.friendDiscountAmount},
      ${data.isActive}
    )
    RETURNING *
  `;

  return result[0] as ReferralCodeRow;
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = parseReferralCodeInput(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { data } = parsed;
    const candidateCodes = data.code
      ? [data.code]
      : [
          generateReferralCodeWithRewardSuffix(data.referrerName),
          generateReferralCode(data.referrerName),
          generateReferralCode(data.referrerName),
        ];

    let created: ReferralCodeRow | null = null;
    let lastError: unknown = null;

    for (const code of candidateCodes) {
      try {
        created = await insertReferralCode({
          code,
          referrerName: data.referrerName,
          referrerEmail: data.referrerEmail,
          rewardAmount: data.rewardAmount,
          friendDiscountAmount: data.friendDiscountAmount,
          isActive: data.isActive,
        });
        break;
      } catch (error) {
        lastError = error;
        const isDuplicate =
          error instanceof Error &&
          (error.message.includes("referral_codes_code_key") ||
            error.message.includes("duplicate key"));
        if (!isDuplicate || data.code) {
          throw error;
        }
      }
    }

    if (!created) {
      console.error(lastError);
      return NextResponse.json(
        { error: "Failed to generate a unique referral code." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      referralCode: serializeReferralCode(created),
    });
  } catch (error) {
    console.error(error);

    const isDuplicate =
      error instanceof Error &&
      (error.message.includes("referral_codes_code_key") ||
        error.message.includes("duplicate key"));

    if (isDuplicate) {
      return NextResponse.json(
        { error: "Referral code already exists." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create referral code." },
      { status: 500 },
    );
  }
}
