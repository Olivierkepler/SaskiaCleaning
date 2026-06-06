"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const VIEWPORT = { once: false, amount: 0.2 };
const EASE = [0.22, 1, 0.36, 1] as const;

export default function LocationMapSection() {
  const address = "Saskia Cleaning, 575 Gallivan Blvd, Boston, MA 02124";
  const encodedAddress = encodeURIComponent(address);

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          <p className="mb-4 text-[16px] font-medium uppercase tracking-[0.09em] text-sky-500">
            Our Location
          </p>

          <h2
            className="
              font-heading
              max-w-xl
              text-3xl
              font-thin
              leading-[0.95]
              tracking-tight
              sm:text-4xl
              lg:text-5xl
              text-slate-950
            "
            style={{
              fontWeight: 300,
              letterSpacing: "-0.01em",
            }}
          >
            Proudly Serving Massachusetts & Rhode Island
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Saskia Cleaning is based in Boston and provides trusted residential
            and commercial cleaning services across nearby communities.
          </p>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
              Main Office
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              575 Gallivan Blvd
            </p>

            <p className="mt-1 text-lg font-medium text-slate-600">
              Boston, MA 02124
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-sky-300"
            >
              Get Directions
            </a>

            <a
              href="tel:8573528554"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-4 text-base font-bold text-slate-800 transition hover:border-sky-300 hover:text-sky-500"
            >
              Call Us
            </a>
          </div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        >
          {/* Massachusetts Image */}
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-sky-50 shadow-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <Image
              src="/images/boston.jpg"
              alt="Massachusetts service area"
              width={900}
              height={420}
              className="h-[240px] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />

            <div className="absolute bottom-6 left-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-200">
                Service Area
              </p>
              <h3 className="mt-2 text-3xl font-bold text-white">
                Boston, Massachusetts
              </h3>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
          >
            <iframe
              title="Saskia Cleaning Location Map"
              src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
