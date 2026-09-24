import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TermsAndConditionsPage() {
  const t = await getTranslations("legal");
  const tt = await getTranslations("legal.terms");
  const date = tt("dateValue");

  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-6 py-24 sm:px-8 sm:py-28 lg:px-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-500 transition hover:text-sky-600"
        >
          <span aria-hidden="true">←</span>
          {t("backToHome")}
        </Link>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-500">
          {t("eyebrow")}
        </p>

        <h1 className="font-heading mt-4 text-[clamp(2.4rem,4vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950">
          {tt("title")}
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-500">
          {t("effectiveDate", { date })}
          <br />
          {t("lastUpdated", { date })}
        </p>

        <p className="mt-8 text-[15px] leading-8 text-slate-600">{tt("intro")}</p>

        <article className="mt-12 space-y-10 text-[15px] leading-8 text-slate-600">
          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s1Title")}
            </h2>
            <p className="mt-4">{tt("s1p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s2Title")}
            </h2>
            <p className="mt-4">{tt("s2p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s3Title")}
            </h2>
            <p className="mt-4">{tt("s3p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s4Title")}
            </h2>
            <p className="mt-4">{tt("s4p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s5Title")}
            </h2>
            <p className="mt-4">{tt("s5p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s6Title")}
            </h2>
            <p className="mt-4">{tt("s6p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s7Title")}
            </h2>
            <p className="mt-4">{tt("s7p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s8Title")}
            </h2>
            <p className="mt-4">{tt("s8p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s9Title")}
            </h2>
            <p className="mt-4">{tt("s9p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s10Title")}
            </h2>
            <p className="mt-4">{tt("s10Intro")}</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>{tt("s10i1")}</li>
              <li>{tt("s10i2")}</li>
              <li>{tt("s10i3")}</li>
              <li>{tt("s10i4")}</li>
              <li>{tt("s10i5")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s11Title")}
            </h2>
            <p className="mt-4">{tt("s11p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s12Title")}
            </h2>
            <p className="mt-4">{tt("s12p1")}</p>
            <p className="mt-4">{tt("s12p2")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s13Title")}
            </h2>
            <p className="mt-4">{tt("s13p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s14Title")}
            </h2>
            <p className="mt-4">{tt("s14p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s15Title")}
            </h2>
            <p className="mt-4">{tt("s15p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s16Title")}
            </h2>
            <p className="mt-4">{tt("s16p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s17Title")}
            </h2>
            <p className="mt-4">{tt("s17p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tt("s18Title")}
            </h2>
            <p className="mt-4">{tt("s18Intro")}</p>
            <ul className="mt-4 space-y-2">
              <li>
                {tt("phoneLabel")}{" "}
                <a
                  href="tel:+18573528554"
                  className="text-sky-600 underline-offset-2 hover:underline"
                >
                  (857) 352-8554
                </a>
              </li>
              <li>
                {tt("emailLabel")}{" "}
                <a
                  href="mailto:cleaningsaskia@gmail.com"
                  className="text-sky-600 underline-offset-2 hover:underline"
                >
                  cleaningsaskia@gmail.com
                </a>
              </li>
              <li>{tt("serviceAreaLabel")}</li>
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
