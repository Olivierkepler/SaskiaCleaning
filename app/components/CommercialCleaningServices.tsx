"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion, Variants } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();

  // Easing matches the InfoBar — expo-out
  const ease = [0.19, 1, 0.22, 1] as const;

  // Parent stagger for the left-column children
  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  // Each text/service item rises and fades in
  const itemVariants: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease },
    },
  };

  // Image slides in from the right
  const imageVariants: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: 40, scale: 0.97 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.9, ease },
    },
  };

  return (
    <section
      className="w-full bg-white py-12 px-4 sm:px-6 lg:px-12 overflow-hidden"
      aria-labelledby="commercial-cleaning-heading"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left: Text Content */}
        <motion.div
          className="order-2 lg:order-1"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            id="commercial-cleaning-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight text-gray-900"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          <motion.p
            className="mt-3 font-serif text-lg sm:text-xl font-light italic tracking-tight text-blue-600"
            variants={itemVariants}
          >
            {tagline}
          </motion.p>
          <motion.p
            className="mt-4 text-sm sm:text-base font-light leading-relaxed text-gray-600 max-w-xl"
            variants={itemVariants}
          >
            {description}
          </motion.p>

          {/* Services Grid */}
          <ul
            role="list"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5"
          >
            {services.map((service) => {
              const Icon = service.icon;
              const isClickable = Boolean(onServiceClick);
              return (
                <motion.li
                  key={service.id}
                  className="flex items-center gap-4 group"
                  variants={itemVariants}
                >
                  <motion.span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 transition-colors group-hover:bg-blue-100"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.08, rotate: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  >
                    <Icon className="h-6 w-6 text-blue-600" strokeWidth={1.75} />
                  </motion.span>
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onServiceClick?.(service.id)}
                      className="text-left font-serif text-lg sm:text-xl font-medium tracking-tight leading-tight text-gray-900 underline underline-offset-4 decoration-1 hover:text-blue-600 transition-colors"
                    >
                      {service.label}
                    </button>
                  ) : (
                    <a
                      href={`#${service.id}`}
                      className="font-serif text-lg sm:text-xl font-medium tracking-tight leading-tight text-gray-900 underline underline-offset-4 decoration-1 hover:text-blue-600 transition-colors"
                    >
                      {service.label}
                    </a>
                  )}
                </motion.li>
              );
            })}
          </ul>

          {/* CTA */}
          <motion.div className="mt-10" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={onCtaClick}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 font-serif text-sm sm:text-base font-medium tracking-tight text-white shadow-sm hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          className="order-1 lg:order-2 relative w-full aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-2xl shadow-lg"
          variants={imageVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CommercialCleaningServices;
