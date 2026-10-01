"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/app/lib/use-is-client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type ServiceItem = { nameKey: string; price: string };
type CategoryDef = {
  id: string;
  titleKey: string;
  tagKey: string;
  descKey: string;
  image: string;
  services: ServiceItem[];
};

const categoryDefs: CategoryDef[] = [
  {
    id: "residential",
    titleKey: "residential",
    tagKey: "residentialTag",
    descKey: "residentialDesc",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    services: [
      { nameKey: "basicCleaning", price: "$100+" },
      { nameKey: "standardCleaning", price: "$140+" },
      { nameKey: "deepCleaning", price: "$220+" },
      { nameKey: "moveInOut", price: "$250+" },
    ],
  },
  {
    id: "commercial",
    titleKey: "commercial",
    tagKey: "commercialTag",
    descKey: "commercialDesc",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    services: [
      { nameKey: "officeCleaning", price: "$0.15 / sq. ft." },
      { nameKey: "retailCleaning", price: "$0.18 / sq. ft." },
      { nameKey: "smallBusiness", price: "$180+" },
      { nameKey: "recurringJanitorial", price: "$350+ weekly" },
    ],
  },
  {
    id: "laundry",
    titleKey: "laundry",
    tagKey: "laundryTag",
    descKey: "laundryDesc",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    services: [
      { nameKey: "washFold", price: "$1.75 / lb" },
      { nameKey: "washDryFold", price: "$25 / load" },
      { nameKey: "ironing", price: "$3 / item" },
      { nameKey: "beddingLinen", price: "$35+" },
      { nameKey: "pickupDelivery", price: "$15 fee" },
      { nameKey: "sameDayLaundry", price: "+$20 rush" },
    ],
  },
];

function scrollToQuote() {
  document.getElementById("quote")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function CleaningServicesPricing() {
  const t = useTranslations("services");
  const tHome = useTranslations("home");
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(
    null,
  );
  const portalReady = useIsClient();

  const modal =
    portalReady &&
    selectedCategory &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[90] flex min-h-dvh items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        onClick={() => setSelectedCategory(null)}
      >
        <div
          className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-950/25 sm:rounded-[22px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setSelectedCategory(null)}
            className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-xs transition hover:bg-slate-900 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <span className="text-lg leading-none" aria-hidden="true">
              &times;
            </span>
          </button>

          <div className="relative h-52 overflow-hidden sm:h-56">
            <img
              src={selectedCategory.image}
              alt={t(selectedCategory.titleKey)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            <div className="absolute left-4 top-4">
              <span className="inline-block rounded-md bg-sky-500/90 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white shadow-xs backdrop-blur-xs">
                {t(selectedCategory.tagKey)}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-12">
              <h3 className="font-heading text-2xl font-bold leading-snug tracking-tight text-white">
                {t(selectedCategory.titleKey)}
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-slate-600">
              {t(selectedCategory.descKey)}
            </p>

            <div className="mt-5 divide-y divide-slate-100/90 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 sm:p-3">
              {selectedCategory.services.map((service) => (
                <div
                  key={service.nameKey}
                  className="flex items-center justify-between gap-3 px-1.5 py-2 first:pt-1 last:pb-1"
                >
                  <span className="text-sm font-medium leading-snug text-slate-700">
                    {t(service.nameKey)}
                  </span>
                  <span className="shrink-0 text-right text-sm font-semibold tabular-nums tracking-tight text-slate-900">
                    {service.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  requestAnimationFrame(scrollToQuote);
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-sky-500 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-xs transition-all duration-200 hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                {tHome("requestThisService")}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
    >
      {/* Subtle, refined ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[64rem] -translate-x-1/2 rounded-full bg-sky-50/60 blur-[110px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section header */}
        <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
          <div
            aria-hidden="true"
            className="mx-auto mb-4 h-[3px] w-8 rounded-full bg-sky-500"
          />

          <h2 className="font-heading text-[clamp(2.15rem,3.2vw,3rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-slate-950">
            {tHome("pricingTitle")}{" "}
            <span className="font-light italic text-sky-600">
              {tHome("pricingTitleAccent")}
            </span>
          </h2>

          <p className="mx-auto mt-4 text-[15px] font-normal leading-relaxed text-slate-600 sm:text-base">
            {tHome("pricingDescription")}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {categoryDefs.map((category, index) => (
            <motion.article
              key={category.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] sm:rounded-[22px]"
            >
              <div className="relative h-56 shrink-0 overflow-hidden sm:h-60">
                <img
                  src={category.image}
                  alt={t(category.titleKey)}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                <div className="absolute left-4 top-4">
                  <span className="inline-block rounded-md bg-sky-500/90 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white shadow-xs backdrop-blur-xs">
                    {t(category.tagKey)}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-heading text-xl font-bold leading-snug tracking-tight text-white sm:text-[1.4rem]">
                    {t(category.titleKey)}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-slate-600">
                  {t(category.descKey)}
                </p>

                <div className="mt-5 divide-y divide-slate-100/90 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 sm:p-3">
                  {category.services.map((service) => (
                    <div
                      key={`${category.id}-${service.nameKey}`}
                      className="flex items-center justify-between gap-3 px-1.5 py-2 first:pt-1 last:pb-1"
                    >
                      <span className="text-sm font-medium leading-snug text-slate-700">
                        {t(service.nameKey)}
                      </span>

                      <span className="shrink-0 text-right text-sm font-semibold tabular-nums tracking-tight text-slate-900">
                        {service.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-sky-500 px-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-xs transition-all duration-200 hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                  >
                    {tHome("requestThisService")}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {modal}
    </section>
  );
}
