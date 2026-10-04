import Link from "next/link";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerReferralAccountData } from "@/app/lib/customer-referral-account";
import AccountHero from "@/app/components/account/AccountHero";
import { PortalCodeSection } from "@/app/referrals/ReferralPortalSections";
import type { ReferralStatus } from "@/app/lib/referrals";

const statusLabels: Array<[ReferralStatus, string]> = [
  ["pending", "Pending"],
  ["completed", "Completed"],
  ["rewarded", "Rewarded"],
  ["cancelled", "Cancelled"],
];

function AccountEmptyState() {
  return (
    <div className="rounded-[24px] bg-[#ECF0F3] p-6 text-center shadow-[inset_5px_5px_12px_rgba(163,177,198,0.30),inset_-5px_-5px_12px_rgba(255,255,255,0.95)] sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">
        You don&apos;t have a referral code yet.
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Create one from the Refer Now card on the Saskia homepage. When you are
        signed in, the new code will be linked to your account automatically.
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

export default async function AccountReferralsPage() {
  const customer = await requireCustomer("/login");
  const data = await getCustomerReferralAccountData(customer);

  const codes = data.found ? data.codes : [];
  const totals = codes.reduce(
    (result, code) => {
      for (const [status] of statusLabels) {
        result[status] += code.statusCounts[status];
      }
      return result;
    },
    { pending: 0, completed: 0, rewarded: 0, cancelled: 0 },
  );

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title="Referrals"
        description="Track referrals and share your rewards link."
        imageSrc="/account/referal.png"
        imageAlt="Bright kitchen with greenery and referral-ready home setting"
      />

      <section className="space-y-6 rounded-[28px] bg-[#ECF0F3] p-6 shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)] md:p-10">
        {!codes.length ? (
          <AccountEmptyState />
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Referral activity
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Your codes are listed newest first. All codes linked to your
                account are included below.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] bg-[#ECF0F3] p-4 shadow-[8px_8px_18px_rgba(163,177,198,0.38),-8px_-8px_18px_rgba(255,255,255,0.9)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total referrals
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {Object.values(totals).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
              {statusLabels.map(([status, label]) => (
                <div
                  key={status}
                  className="rounded-[20px] bg-[#ECF0F3] p-4 shadow-[8px_8px_18px_rgba(163,177,198,0.38),-8px_-8px_18px_rgba(255,255,255,0.9)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {totals[status]}
                  </p>
                </div>
              ))}
            </div>

            {codes.map((code) => (
              <PortalCodeSection key={code.code} summary={code} />
            ))}
          </>
        )}
      </section>
    </>
  );
}
