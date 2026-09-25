"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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
    imageSrc: "/commercial/basic.png",
    description:
      "Essential care for smaller spaces, high-traffic areas, restrooms, and shared environments.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "advance",
    name: "Advance",
    icon: Sparkles,
    featured: true,
    imageSrc: "/commercial/advnace2.png",
    description:
      "Detailed sanitation, floor attention, surface care, and flexible scheduling for larger spaces.",
    ctaLabel: "Get A Quote",
  },
  {
    id: "premium",
    name: "Premium",
    icon: Building2,
    imageSrc: "/commercial/premium.png",
    description:
      "Complete facility care with polished standards, specialty services, and ongoing support.",
    ctaLabel: "Get A Quote",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

function scrollToQuote() {
  document.getElementById("quote")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function CommercialCleaningPlans({
  title,
  description,
  contactLabel,
  onContactClick,
  plans,
  onPlanClick,
  backgroundImageSrc = "/images/kitchen.jpg",
}: CommercialCleaningPlansProps) {
  const t = useTranslations("home");
  const prefersReducedMotion = useReducedMotion();

  const resolvedTitle = title ?? `${t("commercialTitle")} `;
  const resolvedDescription = description ?? [t("commercialDescription")];
  const resolvedContactLabel = contactLabel ?? t("contactUs");

  const resolvedPlans =
    plans ??
    DEFAULT_PLANS.map((plan) => ({
      ...plan,
      name:
        plan.id === "basic"
          ? t("planBasic")
          : plan.id === "advance"
            ? t("planAdvance")
            : t("planPremium"),
      description:
        plan.id === "basic"
          ? t("planBasicDesc")
          : plan.id === "advance"
            ? t("planAdvanceDesc")
            : t("planPremiumDesc"),
      ctaLabel: t("getAQuote"),
    }));

  const handleContactClick = () => {
    onContactClick?.();
    scrollToQuote();
  };

  const handlePlanClick = (planId: string) => {
    onPlanClick?.(planId);
    scrollToQuote();
  };

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
      y: prefersReducedMotion ? 0 : 36,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.8,
        ease,
      },
    },
  };

  const gridVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
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

      {/* Background image */}
      <motion.div
        aria-hidden="true"
        variants={{
          hidden: {
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 1.04,
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
        style={{
          backgroundImage: `url(${backgroundImageSrc})`,
        }}
      />

      {/* Background treatment */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/24 backdrop-blur-[1px]"
      />

      <div
        aria-hidden="true"
        className="
          absolute inset-0
          bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(248,250,252,0.08)_45%,rgba(255,255,255,0.22)_100%)]
        "
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        <div className="relative">
          {/* Ambient decoration */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -left-20 top-20
              h-72 w-72
              rounded-full
              bg-sky-300/10
              blur-[100px]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -right-20 bottom-0
              h-80 w-80
              rounded-full
              bg-blue-200/10
              blur-[110px]
            "
          />

          <motion.div
            variants={gridVariants}
            className="
              relative z-10
              grid grid-cols-1
              gap-6
              md:grid-cols-3
              lg:gap-7
              xl:gap-8
            "
          >
            {resolvedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                variants={fadeUpVariants}
                reduced={prefersReducedMotion ?? false}
                onClick={handlePlanClick}
                mostPopularLabel={t("mostPopular")}
                fallbackCtaLabel={t("getAQuote")}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <Curve position="bottom" />
    </motion.section>
  );
}

function Curve({
  position,
}: {
  position: "top" | "bottom";
}) {
  return (
    <div
      aria-hidden="true"
      className={`
        absolute left-0 z-[2] w-full overflow-hidden leading-[0]
        ${position === "top" ? "top-0" : "bottom-0 rotate-180"}
      `}
    >
      <svg
        className="relative block h-[100px] w-[calc(100%+1.3px)] sm:h-[120px]"
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
  mostPopularLabel: string;
  fallbackCtaLabel: string;
};

function PlanCard({
  plan,
  onClick,
  variants,
  reduced,
  mostPopularLabel,
  fallbackCtaLabel,
}: PlanCardProps) {
  return (
    <motion.article
      variants={variants}
      whileHover={
        reduced
          ? undefined
          : {
              y: -8,
            }
      }
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
      }}
      className="
        group
        relative
        flex h-full flex-col
        overflow-hidden
        rounded-[24px]
        border border-white/80
        bg-white
        shadow-[0_18px_55px_rgba(15,23,42,0.10)]
        ring-1 ring-slate-950/[0.035]
        transition-[box-shadow,border-color]
        duration-500
        hover:border-sky-200/90
        hover:shadow-[0_30px_80px_rgba(15,23,42,0.16)]
      "
    >
      {/* Image */}
      <div
        className="
          relative
          aspect-[4/3]
          w-full
          overflow-hidden
          bg-slate-100
        "
      >
        {plan.imageSrc ? (
          <Image
            src={plan.imageSrc}
            alt={plan.name}
            fill
            sizes="
              (max-width: 767px) 100vw,
              (max-width: 1279px) 33vw,
              430px
            "
            className="
              object-cover
              transition-transform
              duration-700
              ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:scale-[1.045]
            "
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <Wind
              aria-hidden="true"
              className="h-12 w-12 text-sky-500"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Image readability treatment */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-t
            from-slate-950/20
            via-transparent
            to-black/[0.03]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0
            h-24
            bg-gradient-to-t
            from-black/20
            to-transparent
          "
        />

        {/* Most popular badge */}
        {/* {plan.featured && (
          <div
            className="
              absolute left-5 top-5 z-20
              inline-flex
              items-center
              gap-2
              rounded-full
              border border-white/40
              bg-sky-500/95
              px-3.5 py-2
              text-white
              shadow-[0_8px_25px_rgba(2,132,199,0.28)]
              backdrop-blur-md
            "
          >
            <Sparkles
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.17em]
              "
            >
              {mostPopularLabel}
            </span>
          </div>
        )} */}

        {/* Plan label over image */}
        <div className="absolute bottom-4 left-5 z-10">
          <div
            className="
              inline-flex
              items-center
              rounded-full
              border border-white/30
              bg-slate-950/45
              px-3 py-1.5
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-white
              shadow-sm
              backdrop-blur-md
            "
          >
            {plan.name}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="
          relative
          flex flex-1 flex-col
          px-6 pb-6 pt-7
          sm:px-7 sm:pb-7
          lg:px-7
        "
      >
        {/* Subtle top accent */}
        <div
          aria-hidden="true"
          className="
            absolute left-7 top-0
            h-[2px] w-10
            -translate-y-px
            rounded-full
            bg-sky-500
          "
        />

        <div className="flex flex-1 flex-col">
          <h4
            className="
              font-heading
              text-[clamp(1.8rem,2.2vw,2.25rem)]
              font-medium
              leading-[1.02]
              tracking-[-0.04em]
              text-slate-950
            "
          >
            {plan.name}
          </h4>

          <p
            className="
              mt-4
              max-w-[34rem]
              text-[14px]
              leading-[1.75]
              text-slate-500
            "
          >
            {plan.description}
          </p>
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={() => onClick?.(plan.id)}
          whileTap={reduced ? undefined : { scale: 0.985 }}
          className="
            mt-7
            inline-flex
            min-h-12
            w-full
            cursor-pointer
            items-center
            justify-between
            rounded-[14px]
            bg-[#0F172A]
            px-5 py-3.5
            text-left
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-white
            shadow-[0_8px_24px_rgba(15,23,42,0.14)]
            transition-all
            duration-300
            hover:bg-sky-500
            hover:shadow-[0_12px_30px_rgba(14,165,233,0.24)]
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-sky-500
            focus-visible:ring-offset-2
          "
        >
          <span>{plan.ctaLabel ?? fallbackCtaLabel}</span>

          <span
            className="
              flex
              h-8 w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white/10
              ring-1 ring-white/10
              transition-all
              duration-300
              group-hover:bg-white/20
              group-hover:ring-white/20
            "
          >
            <ArrowUpRight
              aria-hidden="true"
              size={15}
              strokeWidth={1.9}
              className="
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </span>
        </motion.button>
      </div>
    </motion.article>
  );
}