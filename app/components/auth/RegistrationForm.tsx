"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import ResendVerificationForm from "@/app/components/auth/ResendVerificationForm";

export default function RegistrationForm() {
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
          | { error?: string; code?: string }
          | null;
        setError(result?.error ?? "Unable to create account. Please check your details.");
        if (result?.code === "verification_delivery_failed") {
          setResendEmail(String(form.get("email") ?? ""));
        }
        return;
      }
      router.replace("/verify-email");
    } catch {
      setError("Unable to create account right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const fieldClassName =
    "h-[54px] w-full rounded-[14px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-100";
  const labelClassName = "mb-2 block text-[13px] font-semibold text-slate-700";
  const checkClassName =
    "relative mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-slate-300 bg-white transition checked:border-sky-600 checked:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 after:absolute after:left-[6px] after:top-[2px] after:h-[10px] after:w-[6px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:opacity-0 checked:after:opacity-100 after:content-['']";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-first-name" className={labelClassName}>
              First name
            </label>
            <input
              id="register-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              maxLength={60}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="register-last-name" className={labelClassName}>
              Last name
            </label>
            <input
              id="register-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              maxLength={60}
              className={fieldClassName}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className={labelClassName}>
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="register-password" className={labelClassName}>
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={15}
            maxLength={128}
            aria-describedby="password-policy"
            className={fieldClassName}
          />
          <p id="password-policy" className="mt-2 text-xs leading-5 text-slate-500">
            Use 15–128 characters. Passphrases are welcome.
          </p>
        </div>

        <div>
          <label htmlFor="register-confirm-password" className={labelClassName}>
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={15}
            maxLength={128}
            className={fieldClassName}
          />
        </div>

        <div className="space-y-3 rounded-[16px] bg-slate-50/80 px-3 py-3.5 sm:px-4">
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-slate-600">
            <input name="acceptTerms" type="checkbox" required className={checkClassName} />
            <span>
              I agree to the{" "}
              <Link
                href="/terms-and-conditions"
                className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-800 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Terms of Service
              </Link>
              .
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-slate-600">
            <input name="acceptPrivacy" type="checkbox" required className={checkClassName} />
            <span>
              I acknowledge the{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-800 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        {error ? (
          <p role="alert" className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="min-h-14 w-full rounded-[14px] bg-sky-700 px-5 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(3,105,161,0.18)] transition hover:bg-sky-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      {resendEmail ? <ResendVerificationForm initialEmail={resendEmail} compact /> : null}
    </>
  );
}
