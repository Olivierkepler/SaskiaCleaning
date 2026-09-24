import { Suspense } from "react";
import { requireCustomer } from "@/app/lib/customer-auth";
import AccountHero from "@/app/components/account/AccountHero";
import ReferralPortal from "@/app/referrals/ReferralPortal";

function EmbeddedReferralFallback() {
  return (
    <p className="rounded-[28px] bg-[#ECF0F3] p-6 text-sm text-slate-600 shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)] md:p-10">
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
        imageSrc="/account/referal.png"
        imageAlt="Bright kitchen with greenery and referral-ready home setting"
      />

      <section className="rounded-[28px] bg-[#ECF0F3] p-6 shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)] md:p-10">
        <Suspense fallback={<EmbeddedReferralFallback />}>
          <ReferralPortal embedded />
        </Suspense>
      </section>
    </>
  );
}
