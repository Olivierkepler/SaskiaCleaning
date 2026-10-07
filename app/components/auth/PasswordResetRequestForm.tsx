"use client";

import { useState, type FormEvent } from "react";

const GENERIC_SUCCESS = "If an eligible account exists, check your email for password reset instructions.";

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.status === 202) {
        setMessage(GENERIC_SUCCESS);
      } else if (response.status === 429) {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Unable to process your request right now. Please try again later.");
      }
    } catch {
      setError("Unable to process your request right now. Please try again later.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="password-reset-email" className="mb-2 block text-[13px] font-semibold text-slate-700">
          Email
        </label>
        <input
          id="password-reset-email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-[54px] w-full rounded-[14px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-100"
        />
      </div>
      {message ? <p role="status" className="rounded-[12px] border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700">{message}</p> : null}
      {error ? <p role="alert" className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="min-h-14 w-full rounded-[14px] bg-sky-700 px-5 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(3,105,161,0.18)] transition hover:bg-sky-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
