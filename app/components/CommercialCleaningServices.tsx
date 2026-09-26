"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

type Service = {
  id: string;
  label: string;
  image: string;
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
  {
    id: "office",
    label: "Office Cleaning",
    image: "/commercial/office.png",
  },
  {
    id: "restaurant",
    label: "Restaurant Cleaning",
    image: "/commercial/RestaurantCleaning.png",
  },
  {
    id: "post-construction",
    label: "Post Construction Cleaning",
    image: "/commercial/PostConstruction.png",
  },
  {
    id: "floor-care",
    label: "Floor Care & Maintenance",
    image: "/commercial/FloorMaintenance.png",
  },
  {
    id: "building",
    label: "Building Maintenance",
    image: "/commercial/BuildingMaintenance.png",
  },
  {
    id: "deep",
    label: "Deep Cleaning",
    image: "/commercial/DeepCleaning1.png",
  },
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

  const resolvedTitle =
    title ?? t("commercialServicesTitle");

  const resolvedTagline =
    tagline ?? t("commercialServicesTagline");

  const resolvedDescription =
    description ?? t("commercialServicesBody");

  const resolvedImageAlt =
    imageAlt ?? t("commercialImageAlt");

  const resolvedCtaLabel =
    ctaLabel ?? t("startCleaning");

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
    DEFAULT_SERVICES.map((service) => ({
      ...service,
      label: labelById[service.id] ?? service.label,
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
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const fadeUp: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 24,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease,
      },
    },
  };

  const imageVariants: Variants = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : 34,
      scale: prefersReducedMotion ? 1 : 0.985,
    },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.95,
        ease,
      },
    },
  };

  return (
    <motion.section
      id="commercial-cleaning"
      aria-labelledby="commercial-cleaning-heading"
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: 0.2,
        margin: "-80px",
      }}
      className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32"
    >
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[72rem] -translate-x-1/2 rounded-full bg-sky-100/35 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-8rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-slate-100/60 blur-[90px]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        {/* Left content */}
        <div className="order-2 lg:order-1">
          <motion.div
            variants={fadeUp}
            aria-hidden="true"
            className="mb-5 h-[3px] w-10 rounded-full bg-sky-500"
          />

          <motion.h2
            id="commercial-cleaning-heading"
            variants={fadeUp}
            className="max-w-2xl font-heading text-[clamp(2.5rem,4vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-slate-950"
          >
            {resolvedTitle}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-[clamp(1.35rem,2vw,1.85rem)] font-light italic leading-tight tracking-[-0.035em] text-sky-500"
          >
            “{resolvedTagline}”
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-[15px] leading-8 text-slate-500 sm:text-[16px]"
          >
            {resolvedDescription}
          </motion.p>

          {/* Services */}
          <motion.ul
            role="list"
            variants={sectionVariants}
            className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2"
          >
            {resolvedServices.map((service, index) => (
              <motion.li
                key={service.id}
                variants={fadeUp}
                className="group"
              >
                <button
                  type="button"
                  onClick={() =>
                    handleServiceClick(service.id)
                  }
                  className="
                    flex
                    min-h-[76px]
                    w-full
                    cursor-pointer
                    items-center
                    gap-4
                    rounded-[18px]
                    border
                    border-slate-200/70
                    bg-white/80
                    px-3
                    py-3
                    text-left
                    shadow-[0_6px_20px_rgba(15,23,42,0.035)]
                    backdrop-blur-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-sky-200
                    hover:bg-sky-50/40
                    hover:shadow-[0_10px_28px_rgba(14,165,233,0.08)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-sky-500
                    focus-visible:ring-offset-2
                  "
                >
                  {/* Service image — gentle staggered bounce */}
                  <motion.span
                    className="
                      relative
                      h-18
                      w-18
                      shrink-0
                      overflow-visible
                    "
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : {
                          y: [0, -5, 0],
                        }
                    }
                    transition={{
                      duration: 2.8,
                      delay: index * 0.18,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="72px"
                      className="
                        object-contain
                        p-1
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      "
                    />
                  </motion.span>

                  <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span
                      className="
                        text-[15px]
                        font-semibold
                        leading-snug
                        tracking-[-0.025em]
                        text-slate-900
                        transition-colors
                        group-hover:text-sky-600
                      "
                    >
                      {service.label}
                    </span>

                    <ArrowUpRight
                      aria-hidden="true"
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-slate-300
                        transition-all
                        duration-300
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                        group-hover:text-sky-500
                      "
                      strokeWidth={1.8}
                    />
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA */}
          <motion.div
            className="mt-10"
            variants={fadeUp}
          >
            <motion.button
              type="button"
              onClick={handleCtaClick}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { y: -2 }
              }
              whileTap={
                prefersReducedMotion
                  ? undefined
                  : { scale: 0.985 }
              }
              className="
                group
                inline-flex
                min-h-[50px]
                items-center
                justify-center
                gap-3
                rounded-[14px]
                bg-slate-950
                px-6
                py-3.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
                shadow-[0_10px_24px_rgba(15,23,42,0.14)]
                transition-all
                duration-300
                hover:bg-sky-500
                hover:shadow-[0_14px_30px_rgba(14,165,233,0.2)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-500
                focus-visible:ring-offset-2
              "
            >
              <span>{resolvedCtaLabel}</span>

              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.8}
                />
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Main commercial image */}
        <motion.div
          variants={imageVariants}
          whileHover={
            prefersReducedMotion
              ? undefined
              : {
                y: -6,
              }
          }
          transition={{
            duration: 0.45,
            ease,
          }}
          className="group relative order-1 lg:order-2"
        >
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -inset-5
              rounded-[36px]
              bg-sky-100/35
              blur-2xl
              transition-all
              duration-700
              group-hover:bg-sky-200/45
              group-hover:blur-3xl
            "
          />

          {/* Image frame */}
          <div
            className="
              relative
              aspect-[4/3]
              w-full
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200/70
              bg-slate-100
              shadow-[0_20px_60px_rgba(15,23,42,0.10)]
              transition-all
              duration-500
              ease-out
              group-hover:border-sky-200/80
              group-hover:shadow-[0_32px_90px_rgba(14,165,233,0.16)]
              lg:aspect-[5/4]
            "
          >
            <motion.div
              className="relative h-full w-full"
              variants={{
                hidden: {
                  scale: prefersReducedMotion
                    ? 1
                    : 1.05,
                },
                show: {
                  scale: 1,
                  transition: {
                    duration: 1.1,
                    ease,
                  },
                },
              }}
            >
              <Image
                src={imageSrc}
                alt={resolvedImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="
                  object-cover
                  object-center
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.045]
                "
                priority
              />

              {/* Subtle image treatment */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-slate-950/10
                  via-transparent
                  to-white/[0.04]
                  transition-all
                  duration-500
                  group-hover:from-slate-950/15
                  group-hover:to-white/[0.08]
                "
              />

              {/* Soft highlight */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-tr
                  from-transparent
                  via-transparent
                  to-white/0
                  opacity-0
                  transition-all
                  duration-700
                  group-hover:to-white/10
                  group-hover:opacity-100
                "
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}