// components/ServicesOrbit.tsx

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const SERVICES = [
  {
    label: "Services",
    icon: "ti-sparkles",
    href: "#social-section",
    style: { top: "1px", left: "5px", cursor: "pointer" },
  },
  {
    label: "Plans",
    icon: "ti-calendar-repeat",
    href: "#plans",
    style: { top: "20px", right: "1px", cursor: "pointer" },
  },
  {
    label: "Commercial",
    icon: "ti-building",
    href: "#commercial-cleaning",
    style: { top: "160px", right: "-100px", cursor: "pointer" },
  },
  {
    label: "Pricing",
    icon: "ti-calculator",
    href: "#pricing",
    style: { bottom: "-10px", right: "40px", cursor: "pointer" },
  },
  {
    label: "Service Area",
    icon: "ti-map-pin",
    href: "#location",
    style: { bottom: "-10px", left: "5px", cursor: "pointer" },
  },

  {
    label: "Get Quote",
    icon: "ti-clipboard-check",
    href: "#quote",
    style: { top: "160px", left: "-90px", cursor: "pointer" },
  },
];



const BACKGROUND_BUBBLES = [
  { top: "12%", left: "20%", size: 9, delay: 0 },
  { top: "18%", right: "9%", size: 14, delay: 0.6 },
  { bottom: "20%", left: "10%", size: 11, delay: 1.1 },
  { bottom: "14%", right: "18%", size: 8, delay: 1.5 },
  { top: "48%", left: "4%", size: 7, delay: 0.9 },
];

function Bubble({
  className = "",
  highlight = true,
}: {
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        relative rounded-full border border-white/60
        bg-white/20 backdrop-blur-sm
        shadow-[inset_0_2px_5px_rgba(255,255,255,0.75),0_0_18px_rgba(186,230,253,0.35)]
        ${className}
      `}
    >
      {highlight && (
        <span className="absolute left-[22%] top-[20%] block h-[28%] w-[28%] rounded-full bg-white/80" />
      )}
    </div>
  );
}

export default function ServicesOrbit() {
  return (
    <section className="pointer-events-none flex justify-center px-4 py-8">
      <motion.div
      className="relative h-[420px] w-[420px] overflow-visible"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />

        {BACKGROUND_BUBBLES.map((bubble, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full border border-white/40 bg-white/10 backdrop-blur-sm"
            style={{
              ...bubble,
              width: bubble.size,
              height: bubble.size,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.25, 0.65, 0.25],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 4 + index * 0.45,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div
          className="absolute rounded-full border border-white/35"
          style={{ width: 390, height: 390, top: 15, left: 15 }}
        />

        <div
          className="absolute rounded-full border border-white/25"
          style={{ width: 285, height: 285, top: 68, left: 68 }}
        />

        <motion.div
          className="absolute"
          style={{ width: 390, height: 390, top: 15, left: 15 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <Bubble className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2" />
          <Bubble className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2" />
          <Bubble className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2" />
        </motion.div>

        <motion.div
          className="absolute"
          style={{ width: 285, height: 285, top: 68, left: 68 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        >
          <Bubble className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2" />
          <Bubble
            className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2"
            highlight={false}
          />
          <Bubble className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2" />
        </motion.div>

        <motion.div
          className="absolute overflow-visible"
          style={{ width: 280, height: 280, top: 70, left: 70 }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="
              absolute inset-0 z-0 rounded-full
              border border-white/70
              bg-white/95
              shadow-[0_22px_60px_rgba(15,23,42,0.16)]
              backdrop-blur-xl
            "
            aria-hidden="true"
          />

          <motion.div
            className="
              absolute left-1/2 top-1/2 z-10
              flex h-[520px] w-[520px]
              -translate-x-1/2 -translate-y-[78%]
              items-center justify-center
            "
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="
                absolute left-1/2 bottom-0
                h-[520px] w-[520px]
                -translate-x-1/2
                overflow-hidden
                rounded-[99999px]
              "
            >
              <Image
                src="/images/hero/woman.png"
                alt="Professional cleaner"
                width={520}
                height={520}
                priority
                className="
                  h-full w-full object-contain
                  drop-shadow-[0_25px_50px_rgba(15,23,42,0.22)]
                "
                style={{ objectPosition: "bottom" }}
              />
            </div>
          </motion.div>
        </motion.div>

        {SERVICES.map((service, index) => (
          <motion.a
            key={service.label}
            href={service.href}
            className="
              pointer-events-auto absolute z-30 flex items-center gap-2
              whitespace-nowrap rounded-full
              border border-white/70
              bg-white/95 py-2 pl-2 pr-4
              shadow-[0_10px_28px_rgba(15,23,42,0.12)]
              backdrop-blur-xl
              transition-shadow duration-300
              hover:shadow-[0_16px_36px_rgba(14,165,233,0.22)]
            "
            style={service.style}
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: [0, -4, 0],
              scale: 1,
            }}
            transition={{
              opacity: {
                duration: 0.55,
                delay: 0.2 + index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              },
              scale: {
                duration: 0.55,
                delay: 0.2 + index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              },
              y: {
                duration: 4.2 + index * 0.35,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={{ scale: 1.045, y: -5 }}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-50 text-base text-sky-500">
              <i className={`ti ${service.icon}`} aria-hidden="true" />
            </div>

            <span
              className="text-[13px] font-semibold tracking-[-0.02em] text-slate-800"
              style={{ fontFamily: FONT_STACK }}
            >
              {service.label}
            </span>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}