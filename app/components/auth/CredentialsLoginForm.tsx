"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import ResendVerificationForm from "@/app/components/auth/ResendVerificationForm";

export default function CredentialsLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResendEmail("");
    setPending(true);
    const form = new FormData(event.currentTarget);

    try {
      const email = String(form.get("email") ?? "");
      const result = await signIn("credentials", {
        email,
        password: String(form.get("password") ?? ""),
        callbackUrl: "/account",
        redirect: false,
      });
      if (!result || result.error) {
        if (result?.code === "email_not_verified") {
          setError("Please verify your email before signing in.");
          setResendEmail(email);
          return;
        }
        setError(
          result?.code === "try_again_later"
            ? "Too many attempts. Please try again later."
            : "Invalid email or password.",
        );
        return;
      }
      router.replace(result.url || "/account");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200"
          />
        </div>
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {resendEmail ? <ResendVerificationForm initialEmail={resendEmail} compact /> : null}
    </>
  );
}
