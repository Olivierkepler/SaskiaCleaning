"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const carouselItems = [
  {
    title: "Residential Cleaning",
    subtitle: "Premium home care for apartments, houses, and move-outs.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    details: [
      "Basic, standard, deep cleaning, and move-in/move-out cleaning.",
      "Ideal for apartments, family homes, condos, and rentals.",
      "Includes kitchens, bathrooms, bedrooms, floors, and common areas.",
    ],
    startingPrice: "$100+",
  },
  {
    title: "Commercial Cleaning",
    subtitle: "Precision cleaning for offices, retail spaces, and businesses.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    details: [
      "Designed for offices, stores, studios, and small businesses.",
      "Includes floors, desks, restrooms, trash removal, and shared spaces.",
      "Available for one-time, weekly, or recurring janitorial service.",
    ],
    startingPrice: "$180+",
  },
  {
    title: "Laundry Services",
    subtitle: "Wash, dry, fold, pressing, linens, and pickup solutions.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    details: [
      "Wash and fold, drying, ironing, bedding, linens, and same-day laundry.",
      "Pickup and delivery available for busy clients.",
      "Perfect for homes, rentals, Airbnb hosts, and professionals.",
    ],
    startingPrice: "$1.75 / lb",
  },
  {
    title: "Airbnb Cleaning",
    subtitle: "Fast guest-ready turnovers for short-term rental properties.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    details: [
      "Quick turnover cleaning between guest stays.",
      "Linen replacement, restocking, bathroom refresh, and kitchen reset.",
      "Same-day turnover options available for urgent bookings.",
    ],
    startingPrice: "$120+",
  },
  {  
    title: "Specialty Cleaning",
    subtitle: "Advanced care for carpets, windows, appliances, and build-outs.",
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80",
    details: [
      "Carpet cleaning, window cleaning, appliance cleaning, and post-construction cleaning.",
      "Great for seasonal refreshes or specific problem areas.",
      "Pricing depends on room count, surface type, and job size.",
    ],
    startingPrice: "$45+",
  },
  {
    title: "Add-On Services",
    subtitle: "Custom enhancements for deeper, cleaner, smarter service.",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
    details: [
      "Fridge cleaning, oven cleaning, pet hair removal, cabinet cleaning, and eco-friendly products.",
      "Can be added to any cleaning package.",
      "Best for clients who want a more detailed finish.",
    ],
    startingPrice: "$10+",
  },
];

type CarouselItem = (typeof carouselItems)[number];

export default function AutoServiceCarousel() {
  const repeatedItems = [...carouselItems, ...carouselItems];
  const [selectedService, setSelectedService] = useState<CarouselItem | null>(
    null
  );
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (!selectedService) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedService]);

  useEffect(() => {
    if (!selectedService) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedService(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedService]);

  const modal =
    portalReady &&
    selectedService &&
    createPortal(
      <div
        className="fixed inset-0 z-[90] flex min-h-dvh items-end justify-center bg-[#1A1A1A]/55 p-0 backdrop-blur-[6px] sm:items-center sm:p-4 md:p-6"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="carousel-service-modal-title"
        onClick={() => setSelectedService(null)}
      >
        <div
          className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-stone-200/90 bg-white shadow-[0_-24px_80px_rgba(0,0,0,0.18)] sm:max-h-[min(92dvh,44rem)] sm:rounded-sm sm:shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setSelectedService(null)}
            className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/95 text-2xl font-light leading-none text-[#1A1A1A] shadow-md ring-1 ring-stone-200/80 transition hover:bg-[#1A1A1A] hover:text-white hover:ring-0 sm:right-4 sm:top-4 sm:min-h-10 sm:min-w-10 sm:text-xl"
            aria-label="Close modal"
          >
            ×
          </button>

          <div className="relative h-44 w-full shrink-0 overflow-hidden sm:h-56 md:h-64 lg:h-[19rem]">
            <img
              src={selectedService.image}
              alt=""
              sizes="(max-width:640px) 100vw, 42rem"
              className="h-full w-full object-cover grayscale-[8%]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/85 via-[#1A1A1A]/28 to-transparent" />

            <div className="absolute bottom-4 left-4 right-16 sm:bottom-6 sm:left-6 sm:right-20">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.28em] text-stone-200 sm:mb-3 sm:tracking-[0.25em]">
                Starting at {selectedService.startingPrice}
              </p>

              <h3
                id="carousel-service-modal-title"
                className="font-serif text-2xl leading-[1.05] tracking-tight text-white sm:text-3xl md:text-4xl"
              >
                {selectedService.title}
              </h3>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-8">
            <p className="text-[15px] font-light leading-relaxed text-stone-600 sm:text-base">
              {selectedService.subtitle}
            </p>

            <div className="mt-5 border border-stone-100 bg-[#FCFAF8]/90 p-4 sm:mt-6 sm:p-5">
              <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 sm:mb-4">
                Service Includes
              </h4>

              <ul className="space-y-2.5 sm:space-y-3">
                {selectedService.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex gap-3 text-[13px] font-light leading-relaxed text-stone-600 sm:text-sm"
                  >
                    <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400 sm:mt-1.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:gap-3">
              <button
                type="button"
                className="group/req relative min-h-[48px] w-full overflow-hidden bg-[#1A1A1A] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-shadow active:bg-stone-800 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] sm:min-h-0 sm:flex-1 sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.25em]"
              >
                <span className="relative z-10">Request This Service</span>
                <div className="absolute inset-0 translate-y-full bg-stone-700 transition-transform duration-300 motion-safe:group-hover/req:translate-y-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="min-h-[48px] w-full border border-stone-200 bg-white px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A1A1A] transition hover:bg-stone-50 active:bg-stone-100 sm:min-h-0 sm:flex-1 sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.2em]"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <section className="relative overflow-hidden bg-[#FCFAF8] px-4 py-14 sm:px-6 sm:py-20 lg:px-16 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-stone-200/35 blur-3xl sm:h-80 sm:w-80 sm:bg-stone-200/40" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14 lg:mb-16 lg:max-w-4xl">
          <span className="mb-4 block text-[9px] font-semibold uppercase tracking-[0.32em] text-stone-400 sm:mb-5 sm:text-[10px] sm:tracking-[0.35em]">
            Intelligent Cleaning Network
          </span>
          <h2 className="font-serif text-[1.65rem] leading-[1.08] tracking-tight text-[#1A1A1A] sm:text-4xl md:text-5xl lg:text-6xl">
            Elevated cleaning for modern living
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-stone-500 sm:mt-5 sm:text-lg md:text-xl">
            Seamless cleaning, laundry, and property care — precise, reliable,
            and tailored to your space.
          </p>
        </header>

        <div className="relative -mx-1 overflow-hidden sm:mx-0">
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 bg-gradient-to-r from-[#FCFAF8] to-transparent sm:w-16 md:w-24 lg:w-32" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-10 bg-gradient-to-l from-[#FCFAF8] to-transparent sm:w-16 md:w-24 lg:w-32" />

          <div className="flex w-max animate-service-scroll gap-4 motion-reduce:animate-none sm:gap-5 md:gap-6 lg:gap-8">
            {repeatedItems.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => setSelectedService(item)}
                className="group relative w-[min(17.25rem,calc(100vw-2.25rem))] shrink-0 overflow-hidden rounded-sm border border-stone-200/70 bg-white text-left shadow-[0_12px_40px_rgba(0,0,0,0.05)] ring-[#1A1A1A]/0 transition duration-500 hover:-translate-y-1 hover:border-stone-300/90 hover:shadow-[0_22px_70px_rgba(0,0,0,0.09)] hover:ring-2 hover:ring-[#1A1A1A]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF8] active:scale-[0.992] sm:w-[18.75rem] md:w-[21rem] lg:w-[22.5rem] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
              >
                <div className="relative aspect-[5/3] w-full overflow-hidden sm:h-52 md:h-56 lg:h-60 lg:aspect-auto">
                  <img
                    src={item.image}
                    alt=""
                    sizes="(max-width:640px) min(calc(100vw - 2.25rem), 276px), (max-width:768px) 300px, (max-width:1024px) 336px, 360px"
                    className="h-full w-full object-cover grayscale-[10%] transition duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/40 via-transparent to-transparent" />
                </div>

                <div className="p-4 sm:p-5 md:p-6">
                  <div className="mb-3 h-px w-10 bg-stone-300 sm:mb-4 sm:w-12" />

                  <h3 className="font-serif text-lg leading-snug tracking-tight text-[#1A1A1A] sm:text-xl">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-[13px] font-light leading-relaxed text-stone-600 sm:mt-3 sm:line-clamp-none sm:text-sm">
                    {item.subtitle}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 sm:mt-6 sm:pt-5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-400 sm:text-[10px] sm:tracking-[0.2em]">
                      From {item.startingPrice}
                    </span>

                    <span className="inline-flex min-h-9 items-center border border-[#1A1A1A] bg-[#1A1A1A] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white transition group-hover:bg-stone-800 sm:text-[10px] sm:tracking-[0.2em]">
                      View Details
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-md px-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-stone-400 sm:mt-10 sm:max-w-none sm:text-[11px] sm:tracking-[0.2em]">
          Select a service for details — marquee pauses on hover
        </p>

        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-2 px-2 sm:mt-8 sm:gap-2.5"
          aria-hidden="true"
        >
          {carouselItems.map((item, index) => (
            <span
              key={item.title}
              className={`h-2 rounded-full transition-all sm:h-2.5 ${
                index === 0 ? "w-7 bg-[#1A1A1A] sm:w-8" : "w-2 bg-stone-300 sm:w-2.5"
              }`}
            />
          ))}
        </div>
      </div>

      {modal}

      <style jsx>{`
        @keyframes service-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-service-scroll {
          animation: service-scroll 36s linear infinite;
        }

        @media (hover: hover) {
          .animate-service-scroll:hover {
            animation-play-state: paused;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-service-scroll {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}