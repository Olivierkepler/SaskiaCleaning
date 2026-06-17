import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import {
  isDashboardAuthorized,
  isDuplicateReferralCodeError,
  mergeReferralCodeInput,
  parseReferralCodePatch,
  parseReferralId,
  serializeReferralCode,
  type ReferralCodeRow,
} from "../../../lib/referrals";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const codeId = parseReferralId(id);
    if (!codeId) {
      return NextResponse.json(
        { error: "Invalid referral code ID." },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = parseReferralCodePatch(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existingRows = await sql`
      SELECT *
      FROM referral_codes
      WHERE id = ${codeId}
    `;

    const existing = existingRows[0] as ReferralCodeRow | undefined;
    if (!existing) {
      return NextResponse.json(
        { error: "Referral code not found." },
        { status: 404 },
      );
    }

    const merged = mergeReferralCodeInput(existing, parsed.data);

    const result = await sql`
      UPDATE referral_codes
      SET
        code = ${merged.code!},
        referrer_name = ${merged.referrerName},
        referrer_email = ${merged.referrerEmail},
        reward_amount = ${merged.rewardAmount},
        friend_discount_amount = ${merged.friendDiscountAmount},
        is_active = ${merged.isActive},
        updated_at = now()
      WHERE id = ${codeId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      referralCode: serializeReferralCode(result[0] as ReferralCodeRow),
    });
  } catch (error) {
    console.error(error);

    if (isDuplicateReferralCodeError(error)) {
      return NextResponse.json(
        { error: "Referral code already exists." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update referral code." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const codeId = parseReferralId(id);
    if (!codeId) {
      return NextResponse.json(
        { error: "Invalid referral code ID." },
        { status: 400 },
      );
    }

    const existingRows = await sql`
      SELECT *
      FROM referral_codes
      WHERE id = ${codeId}
    `;

    const existing = existingRows[0] as ReferralCodeRow | undefined;
    if (!existing) {
      return NextResponse.json(
        { error: "Referral code not found." },
        { status: 404 },
      );
    }

    const usageRows = await sql`
      SELECT COUNT(*)::int AS count
      FROM referrals
      WHERE referral_code_id = ${codeId}
    `;

    const usageCount = Number(usageRows[0]?.count ?? 0);

    if (usageCount > 0) {
      const result = await sql`
        UPDATE referral_codes
        SET
          is_active = false,
          updated_at = now()
        WHERE id = ${codeId}
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        softDeleted: true,
        message:
          "Referral code has existing referral history and was deactivated instead of deleted.",
        referralCode: serializeReferralCode(result[0] as ReferralCodeRow),
      });
    }

    await sql`
      DELETE FROM referral_codes
      WHERE id = ${codeId}
    `;

    return NextResponse.json({ success: true, softDeleted: false });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete referral code." },
      { status: 500 },
    );
  }
}
