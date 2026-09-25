"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const SERVICES = [
  {
    label: "Services",
    href: "#social-section",
    image: "/images/hero/sparkle.png",
    position:
      "left-[-12px] top-[4px] sm:left-[-28px] lg:left-[-42px]",
  },
  {
    label: "Plans",
    href: "#plans",
    image: "/images/hero/calandar.png",
    position:
      "right-[-12px] top-[18px] sm:right-[-28px] lg:right-[-42px]",
  },
  {
    label: "Commercial",
    href: "#commercial-cleaning",
    image: "/images/hero/building.png",
    position:
      "right-[-58px] top-[142px] sm:right-[-88px] lg:right-[-118px]",
  },
  {
    label: "Pricing",
    href: "#pricing",
    image: "/images/hero/calculator.png",
    position:
      "bottom-[8px] right-[-8px] sm:right-[-18px]",
  },
  {
    label: "Service Area",
    href: "#location",
    image: "/images/hero/map.gif",
    position:
      "bottom-[8px] left-[-8px] sm:left-[-18px]",
  },
  {
    label: "Get Quote",
    href: "#quote",
    image: "/images/hero/estimation.png",
    position:
      "left-[-58px] top-[142px] sm:left-[-88px] lg:left-[-118px]",
  },
] as const;

const BACKGROUND_BUBBLES = [
  {
    top: "16%",
    left: "25%",
    size: 7,
    delay: 0,
  },
  {
    top: "20%",
    right: "16%",
    size: 9,
    delay: 0.6,
  },
  {
    bottom: "18%",
    left: "15%",
    size: 8,
    delay: 1.1,
  },
  {
    bottom: "15%",
    right: "24%",
    size: 6,
    delay: 1.5,
  },
] as const;

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
        relative
        rounded-full
        border
        border-white/50
        bg-white/15
        backdrop-blur-sm
        shadow-[inset_0_2px_5px_rgba(255,255,255,0.75),0_0_16px_rgba(186,230,253,0.28)]
        ${className}
      `}
    >
      {highlight && (
        <span
          className="
            absolute
            left-[22%]
            top-[20%]
            block
            h-[28%]
            w-[28%]
            rounded-full
            bg-white/80
          "
        />
      )}
    </div>
  );
}

export default function ServicesOrbit() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Cleaning services"
      className="
        pointer-events-none
        relative
        flex
        w-full
        items-center
        justify-center
        overflow-visible
        px-4
        py-8
      "
    >
      <motion.div
        className="
          relative
          h-[330px]
          w-[330px]
          origin-center
          overflow-visible

          sm:h-[360px]
          sm:w-[360px]

          xl:h-[390px]
          xl:w-[390px]
        "
        initial={
          reducedMotion
            ? { opacity: 1 }
            : {
                opacity: 0,
                scale: 0.94,
                y: 18,
              }
        }
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Soft glow */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-1/2
            h-[84%]
            w-[84%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-sky-300/10
            blur-[70px]
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-1/2
            h-[64%]
            w-[64%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/10
            blur-2xl
          "
        />

        {/* Ambient bubbles */}
        {BACKGROUND_BUBBLES.map((bubble, index) => (
          <motion.div
            key={index}
            aria-hidden="true"
            className="
              absolute
              rounded-full
              border
              border-white/35
              bg-white/10
              backdrop-blur-sm
            "
            style={{
              ...bubble,
              width: bubble.size,
              height: bubble.size,
            }}
            animate={
              reducedMotion
                ? undefined
                : {
                    y: [0, -8, 0],
                    opacity: [0.22, 0.58, 0.22],
                    scale: [1, 1.06, 1],
                  }
            }
            transition={{
              duration: 4.5 + index * 0.45,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Orbit rings */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-1/2
            h-[92%]
            w-[92%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-white/30
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-1/2
            h-[65%]
            w-[65%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-white/20
          "
        />

        {/* Outer rotating orbit */}
        <motion.div
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-1/2
            h-[92%]
            w-[92%]
            -translate-x-1/2
            -translate-y-1/2
          "
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Bubble
            className="
              absolute
              left-1/2
              top-0
              h-4
              w-4
              -translate-x-1/2
            "
          />

          <Bubble
            className="
              absolute
              bottom-0
              left-1/2
              h-2.5
              w-2.5
              -translate-x-1/2
            "
          />

          <Bubble
            className="
              absolute
              right-0
              top-1/2
              h-2
              w-2
              -translate-y-1/2
            "
          />
        </motion.div>

        {/* Inner rotating orbit */}
        <motion.div
          aria-hidden="true"
          className="
            absolute
            left-1/2
            top-1/2
            h-[65%]
            w-[65%]
            -translate-x-1/2
            -translate-y-1/2
          "
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: -360,
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Bubble
            className="
              absolute
              left-1/2
              top-0
              h-3.5
              w-3.5
              -translate-x-1/2
            "
          />

          <Bubble
            highlight={false}
            className="
              absolute
              right-0
              top-1/2
              h-2
              w-2
              -translate-y-1/2
            "
          />

          <Bubble
            className="
              absolute
              bottom-0
              left-1/2
              h-2.5
              w-2.5
              -translate-x-1/2
            "
          />
        </motion.div>

        {/* Center cleaner */}
        <motion.div
          className="
            absolute
            left-1/2
            top-1/2
            z-10
            h-[64%]
            w-[64%]
            -translate-x-1/2
            -translate-y-1/2
          "
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -5, 0],
                }
          }
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Halo */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-[-16px]
              rounded-full
              bg-white/[0.08]
              blur-xl
            "
          />

          {/* Main white circle */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              rounded-full
              border
              border-white/75
              bg-white/95
              shadow-[0_25px_65px_rgba(15,23,42,0.18)]
              backdrop-blur-xl
            "
          />

          {/* Inner accent */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-[7px]
              rounded-full
              border
              border-sky-100
            "
          />

          {/* Cleaner image */}
          <motion.div
            className="
              absolute
              inset-0
              z-10
              overflow-visible
            "
            animate={
              reducedMotion
                ? undefined
                : {
                    y: [0, -4, 0],
                  }
            }
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="
                absolute
                bottom-0
                left-1/2
                h-[128%]
                w-[122%]
                -translate-x-1/2
                overflow-hidden
                rounded-b-full
              "
            >
              <Image
                src="/commercial/saskia.png"
                alt="Professional cleaner"
                fill
                priority
                sizes="
                  (max-width: 640px) 260px,
                  (max-width: 1280px) 290px,
                  320px
                "
                className="
                  object-contain
                  object-bottom
                  drop-shadow-[0_16px_28px_rgba(15,23,42,0.17)]
                "
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Service buttons */}
        {SERVICES.map((service, index) => (
          <motion.a
            key={service.label}
            href={service.href}
            aria-label={service.label}
            className={`
              pointer-events-auto
              absolute
              z-30
              flex
              min-h-[54px]
              items-center
              gap-2
              whitespace-nowrap
              rounded-full
              border
              border-white/80
              bg-white/[0.96]
              py-1.5
              pl-1.5
              pr-3.5
              text-slate-900
              shadow-[0_10px_28px_rgba(15,23,42,0.12)]
              backdrop-blur-xl
              transition-[box-shadow,border-color,background-color]
              duration-300

              hover:border-sky-200
              hover:bg-white
              hover:shadow-[0_16px_38px_rgba(14,165,233,0.20)]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-sky-400
              focus-visible:ring-offset-2

              sm:min-h-[58px]
              sm:gap-2.5
              sm:pr-4

              ${service.position}
            `}
            initial={
              reducedMotion
                ? { opacity: 1 }
                : {
                    opacity: 0,
                    y: 14,
                    scale: 0.94,
                  }
            }
            animate={
              reducedMotion
                ? {
                    opacity: 1,
                    scale: 1,
                  }
                : {
                    opacity: 1,
                    y: [0, -3, 0],
                    scale: 1,
                  }
            }
            transition={{
              opacity: {
                duration: 0.5,
                delay: 0.2 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              },
              scale: {
                duration: 0.5,
                delay: 0.2 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              },
              y: {
                duration: 4.5 + index * 0.28,
                delay: index * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={
              reducedMotion
                ? undefined
                : {
                    scale: 1.045,
                    y: -5,
                  }
            }
            whileTap={{
              scale: 0.985,
            }}
          >
            {/* Icon */}
            <div
              className="
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-sky-400/80
                bg-sky-50
                shadow-[inset_0_0_0_3px_rgba(255,255,255,0.9)]

                sm:h-11
                sm:w-11
              "
            >
              <Image
                src={service.image}
                alt=""
                width={28}
                height={28}
                className="
                  h-6
                  w-6
                  object-contain

                  sm:h-7
                  sm:w-7
                "
              />
            </div>

            {/* Text */}
            <span
              className="
                text-[11px]
                font-semibold
                tracking-[-0.02em]
                text-slate-800

                sm:text-[13px]
              "
              style={{
                fontFamily: FONT_STACK,
              }}
            >
              {service.label}
            </span>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}