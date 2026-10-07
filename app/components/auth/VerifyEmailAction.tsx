"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ResendVerificationForm from "@/app/components/auth/ResendVerificationForm";

export default function VerifyEmailAction() {
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const value = fragment.get("token");
    if (value) setToken(value);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  async function verify() {
    if (!token || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "This verification link is invalid or expired.");
        setToken(null);
        return;
      }
      setVerified(true);
      setToken(null);
    } catch {
      setError("Unable to verify this email right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      {verified ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          Your email is verified. You can now sign in.
        </div>
      ) : token ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-600">Confirm your email address to finish setting up your account.</p>
          <button
            type="button"
            onClick={verify}
            disabled={pending}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Verify email"}
          </button>
        </div>
      ) : (
        <p className="text-sm leading-6 text-slate-600">
          Open the verification link sent to your email. If you need another link, request one below.
        </p>
      )}

      {error ? <p role="alert" className="text-sm leading-6 text-red-700">{error}</p> : null}
      {verified ? (
        <Link href="/login?verified=1" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2">
          Back to sign in
        </Link>
      ) : (
        <ResendVerificationForm />
      )}
    </div>
  );
}
