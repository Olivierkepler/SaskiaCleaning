import Image from "next/image";
import Link from "next/link";

import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";
import RegistrationForm from "@/app/components/auth/RegistrationForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] p-2.5 sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.25rem)] w-full max-w-[1500px] overflow-hidden rounded-[26px] bg-[#f3f7fb] shadow-[0_24px_80px_rgba(31,56,84,0.12)] sm:min-h-[calc(100vh-2rem)] sm:rounded-[30px] lg:min-h-[calc(100vh-3rem)] md:grid-cols-[40%_60%] lg:grid-cols-[45%_55%] xl:grid-cols-[48%_52%]">
        <section className="relative hidden min-h-full overflow-hidden md:block" aria-label="A bright, welcoming Saskia home">
          <Image
            src="/images/register/resigerleft.png"
            alt="A bright, serene home interior prepared for a fresh start"
            fill
            priority
            sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 45vw, 40vw"
            className="object-cover object-center"
          />
        </section>

        <section className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-8 sm:px-7 sm:py-10 md:px-6 lg:px-8 lg:py-12 xl:px-12">
          <Image
            src="/images/register/registerright.png"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 60vw, 100vw"
            aria-hidden="true"
            className="pointer-events-none object-cover object-center"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/35" />

          <div className="relative z-10 w-full max-w-[560px]">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-slate-600 transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true" className="text-base">←</span>
              Back to home
            </Link>

            <header className="mb-6 mt-5 sm:mb-7 sm:mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700">Saskia Cleaning</p>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.045em] text-slate-950 sm:text-[40px]">
                Create your account
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-7 text-slate-600">
                Create an account to manage your bookings and referral rewards.
              </p>
            </header>

            <div className="rounded-[24px] bg-white/90 p-5 shadow-[0_14px_40px_rgba(38,66,95,0.10)] backdrop-blur-[2px] sm:p-7">
              <RegistrationForm />

              <div className="my-6 flex items-center gap-3 sm:my-7">
                <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Or continue with
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-slate-200" />
              </div>

              <GoogleSignInButton callbackUrl="/account" buttonAppearance="registration" />

              <p className="mt-6 text-center text-sm leading-6 text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="rounded-sm font-semibold text-sky-700 underline-offset-4 transition hover:text-sky-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-5 px-2 text-center text-xs leading-5 text-slate-500">
              Your details are used to manage your Saskia Cleaning account and bookings.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
