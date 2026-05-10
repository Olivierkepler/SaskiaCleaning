"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type InfoIconType = "clock" | "pin" | "envelope";

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
    icon: "clock",
    title: "Opening Hours",
    lines: ["24/7 Availability", "for Contracted Clients"],
  },
  {
    icon: "pin",
    title: "We Are Located at",
    lines: ["950 Watertown St, Suite 06", "West Newton, MA 02465"],
    href: "https://maps.google.com/?q=950+Watertown+St+Suite+06+West+Newton+MA+02465",
    ariaLabel: "Open location in Google Maps",
  },
  {
    icon: "envelope",
    title: "Get A Quote",
    lines: ["info@primecleaninginc.com"],
    href: "mailto:info@primecleaninginc.com",
    ariaLabel: "Email info@primecleaninginc.com",
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function InfoBar() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Business information"
      className="
        relative overflow-hidden
        bg-gradient-to-r from-[#0F4FB8] via-[#1A6FE0] to-[#0F4FB8]
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
            <p key={i}>{line}</p>
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
        focus-visible:ring-offset-[#1A6FE0]
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

  if (type === "clock") {
    return (
      <svg {...common} className="text-white">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 1.5" />
        <path d="M9 3h6" />
        <path d="M12 3v2" />
      </svg>
    );
  }

  if (type === "pin") {
    return (
      <svg {...common} className="text-white">
        <path d="M4 11 L12 4 L20 11 V20 H4 Z" />
        <circle cx="12" cy="13" r="2" />
      </svg>
    );
  }

  // envelope (Get a Quote / contact)
  return (
    <svg {...common} className="text-white">
      <rect x="3" y="6" width="18" height="13" rx="1" />
      <path d="M3 7 L12 14 L21 7" />
      <circle cx="12" cy="11" r="2.4" />
      <path d="M10.8 11 L11.7 11.9 L13.2 10.3" />
    </svg>
  );
}
