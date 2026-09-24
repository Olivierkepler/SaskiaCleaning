import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.privacy");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations("legal");
  const tp = await getTranslations("legal.privacy");
  const date = tp("dateValue");

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
          {t("privacyTitle")}
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-500">
          {t("effectiveDate", { date })}
          <br />
          {t("lastUpdated", { date })}
        </p>

        <p className="mt-8 text-[15px] leading-8 text-slate-600">{tp("intro")}</p>

        <article className="mt-12 space-y-10 text-[15px] leading-8 text-slate-600">
          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s1Title")}
            </h2>
            <p className="mt-4">{tp("s1Intro")}</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>{tp("s1i1")}</li>
              <li>{tp("s1i2")}</li>
              <li>{tp("s1i3")}</li>
              <li>{tp("s1i4")}</li>
              <li>{tp("s1i5")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s2Title")}
            </h2>
            <p className="mt-4">{tp("s2Intro")}</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>{tp("s2i1")}</li>
              <li>{tp("s2i2")}</li>
              <li>{tp("s2i3")}</li>
              <li>{tp("s2i4")}</li>
              <li>{tp("s2i5")}</li>
              <li>{tp("s2i6")}</li>
              <li>{tp("s2i7")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s3Title")}
            </h2>
            <p className="mt-4">{tp("s3p1")}</p>
            <p className="mt-4">{tp("s3p2")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s4Title")}
            </h2>
            <p className="mt-4">{tp("s4Intro")}</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>{tp("s4i1")}</li>
              <li>{tp("s4i2")}</li>
              <li>{tp("s4i3")}</li>
              <li>{tp("s4i4")}</li>
            </ul>
            <p className="mt-4">{tp("s4Outro")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s5Title")}
            </h2>
            <p className="mt-4">{tp("s5p1")}</p>
            <p className="mt-4">{tp("s5p2")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s6Title")}
            </h2>
            <p className="mt-4">{tp("s6p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s7Title")}
            </h2>
            <p className="mt-4">{tp("s7p1")}</p>
            <p className="mt-4">{tp("s7p2")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s8Title")}
            </h2>
            <p className="mt-4">{tp("s8p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s9Title")}
            </h2>
            <p className="mt-4">{tp("s9p1")}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {tp("s10Title")}
            </h2>
            <p className="mt-4">{tp("s10Intro")}</p>
            <ul className="mt-4 space-y-2">
              <li>
                {tp("phoneLabel")}{" "}
                <a
                  href="tel:+18573528554"
                  className="text-sky-600 underline-offset-2 hover:underline"
                >
                  (857) 352-8554
                </a>
              </li>
              <li>
                {tp("emailLabel")}{" "}
                <a
                  href="mailto:cleaningsaskia@gmail.com"
                  className="text-sky-600 underline-offset-2 hover:underline"
                >
                  cleaningsaskia@gmail.com
                </a>
              </li>
              <li>{tp("serviceAreaLabel")}</li>
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
