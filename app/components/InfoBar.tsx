"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type InfoIconType = "phone" | "envelope" | "globe";

type InfoItemData = {
  icon: InfoIconType;
  title: string;
  lines: string[];
  href?: string;
  ariaLabel?: string;
};

/* ─── Data (edit these in one place) ─────────────────────────────────────── */

const ITEMS: InfoItemData[] = [
  {
    icon: "phone",
    title: "Call Us",
    lines: ["857-352-8554", "Mon – Sat, 8am – 6pm"],
    href: "tel:8573528554",
    ariaLabel: "Call Saskia Cleaning at 857-352-8554",
  },
  {
    icon: "envelope",
    title: "Email Us",
    lines: ["cleaningsaskia@gmail.com", "Replies within 24 hours"],
    href: "mailto:cleaningsaskia@gmail.com",
    ariaLabel: "Email cleaningsaskia@gmail.com",
  },
  {
    icon: "globe",
    title: "Visit Our Site",
    lines: ["SaskiaServices.com", "Book online anytime"],
    href: "https://saskiaservices.com/",
    ariaLabel: "Visit SaskiaServices.com",
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function InfoBar() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Contact Saskia Cleaning"
      className="
        relative overflow-hidden
        bg-gradient-to-r from-[#0E3D22] via-[#14532D] to-[#0E3D22]
        text-white
      "
    >
      {/* Subtle dotted grain to match the hero's texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />

      {/* Soft top highlight to lift the bar off the hero above it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 sm:gap-10 sm:px-8 sm:py-12 md:grid-cols-3 md:gap-6 md:py-14 lg:px-16">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 16 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.7,
              delay: i * 0.12,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            <InfoItem {...item} />
          </motion.div>
        ))}
      </div>

      {/* Soft bottom highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10"
      />
    </section>
  );
}

/* ─── InfoItem ───────────────────────────────────────────────────────────── */

function InfoItem({ icon, title, lines, href, ariaLabel }: InfoItemData) {
  const content = (
    <div className="group flex items-start gap-5">
      {/* Icon — outlined circle */}
      <span
        aria-hidden="true"
        className="
          relative flex h-14 w-14 shrink-0 items-center justify-center
          rounded-full border border-white/60
          transition-all duration-500
          group-hover:border-white group-hover:bg-white/10
          group-hover:scale-105
          sm:h-16 sm:w-16
        "
      >
        <InfoIcon type={icon} />
      </span>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-serif text-lg font-medium leading-tight tracking-tight text-white sm:text-xl">
          {title}
        </h3>
        <div className="text-sm font-light leading-relaxed text-white/85">
          {lines.map((line, i) => (
            <p key={i} className={i === 0 ? "font-normal text-white" : undefined}>
              {line}
            </p>
          ))}
        </div>

        {/* Underline accent — only present when the item is a link */}
        {href && (
          <span
            aria-hidden="true"
            className="
              mt-2 h-px w-8 bg-white/40
              transition-all duration-500
              group-hover:w-16 group-hover:bg-white
            "
          />
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="
        block rounded-sm
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2
        focus-visible:ring-offset-[#14532D]
      "
    >
      {content}
    </a>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function InfoIcon({ type }: { type: InfoIconType }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor" as const,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "phone") {
    return (
      <svg {...common} className="text-white">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  if (type === "envelope") {
    return (
      <svg {...common} className="text-white">
        <rect x="3" y="6" width="18" height="13" rx="1" />
        <path d="M3 7 L12 14 L21 7" />
        <circle cx="12" cy="11" r="2.4" />
        <path d="M10.8 11 L11.7 11.9 L13.2 10.3" />
      </svg>
    );
  }

  // globe (website)
  return (
    <svg {...common} className="text-white">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
