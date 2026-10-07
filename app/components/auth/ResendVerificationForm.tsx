"use client";

import { useState, type FormEvent } from "react";

export default function ResendVerificationForm({
  initialEmail = "",
  compact = false,
}: {
  initialEmail?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;
      setMessage(
        response.ok
          ? result?.message ?? "If an eligible account exists, a verification email has been sent."
          : result?.error ?? "Unable to process your request right now. Please try again later.",
      );
    } catch {
      setMessage("Unable to process your request right now. Please try again later.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "mt-3 space-y-2" : "mt-6 space-y-3"}>
      {!initialEmail ? (
        <div>
          <label htmlFor="verification-resend-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="verification-resend-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend verification email"}
      </button>
      {message ? <p role="status" className="text-sm leading-6 text-slate-600">{message}</p> : null}
    </form>
  );
}
