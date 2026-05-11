"use client";

import React from "react";
import Image from "next/image";
import {
  Sparkles,
  Utensils,
  Wrench,
  Footprints,
  Settings,
  Droplets,
  LucideIcon,
} from "lucide-react";

type Service = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type CommercialCleaningServicesProps = {
  title?: string;
  tagline?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  services?: Service[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  onServiceClick?: (serviceId: string) => void;
};

const DEFAULT_SERVICES: Service[] = [
  { id: "office", label: "Office Cleaning", icon: Sparkles },
  { id: "restaurant", label: "Restaurant Cleaning", icon: Utensils },
  { id: "post-construction", label: "Post Construction Cleaning", icon: Wrench },
  { id: "floor-care", label: "Floor Care & Maintenance", icon: Footprints },
  { id: "building", label: "Building Maintenance", icon: Settings },
  { id: "deep", label: "Deep Cleaning", icon: Droplets },
];

const CommercialCleaningServices: React.FC<CommercialCleaningServicesProps> = ({
  title = "Commercial Cleaning Services",
  tagline = '"We Keep Your Business Sparkling Clean"',
  description = "Our experienced and reliable team specializes in commercial cleaning for offices, restaurants, schools, and more delivering spotless results every time.",
  imageSrc = "/images/kitchen.jpg",
  imageAlt = "Clean commercial restaurant interior",
  services = DEFAULT_SERVICES,
  ctaLabel = "Start Cleaning",
  onCtaClick,
  onServiceClick,
}) => {
  return (
    <section
      className="w-full bg-white py-12 px-4 sm:px-6 lg:px-12"
      aria-labelledby="commercial-cleaning-heading"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left: Text Content */}
        <div className="order-2 lg:order-1">
          <h2
            id="commercial-cleaning-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight"
          >
            {title}
          </h2>
          <p className="mt-3 text-blue-600 italic text-base sm:text-lg">
            {tagline}
          </p>
          <p className="mt-4 text-gray-600 text-sm sm:text-base max-w-xl leading-relaxed">
            {description}
          </p>

          {/* Services Grid */}
          <ul
            role="list"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5"
          >
            {services.map((service) => {
              const Icon = service.icon;
              const isClickable = Boolean(onServiceClick);
              return (
                <li key={service.id} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50"
                  >
                    <Icon className="h-6 w-6 text-blue-600" strokeWidth={1.75} />
                  </span>
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onServiceClick?.(service.id)}
                      className="text-left text-gray-800 font-medium underline underline-offset-4 decoration-1 hover:text-blue-600 transition-colors"
                    >
                      {service.label}
                    </button>
                  ) : (
                    <a
                      href={`#${service.id}`}
                      className="text-gray-800 font-medium underline underline-offset-4 decoration-1 hover:text-blue-600 transition-colors"
                    >
                      {service.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <div className="mt-10">
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
            >
              {ctaLabel}
            </button>
          </div>
        </div>

        {/* Right: Image */}
        <div className="order-1 lg:order-2 relative w-full aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default CommercialCleaningServices;
