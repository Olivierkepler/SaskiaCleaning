"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  ReferralPortalCodeSummary,
  ReferralPortalHistoryItem,
} from "../lib/referral-portal";

type LookupResponse =
  | { success: true; found: false; message: string }
  | { success: true; found: true; codes: ReferralPortalCodeSummary[] }
  | { error: string };

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

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

function PortalCodeSection({ summary }: { summary: ReferralPortalCodeSummary }) {
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

export default function ReferralPortal() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [results, setResults] = useState<ReferralPortalCodeSummary[] | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmptyMessage(null);
    setResults(null);

    try {
      const response = await fetch("/api/referrals/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: code.trim() || undefined,
        }),
      });

      const data = (await response.json()) as LookupResponse;

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Lookup failed.");
      }

      if (!("found" in data) || !data.found) {
        setEmptyMessage(
          "message" in data ? data.message : "No referral codes found.",
        );
        return;
      }

      setResults(data.codes);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Failed to look up referral status.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-6 py-24 sm:px-8 sm:py-28 lg:px-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-500 transition hover:text-sky-600"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-500">
          Referral portal
        </p>

        <h1 className="font-heading mt-4 text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950">
          Check your referral rewards
        </h1>

        <p className="mt-5 max-w-2xl text-[15px] leading-8 text-slate-600">
          Enter the email address linked to your referral code to view your
          link, referral activity, and reward status.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="referral-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Email address
              </label>
              <input
                id="referral-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="referral-code"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Referral code (optional)
              </label>
              <input
                id="referral-code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="BARBARA20"
                className={inputClassName}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Looking up..." : "View my referrals"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {emptyMessage && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            {emptyMessage}
          </div>
        )}

        {results && (
          <div className="mt-8 space-y-6">
            {results.map((summary) => (
              <PortalCodeSection key={summary.code} summary={summary} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
