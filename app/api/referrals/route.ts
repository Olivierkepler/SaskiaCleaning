import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import {
  isDashboardAuthorized,
  serializeReferralTracking,
  type ReferralTrackingRow,
} from "../../lib/referrals";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT
        r.id,
        r.code,
        r.status,
        r.reward_amount,
        r.friend_discount_amount,
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
      ORDER BY r.created_at DESC, r.id DESC
    `;

    return NextResponse.json({
      success: true,
      referrals: (rows as ReferralTrackingRow[]).map(serializeReferralTracking),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load referrals." },
      { status: 500 },
    );
  }
}
