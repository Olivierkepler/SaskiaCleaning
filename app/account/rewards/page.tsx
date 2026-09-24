import { Suspense } from "react";
import { requireCustomer } from "@/app/lib/customer-auth";
import AccountHero from "@/app/components/account/AccountHero";
import ReferralPortal from "@/app/referrals/ReferralPortal";

function EmbeddedRewardsFallback() {
  return (
    <p className="rounded-[28px] bg-[#ECF0F3] p-6 text-sm text-slate-600 shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)] md:p-10">
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

      <section className="rounded-[28px] bg-[#ECF0F3] p-6 shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)] md:p-10">
        <Suspense fallback={<EmbeddedRewardsFallback />}>
          <ReferralPortal embedded />
        </Suspense>
      </section>
    </>
  );
}
