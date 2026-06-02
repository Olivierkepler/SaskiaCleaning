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

  const ease = [0.16, 1, 0.3, 1] as const;

  const sectionVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  };

  const blockFadeUp: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 40,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        ease,
      },
    },
  };

  const planGridVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const viewportSettings = {
    once: false,
    amount: 0.15,
    margin: "-60px",
  } as const;

  return (
    <motion.section
      aria-labelledby="plans-heading"
      className="relative w-full overflow-hidden bg-white py-24"
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewportSettings}
    >
      {/* TOP CURVE */}
      <div className="absolute top-0 left-0 z-[2] w-full overflow-hidden leading-[0]">
        <svg
          className="relative block h-[120px] w-[calc(100%+1.3px)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39 56.44C197.8 89.92 0 120 0 120V0h1200v27.35c-86.91 25.8-208.8 58.23-348.84 62.15-147.19 4.14-243.45-23.08-358.66-35.71-87.53-9.61-172.8-3.2-271.11 2.65Z"
            className="fill-white"
          />
        </svg>
      </div>

      {/* Background Image */}
      <motion.div
        aria-hidden="true"
        variants={{
          hidden: {
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 1.05,
          },
          show: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: 1.4,
              ease,
            },
          },
        }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url(${backgroundImageSrc})`,
        }}
      />

      {/* Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-950/55"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        
        {/* TOP BANNER */}
        
<motion.div
  variants={blockFadeUp}
  className="
    relative overflow-hidden rounded-[2.5rem]
    bg-white px-6 py-8
    shadow-[0_25px_80px_rgba(15,23,42,0.08)]
    ring-1 ring-slate-200/60
    sm:px-10 sm:py-10 lg:px-14 lg:py-12
  "
>
  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
    
    <div className="max-w-2xl">
      {/* <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-500">
        Commercial Services
      </p> */}

      <h2
        id="plans-heading"
        className="
          max-w-2xl
          font-[family-name:var(--font-cormorant)]
          text-[clamp(1.4rem,2.5vw,2.6rem)]
          font-semibold
          leading-[0.95]
          tracking-[-0.04em]
          text-slate-900
        "
      >
 
        {title}
      </h2>

      <div className="mt-5 max-w-xl space-y-2.5 text-[15px] leading-7 tracking-[-0.01em] text-slate-600">
        {description.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-5">
      
      <motion.div
        aria-hidden="true"
        className="hidden text-sky-500 md:block"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                rotate: [0, 8, -8, 0],
                scale: [1, 1.04, 1],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles
          className="h-14 w-14"
          strokeWidth={1.5}
        />
      </motion.div>

      <motion.button
        type="button"
        onClick={onContactClick}
        whileHover={
          prefersReducedMotion
            ? undefined
            : { y: -3, scale: 1.02 }
        }
        whileTap={
          prefersReducedMotion
            ? undefined
            : { scale: 0.97 }
        }
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 18,
        }}
        className="
          group inline-flex items-center justify-center gap-2 rounded-full
          bg-sky-500 px-7 py-3.5
          text-[10px] font-semibold uppercase tracking-[0.16em]
          text-white shadow-lg transition hover:bg-slate-900
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
          focus-visible:ring-offset-2
        "
      >
        {contactLabel}

        <ArrowUpRight
          size={13}
          className="
            transition-transform duration-300
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
          "
        />
      </motion.button>
    </div>
  </div>
</motion.div>



        {/* SECTION TITLE */}
        <motion.h3
          variants={blockFadeUp}
          className="
            mt-16 text-center
            font-[family-name:var(--font-cormorant)]
            text-[clamp(1.8rem,3vw,3rem)]
            font-semibold
            leading-[1]
            tracking-[-0.04em]
            text-white sm:mt-20
          "
        >
          Plans
        </motion.h3>

        {/* PLANS GRID */}
        <motion.div
          variants={planGridVariants}
          className="
            mt-10 grid grid-cols-1 gap-6
            sm:mt-12 md:grid-cols-3 lg:gap-8
          "
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              variants={blockFadeUp}
              reduced={prefersReducedMotion ?? false}
              onClick={onPlanClick}
            />
          ))}
        </motion.div>
      </div>

      {/* BOTTOM CURVE */}
      <div className="absolute bottom-0 left-0 z-[2] w-full overflow-hidden leading-[0] rotate-180">
        <svg
          className="relative block h-[120px] w-[calc(100%+1.3px)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39 56.44C197.8 89.92 0 120 0 120V0h1200v27.35c-86.91 25.8-208.8 58.23-348.84 62.15-147.19 4.14-243.45-23.08-358.66-35.71-87.53-9.61-172.8-3.2-271.11 2.65Z"
            className="fill-white"
          />
        </svg>
      </div>
    </motion.section>
  );
}

type PlanCardProps = {
  plan: Plan;
  onClick?: (planId: string) => void;
  variants: Variants;
  reduced: boolean;
};

function PlanCard({
  plan,
  onClick,
  variants,
  reduced,
}: PlanCardProps) {
  const Icon = plan.icon;

  const headerBg = plan.featured
    ? "bg-sky-500"
    : "bg-slate-900";

  const ctaClasses = plan.featured
    ? "bg-sky-500 text-white hover:bg-slate-900"
    : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50";

  return (
    <motion.article
      variants={variants}
      whileHover={
        reduced
          ? undefined
          : { y: -10, scale: 1.015 }
      }
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 20,
      }}
      className="
        group relative flex flex-col overflow-hidden rounded-[1.75rem]
        bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        transition-shadow duration-300
        hover:shadow-[0_30px_70px_rgba(14,165,233,0.15)]
      "
    >
      {/* Hover Glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.15),transparent_60%)]
          opacity-0 transition-opacity duration-500
          group-hover:opacity-100
        "
      />

      {/* Card Header */}
      <div className={`${headerBg} relative px-6 py-5 text-center`}>
        <h4
          className="
            font-[family-name:var(--font-cormorant)]
            text-[1.7rem] font-semibold
            leading-none tracking-[-0.035em]
            text-white sm:text-[1.95rem]
          "
        >
          {plan.name}
        </h4>
      </div>

      {/* Card Body */}
      <div
        className="
          relative flex flex-1 flex-col items-center
          px-6 py-8 text-center
          sm:px-8 sm:py-10
        "
      >
        <motion.span
          aria-hidden="true"
          className="
            flex h-16 w-16 items-center justify-center
            rounded-full bg-sky-500/10
          "
          whileHover={
            reduced
              ? undefined
              : { scale: 1.12, rotate: -8 }
          }
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
          }}
        >
          <Icon
            className="h-8 w-8 text-sky-500"
            strokeWidth={1.75}
          />
        </motion.span>

        <p className="mt-5 flex-1 text-[15px] leading-7 tracking-[-0.01em] text-slate-600">
          {plan.description}
        </p>

        <motion.button
          type="button"
          onClick={() => onClick?.(plan.id)}
          whileHover={
            reduced
              ? undefined
              : { scale: 1.04 }
          }
          whileTap={
            reduced
              ? undefined
              : { scale: 0.97 }
          }
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 16,
          }}
          className={`
            group mt-8 inline-flex items-center justify-center gap-2 rounded-full
            px-6 py-3.5
            text-[10px] font-semibold uppercase tracking-[0.16em]
            shadow-sm transition-all duration-300
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-slate-900 focus-visible:ring-offset-2
            ${ctaClasses}
          `}
        >
          {plan.ctaLabel ?? "Get A Quote"}

          <ArrowUpRight
            size={13}
            className="
              transition-transform duration-300
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          />
        </motion.button>
      </div>
    </motion.article>
  );
}