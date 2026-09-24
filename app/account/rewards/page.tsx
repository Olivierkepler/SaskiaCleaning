import { Suspense } from "react";
import { requireCustomer } from "@/app/lib/customer-auth";
import AccountHero from "@/app/components/account/AccountHero";
import ReferralPortal from "@/app/referrals/ReferralPortal";

function EmbeddedRewardsFallback() {
  return (
    <p className="rounded-[28px] border border-slate-200/60 bg-white p-6 text-sm text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
      Loading rewards…
    </p>
  );
}

export default async function AccountRewardsPage() {
  await requireCustomer("/login");

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title="Rewards"
        description="See your referral wallet and milestones."
        imageSrc="/account/rewards.png"
        imageAlt="Warm home interior suggesting rewards and milestones"
      />

      <section className="rounded-[28px] border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
        <Suspense fallback={<EmbeddedRewardsFallback />}>
          <ReferralPortal embedded />
        </Suspense>
      </section>
    </>
  );
}
