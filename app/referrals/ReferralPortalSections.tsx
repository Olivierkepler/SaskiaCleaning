"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  ReferralPortalCodeSummary,
  ReferralPortalHistoryItem,
  ReferralPortalMilestones,
  ReferralPortalRewardWallet,
} from "../lib/referral-portal";

function formatMoney(amount: number) {
  return `$${amount}`;
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

function statusBadgeClass(status: ReferralPortalHistoryItem["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "completed":
      return "bg-sky-100 text-sky-800";
    case "rewarded":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-slate-200 text-slate-600";
  }
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}

function WalletCard({
  label,
  value,
  hint,
  accentClassName,
}: {
  label: string;
  value: string;
  hint: string;
  accentClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className={`mb-3 h-1 w-10 rounded-full ${accentClassName}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>
    </div>
  );
}

function TimelineStep({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: number;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center text-center">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-2.5rem)] bg-sky-200 sm:block"
        />
      )}
      <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-500 text-sm font-bold text-white shadow-[0_8px_24px_rgba(14,165,233,0.25)]">
        {value}
      </div>
      <p className="mt-3 max-w-[9rem] text-[11px] font-semibold uppercase leading-snug tracking-[0.14em] text-slate-600">
        {label}
      </p>
    </div>
  );
}

export function ReferralRewardWalletSection({
  wallet,
}: {
  wallet: ReferralPortalRewardWallet;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-500">
          Reward wallet
        </p>
        <h2 className="font-heading mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
          Your referral rewards
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Track pending, available, and paid rewards across your referrals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <WalletCard
          label="Pending rewards"
          value={formatMoney(wallet.pendingRewards)}
          hint="Friend booked, waiting for service completion."
          accentClassName="bg-amber-400"
        />
        <WalletCard
          label="Available rewards"
          value={formatMoney(wallet.availableRewards)}
          hint="Completed referrals ready for reward review."
          accentClassName="bg-sky-500"
        />
        <WalletCard
          label="Paid rewards"
          value={formatMoney(wallet.paidRewards)}
          hint="Rewards already marked paid."
          accentClassName="bg-emerald-500"
        />
        <WalletCard
          label="Lifetime earnings"
          value={formatMoney(wallet.lifetimeEarnings)}
          hint="All rewards earned through referrals."
          accentClassName="bg-slate-900"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-5 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-600">
          Referral progress
        </p>
        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <TimelineStep
            label="Referrals started"
            value={wallet.referralsStarted}
          />
          <TimelineStep
            label="Completed cleanings"
            value={wallet.completedCleanings}
          />
          <TimelineStep
            label="Rewards paid"
            value={wallet.rewardsPaid}
            isLast
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Total referrals
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {wallet.totalReferrals}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Completed referrals
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {wallet.completedReferrals}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Rewarded referrals
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {wallet.rewardedReferrals}
          </p>
        </div>
      </div>
    </section>
  );
}

function MilestoneProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-sky-500 transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function ReferralMilestonesSection({
  milestones,
}: {
  milestones: ReferralPortalMilestones;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-500">
          Milestones
        </p>
        <h2 className="font-heading mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
          Referral Milestones
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Track your progress toward referral milestones based on completed
          cleanings.
        </p>
      </div>

      {milestones.allComplete ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-center sm:px-6">
          <p className="text-sm font-semibold text-emerald-900">
            All milestones complete
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-800">
            You have reached every referral milestone. Thank you for sharing
            Saskia Cleaning.
          </p>
        </div>
      ) : milestones.nextMilestone ? (
        <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-5 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-600">
            Next milestone
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {milestones.nextMilestone.label}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {milestones.nextMilestone.description}
          </p>
          <p className="mt-3 text-sm font-semibold text-sky-700">
            {milestones.nextMilestone.currentProgress} /{" "}
            {milestones.nextMilestone.requiredCompletedReferrals} completed
            cleanings
          </p>
          <MilestoneProgressBar percent={milestones.nextMilestone.progressPercent} />
          <p className="mt-2 text-xs text-slate-500">
            {milestones.nextMilestone.remaining} more completed cleaning
            {milestones.nextMilestone.remaining === 1 ? "" : "s"} to unlock
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {milestones.milestones.map((milestone) => (
          <div
            key={milestone.key}
            className={`rounded-2xl border px-5 py-4 sm:px-6 ${
              milestone.completed
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-950">
                    {milestone.label}
                  </h3>
                  {milestone.completed && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                      Completed
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {milestone.description}
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {milestone.currentProgress} /{" "}
                  {milestone.requiredCompletedReferrals}
                </p>
                <MilestoneProgressBar percent={milestone.progressPercent} />
              </div>
              {milestone.completed && (
                <div
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-lg text-white"
                >
                  ✓
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PortalCodeSection({
  summary,
}: {
  summary: ReferralPortalCodeSummary;
}) {
  const totalReferrals = Object.values(summary.statusCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-500">
            Your referral code
          </p>
          <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            {summary.code}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {summary.isActive ? "Active" : "Inactive"} · {summary.usageCount}{" "}
            use{summary.usageCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={summary.code} label="Copy code" />
          <CopyButton value={summary.referralLink} label="Copy referral link" />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
        <p>
          <span className="font-semibold text-slate-900">Referral link:</span>{" "}
          {summary.referralLink}
        </p>
        <p className="mt-2">
          Earn {formatMoney(summary.rewardAmount)} per completed referral.
          Friends save {formatMoney(summary.friendDiscountAmount)}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total referrals" value={totalReferrals} />
        <MetricCard
          label="Pending rewards"
          value={formatMoney(summary.payoutSummary.pendingRewards)}
        />
        <MetricCard
          label="Earned rewards"
          value={formatMoney(summary.payoutSummary.totalEarned)}
        />
        <MetricCard
          label="Paid rewards"
          value={formatMoney(summary.payoutSummary.totalPaid)}
        />
        <MetricCard
          label="Outstanding rewards"
          value={formatMoney(summary.payoutSummary.outstandingRewards)}
        />
        <MetricCard
          label="Reward amount"
          value={formatMoney(summary.rewardAmount)}
          hint="Per completed referral"
        />
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          Referral status
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["pending", "Pending"],
              ["completed", "Completed"],
              ["rewarded", "Rewarded"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {summary.statusCounts[key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          Referral history
        </h3>
        {summary.referrals.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No referrals yet. Share your link to start earning rewards.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {summary.referrals.map((referral, index) => (
              <div
                key={`${referral.referredLabel}-${referral.createdAt}-${index}`}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {referral.referredLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Referred on {formatDate(referral.createdAt)}
                  </p>
                  {referral.rewardedAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      Rewarded on {formatDate(referral.rewardedAt)}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClass(referral.status)}`}
                >
                  {referral.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PortalLoadingState() {
  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-8">
      <p className="text-sm font-medium text-slate-600">
        Verifying your secure access link...
      </p>
    </div>
  );
}

export function PortalTokenError({ message }: { message: string }) {
  return (
    <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm sm:px-8">
      <p className="text-sm font-medium text-red-800">{message}</p>
      <Link
        href="/referrals"
        className="mt-6 inline-flex rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100"
      >
        Request a new secure access link
      </Link>
    </div>
  );
}
