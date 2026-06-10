"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Icon,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

type Plan = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
  ctaLabel?: string;
  imageSrc?: string;
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
    imageSrc: "/images/Designer(1).png",
    description:
      "Essential care for smaller spaces, high-traffic areas, restrooms, and shared environments.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "advance",
    name: "Advance",
    icon: Sparkles,
    featured: true,
    imageSrc: "/images/Designer(2).png",
    description:
      "Detailed sanitation, floor attention, surface care, and flexible scheduling for larger spaces.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "premium",
    name: "Premium",
    icon: Building2,
    imageSrc: "/images/Designer(3).png",
    description:
      "Complete facility care with polished standards, specialty services, and ongoing support.",
    ctaLabel: "Get A Quote",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function CommercialCleaningPlans({
  title = "Commercial Cleaning ",
  description = [
    "Choose the plan that best fits your company's needs — from routine maintenance to complete facility care.",

  ],
  contactLabel = "Contact Us",
  onContactClick,
  plans = DEFAULT_PLANS,
  onPlanClick,
  backgroundImageSrc = "/images/kitchen.jpg",
}: CommercialCleaningPlansProps) {
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  };

  const fadeUpVariants: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 40,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.85,
        ease,
      },
    },
  };

  const gridVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  return (
    <motion.section
      id="plans"  
      aria-labelledby="plans-heading"
      className="relative w-full overflow-hidden bg-white py-24"
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: false,
        amount: 0.15,
        margin: "-60px",
      }}
    >
      <Curve position="top" />

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
              duration: prefersReducedMotion ? 0.01 : 1.4,
              ease,
            },
          },
        }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${backgroundImageSrc})` }}
      />

      {/* <div aria-hidden="true" className="absolute inset-0 bg-slate-950/55" /> */}

   {/* Blue overlay */}
   <div className="absolute inset-0 bg-gradient-to-r from-[#172b45]/60 via-[#29496b]/40 to-[#7fb6e7]/20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <motion.div
          variants={fadeUpVariants}
          className="
            rounded-[0.75rem]
            bg-white
            px-5 py-6
            sm:px-8 sm:py-7
            shadow-[0_12px_40px_rgba(15,23,42,0.06)]
            ring-1 ring-slate-200/50
          "
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2
                id="plans-heading"
                className="
                  font-heading
                  text-[clamp(1.5rem,2vw,2.2rem)]
                  font-semibold
                  leading-[0.95]
                  tracking-[-0.03em]
                  text-slate-950
                "
              >
                {title}
               <span className="text-sky-500">Service Plans</span>
              </h2>

              <div className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
                {description.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <motion.button
              type="button"
              onClick={onContactClick}
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="
                inline-flex items-center gap-2
                rounded-full
                bg-sky-500
                cursor-pointer
                px-5 py-3
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-white
                transition
                hover:bg-sky-600
              "
            >
              {contactLabel}
              <ArrowUpRight
                size={12}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </motion.button>
          </div>
        </motion.div>

        <br />

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-8 top-8 h-28 w-28 rounded-full bg-sky-100/50 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 bottom-10 h-36 w-36 rounded-full bg-slate-100 blur-3xl"
          />
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 right-16 h-8 w-8 text-sky-200"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l2.9 6.9H22l-5.5 4.5 2.1 6.9L12 17.8l-6.6 3.5 2.1-6.9L2 8.9h7.1z" />
          </svg>

          <motion.div
            variants={gridVariants}
            className="relative z-10 mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-3 lg:gap-8"
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                variants={fadeUpVariants}
                reduced={prefersReducedMotion ?? false}
                onClick={onPlanClick}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <Curve position="bottom" />
    </motion.section>
  );
}

function Curve({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden="true"
      className={`
        absolute left-0 z-[2] w-full overflow-hidden leading-[0]
        ${position === "top" ? "top-0" : "bottom-0 rotate-180"}
      `}
    >
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
  );
}

type PlanCardProps = {
  plan: Plan;
  onClick?: (planId: string) => void;
  variants: Variants;
  reduced: boolean;
};

function PlanCard({ plan, onClick, variants, reduced }: PlanCardProps) {
  return (
    <motion.article
      variants={variants}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className="
        group relative flex h-full flex-col overflow-hidden rounded-[10px]
        border border-neutral-200 bg-white
        shadow-sm transition-all duration-300
        hover:border-sky-500 hover:shadow-[0_18px_45px_rgba(12,26,46,0.12)]
      "
    >
      {plan.featured && (
        <div className="absolute left-0 top-4 z-10 bg-sky-500 px-3 py-1">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-neutral-200 bg-[#F8F8F8]">
        {plan.imageSrc ? (
          <Image
            src={plan.imageSrc}
            alt={plan.name}
            width={190}
            height={190}
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <Wind className="h-10 w-10 text-sky-500" strokeWidth={1.75} />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between px-5 py-5 text-center">
        <div>
          <h4
            className="
              font-serif text-[clamp(26px,2vw,34px)]
              font-bold leading-none tracking-[-0.02em]
              text-slate-950
            "
          >
            {plan.name}
          </h4>

          <p className="mx-auto mt-3 max-w-[260px] text-[13px] leading-6 text-slate-500">
            {plan.description}
          </p>
        </div>

        <motion.button
          type="button"
          onClick={() => onClick?.(plan.id)}
          whileHover={reduced ? undefined : { scale: 1.01 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          className="
            mt-6 inline-flex w-full items-center justify-center gap-2
            border border-sky-500 bg-transparent px-6 py-3
            text-[11px] font-black uppercase tracking-[0.14em]
            text-sky-500 transition-all duration-200
            hover:bg-sky-500 hover:text-white
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-sky-500 focus-visible:ring-offset-2
            cursor-pointer
          "
        >
          {plan.ctaLabel ?? "Get A Quote"}
          <ArrowUpRight
            aria-hidden="true"
            size={13}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </motion.button>
      </div>
    </motion.article>
  );
}