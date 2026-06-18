import { sql } from "../../lib/db";
import { redirect } from "next/navigation";
import {
  computeReferralMetrics,
  serializeReferralCode,
  serializeReferralTracking,
  type ReferralCodeRow,
  type ReferralTrackingRow,
} from "../../lib/referrals";
import Navbar from "../components/Navbar";
import ReferralDashboard from "./ReferralDashboard";

type DashboardPageProps = {
  searchParams: Promise<{
    key?: string;
  }>;
};

export default async function ReferralsDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  if (params.key !== process.env.DASHBOARD_KEY) {
    redirect("/");
  }

  const [codeRows, referralRows, bookingRows] = await Promise.all([
    sql`
      SELECT *
      FROM referral_codes
      ORDER BY created_at DESC, id DESC
    `,
    sql`
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
      ORDER BY r.created_at DESC, r.id DESC
    `,
    sql`
      SELECT id, name, email, created_at, seen, service, location
      FROM booking_requests
      ORDER BY created_at DESC
    `,
  ]);

  const referralCodes = (codeRows as ReferralCodeRow[]).map(serializeReferralCode);
  const referrals = (referralRows as ReferralTrackingRow[]).map(
    serializeReferralTracking,
  );
  const metrics = computeReferralMetrics(referralCodes, referrals);

  const unseenBookings = bookingRows
    .filter((booking) => !booking.seen)
    .slice(0, 10)
    .map(({ id, name, email, created_at, service, location }) => ({
      id,
      name,
      email,
      created_at,
      service,
      location,
    }));
  const unseenCount = bookingRows.filter((booking) => !booking.seen).length;

  return (
    <main className="min-h-screen bg-slate-100 py-6">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-20">
        <Navbar
          dashboardKey={params.key!}
          unseenCount={unseenCount}
          unseenBookings={unseenBookings}
        />

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Referrals
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Manage referral codes and track referral rewards.
          </p>
        </div>

        <ReferralDashboard
          referralCodes={referralCodes}
          referrals={referrals}
          metrics={metrics}
          dashboardKey={params.key!}
        />
      </div>
    </main>
  );
}
