"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Wind, Sparkles, Building2, type LucideIcon } from "lucide-react";

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
      "Ideal for smaller facilities or regular maintenance cleanings. Includes essential care for high-traffic areas, restrooms, and shared spaces to keep your business looking polished.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "advance",
    name: "Advance",
    icon: Sparkles,
    featured: true,
    description:
      "Recommended for medium to large facilities that need deeper care. Includes the Basic Plan plus detailed sanitation, floor attention, surface detailing, and flexible scheduling.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "premium",
    name: "Premium",
    icon: Building2,
    description:
      "Our most complete plan for facilities that require elevated standards. Includes detailed maintenance, floor polishing, high-surface cleaning, and full facility support.",
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

  const heroVariants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease },
    },
  };

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
        delayChildren: prefersReducedMotion ? 0 : 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease },
    },
  };

  const titleVariants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease },
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
          variants={heroVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="
            relative overflow-hidden rounded-[2rem]
            bg-green-950
            px-6 py-8
            shadow-[0_30px_90px_rgba(15,23,42,0.18)]
            sm:px-10 sm:py-10
            lg:px-14 lg:py-12
          "
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
                Commercial Services
              </p>

              <h2
                id="plans-heading"
                className="
                  font-serif
                  text-[clamp(2rem,4vw,4rem)]
                  leading-[0.96]
                  tracking-[-0.045em]
                  text-white
                "
              >
                {title}
              </h2>

              <div
                className="
                  mt-5 space-y-3
                  text-[15px] font-light leading-7 tracking-[-0.01em]
                  text-white/85
                  sm:text-base
                "
              >
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
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
                className="
                  inline-flex items-center justify-center rounded-full
                  bg-white
                  px-7 py-3.5
                  text-[11px] font-semibold uppercase tracking-[0.18em]
                  text-green-950
                  shadow-lg transition
                  hover:bg-stone-50
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-green-950
                "
              >
                {contactLabel}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.h3
          variants={titleVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="
            mt-16 text-center
            font-serif
            text-[clamp(2rem,4vw,3.5rem)]
            leading-none
            tracking-[-0.045em]
            text-zinc-950
            sm:mt-20
          "
        >
          Plans
        </motion.h3>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-3 lg:gap-8"
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={onPlanClick}
              variants={cardVariants}
              reduced={prefersReducedMotion ?? false}
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
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 22,
      }}
      className="
        flex flex-col overflow-hidden rounded-[1.75rem]
        bg-white
        shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        transition duration-300
      "
    >
      <div className={`${headerBg} px-6 py-5 text-center`}>
        <h4
          className="
            font-serif
            text-2xl leading-none tracking-[-0.04em]
            text-white
            sm:text-[2rem]
          "
        >
          {plan.name}
        </h4>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 py-8 text-center sm:px-8 sm:py-10">
        <motion.span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-green-950/8"
          whileHover={reduced ? undefined : { scale: 1.08, rotate: -4 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 18,
          }}
        >
          <Icon className="h-8 w-8 text-green-950" strokeWidth={1.75} />
        </motion.span>

        <p
          className="
            mt-6 flex-1
            text-[15px] font-light leading-7 tracking-[-0.01em]
            text-stone-600
          "
        >
          {plan.description}
        </p>

        <motion.button
          type="button"
          onClick={() => onClick?.(plan.id)}
          whileHover={reduced ? undefined : { scale: 1.03 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 18,
          }}
          className={`
            mt-8 inline-flex items-center justify-center rounded-full
            px-6 py-3.5
            text-[10px] font-semibold uppercase tracking-[0.18em]
            shadow-sm transition-all
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-900
            focus-visible:ring-offset-2
            ${ctaClasses}
          `}
        >
          {plan.ctaLabel ?? "Get A Quote"}
        </motion.button>
      </div>
    </motion.article>
  );
}
