"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const VIEWPORT = {
  once: true,
  amount: 0.2,
};

const EASE = [0.22, 1, 0.36, 1] as const;

const address = "Saskia Cleaning, 575 Gallivan Blvd, Boston, MA 02124";
const encodedAddress = encodeURIComponent(address);

export default function LocationMapSection() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="relative isolate overflow-hidden bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-32"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 xl:gap-24">
        {/* Left content */}
        <motion.div
          className="lg:sticky "
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{
            duration: 0.75,
            delay: 0.05,
            ease: EASE,
          }}
        >


          <h2
            id="location-heading"
            className="max-w-xl font-heading text-2xl font-light leading-[1.02] tracking-[-0.035em] text-slate-950 sm:text-3xl lg:text-[2.5rem]"
          >
            {t("locationTitle")}
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            {t("locationBody")}
          </p>

          {/* Address card */}
          <motion.div
            className="mt-9 overflow-hidden bg-white "
            whileHover={{
              y: -3,
              transition: { duration: 0.25 },
            }}
          >
            <div className="flex items-start gap-4 p-5 sm:p-6">


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


          </motion.div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <motion.a
              href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${tCommon("getDirections")} to Saskia Cleaning`}
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-4 text-base font-bold text-white shadow-[0_14px_35px_-15px_rgba(14,165,233,0.75)] transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <NavigationIcon />

              {tCommon("getDirections")}

              <ArrowIcon />
            </motion.a>

            <motion.a
              href="tel:+18573528554"
              aria-label={`${tCommon("callUs")}: 857-352-8554`}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-bold text-slate-800 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <PhoneIcon />
              {tCommon("callUs")}
            </motion.a>
          </div>
        </motion.div>

        {/* Right visual */}
        <motion.div
          className="min-w-0 space-y-5"
          initial={{ opacity: 0, x: 36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: EASE,
          }}
        >
          {/* Boston image */}
          <motion.div
            className="group relative min-h-[270px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.55)] sm:min-h-[320px]"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{
              duration: 0.7,
              ease: EASE,
            }}
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
                    Service Area
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

          {/* Map */}
          <motion.div
            className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_25px_70px_-35px_rgba(15,23,42,0.4)]"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{
              duration: 0.7,
              delay: 0.12,
              ease: EASE,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <MapIcon />
                </div>

                <div>
                  <p className="font-bold text-slate-950">
                    Find our main office
                  </p>

                  <p className="text-sm text-slate-500">
                    575 Gallivan Blvd, Boston
                  </p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open location in Google Maps"
                className="hidden text-sm font-bold text-sky-600 transition hover:text-sky-700 sm:inline-flex"
              >
                Open map
              </a>
            </div>

            <iframe
              title="Saskia Cleaning location at 575 Gallivan Boulevard, Boston"
              src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
              className="h-[360px] w-full border-0 sm:h-[430px]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z"
      />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 11 18-8-8 18-2.5-7.5L3 11Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.2 3.5 10 8.7 7.7 11a16 16 0 0 0 5.3 5.3l2.3-2.3 5.2 2.8v3a2 2 0 0 1-2 2C10.6 19.8 4.2 13.4 4.2 5.5a2 2 0 0 1 2-2h1Z"
      />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"
      />
      <path strokeLinecap="round" d="M9 3v15M15 6v15" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-5-5 5 5-5 5"
      />
    </svg>
  );
}