// components/ServicesOrbit.tsx

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const SERVICES = [
  {
    label: "Services",
    href: "#social-section",
    image: "/images/hero/sparkle.png",
    style: { top: "8px", left: "-28px" },
  },
  {
    label: "Plans",
    href: "#plans",
    image: "/images/hero/calandar.png",
    style: { top: "20px", right: "-28px" },
  },
  {
    label: "Commercial",
    href: "#commercial-cleaning",
    image: "/images/hero/building.png",
    style: { top: "138px", right: "-105px" },
  },
  {
    label: "Pricing",
    href: "#pricing",
    image: "/images/hero/calculator.png",
    style: { bottom: "10px", right: "-10px" },
  },
  {
    label: "Service Area",
    href: "#location",
    image: "/images/hero/map.gif",
    style: { bottom: "10px", left: "-28px" },
  },
  {
    label: "Get Quote",
    href: "#quote",
    image: "/images/hero/estimation.png",
    style: { top: "138px", left: "-105px" },
  },
];

const BACKGROUND_BUBBLES = [
  { top: "13%", left: "24%", size: 7, delay: 0 },
  { top: "20%", right: "14%", size: 10, delay: 0.6 },
  { bottom: "22%", left: "13%", size: 8, delay: 1.1 },
  { bottom: "16%", right: "22%", size: 6, delay: 1.5 },
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
        shadow-[inset_0_2px_5px_rgba(255,255,255,0.75),0_0_14px_rgba(186,230,253,0.3)]
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
    <section className="pointer-events-none flex justify-center px-4 py-6">
      <motion.div
        className="relative h-[360px] w-[360px] overflow-visible"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />

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
              y: [0, -10, 0],
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
          style={{ width: 330, height: 330, top: 15, left: 15 }}
        />

        <div
          className="absolute rounded-full border border-white/25"
          style={{ width: 235, height: 235, top: 62, left: 62 }}
        />

        <motion.div
          className="absolute"
          style={{ width: 330, height: 330, top: 15, left: 15 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <Bubble className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2" />
          <Bubble className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2" />
          <Bubble className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2" />
        </motion.div>

        <motion.div
          className="absolute"
          style={{ width: 235, height: 235, top: 62, left: 62 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        >
          <Bubble className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2" />
          <Bubble
            className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2"
            highlight={false}
          />
          <Bubble className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2" />
        </motion.div>

        <motion.div
          className="absolute overflow-visible"
          style={{ width: 220, height: 220, top: 70, left: 70 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="
              absolute inset-0 z-0 rounded-full
              border border-white/70
              bg-white/95
              shadow-[0_18px_45px_rgba(15,23,42,0.14)]
              backdrop-blur-xl
            "
            aria-hidden="true"
          />

          <motion.div
            className="
              absolute left-1/2 top-1/2 z-10
              flex h-[380px] w-[380px]
              -translate-x-1/2 -translate-y-[77%]
              items-center justify-center
            "
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="
                absolute left-1/2 bottom-0
                h-[380px] w-[380px]
                -translate-x-1/2
                overflow-hidden
                rounded-[99999px]
              "
            >
              <Image
                src="/images/hero/woman.png"
                alt="Professional cleaner"
                width={380}
                height={380}
                priority
                className="
                  h-full w-full object-contain
             rounded-full shadow-lg
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
              bg-white/95 py-1.5 pl-1.5 pr-3
              shadow-[0_8px_20px_rgba(15,23,42,0.1)]
              backdrop-blur-xl
              transition-shadow duration-300
              hover:shadow-[0_12px_28px_rgba(14,165,233,0.2)]
            "
            style={{
              ...service.style,
              cursor: "pointer",
            }}
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: [0, -3, 0],
              scale: 1,
            }}
            transition={{
              opacity: {
                duration: 0.5,
                delay: 0.18 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              },
              scale: {
                duration: 0.5,
                delay: 0.18 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              },
              y: {
                duration: 4 + index * 0.3,
                delay: index * 0.18,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={{ scale: 1.04, y: -4 }}
          >
            <div className="flex h-10 w-10  flex-shrink-0 items-center justify-center rounded-full border border-sky-400 bg-sky-50 text-sky-500">
              <Image
                src={service.image}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain rounded-full "
              />
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