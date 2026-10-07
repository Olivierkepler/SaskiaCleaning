"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import AccountOverviewCard from "@/app/components/account/AccountOverviewCard";

export default function AccountReferralShare({
  code,
  link,
  failed,
}: {
  code: string | null;
  link: string | null;
  failed: boolean;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <AccountOverviewCard title="Share & Earn" icon={<Link2 className="h-5 w-5" />}>
      {failed ? (
        <p role="status" className="text-sm text-slate-600">Your referral details are temporarily unavailable.</p>
      ) : code && link ? (
        <>
          <p className="text-sm text-slate-600">Share your referral code with a friend.</p>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm font-semibold tracking-wide text-slate-900">{code}</p>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <a href={link} className="min-w-0 flex-1 break-all text-xs text-sky-700 underline decoration-sky-200 underline-offset-2" target="_blank" rel="noreferrer">{link}</a>
            <button type="button" onClick={() => void copyLink()} aria-label="Copy referral link" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              <span>{copyState === "copied" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {copyState === "copied" ? "Referral link copied." : copyState === "error" ? "Could not copy referral link." : ""}
          </p>
        </>
      ) : (
        <div>
          <p className="font-medium text-slate-800">Your referral code isn&apos;t available yet.</p>
          <p className="mt-1 text-sm text-slate-500">Visit referrals to see your account activity.</p>
        </div>
      )}
      <Link href="/account/referrals" className="mt-5 inline-flex min-h-10 items-center text-sm font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
        View referrals <span className="ml-1" aria-hidden="true">→</span>
      </Link>
    </AccountOverviewCard>
  );
}
