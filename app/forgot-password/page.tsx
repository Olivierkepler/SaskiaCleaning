import Image from "next/image";
import Link from "next/link";

import PasswordResetRequestForm from "@/app/components/auth/PasswordResetRequestForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] p-2.5 sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.25rem)] w-full max-w-[1500px] overflow-hidden rounded-[26px] bg-[#f3f7fb] shadow-[0_24px_80px_rgba(31,56,84,0.12)] sm:min-h-[calc(100vh-2rem)] sm:rounded-[30px] lg:min-h-[calc(100vh-3rem)] md:grid-cols-[54%_46%] lg:grid-cols-[52%_48%]">
        <section className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-8 sm:px-7 sm:py-10 md:px-5 lg:px-8 lg:py-12 xl:px-12">
          <Image
            src="/images/forgot-password/forgotpasswordLeft.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 54vw"
            aria-hidden="true"
            className="pointer-events-none object-cover object-center"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/40" />

          <div className="relative z-10 w-full max-w-[560px]">
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-slate-600 transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true" className="text-base">←</span>
              Back to sign in
            </Link>

            <header className="mb-6 mt-5 sm:mb-7 sm:mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">Account access</p>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.045em] text-slate-950 sm:text-[40px]">
                Forgot your password?
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-7 text-slate-600">
                Enter the email address for your account. If it is eligible, we’ll send a secure reset link.
              </p>
            </header>

            <div className="rounded-[24px] bg-white/90 p-5 shadow-[0_14px_40px_rgba(38,66,95,0.10)] backdrop-blur-[2px] sm:p-7">
              <PasswordResetRequestForm />
            </div>

            <p className="mt-6 px-2 text-center text-sm leading-6 text-slate-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="rounded-sm font-semibold text-sky-700 underline-offset-4 transition hover:text-sky-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="relative hidden min-h-full overflow-hidden md:block" aria-label="A calm, refreshed home">
          <Image
            src="/images/forgot-password/forgotpasswordRight.png"
            alt="A bright, welcoming home interior"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 46vw"
            className="object-cover object-center"
          />
        </section>
      </div>
    </main>
  );
}
