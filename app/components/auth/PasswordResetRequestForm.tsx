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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password-reset-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <input
          id="password-reset-email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200"
        />
      </div>
      {message ? <p role="status" className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700">{message}</p> : null}
      {error ? <p role="alert" className="text-sm leading-6 text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
