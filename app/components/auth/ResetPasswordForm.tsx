"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

export default function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const value = fragment.get("token");
    if (value) setToken(value);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || pending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const result = await response.json().catch(() => null) as { success?: boolean; error?: string } | null;
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "This password reset link is invalid or has expired.");
        setToken(null);
        return;
      }
      setSuccess(true);
      setToken(null);
      formElement.reset();
    } catch {
      setError("Unable to reset your password right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">Password updated successfully.</p>
        <Link href="/login?passwordReset=1" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2">Sign in</Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <p role="status" className="text-sm leading-6 text-slate-600">This password reset link is invalid or has expired. You can request another link.</p>
        <Link href="/forgot-password" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2">Request a new reset link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-new-password" className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
        <input id="reset-new-password" name="password" type="password" autoComplete="new-password" required minLength={15} maxLength={128} aria-describedby="reset-password-policy" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
        <p id="reset-password-policy" className="mt-1.5 text-xs text-slate-500">Use 15–128 characters. Passphrases are welcome.</p>
      </div>
      <div>
        <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm new password</label>
        <input id="reset-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={15} maxLength={128} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
      </div>
      {error ? <p role="alert" className="text-sm leading-6 text-red-700">{error}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Updating password…" : "Reset password"}</button>
    </form>
  );
}
