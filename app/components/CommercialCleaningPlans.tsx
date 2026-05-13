"use client";

import React from "react";import { motion, useReducedMotion, Variants } from "framer-motion";import { Wind, Sparkles, Building2, LucideIcon } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Plan = {id: string;name: string;description: string;icon: LucideIcon;featured?: boolean;ctaLabel?: string;};

type CommercialCleaningPlansProps = {title?: string;description?: string[];contactLabel?: string;onContactClick?: () => void;plans?: Plan[];onPlanClick?: (planId: string) => void;backgroundImageSrc?: string;};

/* ─── Default Data ──────────────────────────────────────────────────────── */

const DEFAULT_PLANS: Plan[] = [{id: "basic",name: "Basic",icon: Wind,description:"Ideal for smaller facilities or regular maintenance cleanings. Includes essential cleaning for high-traffic areas, restrooms, and common spaces to maintain a consistent professional appearance.",ctaLabel: "Get A Quote",},{id: "advance",name: "Advance",icon: Sparkles,featured: true,description:"Recommended for medium to large facilities requiring deeper care and detailed attention. Includes everything from the Basic Plan plus advanced services such as deep floor cleaning, detailed surface sanitation, and flexible scheduling.",ctaLabel: "Get A Quote",},{id: "premium",name: "Premium",icon: Building2,description:"Our most complete plan, designed for facilities that demand top-tier cleaning standards and specialized services. Includes detailed maintenance, floor polishing, high-surface cleaning, and full facility management support.",ctaLabel: "Get A Quote",},];

/* ─── Component ─────────────────────────────────────────────────────────── */

const CommercialCleaningPlans: React.FC = ({title = "Commercial Cleaning Service Plans",description = ["Choose the plan that best fits your company's needs — from basic maintenance to complete facility care.","All plans are fully customizable based on your space, schedule, and cleaning priorities.",],contactLabel = "Contact Us",onContactClick,plans = DEFAULT_PLANS,onPlanClick,backgroundImageSrc = "/images/kitchen.jpg",}) => {const prefersReducedMotion = useReducedMotion();const ease = [0.19, 1, 0.22, 1] as const;

const heroVariants: Variants = {hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24 },show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },};

const containerVariants: Variants = {hidden: {},show: {transition: {staggerChildren: prefersReducedMotion ? 0 : 0.15,delayChildren: prefersReducedMotion ? 0 : 0.2,},},};

const cardVariants: Variants = {hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 },show: {opacity: 1,y: 0,transition: { duration: 0.7, ease },},};

const titleVariants: Variants = {hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 },show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },};

return ({/* Fixed background image — stays in place while content scrolls over it /}<divaria-hidden="true"className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"style={{ backgroundImage: url(${backgroundImageSrc}) }}/>{/ Dark overlay on the fixed image /}{/ Bottom fade so the cards sit on a lighter surface as you scroll past */}

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20">
    {/* Hero Card */}
    <motion.div
      variants={heroVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="relative rounded-2xl bg-blue-600 px-6 sm:px-10 lg:px-14 py-8 sm:py-10 shadow-xl"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl">
          <h2
            id="plans-heading"
            className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight leading-tight text-white"
          >
            {title}
          </h2>
          <div className="mt-4 space-y-2 text-sm sm:text-base font-light leading-relaxed text-white/90">
            {description.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {/* Decorative sparkle icon */}
          <motion.div
            aria-hidden="true"
            className="hidden md:block text-white/90"
            animate={
              prefersReducedMotion
                ? undefined
                : { rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-16 w-16" strokeWidth={1.5} />
          </motion.div>

          <motion.button
            type="button"
            onClick={onContactClick}
            whileHover={
              prefersReducedMotion ? undefined : { scale: 1.04 }
            }
            whileTap={
              prefersReducedMotion ? undefined : { scale: 0.97 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 font-serif text-sm sm:text-base font-medium tracking-tight text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
          >
            {contactLabel}
          </motion.button>
        </div>
      </div>
    </motion.div>

    {/* "Plans" section label */}
    <motion.h3
      variants={titleVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-16 sm:mt-20 text-center font-serif text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 drop-shadow-sm"
    >
      Plans
    </motion.h3>

    {/* Plan Cards */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
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

);};

/* ─── PlanCard ──────────────────────────────────────────────────────────── */

type PlanCardProps = {plan: Plan;onClick?: (planId: string) => void;variants: Variants;reduced: boolean;};

const PlanCard: React.FC = ({plan,onClick,variants,reduced,}) => {const Icon = plan.icon;const headerBg = plan.featured ? "bg-blue-600" : "bg-gray-900";const ctaClasses = plan.featured? "bg-gray-900 text-white hover": "bg-white text-gray-900 border border-gray-300 hover";

return (<motion.articlevariants={variants}whileHover={reduced ? undefined : { y: -6 }}transition={{ type: "spring", stiffness: 300, damping: 22 }}className="flex flex-col rounded-2xl overflow-hidden bg-white shadow-lg">{/* Header */}<div className={${headerBg} px-6 py-5 text-center}>{plan.name}

  {/* Body */}
  <div className="flex flex-col items-center flex-1 px-6 py-8 sm:px-8 sm:py-10 text-center">
    <motion.span
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50"
      whileHover={reduced ? undefined : { scale: 1.08, rotate: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      <Icon className="h-8 w-8 text-blue-600" strokeWidth={1.75} />
    </motion.span>

    <p className="mt-6 text-sm sm:text-base font-light leading-relaxed text-gray-600 flex-1">
      {plan.description}
    </p>

    <motion.button
      type="button"
      onClick={() => onClick?.(plan.id)}
      whileHover={reduced ? undefined : { scale: 1.04 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`mt-8 inline-flex items-center justify-center rounded-md px-6 py-3 font-serif text-sm sm:text-base font-medium tracking-tight shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors ${ctaClasses}`}
    >
      {plan.ctaLabel ?? "Get A Quote"}
    </motion.button>
  </div>
</motion.article>

);};

export default CommercialCleaningPlans;
