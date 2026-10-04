import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.referral");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ReferralTermsPage() {
  const t = await getTranslations("legal");
  const tr = await getTranslations("legal.referral");

  const sections = Array.from({ length: 15 }, (_, index) => index + 1);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-6 py-24 sm:px-8 sm:py-28 lg:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600 transition hover:text-sky-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-4"
        >
          <span aria-hidden="true">←</span>
          {t("backToHome")}
        </Link>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-600">
          {t("eyebrow")}
        </p>

        <h1 className="font-heading mt-4 text-[clamp(2.4rem,4vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950">
          {tr("title")}
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-600">
          {t("effectiveDate", { date: tr("dateValue") })}
        </p>

        <p className="mt-8 text-[15px] leading-8 text-slate-600">
          {tr("intro")}
        </p>

        <article className="mt-12 space-y-10 text-[15px] leading-8 text-slate-600">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {section}. {tr(`s${section}Title`)}
              </h2>
              {section === 9 ? (
                <>
                  <p className="mt-4">{tr("s9Intro")}</p>
                  <ul className="mt-4 list-disc space-y-2 pl-6">
                    {tr.raw("s9Items").map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : section === 13 ? (
                <p className="mt-4">
                  {tr("s13BeforeLink")} {" "}
                  <Link
                    href="/privacy-policy"
                    className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-800 hover:decoration-sky-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                  >
                    {tr("privacyLink")}
                  </Link>
                  {" "}{tr("s13AfterLink")}
                </p>
              ) : section === 14 ? (
                <p className="mt-4">
                  {tr("s14BeforeLink")} {" "}
                  <Link
                    href="/terms-and-conditions"
                    className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-800 hover:decoration-sky-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                  >
                    {tr("termsLink")}
                  </Link>
                  {" "}{tr("s14AfterLink")}
                </p>
              ) : section === 15 ? (
                <>
                  <p className="mt-4">{tr("s15Intro")}</p>
                  <ul className="mt-4 space-y-2">
                    <li>
                      {t("privacy.phoneLabel")} {" "}
                      <a
                        href="tel:+18573528554"
                        className="text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-800 hover:decoration-sky-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                      >
                        (857) 352-8554
                      </a>
                    </li>
                    <li>
                      {t("privacy.emailLabel")} {" "}
                      <a
                        href="mailto:cleaningsaskia@gmail.com"
                        className="text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-800 hover:decoration-sky-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                      >
                        cleaningsaskia@gmail.com
                      </a>
                    </li>
                  </ul>
                </>
              ) : (
                <p className="mt-4">{tr(`s${section}Text`)}</p>
              )}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
