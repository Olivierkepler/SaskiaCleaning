import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import { normalizeReferralCode, type ReferralCodeRow } from "../../../lib/referrals";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
    const referralCodeRaw = record?.referralCode ?? record?.referral_code;

    if (
      referralCodeRaw == null ||
      typeof referralCodeRaw !== "string" ||
      referralCodeRaw.trim() === ""
    ) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: "Invalid referral code.",
      });
    }

    const normalizedCode = normalizeReferralCode(referralCodeRaw);
    if (!normalizedCode) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: "Invalid referral code.",
      });
    }

    const rows = await sql`
      SELECT *
      FROM referral_codes
      WHERE code = ${normalizedCode}
        AND is_active = true
      LIMIT 1
    `;

    const row = rows[0] as ReferralCodeRow | undefined;
    if (!row) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: "Invalid referral code.",
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      code: row.code,
      friendDiscountAmount: row.friend_discount_amount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to validate referral code." },
      { status: 500 },
    );
  }
}
