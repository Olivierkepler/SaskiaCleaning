"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";

type InfoIconType = "phone" | "envelope" | "globe";

type InfoItemData = {
  icon: InfoIconType;
  title: string;
  lines: string[];
  href?: string;
  ariaLabel?: string;
};

const ITEMS: InfoItemData[] = [
  {
    icon: "phone",
    title: "Call Us",
    lines: ["857-352-8554", "Mon – Sat, 8am – 6pm"],
    href: "tel:8573528554",
  },
  {
    icon: "envelope",
    title: "Email Us",
    lines: ["cleaningsaskia@gmail.com", "Replies within 24 hours"],
    href: "mailto:cleaningsaskia@gmail.com",
  },
  {
    icon: "globe",
    title: "Visit Our Site",
    lines: ["SaskiaServices.com", "Book online anytime"],
    href: "https://saskiaservices.com/",
  },
];

export default function InfoBar() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const cardEntranceVariants: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 18,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 130,
        damping: 18,
      },
    },
  };

  return (
    <section
      aria-label="Contact Information"
      className="relative bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-12"
      style={{ transform: "translateY(-14px)" }}
    >
      <motion.div
        className="
          mx-auto grid max-w-7xl grid-cols-1 gap-3
          sm:grid-cols-2
          lg:grid-cols-3
        "
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.2,
        }}
      >
        {ITEMS.map((item) => (
          <motion.div
            key={item.title}
            variants={cardEntranceVariants}
            className="h-full"
          >
            <InfoItem
              {...item}
              prefersReducedMotion={!!prefersReducedMotion}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function InfoItem({
  icon,
  title,
  lines,
  href,
  ariaLabel,
  prefersReducedMotion,
}: InfoItemData & { prefersReducedMotion: boolean }) {
  const content = (
    <motion.div
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -3,
              boxShadow: "0 16px 45px rgba(15, 23, 42, 0.08)",
            }
      }
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="
        group relative h-full overflow-hidden rounded-2xl
        border border-slate-200/80 bg-white
        px-4 py-4 shadow-sm
        transition-colors duration-300
        hover:border-sky-200
        sm:px-5 sm:py-5
      "
    >
      <div
        className="
          pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500
          group-hover:opacity-100
          bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_58%)]
        "
      />

      <div className="relative flex items-center gap-4">
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-xl bg-sky-500 text-white
            shadow-md shadow-sky-500/20
            sm:h-12 sm:w-12
          "
        >
          <InfoIcon type={icon} />
        </motion.div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold tracking-tight text-slate-950 sm:text-base">
            {title}
          </h3>

          <div className="mt-1 min-w-0 text-sm leading-5">
            <p className="truncate font-semibold text-slate-800">
              {lines[0]}
            </p>

            <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
              {lines[1]}
            </p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="
            hidden text-slate-300 transition-transform duration-300
            group-hover:translate-x-0.5 group-hover:text-sky-400
            sm:block
          "
        >
          →
        </span>
      </div>
    </motion.div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? `${title}: ${lines[0]}`}
      className="block h-full"
    >
      {content}
    </a>
  );
}

function InfoIcon({ type }: { type: InfoIconType }) {
  const common = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor" as const,
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  if (type === "envelope") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}