"use client";

import Image from "next/image";

const serviceCategories = [
  {
    title: "Residential Cleaning",
    description: "Home cleaning packages for apartments, houses, and move-in or move-out needs.",
    services: [
      {
        name: "Basic Cleaning",
        price: "$100",
        priceNote: "starting price",
        image: "/images/services/basic-cleaning.jpg",
        description: "Light cleaning for bedrooms, bathrooms, kitchen surfaces, floors, and common areas.",
      },
      {
        name: "Standard Cleaning",
        price: "$140",
        priceNote: "starting price",
        image: "/images/services/standard-cleaning.jpg",
        description: "A fuller cleaning service including dusting, vacuuming, mopping, counters, sinks, and bathroom refresh.",
      },
      {
        name: "Deep Cleaning",
        price: "$220",
        priceNote: "starting price",
        image: "/images/services/deep-cleaning.jpg",
        description: "Detailed cleaning for neglected areas, baseboards, appliances, fixtures, and high-touch surfaces.",
      },
      {
        name: "Move-In / Move-Out Cleaning",
        price: "$250",
        priceNote: "starting price",
        image: "/images/services/move-cleaning.jpg",
        description: "Complete cleaning for empty homes, apartments, and rental spaces before or after moving.",
      },
    ],
  },
  {
    title: "Commercial Cleaning",
    description: "Professional cleaning services for offices, retail spaces, and small businesses.",
    services: [
      {
        name: "Office Cleaning",
        price: "$0.15",
        priceNote: "per sq. ft.",
        image: "/images/services/office-cleaning.jpg",
        description: "Cleaning for desks, floors, trash removal, bathrooms, break rooms, and shared workspaces.",
      },
      {
        name: "Retail Cleaning",
        price: "$0.18",
        priceNote: "per sq. ft.",
        image: "/images/services/retail-cleaning.jpg",
        description: "Keeps storefronts, fitting rooms, floors, counters, and customer areas clean and welcoming.",
      },
      {
        name: "Small Business Cleaning",
        price: "$180",
        priceNote: "starting price",
        image: "/images/services/business-cleaning.jpg",
        description: "Flexible cleaning for salons, studios, clinics, shops, and small professional spaces.",
      },
      {
        name: "Recurring Janitorial Cleaning",
        price: "$350",
        priceNote: "weekly starting price",
        image: "/images/services/janitorial-cleaning.jpg",
        description: "Scheduled maintenance cleaning for businesses that need consistent weekly service.",
      },
    ],
  },
  {
    title: "Laundry Services",
    description: "Laundry care for clients who need clothes, bedding, and linens washed, dried, and folded.",
    services: [
      {
        name: "Wash & Fold",
        price: "$1.75",
        priceNote: "per pound",
        image: "/images/services/wash-fold.jpg",
        description: "Clothes are washed, dried, folded neatly, and prepared for pickup or delivery.",
      },
      {
        name: "Wash, Dry & Fold",
        price: "$25",
        priceNote: "per load",
        image: "/images/services/wash-dry-fold.jpg",
        description: "A complete laundry load service for everyday clothing, towels, and personal items.",
      },
      {
        name: "Ironing / Pressing",
        price: "$3",
        priceNote: "per item",
        image: "/images/services/ironing.jpg",
        description: "Wrinkle removal and pressing for shirts, pants, dresses, uniforms, and business wear.",
      },
      {
        name: "Bedding & Linen Cleaning",
        price: "$35",
        priceNote: "starting price",
        image: "/images/services/linen-cleaning.jpg",
        description: "Laundry care for sheets, pillowcases, comforters, blankets, towels, and household linens.",
      },
      {
        name: "Pickup & Delivery Laundry",
        price: "$15",
        priceNote: "service fee",
        image: "/images/services/laundry-pickup.jpg",
        description: "Convenient laundry pickup and drop-off service for busy clients.",
      },
      {
        name: "Same-Day Laundry",
        price: "+$20",
        priceNote: "rush fee",
        image: "/images/services/same-day-laundry.jpg",
        description: "Fast laundry turnaround for clients who need their clothes cleaned quickly.",
      },
    ],
  },
  {
    title: "Specialty Cleaning",
    description: "Extra cleaning services for specific areas, materials, or larger cleaning needs.",
    services: [
      {
        name: "Carpet Cleaning",
        price: "$45",
        priceNote: "per room",
        image: "/images/services/carpet-cleaning.jpg",
        description: "Refreshes carpets by targeting dirt, stains, odors, and high-traffic areas.",
      },
      {
        name: "Window Cleaning",
        price: "$8",
        priceNote: "per window",
        image: "/images/services/window-cleaning.jpg",
        description: "Interior window cleaning for clearer glass, frames, and window sills.",
      },
      {
        name: "Post-Construction Cleaning",
        price: "$300",
        priceNote: "starting price",
        image: "/images/services/post-construction.jpg",
        description: "Removes dust, debris, residue, and construction mess after renovation or building work.",
      },
      {
        name: "Appliance Cleaning",
        price: "$30",
        priceNote: "per appliance",
        image: "/images/services/appliance-cleaning.jpg",
        description: "Detailed cleaning for appliances such as fridges, ovens, microwaves, and dishwashers.",
      },
    ],
  },
  {
    title: "Add-On Services",
    description: "Optional extras clients can add to their cleaning package.",
    services: [
      {
        name: "Inside Fridge Cleaning",
        price: "$25",
        priceNote: "add-on",
        image: "/images/services/fridge-cleaning.jpg",
        description: "Interior refrigerator cleaning including shelves, drawers, and visible spills.",
      },
      {
        name: "Oven Cleaning",
        price: "$30",
        priceNote: "add-on",
        image: "/images/services/oven-cleaning.jpg",
        description: "Interior oven cleaning to remove buildup, grease, and food residue.",
      },
      {
        name: "Pet Hair Removal",
        price: "$20",
        priceNote: "add-on",
        image: "/images/services/pet-hair-removal.jpg",
        description: "Extra vacuuming and detail work for pet hair on furniture, floors, and fabrics.",
      },
      {
        name: "Cabinet Cleaning",
        price: "$35",
        priceNote: "add-on",
        image: "/images/services/cabinet-cleaning.jpg",
        description: "Wiping cabinet doors, handles, and exterior surfaces in kitchens or bathrooms.",
      },
      {
        name: "Eco-Friendly Products",
        price: "$10",
        priceNote: "add-on",
        image: "/images/services/eco-cleaning.jpg",
        description: "Use of eco-conscious cleaning products upon client request.",
      },
      {
        name: "Extra Bathroom Cleaning",
        price: "$25",
        priceNote: "per bathroom",
        image: "/images/services/bathroom-cleaning.jpg",
        description: "Additional bathroom cleaning for larger homes or extra service needs.",
      },
    ],
  },
];

export default function CleaningServicesPricing() {
  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-600">
            Our Services
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Cleaning & Laundry Service Pricing
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Choose from residential cleaning, commercial cleaning, laundry care,
            specialty services, and add-ons. Prices may vary depending on home size,
            condition, location, and custom requests.
          </p>
        </div>

        <div className="space-y-16">
          {serviceCategories.map((category) => (
            <div key={category.title}>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">{category.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.services.map((service) => (
                  <article
                    key={service.name}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <h4 className="text-lg font-semibold text-slate-950">
                          {service.name}
                        </h4>
                        <div className="text-right">
                          <p className="text-xl font-bold text-teal-600">{service.price}</p>
                          <p className="text-xs text-slate-500">{service.priceNote}</p>
                        </div>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {service.description}
                      </p>

                      <button className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600">
                        Request Service
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
