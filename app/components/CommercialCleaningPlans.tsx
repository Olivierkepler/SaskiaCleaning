"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, Building2, LucideIcon, Sparkles, Wind } from "lucide-react";

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
      "Essential upkeep for smaller spaces, high-traffic areas, restrooms, and shared environments.",
    ctaLabel: "Request Quote",
  },
  {
    id: "advance",
    name: "Advanced",
    icon: Sparkles,
    featured: true,
    description:
      "A deeper level of care with enhanced sanitation, detailed surfaces, floor attention, and flexible scheduling.",
    ctaLabel: "Request Quote",
  },
  {
    id: "premium",
    name: "Premium",
    icon: Building2,
    description:
      "Complete facility care for spaces that require polished standards, specialty services, and ongoing support.",
    ctaLabel: "Request Quote",
  },
];

export default function CommercialCleaningPlans({
  title = "Commercial Cleaning Plans",
  description = [
    "Flexible service packages designed for offices, facilities, and commercial spaces that need consistent professional care.",
    "Every plan can be tailored to your schedule, square footage, and cleaning priorities.",
  ],
  contactLabel = "Talk To Us",
  onContactClick,
  plans = DEFAULT_PLANS,
  onPlanClick,
  backgroundImageSrc = "/images/kitchen.jpg",
}: CommercialCleaningPlansProps) {
  const prefersReducedMotion = useReducedMotion();
  const ease = [0.19, 1, 0.22, 1] as const;

  const fadeUp: Variants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 26 },
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
        delayChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };

  return (
    <section
      aria-labelledby="commercial-plans-heading"
      className="relative isolate overflow-hidden bg-[#f6f4ee] py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${backgroundImageSrc})` }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(246,244,238,0.92)_0%,rgba(246,244,238,0.82)_45%,rgba(246,244,238,1)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.24]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
          className="relative overflow-hidden rounded-[2rem] bg-green-950 px-6 py-8 shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-10 sm:py-10 lg:px-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.16),transparent_34%)]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                Service Options
              </p>

              <h2
                id="commercial-plans-heading"
                className="font-serif text-[clamp(2rem,4vw,4rem)] leading-[0.95] tracking-[-0.045em] text-white"
              >
                {title}
              </h2>

              <div className="mt-5 max-w-2xl space-y-2 text-[15px] font-light leading-7 text-white/75 sm:text-base">
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
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-950 shadow-lg transition hover:bg-[#f6f4ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-950 sm:w-auto"
            >
              {contactLabel}
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </motion.button>
          </div>
        </motion.div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 sm:mt-20 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-green-950/55">
              Compare Plans
            </p>
            <h3 className="mt-3 font-serif text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-[-0.045em] text-zinc-950">
              Choose Your Level of Care
            </h3>
          </div>

          <p className="max-w-md text-sm leading-6 text-stone-600">
            Start with a plan, then customize the details around your facility,
            schedule, and cleaning standards.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
          className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6"
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

  return (
    <motion.article
      variants={variants}
      whileHover={reduced ? undefined : { y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`
        group relative flex min-h-[430px] flex-col overflow-hidden rounded-[2rem]
        border bg-white/82 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]
        backdrop-blur-md transition duration-300
        ${
          plan.featured
            ? "border-green-950/20 ring-1 ring-green-950/10"
            : "border-white/70"
        }
      `}
    >
      {plan.featured && (
        <div className="absolute right-5 top-5 rounded-full bg-green-950 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
          Popular
        </div>
      )}

      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-green-950/8 text-green-950">
        <Icon size={24} strokeWidth={1.7} />
      </div>

      <div className="mt-8">
        <h4 className="font-serif text-3xl leading-none tracking-[-0.04em] text-zinc-950">
          {plan.name}
        </h4>

        <p className="mt-5 text-[15px] font-light leading-7 text-stone-600">
          {plan.description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onClick?.(plan.id)}
        className={`
          mt-auto inline-flex items-center justify-center gap-2 rounded-full
          px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em]
          transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2
          ${
            plan.featured
              ? "bg-green-950 text-white hover:bg-zinc-950"
              : "border border-stone-300 bg-white text-zinc-950 hover:border-green-950"
          }
        `}
      >
        {plan.ctaLabel ?? "Request Quote"}
        <ArrowUpRight
          size={14}
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </button>
    </motion.article>
  );
}
