import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import type { ReferralPortalLookupResult } from "@/app/lib/referral-portal";
import { formatUsdAmount } from "@/app/lib/customer-bookings-pure";
import AccountOverviewCard from "@/app/components/account/AccountOverviewCard";

export default function AccountReferralRewards({
  data,
  failed,
}: {
  data: Extract<ReferralPortalLookupResult, { found: true }> | null;
  failed: boolean;
}) {
  return (
    <AccountOverviewCard title="Referral Rewards" icon={<Gift className="h-5 w-5" />}>
      {failed ? (
        <p role="status" className="text-sm text-slate-600">Referral rewards are temporarily unavailable.</p>
      ) : !data || data.wallet.totalReferrals === 0 ? (
        <div>
          <p className="font-medium text-slate-800">No referral rewards yet</p>
          <p className="mt-1 text-sm text-slate-500">Successful referrals and reward progress will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Referral rewards earned</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
              {data.wallet.lifetimeEarnings > 0 ? formatUsdAmount(data.wallet.lifetimeEarnings) : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Referral rewards only</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Successful referrals</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{data.wallet.completedCleanings}</p>
            {data.milestones.nextMilestone ? (
              <p className="mt-1 text-xs text-slate-500">{data.milestones.nextMilestone.remaining} to {data.milestones.nextMilestone.label}</p>
            ) : <p className="mt-1 text-xs text-slate-500">All referral milestones complete</p>}
          </div>
        </div>
      )}
      <Link href="/account/rewards" className="mt-5 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
        View rewards <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
      </Link>
    </AccountOverviewCard>
  );
}
