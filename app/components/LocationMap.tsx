"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

const VIEWPORT = { once: true, amount: 0.2 };
const EASE = [0.22, 1, 0.36, 1] as const;

const address = "Saskia Cleaning, 575 Gallivan Blvd, Boston, MA 02124";
const encodedAddress = encodeURIComponent(address);
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
const mapUrl = `https://www.google.com/maps?q=${encodedAddress}&z=15&output=embed`;

export default function LocationMapSection() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="relative isolate overflow-hidden bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 xl:gap-24">
        <motion.div
          className="lg:sticky lg:top-28"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.75, delay: 0.05, ease: EASE }}
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
            Boston location
          </p>

          <h2
            id="location-heading"
            className="max-w-xl font-heading text-3xl font-light leading-[1.04] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl"
          >
            {t("locationTitle")}
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            {t("locationBody")}
          </p>

          <motion.div
            className="mt-9 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)]"
            whileHover={reduceMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-600">
                <LocationIcon />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  {t("mainOffice")}
                </p>
                <address className="mt-2 not-italic">
                  <p className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                    575 Gallivan Blvd
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-600 sm:text-lg">
                    Boston, MA 02124
                  </p>
                </address>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/80">
              <div className="border-r border-slate-100 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Service area
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  Greater Boston
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Estimates
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  Free quotes
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <motion.a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${tCommon("getDirections")} to Saskia Cleaning`}
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-4 text-base font-bold text-white shadow-[0_14px_35px_-15px_rgba(14,165,233,0.75)] transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <NavigationIcon />
              {tCommon("getDirections")}
              <ArrowIcon />
            </motion.a>

            <motion.a
              href="tel:+18573528554"
              aria-label={`${tCommon("callUs")}: 857-352-8554`}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-bold text-slate-800 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <PhoneIcon />
              {tCommon("callUs")}
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          className="min-w-0 space-y-5"
          initial={reduceMotion ? false : { opacity: 0, x: 36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        >
          <motion.div
            className="group relative min-h-[270px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.55)] sm:min-h-[320px]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Image
              src="/images/boston.jpg"
              alt="Boston, Massachusetts, Saskia Cleaning service area"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200 sm:text-sm">
                    Service area
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Boston, Massachusetts
                  </h3>
                </div>
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md sm:flex">
                  <LocationIcon />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_25px_70px_-35px_rgba(15,23,42,0.4)]"
            initial={reduceMotion ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-600">
                  <MapIcon />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-950">Find our main office</p>
                  <p className="truncate text-sm text-slate-500">
                    575 Gallivan Blvd, Boston, MA 02124
                  </p>
                </div>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Saskia Cleaning location in Google Maps"
                className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full bg-sky-50 px-4 text-sm font-bold text-sky-700 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex"
              >
                Open map
                <ExternalLinkIcon />
              </a>
            </div>

            <div className="relative bg-slate-100">
              <iframe
                title="Saskia Cleaning location at 575 Gallivan Boulevard, Boston"
                src={mapUrl}
                className="h-[380px] w-full border-0 sm:h-[460px] lg:h-[500px]"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/20 to-transparent" />
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 right-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white/95 px-5 text-sm font-bold text-slate-900 shadow-xl backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 sm:hidden"
              >
                <NavigationIcon />
                Get directions
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4 text-sm sm:px-6">
              <span className="inline-flex items-center gap-2 font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                Serving Boston and nearby communities
              </span>
              <a
                href="tel:+18573528554"
                className="font-bold text-sky-700 transition hover:text-sky-800"
              >
                857-352-8554
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

type IconProps = { className?: string };

function LocationIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function NavigationIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 11 18-8-8 18-2.5-7.5L3 11Z" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.2 3.5 10 8.7 7.7 11a16 16 0 0 0 5.3 5.3l2.3-2.3 5.2 2.8v3a2 2 0 0 1-2 2C10.6 19.8 4.2 13.4 4.2 5.5a2 2 0 0 1 2-2h1Z" />
    </svg>
  );
}

function MapIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path strokeLinecap="round" d="M9 3v15M15 6v15" />
    </svg>
  );
}

function ArrowIcon({ className = "h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5v5M10 14 19 5M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}
