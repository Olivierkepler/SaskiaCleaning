"use client";

import { useState } from "react";

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

export default function AutoServiceCarousel() {
  const repeatedItems = [...carouselItems, ...carouselItems];
  const [selectedService, setSelectedService] =
    useState<(typeof carouselItems)[number] | null>(null);

  return (
    <section className="relative overflow-hidden bg-[#FCFAF8] px-6 py-24 sm:px-8 lg:px-16">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-stone-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* <div className="mx-auto mb-16 max-w-4xl text-center">
          <span className="text-[10px] tracking-[0.35em] uppercase text-stone-400 font-semibold block mb-6">
            Intelligent Cleaning Network
          </span>

          <h2 className="text-4xl md:text-6xl font-serif tracking-tight text-[#1A1A1A] leading-[1.1]">
            Elevated Cleaning, Built for Modern Living
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl font-light text-stone-500 leading-relaxed">
            Seamless cleaning, laundry, and property care powered by precision,
            reliability, and modern service standards.
          </p>
        </div> */}

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-32 bg-gradient-to-r from-[#FCFAF8] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-32 bg-gradient-to-l from-[#FCFAF8] to-transparent" />

          <div className="flex w-max animate-service-scroll gap-6">
            {repeatedItems.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => setSelectedService(item)}
                className="group relative w-[300px] shrink-0 overflow-hidden rounded-sm border border-stone-200/60 bg-white text-left shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl sm:w-[360px]"
              >
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover grayscale-[10%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/35 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="mb-4 h-px w-12 bg-stone-300" />

                  <h3 className="text-xl font-serif text-[#1A1A1A] tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm font-light leading-relaxed text-stone-600">
                    {item.subtitle}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                      From {item.startingPrice}
                    </span>

                    <span className="border border-[#1A1A1A] bg-[#1A1A1A] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition group-hover:bg-stone-800">
                      View Details
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {carouselItems.map((item, index) => (
            <span
              key={item.title}
              className={`h-2.5 rounded-full transition-all ${
                index === 0 ? "w-8 bg-[#1A1A1A]" : "w-2.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      </div>

      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 px-4 backdrop-blur-sm"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-sm border border-stone-200/80 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl font-light text-[#1A1A1A] shadow-md ring-1 ring-stone-200 transition hover:bg-[#1A1A1A] hover:text-white hover:ring-0"
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="h-full w-full object-cover grayscale-[8%]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/25 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6">
                <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-stone-200">
                  Starting at {selectedService.startingPrice}
                </p>

                <h3 className="text-3xl font-serif text-white tracking-tight sm:text-4xl">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-base font-light leading-relaxed text-stone-600">
                {selectedService.subtitle}
              </p>

              <div className="mt-6 border border-stone-100 bg-[#FCFAF8]/90 p-5">
                <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                  Service Includes
                </h4>

                <ul className="space-y-3">
                  {selectedService.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex gap-3 text-sm font-light leading-relaxed text-stone-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="group/req relative w-full overflow-hidden bg-[#1A1A1A] px-5 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-white transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
                >
                  <span className="relative z-10">Request This Service</span>
                  <div className="absolute inset-0 bg-stone-700 translate-y-full group-hover/req:translate-y-0 transition-transform duration-300" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="w-full border border-stone-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] transition hover:bg-stone-50"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          animation: service-scroll 32s linear infinite;
        }

        .animate-service-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}