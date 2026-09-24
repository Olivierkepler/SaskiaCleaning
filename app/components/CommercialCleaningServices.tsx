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
import { useTranslations } from "next-intl";

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

function scrollToQuote() {
  document.getElementById("quote")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function CommercialCleaningServices({
  title,
  tagline,
  description,
  imageSrc = "/images/kitchen.jpg",
  imageAlt,
  services,
  ctaLabel,
  onCtaClick,
  onServiceClick,
}: CommercialCleaningServicesProps) {
  const t = useTranslations("home");
  const prefersReducedMotion = useReducedMotion();
  const resolvedTitle = title ?? t("commercialServicesTitle");
  const resolvedTagline = tagline ?? t("commercialServicesTagline");
  const resolvedDescription = description ?? t("commercialServicesBody");
  const resolvedImageAlt = imageAlt ?? t("commercialImageAlt");
  const resolvedCtaLabel = ctaLabel ?? t("startCleaning");
  const labelById: Record<string, string> = {
    office: t("officeCleaning"),
    restaurant: t("restaurantCleaning"),
    "post-construction": t("postConstructionCleaning"),
    "floor-care": t("floorCareMaintenance"),
    building: t("buildingMaintenance"),
    deep: t("deepCleaningService"),
  };
  const resolvedServices =
    services ??
    DEFAULT_SERVICES.map((s) => ({
      ...s,
      label: labelById[s.id] ?? s.label,
    }));
  const ease = [0.16, 1, 0.3, 1] as const;

  const handleCtaClick = () => {
    onCtaClick?.();
    scrollToQuote();
  };

  const handleServiceClick = (serviceId: string) => {
    onServiceClick?.(serviceId);
    scrollToQuote();
  };

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
      id="commercial-cleaning"
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
            {resolvedTitle}
          </motion.h2>

          <motion.p
            className="mt-5 text-2xl font-light italic tracking-[-0.03em] text-sky-500 sm:text-3xl"
            variants={fadeUp}
          >
            “{resolvedTagline}”
          </motion.p>

          <motion.p
            className="mt-6 max-w-xl text-[15px] leading-8 text-slate-500 sm:text-lg"
            variants={fadeUp}
          >
            {resolvedDescription}
          </motion.p>

          <motion.ul
            role="list"
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2"
            variants={sectionVariants}
          >
            {resolvedServices.map((service) => {
              const Icon = service.icon;

              return (
                <motion.li
                  key={service.id}
                  variants={fadeUp}
                  className="group flex items-center gap-4"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sky-500/10 text-sky-500 transition duration-300 group-hover:bg-sky-500 group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>

                  <button
                    type="button"
                    onClick={() => handleServiceClick(service.id)}
                    className="text-left text-xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 transition hover:text-sky-500"
                  >
                    {service.label}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>

          <motion.div className="mt-10" variants={fadeUp}>
            <motion.button
              type="button"
              onClick={handleCtaClick}
              whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="rounded-full bg-sky-500 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_32px_rgba(14,165,233,0.24)] transition hover:bg-slate-950"
            >
              {resolvedCtaLabel}
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
              alt={resolvedImageAlt}
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