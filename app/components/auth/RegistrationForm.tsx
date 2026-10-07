"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function RegistrationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
          acceptTerms: form.get("acceptTerms") === "on",
          acceptPrivacy: form.get("acceptPrivacy") === "on",
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(result?.error ?? "Unable to create account. Please check your details.");
        return;
      }
      router.replace("/login?registered=1");
    } catch {
      setError("Unable to create account right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="register-first-name" className="mb-1.5 block text-sm font-medium text-slate-700">First name</label>
          <input id="register-first-name" name="firstName" type="text" autoComplete="given-name" required maxLength={60} className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
        </div>
        <div>
          <label htmlFor="register-last-name" className="mb-1.5 block text-sm font-medium text-slate-700">Last name</label>
          <input id="register-last-name" name="lastName" type="text" autoComplete="family-name" required maxLength={60} className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
        </div>
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <input id="register-email" name="email" type="email" autoComplete="email" required maxLength={254} className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
        <input id="register-password" name="password" type="password" autoComplete="new-password" required minLength={15} maxLength={128} aria-describedby="password-policy" className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
        <p id="password-policy" className="mt-1.5 text-xs text-slate-500">Use 15–128 characters. Passphrases are welcome.</p>
      </div>
      <div>
        <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
        <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={15} maxLength={128} className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input name="acceptTerms" type="checkbox" required className="mt-1 size-4 accent-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" />
        <span>I agree to the <Link href="/terms-and-conditions" className="text-sky-700 underline underline-offset-2">Terms &amp; Conditions</Link>.</span>
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input name="acceptPrivacy" type="checkbox" required className="mt-1 size-4 accent-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300" />
        <span>I acknowledge the <Link href="/privacy-policy" className="text-sky-700 underline underline-offset-2">Privacy Policy</Link>.</span>
      </label>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
