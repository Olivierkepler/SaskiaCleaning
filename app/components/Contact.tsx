"use client";

import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight } from "lucide-react";

export default function Contact() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 sm:py-28 md:px-16 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-between"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-6 bg-sky-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-500">
                Inquiry
              </span>
            </div>

            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.8rem,5vw,5.4rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-slate-950">
              Begin your{" "}
              <span className="font-light italic text-slate-400">
                consultation.
              </span>
            </h2>

            <p className="mt-7 max-w-md text-[15px] leading-8 text-slate-500 sm:text-lg">
              Saskia Cleaning provides premium residential, commercial, laundry,
              and turnover cleaning services with reliable care and polished
              attention to detail.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <a
              href="mailto:cleaningsaskia@gmail.com"
              className="group flex items-center gap-5"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 transition duration-300 group-hover:bg-sky-500 group-hover:text-white group-hover:ring-sky-500">
                <Mail size={18} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Email
                </p>
                <p className="text-sm text-slate-700 sm:text-base">
                  cleaningsaskia@gmail.com
                </p>
              </div>
            </a>

            <a href="tel:+18573528554" className="group flex items-center gap-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 transition duration-300 group-hover:bg-sky-500 group-hover:text-white group-hover:ring-sky-500">
                <Phone size={18} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Direct
                </p>
                <p className="text-sm text-slate-700 sm:text-base">
                  +1 (857) 352-8554
                </p>
              </div>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:p-8 md:p-10 lg:p-12"
        >
          <form className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border-b border-slate-200 bg-transparent py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-sky-500"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full border-b border-slate-200 bg-transparent py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-sky-500"
              />
            </div>

            <div className="relative">
              <select className="w-full appearance-none border-b border-slate-200 bg-transparent py-4 text-sm text-slate-500 outline-none transition focus:border-sky-500">
                <option>Service Interest</option>
                <option>Residential Cleaning</option>
                <option>Commercial Cleaning</option>
                <option>Laundry Services</option>
                <option>Airbnb / Turnover Cleaning</option>
                <option>Specialty Cleaning</option>
              </select>

              <div className="pointer-events-none absolute bottom-4 right-0 text-slate-300">
                <ArrowRight size={16} />
              </div>
            </div>

            <textarea
              rows={4}
              placeholder="Tell us about your space, preferred frequency, and cleaning needs."
              className="w-full resize-none border-b border-slate-200 bg-transparent py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-sky-500"
            />

            <button className="group flex w-full items-center justify-center gap-3 rounded-full bg-sky-500 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_32px_rgba(14,165,233,0.24)] transition duration-300 hover:bg-slate-950">
              Send Inquiry
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}