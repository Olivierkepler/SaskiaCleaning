import Link from "next/link";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerReferralAccountData } from "@/app/lib/customer-referral-account";
import AccountHero from "@/app/components/account/AccountHero";
import {
  ReferralRewardHistorySection,
  ReferralRewardWalletSection,
} from "@/app/referrals/ReferralPortalSections";

function AccountEmptyState() {
  return (
    <div className="rounded-[24px] bg-[#ECF0F3] p-6 text-center shadow-[inset_5px_5px_12px_rgba(163,177,198,0.30),inset_-5px_-5px_12px_rgba(255,255,255,0.95)] sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">
        You don&apos;t have referral rewards yet.
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Create a referral code from the Refer Now card on the Saskia homepage to
        start tracking activity and rewards here.
      </p>
      <Link
        href="/#social-section"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
      >
        Go to Refer Now
      </Link>
    </div>
  );
}

export default async function AccountRewardsPage() {
  const customer = await requireCustomer("/login");
  const data = await getCustomerReferralAccountData(customer);
  const codes = data.found ? data.codes : [];

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title="Rewards"
        description="See your referral wallet and milestones."
        imageSrc="/account/rewards.png"
        imageAlt="Warm home interior suggesting rewards and milestones"
      />

      <section className="space-y-6 rounded-[28px] bg-[#ECF0F3] p-6 shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)] md:p-10">
        {!data.found ? (
          <AccountEmptyState />
        ) : (
          <>
            <ReferralRewardWalletSection wallet={data.wallet} />
            <ReferralRewardHistorySection codes={codes} />
          </>
        )}
      </section>
    </>
  );
}
