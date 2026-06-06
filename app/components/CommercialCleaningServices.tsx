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

export default function CommercialCleaningServices({
  title = "Commercial Cleaning Services",
  tagline = "We Keep Your Business Sparkling Clean",
  description = "Our experienced and reliable team specializes in commercial cleaning for offices, restaurants, schools, and more — delivering spotless results every time.",
  imageSrc = "/images/kitchen.jpg",
  imageAlt = "Clean commercial restaurant interior",
  services = DEFAULT_SERVICES,
  ctaLabel = "Start Cleaning",
  onCtaClick,
  onServiceClick,
}: CommercialCleaningServicesProps) {
  const prefersReducedMotion = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  const sectionVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 40 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 1, ease },
    },
  };

  return (
    <motion.section
      className="relative overflow-hidden bg-white px-6 py-24 sm:py-28 lg:px-12 lg:py-32"
      aria-labelledby="commercial-cleaning-heading"
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: false,
        amount: 0.2,
        margin: "-80px",
      }}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
         

          <motion.h2
            id="commercial-cleaning-heading"
            className="font-heading text-[clamp(2.7rem,3.5vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-slate-950"
            variants={fadeUp}
          >
            {title}
          </motion.h2>

          <motion.p
            className="mt-5 text-2xl font-light italic tracking-[-0.03em] text-slate-400 sm:text-3xl"
            variants={fadeUp}
          >
            “{tagline}”
          </motion.p>

          <motion.p
            className="mt-6 max-w-xl text-[15px] leading-8 text-slate-500 sm:text-lg"
            variants={fadeUp}
          >
            {description}
          </motion.p>

          <motion.ul
            role="list"
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2"
            variants={sectionVariants}
          >
            {services.map((service) => {
              const Icon = service.icon;
              const isClickable = Boolean(onServiceClick);

              return (
                <motion.li
                  key={service.id}
                  variants={fadeUp}
                  className="group flex items-center gap-4"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sky-500/10 text-sky-500 transition duration-300 group-hover:bg-sky-500 group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>

                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onServiceClick?.(service.id)}
                      className="text-left text-xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 transition hover:text-sky-500"
                    >
                      {service.label}
                    </button>
                  ) : (
                    <a
                      href={`#${service.id}`}
                      className="text-xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 transition hover:text-sky-500"
                    >
                      {service.label}
                    </a>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>

          <motion.div className="mt-10" variants={fadeUp}>
            <motion.button
              type="button"
              onClick={onCtaClick}
              whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="rounded-full bg-sky-500 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_32px_rgba(14,165,233,0.24)] transition hover:bg-slate-950"
            >
              {ctaLabel}
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="order-1 relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-[0_28px_90px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 lg:order-2 lg:aspect-[5/4]"
          variants={imageVariants}
        >
          <motion.div
            className="relative h-full w-full"
            variants={{
              hidden: { scale: prefersReducedMotion ? 1 : 1.08 },
              show: { scale: 1, transition: { duration: 1.2, ease } },
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
}