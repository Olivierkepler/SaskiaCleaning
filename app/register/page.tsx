import Image from "next/image";
import Link from "next/link";

import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";
import RegistrationForm from "@/app/components/auth/RegistrationForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fc] p-2.5 sm:p-4 lg:p-6">
      <div
        className="
          mx-auto
          grid
          min-h-[calc(100vh-1.25rem)]
          w-full
          max-w-[1540px]
          overflow-hidden
          rounded-[28px]
          bg-white
          shadow-[0_28px_90px_rgba(30,55,85,0.13)]
          sm:min-h-[calc(100vh-2rem)]
          sm:rounded-[32px]
          lg:min-h-[calc(100vh-3rem)]
          md:grid-cols-[41%_59%]
          lg:grid-cols-[45%_55%]
          xl:grid-cols-[48%_52%]
        "
      >
        {/* Left lifestyle image */}
        <section
          className="relative hidden min-h-full overflow-hidden md:block"
          aria-label="A bright, welcoming Saskia home"
        >
          <Image
            src="/images/register/resigerleft.png"
            alt="A bright, serene home interior prepared for a fresh start"
            fill
            priority
            sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 45vw, 41vw"
            className="object-cover object-center"
          />


          {/* Subtle cinematic depth */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.00)_52%,rgba(15,23,42,0.16)_100%)]
            "
          />

          {/* Soft edge blend toward form */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-y-0
              right-0
              w-24
              bg-gradient-to-l
              from-white/10
              to-transparent
            "
          />
        </section>

        {/* Right registration area */}
        <section
          className="
            relative
            flex
            min-h-full
            items-center
            justify-center
            overflow-hidden
            px-4
            py-7
            sm:px-7
            sm:py-9
            md:px-7
            lg:px-10
            lg:py-12
            xl:px-14
          "
        >
          {/* Decorative background */}
          <Image
            src="/images/register/registerright.png"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 59vw, 100vw"
            aria-hidden="true"
            className="pointer-events-none object-cover object-center"
          />

          {/* Readability layer */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(248,252,255,0.72)_45%,rgba(255,255,255,0.58)_100%)]
            "
          />

          {/* Decorative ambient glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-sky-100/35
              blur-3xl
            "
          />

          <div className="relative z-10 w-full max-w-[565px]">
            {/* Brand / home link */}
            <div className="mb-5 flex items-center justify-start sm:mb-6">
              <Link
                href="/"
                aria-label="Back to Saskia home"
                className="
                  inline-flex
                  items-center
                  rounded-xl
                  px-1
                  py-1
                  transition
                  duration-200
                  hover:opacity-80
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-sky-300
                  focus-visible:ring-offset-2
                "
              >
                <Image
                  src="/images/logoSaskia.png"
                  alt="Saskia"
                  width={108}
                  height={108}
                  priority
                  className="h-auto w-[96px] sm:w-[108px]"
                />
              </Link>
            </div>

            {/* Main form surface */}
            <div
              className="
                rounded-[18px]
                bg-[#ECF0F3]/30
                p-6
                backdrop-blur-[2px]
                shadow-[6px_6px_16px_rgba(163,177,198,0.30),-6px_-6px_16px_rgba(255,255,255,0.90)]
                sm:p-8
              "
            >
              <RegistrationForm />

              {/* Divider */}
              <div className="my-6 flex items-center gap-4 sm:my-7">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-slate-200"
                />

                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Or continue with
                </span>

                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-slate-200"
                />
              </div>

              <GoogleSignInButton
                callbackUrl="/account"
                buttonAppearance="registration"
              />

              {/* Sign in */}
              <p className="mt-6 text-center text-sm leading-6 text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="
                    rounded-sm
                    font-semibold
                    text-sky-700
                    underline-offset-4
                    transition-colors
                    duration-200
                    hover:text-sky-800
                    hover:underline
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-sky-300
                  "
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Privacy / account note */}
            <p className="mx-auto mt-5 max-w-md px-4 text-center text-[12px] leading-5 text-slate-500">
              Your details are used securely to manage your Saskia Cleaning
              account and bookings.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
