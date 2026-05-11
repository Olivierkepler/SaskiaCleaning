"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type ServiceIconType =
  | "office"
  | "restaurant"
  | "construction"
  | "floor"
  | "building"
  | "deep";

type ServiceItem = {
  icon: ServiceIconType;
  title: string;
  href?: string;
};

type CommercialServicesProps = {
  onCtaClick?: () => void;
};

/* ─── Data ────────────────────────────────────────────────────────────────── */

const SERVICES: ServiceItem[] = [
  { icon: "office", title: "Office Cleaning", href: "#office-cleaning" },
  { icon: "restaurant", title: "Restaurant Cleaning", href: "#restaurant-cleaning" },
  { icon: "construction", title: "Post-Construction Cleaning", href: "#post-construction" },
  { icon: "floor", title: "Floor Care & Maintenance", href: "#floor-care" },
  { icon: "building", title: "Building Maintenance", href: "#building-maintenance" },
  { icon: "deep", title: "Deep Cleaning", href: "#deep-cleaning" },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function CommercialServices({ onCtaClick }: CommercialServicesProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Commercial cleaning services"
      className="relative overflow-hidden bg-[#FCFAF8] py-20 sm:py-24 md:py-28 lg:py-32"
    >
      {/* Subtle dotted grain — ties to the hero / infobar texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 sm:px-8 md:gap-16 lg:grid-cols-12 lg:gap-20 lg:px-16">
        {/* ─── Left: Text & Services Grid ─────────────────── */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
          className="lg:col-span-6"
        >
          {/* Eyebrow */}
          <span className="mb-4 block text-[10px] font-semibold uppercase tracking-[0.35em] text-green-900 sm:tracking-[0.4em]">
            What We Do
          </span>

          {/* Title */}
          <h2
            className="
              mb-3 font-serif tracking-tight text-zinc-950
              text-3xl leading-[1] sm:text-4xl md:text-5xl lg:text-[3.25rem]
            "
          >
            Commercial Cleaning <br />
            <span className="italic text-stone-400">Services</span>
          </h2>

          {/* Subhead */}
          <p className="mb-6 font-serif text-base italic text-green-900 sm:text-lg">
            “We keep your business sparkling clean.”
          </p>

          {/* Description */}
          <p className="mb-10 max-w-xl text-sm font-light leading-relaxed text-stone-600 sm:text-base md:mb-12 md:text-lg">
            Our experienced and reliable team specializes in commercial
            cleaning for offices, restaurants, schools, and more — delivering
            spotless results every time.
          </p>

          {/* Services grid */}
          <ul className="mb-10 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:mb-12 md:gap-y-6">
            {SERVICES.map((service, i) => (
              <ServiceItemComponent
                key={service.title}
                service={service}
                index={i}
                prefersReducedMotion={prefersReducedMotion ?? false}
              />
            ))}
          </ul>

          {/* CTA */}
          <button
            type="button"
            onClick={onCtaClick}
            className="
              group relative inline-flex w-full overflow-hidden border border-green-900 bg-green-900
              px-8 py-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white
              transition-all duration-300 hover:shadow-[0_18px_45px_rgba(20,83,45,0.18)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2
              sm:w-auto sm:px-10
            "
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Cleaning
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
            <span className="absolute inset-0 translate-y-full bg-zinc-950 transition-transform duration-300 ease-out group-hover:translate-y-0" />
          </button>
        </motion.div>

        {/* ─── Right: Image ─────────────────────────────── */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
          className="relative lg:col-span-6"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm shadow-2xl lg:aspect-[5/4]">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
              alt="Pristine restaurant interior cleaned by Saskia Cleaning Services"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1200ms] hover:scale-[1.03]"
            />

            {/* Image frame accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20"
            />
          </div>

          {/* Decorative offset border behind the image */}
          <div
            aria-hidden="true"
            className="
              absolute -bottom-4 -right-4 -z-10 hidden h-full w-full
              border border-green-900/30 md:block
              lg:-bottom-6 lg:-right-6
            "
          />

          {/* Floating credentials card — Licensed & Insured */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="
              absolute -bottom-6 left-4 hidden bg-white px-6 py-4 shadow-xl
              sm:flex sm:items-center sm:gap-4 sm:left-6 md:-bottom-8
            "
          >
            {/* Shield-check icon in green circle */}
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-900 text-white"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>

            <div className="flex flex-col leading-tight">
              <span className="font-serif text-lg text-zinc-950 md:text-xl">
                Licensed &amp; Insured
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Trusted Boston Provider
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Service Item ───────────────────────────────────────────────────────── */

function ServiceItemComponent({
  service,
  index,
  prefersReducedMotion,
}: {
  service: ServiceItem;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const content = (
    <div className="group flex items-center gap-4">
      {/* Icon — outlined circle with green stroke */}
      <span
        aria-hidden="true"
        className="
          flex h-12 w-12 shrink-0 items-center justify-center rounded-full
          border border-green-900/20 bg-white
          transition-all duration-500
          group-hover:border-green-900 group-hover:bg-green-900
          group-hover:shadow-[0_6px_20px_rgba(20,83,45,0.18)]
          sm:h-14 sm:w-14
        "
      >
        <ServiceIcon type={service.icon} />
      </span>

      {/* Title */}
      <span
        className="
          text-sm font-medium text-zinc-950 sm:text-base
          transition-colors duration-300
          group-hover:text-green-900
        "
      >
        {service.title}
      </span>
    </div>
  );

  return (
    <motion.li
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: 0.15 + index * 0.07,
        ease: [0.19, 1, 0.22, 1],
      }}
    >
      {service.href ? (
        <a
          href={service.href}
          className="
            block rounded-sm
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-green-900 focus-visible:ring-offset-4
            focus-visible:ring-offset-[#FCFAF8]
          "
        >
          {content}
        </a>
      ) : (
        content
      )}
    </motion.li>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function ServiceIcon({ type }: { type: ServiceIconType }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor" as const,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    // Inherits color: green-900 default, white on group-hover via parent bg.
    className: "text-green-900 transition-colors duration-300 group-hover:text-white",
  };

  switch (type) {
    case "office":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="4" x2="9" y2="20" />
          <line x1="6.5" y1="13" x2="7.5" y2="13" />
          <line x1="6.5" y1="16" x2="7.5" y2="16" />
        </svg>
      );

    case "restaurant":
      return (
        <svg {...common}>
          <path d="M6 3v9a3 3 0 0 0 3 3v6" />
          <path d="M6 3v6" />
          <path d="M9 3v6" />
          <path d="M15 3c-1.5 0-3 2-3 5s1.5 5 3 5v8" />
        </svg>
      );

    case "construction":
      return (
        <svg {...common}>
          <path d="M14 6L8.5 11.5" />
          <path d="M14 6l4 4-6 6-4-4 6-6z" />
          <path d="M3 21l5-5" />
          <path d="M16 14l4 4-2 2-4-4" />
          <circle cx="6" cy="18" r="1" />
        </svg>
      );

    case "floor":
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V10l4-4" />
          <path d="M9 6h6l4 4v11" />
          <path d="M9 14h6" />
          <path d="M9 17h6" />
        </svg>
      );

    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V7l8-4 8 4v14" />
          <path d="M9 21V12h6v9" />
          <line x1="7" y1="9" x2="8" y2="9" />
          <line x1="16" y1="9" x2="17" y2="9" />
          <line x1="7" y1="13" x2="8" y2="13" />
          <line x1="16" y1="13" x2="17" y2="13" />
        </svg>
      );

    case "deep":
      return (
        <svg {...common}>
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" />
          <circle cx="5.5" cy="17.5" r="1.5" />
        </svg>
      );
  }
}
