"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ReferralPortalTokenLoader } from "./ReferralPortalTokenLoader";

const GENERIC_LOOKUP_MESSAGE =
  "If referral rewards exist for that email, we sent a secure access link.";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

type LookupResponse =
  | { success: true; message: string }
  | { error: string };

export default function ReferralPortal() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

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
        throw new Error("error" in data ? data.error : "Request failed.");
      }

      setSubmitSuccess(
        "message" in data ? data.message : GENERIC_LOOKUP_MESSAGE,
      );
    } catch (lookupError) {
      setSubmitError(
        lookupError instanceof Error
          ? lookupError.message
          : "Failed to process referral portal request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const showRequestForm = !token && !submitSuccess;

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
          Enter the email address linked to your referral code. We will email you
          a secure access link to view your referral activity and reward status.
        </p>

        {showRequestForm && (
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
              disabled={isSubmitting}
              className="mt-6 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Sending link..." : "Send secure access link"}
            </button>
          </form>
        )}

        {submitError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center sm:px-8">
            <p className="text-sm font-medium leading-7 text-emerald-900">
              {submitSuccess}
            </p>
            <p className="mt-3 text-sm leading-7 text-emerald-800">
              Check your email for a secure link. The link expires in 30 minutes.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(null);
                setEmail("");
                setCode("");
              }}
              className="mt-6 rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Request another link
            </button>
          </div>
        )}

        {token ? <ReferralPortalTokenLoader token={token} /> : null}
      </div>
    </main>
  );
}
