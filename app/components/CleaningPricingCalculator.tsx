"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const serviceCategories = [
  {
    title: "Residential Cleaning",
    tag: "Most Popular",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    description:
      "Home cleaning packages for apartments, houses, and move-in or move-out needs.",
    services: [
      { name: "Basic Cleaning", price: "$100+" },
      { name: "Standard Cleaning", price: "$140+" },
      { name: "Deep Cleaning", price: "$220+" },
      { name: "Move-In / Move-Out Cleaning", price: "$250+" },
    ],
  },
  {
    title: "Commercial Cleaning",
    tag: "Business",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    description:
      "Professional cleaning services for offices, retail spaces, and small businesses.",
    services: [
      { name: "Office Cleaning", price: "$0.15 / sq. ft." },
      { name: "Retail Cleaning", price: "$0.18 / sq. ft." },
      { name: "Small Business Cleaning", price: "$180+" },
      { name: "Recurring Janitorial Cleaning", price: "$350+ weekly" },
    ],
  },
  {
    title: "Laundry Services",
    tag: "Laundry Care",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Laundry care for clothes, bedding, linens, washing, drying, folding, and pressing.",
    services: [
      { name: "Wash & Fold", price: "$1.75 / lb" },
      { name: "Wash, Dry & Fold", price: "$25 / load" },
      { name: "Ironing / Pressing", price: "$3 / item" },
      { name: "Bedding & Linen Cleaning", price: "$35+" },
      { name: "Pickup & Delivery Laundry", price: "$15 fee" },
      { name: "Same-Day Laundry", price: "+$20 rush" },
    ],
  },
];

type ServiceCategory = (typeof serviceCategories)[number];

export default function CleaningServicesPricing() {
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => setPortalReady(true), []);

  const modal =
    portalReady &&
    selectedCategory &&
    createPortal(
      <div
        className="fixed inset-0 z-[90] flex min-h-dvh items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
        onClick={() => setSelectedCategory(null)}
      >
        <div
          className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-950 shadow-lg hover:bg-slate-950 hover:text-white"
          >
            ×
          </button>

          <div className="relative h-64 overflow-hidden">
            <img
              src={selectedCategory.image}
              alt={selectedCategory.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />

            <div className="absolute bottom-6 left-6 right-16">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
                {selectedCategory.tag}
              </p>
              <h3 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold leading-none text-white">
                {selectedCategory.title}
              </h3>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-[15px] leading-7 text-slate-600">
              {selectedCategory.description}
            </p>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-slate-50 ring-1 ring-slate-100">
              {selectedCategory.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                >
                  <span className="text-sm text-slate-700">
                    {service.name}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-950 ring-1 ring-slate-200">
                    {service.price}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-7 w-full rounded-full bg-sky-500 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_32px_rgba(14,165,233,0.24)] transition hover:bg-slate-950">
              Request This Service
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto mb-20 max-w-4xl text-center">
          {/* <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-sky-300" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-500">
              Saskia Cleaning Services
            </span>
            <span className="h-px w-6 bg-sky-300" />
          </div> */}

          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.8rem,3.5vw,5.4rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-slate-950">
            Cleaning & laundry pricing,{" "}
            <span className="font-light italic text-slate-400">refined.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-8 text-slate-500 sm:text-lg">
            Explore residential cleaning, commercial service, laundry care,
            Airbnb turnover, and premium add-ons with transparent starting
            prices.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {serviceCategories.map((category, index) => (
            <motion.article
              key={category.title}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: false,
                amount: 0.2,
                margin: "-60px",
              }}
              transition={{
                duration: 0.75,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition duration-500 hover:-translate-y-2 hover:ring-sky-200 hover:shadow-[0_28px_90px_rgba(14,165,233,0.16)]"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale-[8%] transition duration-700 group-hover:scale-[1.05] group-hover:grayscale-0"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                    {category.tag}
                  </span>

                  <span className="font-[family-name:var(--font-cormorant)] text-3xl text-white/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="mb-4 h-[2px] w-10 bg-sky-400 transition-all duration-300 group-hover:w-16" />

                  <h3 className="font-[family-name:var(--font-cormorant)] text-[2rem] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
                    {category.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <p className="min-h-[78px] text-[15px] leading-7 text-slate-600">
                  {category.description}
                </p>

                <div className="mt-7 overflow-hidden rounded-[1.4rem] bg-slate-50 ring-1 ring-slate-100">
                  {category.services.map((service, idx) => (
                    <div
                      key={`${category.title}-${service.name}`}
                      className={`flex items-center justify-between gap-4 px-5 py-4 transition duration-300 hover:bg-white ${
                        idx !== category.services.length - 1
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <span className="text-sm leading-6 text-slate-700">
                        {service.name}
                      </span>

                      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-950">
                        {service.price}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className="mt-7 w-full rounded-full bg-sky-500 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_32px_rgba(14,165,233,0.24)] transition duration-300 hover:bg-slate-950"
                >
                  Request This Service
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {modal}
    </section>
  );
}