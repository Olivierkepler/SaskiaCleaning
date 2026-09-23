"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type StaffGoogleSignInButtonProps = {
  callbackUrl?: string;
  className?: string;
};

export default function StaffGoogleSignInButton({
  callbackUrl = "/staff",
  className = "",
}: StaffGoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const intent = await fetch("/api/staff/auth/intent", { method: "POST" });
      if (!intent.ok) {
        throw new Error("Could not start staff sign-in.");
      }
      await signIn("google", { callbackUrl });
    } catch {
      setError("We couldn't sign you in with Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="Continue with Google"
        className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{loading ? "Connecting…" : "Continue with Google"}</span>
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
