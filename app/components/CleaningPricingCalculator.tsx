"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  {
    title: "Specialty Cleaning",
    tag: "Detailed Service",
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=80",
    description:
      "Extra cleaning services for specific areas, materials, or larger cleaning needs.",
    services: [
      { name: "Carpet Cleaning", price: "$45 / room" },
      { name: "Window Cleaning", price: "$8 / window" },
      { name: "Post-Construction Cleaning", price: "$300+" },
      { name: "Appliance Cleaning", price: "$30 / appliance" },
    ],
  },
  {
    title: "Add-On Services",
    tag: "Extras",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Optional extras clients can add to their cleaning package for a more complete service.",
    services: [
      { name: "Inside Fridge Cleaning", price: "$25" },
      { name: "Oven Cleaning", price: "$30" },
      { name: "Pet Hair Removal", price: "$20" },
      { name: "Cabinet Cleaning", price: "$35" },
      { name: "Eco-Friendly Products", price: "$10" },
      { name: "Extra Bathroom Cleaning", price: "$25 / bathroom" },
    ],
  },
  {
    title: "Airbnb / Short-Term Rental Cleaning",
    tag: "Turnover Ready",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    description:
      "Fast and reliable cleaning for Airbnb and short-term rentals to keep your space guest-ready.",
    services: [
      { name: "Standard Turnover Cleaning", price: "$120+" },
      { name: "Deep Turnover Cleaning", price: "$180+" },
      { name: "Linen Replacement Service", price: "$30" },
      { name: "Restocking Essentials", price: "$25" },
      { name: "Same-Day Turnover", price: "+$40 rush" },
    ],
  },
];

type ServiceCategory = (typeof serviceCategories)[number];

export default function CleaningServicesPricing() {
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (!selectedCategory) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedCategory) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCategory(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCategory]);

  const modal =
    portalReady &&
    selectedCategory &&
    createPortal(
      <div
        className="fixed inset-0 z-[90] flex min-h-[100dvh] items-center justify-center bg-[#1A1A1A]/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
        onClick={() => setSelectedCategory(null)}
      >
        <div
          className="relative max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-2xl overflow-y-auto border border-stone-200/80 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl font-light text-zinc-950 shadow-md ring-1 ring-stone-200 transition hover:bg-zinc-950 hover:text-white hover:ring-0"
            aria-label="Close"
          >
            ×
          </button>

          <div className="relative h-56 w-full shrink-0 overflow-hidden bg-stone-200 sm:h-64">
            <img
              src={selectedCategory.image}
              alt={selectedCategory.title}
              className="h-full w-full object-cover grayscale-[8%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/25 to-transparent" />
            <div className="absolute bottom-5 left-5 right-14">
              <span className="mb-2 inline-block text-[9px] font-bold uppercase tracking-[0.28em] text-white/80">
                {selectedCategory.tag}
              </span>
              <h3
                id="pricing-modal-title"
                className="font-serif text-2xl tracking-tight text-white sm:text-3xl"
              >
                {selectedCategory.title}
              </h3>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-base font-light leading-relaxed text-stone-600">
              {selectedCategory.description}
            </p>

            <div className="mt-6 border border-stone-100 bg-[#FCFAF8]/90 p-5">
              <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                Starting prices
              </h4>
              <ul className="space-y-3">
                {selectedCategory.services.map((service) => (
                  <li
                    key={service.name}
                    className="flex items-center justify-between gap-4 text-sm font-light text-stone-700"
                  >
                    <span>{service.name}</span>
                    <span className="shrink-0 border border-stone-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-950">
                      {service.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="group/modal relative mt-6 w-full overflow-hidden border border-zinc-950 bg-zinc-950 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-white hover:text-zinc-950"
            >
              <span className="relative z-10">Request This Service</span>
              <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-300 group-hover/modal:translate-y-0" />
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <section className="relative overflow-hidden bg-[#FCFAF8] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 bg-stone-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 grid gap-8 lg:mb-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.38em] text-stone-400">
              Professional Cleaning Services
            </span>

            <h2 className="max-w-3xl font-serif text-4xl leading-[1.02] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Cleaning & laundry pricing, refined.
            </h2>
          </div>

          <p className="max-w-2xl text-base font-light leading-8 text-stone-500 sm:text-lg lg:justify-self-end">
            Explore residential cleaning, commercial service, laundry care,
            specialty cleaning, Airbnb turnover, and premium add-ons — presented
            with transparent starting prices.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {serviceCategories.map((category, index) => (
            <article
              key={category.title}
              className="group border border-stone-200/80 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.04)] transition duration-500 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_28px_90px_rgba(0,0,0,0.09)]"
            >
              <div className="relative h-72 overflow-hidden bg-stone-200">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover grayscale-[12%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/25 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between">
                  <span className="border border-white/25 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-md">
                    {category.tag}
                  </span>

                  <span className="font-serif text-2xl text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-serif text-3xl leading-tight tracking-tight text-white">
                    {category.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <p className="min-h-[72px] text-sm font-light leading-7 text-stone-600">
                  {category.description}
                </p>

                <div className="mt-6 border border-stone-200 bg-[#FCFAF8]">
                  {category.services.map((service) => (
                    <div
                      key={`${category.title}-${service.name}`}
                      className="flex items-center justify-between gap-4 border-b border-stone-200/70 px-4 py-4 last:border-b-0 hover:bg-white"
                    >
                      <span className="text-sm font-light leading-5 text-stone-700">
                        {service.name}
                      </span>

                      <span className="shrink-0 border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-950">
                        {service.price}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className="group/btn relative mt-6 w-full overflow-hidden border border-zinc-950 bg-zinc-950 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-white hover:text-zinc-950"
                >
                  <span className="relative z-10">Request This Service</span>
                  <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-300 group-hover/btn:translate-y-0" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-4xl border-y border-stone-200 py-6 text-center">
          <p className="text-[11px] font-semibold uppercase leading-6 tracking-[0.24em] text-stone-400">
            Final pricing may vary based on property size, condition, service
            frequency, laundry volume, location, and custom client requests.
          </p>
        </div>
      </div>

      {modal}
    </section>
  );
}