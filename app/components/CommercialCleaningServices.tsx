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

  // Fine-tuned elegant easing curve (Expo-out)
  const ease = [0.16, 1, 0.3, 1] as const;

  // Master layout orchestrator for the entire section view
  const sectionVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };

  // Base typography items fade & lift
  const typographyVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease },
    },
  };

  // Services list wrapper to delay stagger child line items smoothly
  const listContainerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
      },
    },
  };

  // Individual list items fade & lift with spring alignment
  const listItemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // Modern reveal container for the image
  const imageContainerVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: prefersReducedMotion ? 0 : 30,
    },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 1, ease },
    },
  };

  return (
    <motion.section
      className="w-full bg-white py-16 px-4 sm:px-6 lg:px-12 overflow-hidden"
      aria-labelledby="commercial-cleaning-heading"
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      // UPDATED VIEWPORT SETTINGS 👇
      viewport={{ 
        once: false,       // Allows multi-directional animations (up & down)
        amount: 0.2,       // Fires when 20% of the block cuts into view
        margin: "-100px"   // Safe screen-edge padding to prevent jittering on rapid scrolling
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        
        {/* Left: Text Content */}
        <div className="order-2 lg:order-1">
          <motion.h2
            id="commercial-cleaning-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight text-gray-900"
            variants={typographyVariants}
          >
            {title}
          </motion.h2>
          
          <motion.p
            className="mt-3 font-serif text-lg sm:text-xl font-light italic tracking-tight text-blue-600"
            variants={typographyVariants}
          >
            {tagline}
          </motion.p>
          
          <motion.p
            className="mt-4 text-sm sm:text-base font-light leading-relaxed text-gray-600 max-w-xl"
            variants={typographyVariants}
          >
            {description}
          </motion.p>

          {/* Services Grid with its own cascade on scroll */}
          <motion.ul
            role="list"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5"
            variants={listContainerVariants}
          >
            {services.map((service) => {
              const Icon = service.icon;
              const isClickable = Boolean(onServiceClick);
              return (
                <motion.li
                  key={service.id}
                  className="flex items-center gap-4 group"
                  variants={listItemVariants}
                >
                  <motion.span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 transition-colors duration-300 group-hover:bg-blue-100"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.1, rotate: -5 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Icon className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:scale-105" strokeWidth={1.75} />
                  </motion.span>
                  
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onServiceClick?.(service.id)}
                      className="text-left font-serif text-lg sm:text-xl font-medium tracking-tight leading-tight text-gray-900 underline underline-offset-4 decoration-1 hover:text-blue-600 transition-colors duration-300"
                    >
                      {service.label}
                    </button>
                  ) : (
                    <a
                      href={`#${service.id}`}
                      className="font-serif text-lg sm:text-xl font-medium tracking-tight leading-tight text-gray-900 underline underline-offset-4 decoration-1 hover:text-blue-600 transition-colors duration-300"
                    >
                      {service.label}
                    </a>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>

          {/* CTA Button Entry */}
          <motion.div className="mt-10" variants={typographyVariants}>
            <motion.button
              type="button"
              onClick={onCtaClick}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 font-serif text-sm sm:text-base font-medium tracking-tight text-white shadow-sm hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-300"
            >
              {ctaLabel}
            </motion.button>
          </motion.div>
        </div>

        {/* Right: Image Component with subtle Parallax Entrance */}
        <motion.div
          className="order-1 lg:order-2 relative w-full aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-2xl shadow-lg"
          variants={imageContainerVariants}
        >
          <motion.div 
            className="w-full h-full relative"
            variants={{
              hidden: { scale: prefersReducedMotion ? 1 : 1.12 },
              show: { scale: 1, transition: { duration: 1.2, ease } }
            }}
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
        </motion.div>

      </div>
    </motion.section>
  );
};

export default CommercialCleaningServices;