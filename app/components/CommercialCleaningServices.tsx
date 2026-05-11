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
  { id: "post-construction", label: "Post‑Construction Cleaning", icon: Wrench },
  { id: "floor-care", label: "Floor Care & Maintenance", icon: Footprints },
  { id: "building", label: "Building Maintenance", icon: Settings },
  { id: "deep", label: "Deep Cleaning Services", icon: Droplets },
];

const CommercialCleaningServices: React.FC<CommercialCleaningServicesProps> = ({
  title = "Commercial Cleaning Services",
  tagline = "Where Professional Spaces Stay Immaculate",
  description = "We deliver high‑standard commercial cleaning for offices, restaurants, medical buildings, and facilities that demand consistency, precision, and trust.",
  imageSrc = "/images/kitchen.jpg",
  imageAlt = "Professional commercial cleaning environment",
  services = DEFAULT_SERVICES,
  ctaLabel = "Request a Quote",
  onCtaClick,
  onServiceClick,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const ease = [0.19, 1, 0.22, 1] as const;

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease },
    },
  };

  const imageVariants: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: 48, scale: 0.96 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.9, ease },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* TEXT COLUMN */}
        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.span
            variants={itemVariants}
            className="inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700"
          >
            Commercial Grade Cleaning
          </motion.span>

          <motion.h2
            variants={itemVariants}
            className="mt-5 font-serif text-4xl sm:text-5xl font-medium leading-tight tracking-tight text-gray-900"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-xl text-lg italic font-light text-blue-600"
          >
            {tagline}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-xl text-base leading-relaxed text-gray-600"
          >
            {description}
          </motion.p>

          {/* SERVICES */}
          <motion.ul
            variants={containerVariants}
            role="list"
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.li
                  key={service.id}
                  variants={itemVariants}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : { y: -4, boxShadow: "0 20px 30px -12px rgba(0,0,0,.12)" }
                  }
                  className="group relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-5 shadow-sm transition"
                >
                  <button
                    onClick={() => onServiceClick?.(service.id)}
                    className="flex w-full items-center gap-4 text-left focus:outline-none"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md">
                      <Icon className="h-6 w-6" strokeWidth={1.6} />
                    </span>
                    <span className="font-serif text-lg font-medium tracking-tight text-gray-900 group-hover:text-blue-700 transition">
                      {service.label}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* CTA */}
          <motion.div variants={itemVariants} className="mt-12">
            <motion.button
              onClick={onCtaClick}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-4 font-serif text-base font-medium text-white shadow-lg shadow-gray-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {ctaLabel}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative aspect-[5/4] overflow-hidden rounded-3xl shadow-2xl"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/10 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};

export default CommercialCleaningServices;
