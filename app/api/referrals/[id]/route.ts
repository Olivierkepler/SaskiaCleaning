import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import {
  sendReferralNotification,
  type ReferralNotificationResult,
} from "../../../lib/referral-notifications";
import {
  sendRewardEligibleAdminNotification,
  type AdminReferralReminderResult,
} from "../../../lib/admin-referral-reminders";
import { sendReferralMilestoneNotifications } from "../../../lib/referral-milestone-notifications";
import {
  applyReferralUpdate,
  isDashboardAuthorized,
  parseReferralId,
  parseReferralUpdate,
  serializeReferralTracking,
  type ReferralRow,
  type ReferralTrackingRow,
} from "../../../lib/referrals";

async function loadReferralTracking(id: number) {
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
    WHERE r.id = ${id}
    LIMIT 1
  `;

  return rows[0] as ReferralTrackingRow | undefined;
}

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
    const referralId = parseReferralId(id);
    if (!referralId) {
      return NextResponse.json(
        { error: "Invalid referral ID." },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = parseReferralUpdate(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existingRows = await sql`
      SELECT *
      FROM referrals
      WHERE id = ${referralId}
    `;

    const existing = existingRows[0] as ReferralRow | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Referral not found." }, { status: 404 });
    }

    const next = applyReferralUpdate(existing, parsed.data);
    const previousStatus = existing.status;

    if (next.useRewardedAtNow) {
      await sql`
        UPDATE referrals
        SET
          status = ${next.status},
          payout_amount = ${next.payout_amount},
          payout_method = ${next.payout_method},
          payout_notes = ${next.payout_notes},
          rewarded_at = now(),
          updated_at = now()
        WHERE id = ${referralId}
      `;
    } else {
      await sql`
        UPDATE referrals
        SET
          status = ${next.status},
          payout_amount = ${next.payout_amount},
          payout_method = ${next.payout_method},
          payout_notes = ${next.payout_notes},
          rewarded_at = ${next.rewarded_at},
          updated_at = now()
        WHERE id = ${referralId}
      `;
    }

    const referral = await loadReferralTracking(referralId);
    if (!referral) {
      return NextResponse.json({ error: "Referral not found." }, { status: 404 });
    }

    const notifications: ReferralNotificationResult[] = [];
    const adminReminders: AdminReferralReminderResult[] = [];

    if (previousStatus !== next.status) {
      try {
        if (next.status === "completed") {
          notifications.push(
            await sendReferralNotification(referralId, "referral_completed"),
          );
          adminReminders.push(
            await sendRewardEligibleAdminNotification(referralId),
          );
        } else if (next.status === "rewarded") {
          notifications.push(
            await sendReferralNotification(referralId, "referral_rewarded"),
          );
        }

        if (next.status === "completed" || next.status === "rewarded") {
          notifications.push(
            ...(await sendReferralMilestoneNotifications(referralId)),
          );
        }
      } catch (notificationError) {
        console.error("Referral notification error:", notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      referral: serializeReferralTracking(referral),
      notifications,
      adminReminders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update referral." },
      { status: 500 },
    );
  }
}
