"use client";

const carouselItems = [
  {
    title: "Residential Cleaning",
    subtitle: "Premium home care for apartments, houses, and move-outs.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Commercial Cleaning",
    subtitle: "Precision cleaning for offices, retail spaces, and businesses.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Laundry Services",
    subtitle: "Wash, dry, fold, pressing, linens, and pickup solutions.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Airbnb Cleaning",
    subtitle: "Fast guest-ready turnovers for short-term rental properties.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Specialty Cleaning",
    subtitle: "Advanced care for carpets, windows, appliances, and build-outs.",
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Add-On Services",
    subtitle: "Custom enhancements for deeper, cleaner, smarter service.",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
  },
];

export default function AutoServiceCarousel() {
  const repeatedItems = [...carouselItems, ...carouselItems];

  return (
    <section className="relative overflow-hidden bg-[#FCFAF8]  py-24 ">
      {/* subtle glow accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-8xl">
        {/* HEADER */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-600">
            Intelligent Cleaning Network
          </p>

          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Elevated Cleaning, Built for Modern Living
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Seamless cleaning, laundry, and property care powered by precision,
            reliability, and modern service standards.
          </p>
        </div>

        {/* CAROUSEL */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-32 bg-gradient-to-r from-[#FCFAF8] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-32 bg-gradient-to-l from-[#FCFAF8] to-transparent" />

          <div className="flex w-max animate-service-scroll gap-6">
            {repeatedItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="group relative w-[300px] shrink-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl sm:w-[360px]"
              >
                {/* IMAGE */}
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-500" />

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.subtitle}
                  </p>

                  {/* CTA */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Available Now
                    </span>

                    <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-600">
                      Request
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* INDICATORS */}
        <div className="mt-10 flex justify-center gap-2">
          {carouselItems.map((item, index) => (
            <span
              key={item.title}
              className={`h-2.5 rounded-full transition-all ${
                index === 0
                  ? "w-8 bg-slate-900"
                  : "w-2.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ANIMATION */}
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