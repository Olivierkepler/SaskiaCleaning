import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/app/lib/customer-auth";
import { resolveReferralCodeOwnerId } from "@/app/lib/customer-referral-ownership";
import { sql } from "../../../lib/db";
import {
  generatePublicReferralCodeCandidates,
  isDuplicateReferralCodeError,
  parsePublicReferralCodeInput,
  buildReferralLink,
  serializeReferralCode,
  type ReferralCodeRow,
} from "../../../lib/referrals";

async function insertReferralCode(data: {
  code: string;
  referrerName: string;
  referrerEmail: string | null;
  customerId: string | null;
  rewardAmount: number;
  friendDiscountAmount: number;
  isActive: boolean;
}) {
  const result = await sql`
    INSERT INTO referral_codes (
      code,
      referrer_name,
      referrer_email,
      customer_id,
      reward_amount,
      friend_discount_amount,
      is_active
    )
    VALUES (
      ${data.code},
      ${data.referrerName},
      ${data.referrerEmail},
      ${data.customerId},
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
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = parsePublicReferralCodeInput(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { data } = parsed;
    const currentCustomer = await getCurrentCustomer();
    const customerId = resolveReferralCodeOwnerId(currentCustomer);
    const candidateCodes = generatePublicReferralCodeCandidates(data.referrerName);

    let created: ReferralCodeRow | null = null;
    let lastError: unknown = null;

    for (const code of candidateCodes) {
      try {
        created = await insertReferralCode({
          code,
          referrerName: data.referrerName,
          referrerEmail: data.referrerEmail,
          customerId,
          rewardAmount: 20,
          friendDiscountAmount: 20,
          isActive: true,
        });
        break;
      } catch (error) {
        lastError = error;
        if (!isDuplicateReferralCodeError(error)) {
          throw error;
        }
      }
    }

    if (!created) {
      console.error(lastError);
      return NextResponse.json(
        { error: "Failed to generate a unique referral code. Please try again." },
        { status: 500 },
      );
    }

    const referralCode = serializeReferralCode(created);

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink: buildReferralLink(created.code),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create referral code." },
      { status: 500 },
    );
  }
}
