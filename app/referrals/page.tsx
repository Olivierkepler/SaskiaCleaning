import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import ReferralPortal from "./ReferralPortal";

export const metadata: Metadata = {
  title: "Referral Portal | Saskia Cleaning Services",
  description:
    "Check your Saskia Cleaning referral code, share your link, and view reward status.",
};

function ReferralPortalFallback({ message }: { message: string }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-6 py-24 sm:px-8 sm:py-28 lg:px-16">
      <div className="relative mx-auto max-w-4xl">
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </main>
  );
}

export default async function ReferralsPage() {
  const t = await getTranslations("referrals");
  return (
    <Suspense fallback={<ReferralPortalFallback message={t("loading")} />}>
      <ReferralPortal />
    </Suspense>
  );
}
