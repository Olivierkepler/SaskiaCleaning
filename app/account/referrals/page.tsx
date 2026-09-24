import { Suspense } from "react";
import { requireCustomer } from "@/app/lib/customer-auth";
import AccountHero from "@/app/components/account/AccountHero";
import ReferralPortal from "@/app/referrals/ReferralPortal";

function EmbeddedReferralFallback() {
  return (
    <p className="rounded-[28px] border border-slate-200/60 bg-white p-6 text-sm text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
      Loading referral portal…
    </p>
  );
}

export default async function AccountReferralsPage() {
  await requireCustomer("/login");

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title="Referrals"
        description="Track referrals and share your rewards link."
      />

      <section className="rounded-[28px] border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
        <Suspense fallback={<EmbeddedReferralFallback />}>
          <ReferralPortal embedded />
        </Suspense>
      </section>
    </>
  );
}
