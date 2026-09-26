"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => setPortalReady(true), []);

  const modal =
    portalReady &&
    selectedCategory &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[90] flex min-h-dvh items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
        onClick={() => setSelectedCategory(null)}
      >
        <div
          className="relative max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-slate-200/90 bg-white shadow-2xl shadow-slate-950/25"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setSelectedCategory(null)}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-md transition-all hover:bg-slate-900 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <span className="text-xl leading-none" aria-hidden="true">
              &times;
            </span>
          </button>

          <div className="relative h-60 overflow-hidden">
            <img
              src={selectedCategory.image}
              alt={t(selectedCategory.titleKey)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            <div className="absolute left-5 top-5">
              <span className="inline-block rounded-full bg-sky-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                {t(selectedCategory.tagKey)}
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-14">
              <h3 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {t(selectedCategory.titleKey)}
              </h3>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <p className="text-sm leading-relaxed text-slate-600">
              {t(selectedCategory.descKey)}
            </p>

            <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4">
              {selectedCategory.services.map((service) => (
                <div
                  key={service.nameKey}
                  className="flex items-center justify-between gap-3 px-2 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {t(service.nameKey)}
                  </span>
                  <span className="shrink-0 rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-xs">
                    {service.price}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                requestAnimationFrame(scrollToQuote);
              }}
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/25 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              {tHome("requestThisService")}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-32"
    >
      {/* Ambient background glow consistent with footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[72rem] -translate-x-1/2 rounded-full bg-sky-100/40 blur-[90px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <div
            aria-hidden="true"
            className="mx-auto mb-5 h-[3px] w-10 rounded-full bg-sky-500"
          />

          <h2 className="font-heading text-[clamp(2.35rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950">
            {tHome("pricingTitle")}{" "}
            <span className="font-light italic text-sky-600">
              {tHome("pricingTitleAccent")}
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            {tHome("pricingDescription")}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categoryDefs.map((category, index) => (
            <motion.article
              key={category.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(14,165,233,0.10)]"
            >
              <div className="relative h-64 overflow-hidden sm:h-72">
                <img
                  src={category.image}
                  alt={t(category.titleKey)}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                <div className="absolute left-5 top-5">
                  <span className="inline-block rounded-full bg-sky-500/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                    {t(category.tagKey)}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
                    {t(category.titleKey)}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="min-h-[48px] text-sm leading-relaxed text-slate-600">
                  {t(category.descKey)}
                </p>

                <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                  {category.services.map((service) => (
                    <div
                      key={`${category.id}-${service.nameKey}`}
                      className="flex items-center justify-between gap-3 px-2 py-2.5"
                    >
                      <span className="text-sm font-medium leading-5 text-slate-700">
                        {t(service.nameKey)}
                      </span>

                      <span className="shrink-0 rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-xs">
                        {service.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/25 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
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
