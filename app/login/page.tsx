import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";
import LanguageSwitcher from "@/app/components/i18n/LanguageSwitcher";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const session = await auth();
  const t = await getTranslations("login");

  if (session?.user?.id) {
    redirect("/account");
  }

  const params = await searchParams;
  const errorKey = params.error ?? "";

  const errorMessage =
    errorKey === "Configuration"
      ? t("errorConfiguration")
      : errorKey === "unverified_email"
        ? t("errorUnverified")
        : errorKey
          ? t("errorAccessDenied")
          : null;

  return (
    <main className="min-h-screen bg-[#ffffff] p-3 sm:p-5 lg:p-7">
      <div
        className="
          mx-auto
          grid
          min-h-[calc(100vh-1.5rem)]
          w-full
          max-w-[1500px]
          overflow-hidden
          rounded-[30px]
          bg-[#ECF0F3]
          shadow-[14px_14px_32px_rgba(163,177,198,0.42),-14px_-14px_32px_rgba(255,255,255,0.95)]
          sm:min-h-[calc(100vh-2.5rem)]
          lg:grid-cols-2
        "
      >
        {/* Left image */}
        <section className="relative hidden min-h-full overflow-hidden lg:block">
          <Image
            src="/login/loginimage.png"

            
            alt="Bright Saskia Cleaning interior"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />

          {/* Very soft transition into the right panel */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-y-0
              right-0
              w-24
              bg-gradient-to-r
              from-transparent
              to-white/10
            "
          />
        </section>

        {/* Right login panel */}
        <section className="relative flex min-h-[calc(100vh-1.5rem)] items-center justify-center overflow-hidden px-5 py-12 sm:min-h-[calc(100vh-2.5rem)] sm:px-10 lg:min-h-full lg:px-12 xl:px-16">
          {/* Right background image */}
          <Image
            src="/login/loginleft.png"

            alt=""
            fill
            priority
            sizes="50vw"
            aria-hidden="true"
            className="object-cover object-center"
          />





          {/* Subtle readability layer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white/18"
          />

          <div className="relative z-10 w-full max-w-[520px]">
            <div className="mb-6 flex justify-end">
              <LanguageSwitcher />
            </div>

            {/* Mobile brand */}
            <Link
              href="/"
              aria-label={t("homeAria")}
              className="
                mb-10
                inline-block
                rounded-[16px]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-300
                lg:hidden
              "
            >
              <p className="text-2xl font-semibold tracking-[-0.035em] text-sky-600">
                Saskia
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                {t("brandTagline")}
              </p>
            </Link>

            

            {/* Intro */}
            <div className="mb-9">
              {/* <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.24em]
                  text-sky-500
                "
              >
                Welcome back
              </p> */}


            {/* Back home */}
            <div className="mt-8 flex justify-start">
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-500
                  transition
                  hover:text-sky-600
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-sky-300
                "
              >
                <span aria-hidden="true">←</span>
                {t("backToHome")}
              </Link>
            </div>

              <h1
                className="
                  mt-3
                  text-[34px]
                  font-semibold
                  tracking-[-0.045em]
                  text-slate-950
                  sm:text-[42px]
                "
              >
                {t("signInTitle")}
              </h1>

              <p
                className="
                  mt-4
                  max-w-md
                  text-[15px]
                  leading-7
                  text-slate-600
                "
              >
                {t("description")}
              </p>
            </div>

            {/* Login card */}
            <div
              className="
                rounded-[28px]
                bg-[#ECF0F3]/88
                p-6
                backdrop-blur-[2px]
                shadow-[10px_10px_24px_rgba(163,177,198,0.40),-10px_-10px_24px_rgba(255,255,255,0.95)]
                sm:p-8
              "
            >
              {errorMessage ? (
                <div
                  role="alert"
                  className="
                    mb-6
                    rounded-[16px]
                    border
                    border-red-200/70
                    bg-red-50
                    px-4
                    py-3.5
                    text-sm
                    leading-6
                    text-red-700
                  "
                >
                  {errorMessage}
                </div>
              ) : null}

              <GoogleSignInButton callbackUrl="/account" />

              <div className="mt-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-300/70" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("secureSignIn")}
                </span>

                <div className="h-px flex-1 bg-slate-300/70" />
              </div>

              <p
                className="
                  mx-auto
                  mt-6
                  max-w-sm
                  text-center
                  text-xs
                  leading-6
                  text-slate-500
                "
              >
                {t("privacyNote")}
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}