"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
  ctaLabel?: string;
};

type CommercialCleaningPlansProps = {
  title?: string;
  description?: string[];
  contactLabel?: string;
  onContactClick?: () => void;
  plans?: Plan[];
  onPlanClick?: (planId: string) => void;
  backgroundImageSrc?: string;
};

const DEFAULT_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    icon: Wind,
    description:
      "Essential care for smaller spaces, high-traffic areas, restrooms, and shared environments.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "advance",
    name: "Advance",
    icon: Sparkles,
    featured: true,
    description:
      "Detailed sanitation, floor attention, surface care, and flexible scheduling for larger spaces.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "premium",
    name: "Premium",
    icon: Building2,
    description:
      "Complete facility care with polished standards, specialty services, and ongoing support.",
    ctaLabel: "Get A Quote",
  },
];

export default function CommercialCleaningPlans({
  title = "Commercial Cleaning Service Plans",
  description = [
    "Choose the plan that best fits your company’s needs — from routine maintenance to complete facility care.",
    "Every plan can be customized around your space, schedule, and cleaning priorities.",
  ],
  contactLabel = "Contact Us",
  onContactClick,
  plans = DEFAULT_PLANS,
  onPlanClick,
  backgroundImageSrc = "/images/kitchen.jpg",
}: CommercialCleaningPlansProps) {
  const prefersReducedMotion = useReducedMotion();
  const ease = [0.19, 1, 0.22, 1] as const;

  const fadeUp: Variants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease },
    },
  };

  const stagger: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.14,
        delayChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  };

  return (
    <section
      aria-labelledby="plans-heading"
      className="relative w-full overflow-hidden bg-[#f6f4ee]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${backgroundImageSrc})` }}
      />

      <div aria-hidden="true" className="absolute inset-0 bg-black/45" />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-[#f6f4ee]/85 to-[#f6f4ee]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="
            relative overflow-hidden rounded-[2rem]
            bg-green-950 px-6 py-8
            shadow-[0_30px_90px_rgba(15,23,42,0.18)]
            sm:px-10 sm:py-10 lg:px-14 lg:py-12
          "
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                Commercial Services
              </p>

              <h2
                id="plans-heading"
                className="
                  max-w-2xl font-serif
                  text-[clamp(1.75rem,3.4vw,3.2rem)]
                  leading-[1] tracking-[-0.04em]
                  text-white
                "
              >
                {title}
              </h2>

              <div className="mt-5 max-w-xl space-y-2.5 text-[14px] font-normal leading-6 tracking-[-0.01em] text-white/80 sm:text-[15px]">
                {description.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-5">
              <motion.div
                aria-hidden="true"
                className="hidden text-white/85 md:block"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { rotate: [0, 8, -8, 0], scale: [1, 1.04, 1] }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-14 w-14" strokeWidth={1.5} />
              </motion.div>

              <motion.button
                type="button"
                onClick={onContactClick}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="
                  group inline-flex items-center justify-center gap-2 rounded-full
                  bg-white px-7 py-3.5
                  text-[10px] font-semibold uppercase tracking-[0.16em]
                  text-green-950 shadow-lg transition hover:bg-stone-50
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                  focus-visible:ring-offset-2 focus-visible:ring-offset-green-950
                "
              >
                {contactLabel}
                <ArrowUpRight
                  size={13}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.h3
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="
            mt-16 text-center font-serif
            text-[clamp(1.7rem,3vw,2.8rem)]
            leading-[1] tracking-[-0.04em]
            text-zinc-950 sm:mt-20
          "
        >
          Plans
        </motion.h3>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-3 lg:gap-8"
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              variants={fadeUp}
              reduced={prefersReducedMotion ?? false}
              onClick={onPlanClick}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

type PlanCardProps = {
  plan: Plan;
  onClick?: (planId: string) => void;
  variants: Variants;
  reduced: boolean;
};

function PlanCard({ plan, onClick, variants, reduced }: PlanCardProps) {
  const Icon = plan.icon;

  const headerBg = plan.featured ? "bg-green-950" : "bg-zinc-950";

  const ctaClasses = plan.featured
    ? "bg-green-950 text-white hover:bg-zinc-950"
    : "bg-white text-zinc-950 border border-stone-300 hover:bg-stone-50";

  return (
    <motion.article
      variants={variants}
      whileHover={reduced ? undefined : { y: -8, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="
        group relative flex flex-col overflow-hidden rounded-[1.75rem]
        bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        transition duration-300
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_50%_0%,rgba(20,83,45,0.12),transparent_55%)]
          opacity-0 transition-opacity duration-500
          group-hover:opacity-100
        "
      />

      <div className={`${headerBg} relative px-6 py-5 text-center`}>
        <h4 className="font-serif text-[1.55rem] leading-none tracking-[-0.035em] text-white sm:text-[1.8rem]">
          {plan.name}
        </h4>
      </div>

      <div className="relative flex flex-1 flex-col items-center px-6 py-8 text-center sm:px-8 sm:py-10">
        <motion.span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-green-950/8"
          whileHover={reduced ? undefined : { scale: 1.1, rotate: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          <Icon className="h-8 w-8 text-green-950" strokeWidth={1.75} />
        </motion.span>

        <p className="mt-5 flex-1 text-[14px] font-normal leading-6 tracking-[-0.01em] text-stone-600">
          {plan.description}
        </p>

        <motion.button
          type="button"
          onClick={() => onClick?.(plan.id)}
          whileHover={reduced ? undefined : { scale: 1.03 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className={`
            group mt-8 inline-flex items-center justify-center gap-2 rounded-full
            px-6 py-3.5
            text-[10px] font-semibold uppercase tracking-[0.16em]
            shadow-sm transition-all
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-green-900 focus-visible:ring-offset-2
            ${ctaClasses}
          `}
        >
          {plan.ctaLabel ?? "Get A Quote"}
          <ArrowUpRight
            size={13}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </motion.button>
      </div>
    </motion.article>
  );
}
