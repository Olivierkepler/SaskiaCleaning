import {
  BadgeDollarSign,
  CircleDollarSign,
  Clock3,
  Gift,
  UsersRound,
  Wallet,
} from "lucide-react";
import type {
  ReferralPortalCodeSummary,
  ReferralPortalRewardWallet,
} from "@/app/lib/referral-portal";
import { CopyButton } from "@/app/referrals/ReferralPortalSections";
import ExpandableList from "./ExpandableList";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function MetricCard({
  label,
  value,
  hint,
  Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  Icon: typeof UsersRound;
}) {
  return (
    <div className="min-w-0 px-3 py-2 sm:px-4">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-slate-950">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function statusClass(status: ReferralPortalCodeSummary["referrals"][number]["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "completed":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "rewarded":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "cancelled":
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export default function ReferralAccountDashboard({
  codes,
  wallet,
}: {
  codes: ReferralPortalCodeSummary[];
  wallet: ReferralPortalRewardWallet;
}) {
  const primaryCode = codes.find((code) => code.isActive) ?? codes[0];
  const otherCodes = primaryCode
    ? codes.filter((code) => code !== primaryCode)
    : [];
  const history = codes
    .flatMap((code) =>
      code.referrals.map((referral, index) => ({
        ...referral,
        code: code.code,
        key: `${code.code}-${referral.createdAt}-${index}`,
      })),
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );

  const metrics = [
    { label: "Total Referrals", value: wallet.totalReferrals, Icon: UsersRound },
    {
      label: "Pending Rewards",
      value: formatMoney(wallet.pendingRewards),
      Icon: Clock3,
    },
    {
      label: "Earned Rewards",
      value: formatMoney(wallet.lifetimeEarnings),
      Icon: Gift,
    },
    {
      label: "Paid Rewards",
      value: formatMoney(wallet.paidRewards),
      Icon: BadgeDollarSign,
    },
    {
      label: "Outstanding Rewards",
      value: formatMoney(wallet.outstandingRewards),
      Icon: Wallet,
    },
    {
      label: "Reward Amount",
      value: primaryCode ? formatMoney(primaryCode.rewardAmount) : "—",
      hint: "Per completed referral",
      Icon: CircleDollarSign,
    },
  ];

  return (
    <div className="space-y-8">
      <section aria-labelledby="referral-overview-heading">
        <div className="mb-4">
          <h2
            id="referral-overview-heading"
            className="text-lg font-bold tracking-tight text-slate-950"
          >
            Referral Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your referral activity and rewards across all your codes.
          </p>
        </div>
        <div className="rounded-[24px] border border-sky-100 bg-[#F7FBFF] p-3 shadow-[0_5px_18px_rgba(15,65,100,0.06)] sm:p-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-5">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      {primaryCode ? (
        <section
          aria-labelledby="primary-referral-code-heading"
          className="rounded-[24px] border border-sky-100 bg-white p-5 shadow-[0_6px_20px_rgba(15,65,100,0.06)] sm:p-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">
            Primary Referral Code
          </p>
          <div className="mt-4 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Your referral code
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h3
                  id="primary-referral-code-heading"
                  className="break-all text-2xl font-bold tracking-[0.04em] text-slate-950 sm:text-3xl"
                >
                  {primaryCode.code}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    primaryCode.isActive
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
                      primaryCode.isActive ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  {primaryCode.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {primaryCode.usageCount} use
                {primaryCode.usageCount === 1 ? "" : "s"} · Created{" "}
                {formatDate(primaryCode.createdAt)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Referral link
              </p>
              <p className="mt-2 break-all rounded-xl bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
                {primaryCode.referralLink}
              </p>
              <p className="mt-2 text-sm leading-5 text-slate-600">
                Earn {formatMoney(primaryCode.rewardAmount)} per completed
                referral. Friends save{" "}
                {formatMoney(primaryCode.friendDiscountAmount)}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton value={primaryCode.code} label="Copy code" />
                <CopyButton
                  value={primaryCode.referralLink}
                  label="Copy referral link"
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {otherCodes.length > 0 ? (
        <section aria-labelledby="other-referral-codes-heading">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="other-referral-codes-heading"
              className="text-lg font-bold tracking-tight text-slate-950"
            >
              Other Referral Codes ({otherCodes.length})
            </h2>
          </div>
          <ExpandableList
            ariaLabel="Other referral codes"
            className="space-y-2"
            items={otherCodes.map((code) => (
              <li
                key={code.code}
                className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_3px_12px_rgba(15,65,100,0.04)] lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="break-all font-bold tracking-wide text-slate-900">
                    {code.code}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      code.isActive ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        code.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {code.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {code.usageCount} use{code.usageCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs text-slate-500">
                    Created {formatDate(code.createdAt)}
                  </span>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CopyButton value={code.code} label="Copy code" />
                  <CopyButton value={code.referralLink} label="Copy link" />
                </div>
              </li>
            ))}
          />
        </section>
      ) : null}

      <section aria-labelledby="referral-history-heading">
        <div className="mb-4">
          <h2
            id="referral-history-heading"
            className="text-lg font-bold tracking-tight text-slate-950"
          >
            Referral History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Updates from people who used your referral codes.
          </p>
        </div>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center">
            <p className="font-semibold text-slate-900">No referrals yet.</p>
            <p className="mt-1 text-sm text-slate-600">
              Share your link to start earning rewards.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 hidden rounded-t-xl bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.7fr)_minmax(0,0.55fr)_minmax(0,1.2fr)] md:gap-3">
              <span>Date</span>
              <span>Referred Person</span>
              <span>Status</span>
              <span>Reward</span>
              <span>Notes</span>
            </div>
            <ExpandableList
              ariaLabel="Referral history"
              className="space-y-2"
              items={history.map((referral) => (
                <li
                  key={referral.key}
                  className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.7fr)_minmax(0,0.55fr)_minmax(0,1.2fr)] md:items-center md:gap-3"
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Date
                    </span>
                    <span className="text-slate-600">
                      {formatDate(referral.createdAt)}
                    </span>
                  </div>
                  <div className="col-span-2 min-w-0 md:col-span-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Referred Person
                    </span>
                    <span className="break-words font-medium text-slate-900">
                      {referral.referredLabel}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Status
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(referral.status)}`}
                    >
                      {referral.status}
                    </span>
                  </div>
                  <div className="min-w-0 text-right md:text-left">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Reward
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {formatMoney(
                        referral.status === "rewarded"
                          ? referral.payoutAmount ?? referral.rewardAmount
                          : referral.rewardAmount,
                      )}
                    </span>
                  </div>
                  <div className="col-span-2 min-w-0 border-t border-slate-100 pt-2 text-xs leading-5 text-slate-500 md:col-span-1 md:border-0 md:pt-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                      Notes
                    </span>
                    {referral.rewardedAt
                      ? `Rewarded ${formatDate(referral.rewardedAt)}${referral.payoutMethod ? ` · ${referral.payoutMethod}` : ""}`
                      : `Code ${referral.code}`}
                  </div>
                </li>
              ))}
            />
          </>
        )}
      </section>
    </div>
  );
}
