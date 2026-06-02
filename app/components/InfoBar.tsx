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

/* ─── Data ───────────────────────────────────────────────────────────────── */

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

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function InfoBar() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Contact Information"
      className="relative overflow-hidden bg-white py-20"
    >
      {/* subtle background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_60%)]"
      />

      {/* subtle texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(rgb(15 23 42) 0.8px, transparent 0.8px)",
          backgroundSize: "6px 6px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-3 lg:px-8">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
            }}
          >
            <InfoItem {...item} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Item ───────────────────────────────────────────────────────────────── */

function InfoItem({ icon, title, lines, href }: InfoItemData) {
  const content = (
    <div
      className="
        group relative h-full overflow-hidden
        rounded-3xl border border-slate-200
        bg-white/90 p-8
        shadow-[0_10px_40px_rgba(15,23,42,0.06)]
        backdrop-blur-sm
        transition-all duration-500
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-[0_18px_60px_rgba(37,99,235,0.12)]
      "
    >
      {/* glow */}
      <div
        className="
          absolute inset-0 opacity-0 transition-opacity duration-500
          group-hover:opacity-100
          bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_55%)]
        "
      />

      <div className="relative flex items-start gap-5">
        {/* icon */}
        <div
          className="
            flex h-16 w-16 shrink-0 items-center justify-center
            rounded-2xl
            bg-gradient-to-br from-blue-600 to-sky-400
            text-white
            shadow-lg shadow-blue-500/20
            transition-transform duration-500
            group-hover:scale-110
          "
        >
          <InfoIcon type={icon} />
        </div>

        {/* text */}
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h3>

          <div className="mt-2 space-y-1 text-[15px] leading-relaxed">
            <p className="font-medium text-slate-800">
              {lines[0]}
            </p>

            <p className="text-slate-500">
              {lines[1]}
            </p>
          </div>

          {/* accent line */}
          <div
            className="
              mt-5 h-[2px] w-10
              bg-gradient-to-r from-blue-500 to-sky-400
              transition-all duration-500
              group-hover:w-20
            "
          />
        </div>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="block"
    >
      {content}
    </a>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function InfoIcon({ type }: { type: InfoIconType }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor" as const,
    strokeWidth: 1.8,
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