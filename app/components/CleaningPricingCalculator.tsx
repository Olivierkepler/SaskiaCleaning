"use client";

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

export default function CleaningServicesPricing() {
  return (
    <section className="relative overflow-hidden bg-[#FCFAF8] px-6 py-20 sm:px-8 lg:px-16">
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-stone-200/40 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="text-[10px] tracking-[0.35em] uppercase text-stone-400 font-semibold block mb-6">
            Professional Cleaning Services
          </span>

          <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-[#1A1A1A] leading-[1.1]">
            Cleaning & Laundry Pricing Made Simple
          </h2>

          <p className="mt-6 text-lg md:text-xl font-light text-stone-500 leading-relaxed">
            Choose from residential cleaning, commercial cleaning, laundry care,
            specialty services, Airbnb turnover cleaning, and add-ons.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {serviceCategories.map((category) => (
            <article
              key={category.title}
              className="group overflow-hidden rounded-sm bg-white shadow-sm border border-stone-200/60 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-64 w-full overflow-hidden bg-stone-200">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover grayscale-[10%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/25 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <span className="mb-3 inline-block text-[9px] font-bold uppercase tracking-[0.25em] text-stone-200">
                    {category.tag}
                  </span>

                  <h3 className="text-2xl md:text-3xl font-serif text-white tracking-tight">
                    {category.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-sm font-light text-stone-600 leading-relaxed">
                  {category.description}
                </p>

                <div className="mt-6 divide-y divide-stone-100 overflow-hidden border border-stone-100 bg-[#FCFAF8]/80">
                  {category.services.map((service) => (
                    <div
                      key={`${category.title}-${service.name}`}
                      className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-white"
                    >
                      <span className="text-sm font-light text-stone-700">
                        {service.name}
                      </span>

                      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-[#1A1A1A] border border-stone-200 bg-white px-3 py-1.5">
                        {service.price}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="group/btn relative mt-6 w-full overflow-hidden bg-[#1A1A1A] px-5 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-white transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
                >
                  <span className="relative z-10">Request This Service</span>
                  <div className="absolute inset-0 bg-stone-700 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-3xl text-center text-[11px] uppercase tracking-[0.2em] text-stone-400 font-medium leading-relaxed">
          Final pricing may vary based on property size, condition, frequency,
          laundry volume, location, and custom client requests.
        </p>
      </div>
    </section>
  );
}