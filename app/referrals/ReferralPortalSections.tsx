"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  ReferralPortalCodeSummary,
  ReferralPortalHistoryItem,
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
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
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
