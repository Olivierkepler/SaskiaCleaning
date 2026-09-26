"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer
      data-native-cursor
      className="
        relative
        overflow-hidden
        bg-gradient-to-b
        from-sky-50/80
        via-white
        to-slate-50
        px-5
        pb-8
        pt-28
        sm:px-8
        sm:pt-36
        lg:px-16
        lg:pt-40
      "
    >
      {/* Top curve */}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block h-[80px] w-[calc(100%+1.3px)] sm:h-[100px]"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39 56.44C197.8 89.92 0 120 0 120V0h1200v27.35c-86.91 25.8-208.8 58.23-348.84 62.15-147.19 4.14-243.45-23.08-358.66-35.71-87.53-9.61-172.8-3.2-271.11 2.65Z"
            className="fill-white"
          />
        </svg>
      </div>

      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[30rem]
          w-[72rem]
          -translate-x-1/2
          rounded-full
          bg-sky-100/45
          blur-[90px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-24
          right-[-8rem]
          h-[22rem]
          w-[22rem]
          rounded-full
          bg-sky-50
          blur-[80px]
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Main footer content */}
        <div
          className="
            mb-12
            grid
            gap-10
            sm:gap-12
            lg:mb-16
            xl:grid-cols-12
            xl:gap-12
          "
        >
          {/* Brand / statement */}
          <div className="max-w-xl xl:col-span-4">
            <div
              aria-hidden="true"
              className="mb-5 h-[3px] w-10 rounded-full bg-sky-500"
            />

            <h2
              className="
                font-heading
                text-[clamp(2.35rem,4vw,3rem)]
                font-semibold
                leading-[1.1]
                tracking-[-0.045em]
                text-slate-950
              "
            >
              {t("headline")}{" "}
              <span className="font-light italic text-sky-700">
                {t("headlineAccent")}
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-lg
                text-[15px]
                leading-7
                text-slate-600
                sm:text-[16px]
              "
            >
              {t("body")}
            </p>
          </div>

          {/* Footer columns */}
          <div
            className="
              grid
              min-w-0
              grid-cols-2
              gap-x-6
              gap-y-8
              border-t
              border-slate-200/80
              pt-8
              sm:grid-cols-[1.4fr_1fr_1fr]
              sm:gap-8
              xl:col-span-8
              xl:border-t-0
              xl:pt-2
            "
          >
            <FooterColumn title={t("contact")} className="col-span-2 sm:col-span-1">
              <FooterLink href="tel:+18573528554">
                857 352 8554
              </FooterLink>

              <FooterLink href="mailto:cleaningsaskia@gmail.com">
                cleaningsaskia@gmail.com
              </FooterLink>

              <FooterLink
                href="https://saskiaservices.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                SaskiaServices.com
              </FooterLink>
            </FooterColumn>

            <FooterColumn title={t("services")}>
              <FooterText>{t("deepCleaning")}</FooterText>
              <FooterText>{t("recurringService")}</FooterText>
              <FooterText>{t("moveInOut")}</FooterText>
              <FooterText>{t("commercialCleaning")}</FooterText>
            </FooterColumn>

            <FooterColumn title={t("area")}>
              <FooterText>{t("boston")}</FooterText>
              <FooterText>{t("massachusetts")}</FooterText>
              <FooterText>{t("unitedStates")}</FooterText>
            </FooterColumn>
          </div>
        </div>

        {/* Bottom row */}
        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-slate-200/80
            pt-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <p
            className="
              text-center
              text-xs
              leading-6
              font-medium
              text-slate-600
              lg:text-left
            "
          >
            {t("copyright")}
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-1
              lg:justify-end
            "
          >
            <FooterBottomLink href="/privacy-policy">
              {t("privacy")}
            </FooterBottomLink>

            <FooterBottomLink href="/terms-and-conditions">
              {t("terms")}
            </FooterBottomLink>

            <FooterBottomLink href="/referrals">
              {t("referralRewards")}
            </FooterBottomLink>

            <span
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-slate-600
                w-full
                text-center
                sm:w-auto
              "
            >
              {t("bostonArea")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
  className = "",
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col items-start gap-2 ${className}`}>
      <h3
        className="
          mb-3
          text-[11px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-slate-950
        "
      >
        {title}
      </h3>

      {children}
    </div>
  );
}

function FooterLink({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className="
        group
        relative
        flex
        min-h-11
        max-w-full
        items-center
        rounded-sm
        [overflow-wrap:anywhere]
        text-sm
        leading-6
        text-slate-600
        transition-colors
        duration-300
        motion-reduce:transition-none
        hover:text-sky-700
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-sky-600
        focus-visible:ring-offset-2
      "
    >
      <span className="relative">
        {children}

        <span
          aria-hidden="true"
          className="
            absolute
            -bottom-1
            left-0
            h-px
            w-full
            origin-left
            scale-x-0
            bg-sky-500
            transition-transform
            duration-300
            group-hover:scale-x-100
            group-focus-visible:scale-x-100
            motion-reduce:transition-none
          "
        />
      </span>
    </a>
  );
}

function FooterBottomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        inline-flex
        min-h-11
        items-center
        rounded-sm
        text-xs
        font-medium
        leading-5
        hover:underline
        underline-offset-4
        text-slate-600
        transition-colors
        duration-300
        motion-reduce:transition-none
        hover:text-sky-700
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-sky-600
        focus-visible:ring-offset-2
      "
    >
      {children}
    </Link>
  );
}

function FooterText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="
        text-sm
        leading-6
        text-slate-600
      "
    >
      {children}
    </span>
  );
}
