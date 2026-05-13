"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import ServiceInquiryForm from "./ServiceInquiryForm";
import ArchitecturalCarousel from "./ArchitecturalCarousel";
import CostEstimationModal from "./CostEstimationModal";

type ContactIconType = "phone" | "mail";
type TrustIconType = "shield" | "building" | "map" | "sparkle";

const stats = [
  { label: "Response", value: "24h" },
  { label: "Cleaning", value: "Deep" },
  { label: "Service", value: "Reliable" },
];

const contactLinks = [
  {
    href: "tel:8573528554",
    label: "857-352-8554",
    ariaLabel: "Call Saskia Cleaning Services at 857-352-8554",
    icon: "phone" as const,
  },
  {
    href: "mailto:cleaningsaskia@gmail.com",
    label: "cleaningsaskia@gmail.com",
    ariaLabel: "Email Saskia Cleaning Services at cleaningsaskia@gmail.com",
    icon: "mail" as const,
  },
];

const trustBadges = [
  { icon: "shield" as const, label: "Licensed & Insured" },
  { icon: "building" as const, label: "Trusted Local Service" },
  { icon: "map" as const, label: "Boston Area" },
  { icon: "sparkle" as const, label: "Detail-Focused" },
];

export default function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yLarge = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -90]
  );

  const ySmall = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 50]
  );

  const scaleImage = useTransform(
    scrollYProgress,
    [0, 0.55],
    prefersReducedMotion ? [1, 1] : [1.08, 1]
  );

  useEffect(() => {
    const shouldLockScroll = isInquiryOpen || isEstimatorOpen;
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsInquiryOpen(false);
      setIsEstimatorOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInquiryOpen, isEstimatorOpen]);

  return (
    <section
      ref={containerRef}
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-[#f6f4ee]"
    >
      <Background />

      <div
        className="
          mx-auto grid min-h-[90svh] w-full max-w-7xl items-center gap-14
          px-5 py-20
          sm:px-6
          md:px-10
          lg:grid-cols-12 lg:px-16 lg:py-24
        "
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 lg:col-span-6"
        >
          <h1
            id={titleId}
            className="
              max-w-2xl font-serif
              text-[clamp(2.1rem,4.5vw,4rem)]
              leading-[0.96] tracking-[-0.045em]
              text-zinc-950
            "
          >
            A Clean Home
            <span className="mt-2 block italic text-green-950/65">
              Changes Everything.
            </span>
          </h1>

          <p
            className="
              mt-6 max-w-lg
              text-[15px] font-normal leading-7 tracking-[-0.012em]
              text-stone-600
              sm:text-[16px]
            "
          >
            Premium cleaning services for homes and businesses, delivered with
            care and attention to detail.
          </p>

          <dl
            className="
              mt-9 grid max-w-2xl grid-cols-3 overflow-hidden
              rounded-[1.75rem] border border-stone-200
              bg-white/72 shadow-sm backdrop-blur-md
            "
          >
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </dl>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PrimaryButton onClick={() => setIsInquiryOpen(true)}>
              Book Cleaning
            </PrimaryButton>

            <SecondaryButton onClick={() => setIsEstimatorOpen(true)}>
              Get Estimate
            </SecondaryButton>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-4">
            {contactLinks.map((contact) => (
              <ContactLink key={contact.href} {...contact} />
            ))}
          </div>

          <ul className="mt-8 flex max-w-2xl flex-wrap gap-2.5">
            {trustBadges.map((badge) => (
              <TrustBadge key={badge.label} icon={badge.icon}>
                {badge.label}
              </TrustBadge>
            ))}
          </ul>
        </motion.div>

        <div className="relative min-h-[420px] sm:min-h-[520px] md:min-h-[620px] lg:col-span-6 lg:min-h-[720px]">
          <motion.div
            style={{ y: yLarge }}
            initial={
              prefersReducedMotion
                ? false
                : {
                    clipPath: "inset(10% 10% 10% 10%)",
                    opacity: 0,
                    scale: 0.98,
                  }
            }
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    clipPath: "inset(0% 0% 0% 0%)",
                    opacity: 1,
                    scale: 1,
                  }
            }
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
            className="
              absolute right-0 top-0 h-[82%] w-full overflow-hidden
              rounded-[2.5rem] border border-white/70 bg-white
              shadow-[0_40px_120px_rgba(15,23,42,0.18)]
              sm:w-[88%]
            "
          >
            <motion.div
              style={{ scale: scaleImage }}
              className="relative h-full w-full"
            >
              <Image
                src="/images/PHOTO-2026-05-06-23-30-38 (1).jpg"
                alt="A freshly cleaned home interior by Saskia Cleaning Services"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
          </motion.div>

          <motion.div
            style={{ y: ySmall }}
            initial={
              prefersReducedMotion
                ? false
                : {
                    opacity: 0,
                    x: -38,
                    scale: 0.96,
                  }
            }
            whileInView={
              prefersReducedMotion
                ? undefined
                : {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }
            }
            viewport={{ once: true, margin: "-120px" }}
            transition={{
              delay: 0.35,
              duration: 0.9,
              ease: [0.19, 1, 0.22, 1],
            }}
            className="
              absolute left-0 top-[44%] z-20 hidden
              h-[44%] w-[56%] -translate-y-1/2
              overflow-hidden rounded-[2rem]
              bg-white/70 backdrop-blur-xl
              shadow-[0_10px_40px_rgba(0,0,0,0.08),0_30px_80px_rgba(15,23,42,0.16)]
              ring-1 ring-white/40
              md:block
            "
          >
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/10 via-transparent to-black/5" />
            <div className="absolute inset-x-0 top-0 z-10 h-px bg-white/70" />

            <ArchitecturalCarousel />
          </motion.div>

          <div
            className="
              absolute bottom-8 right-6 z-30
              rounded-2xl border border-white/70 bg-white/85
              px-5 py-4 shadow-xl backdrop-blur-md
            "
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone-500">
              Trusted Local Service
            </p>
            <p className="mt-1 font-serif text-[1.65rem] text-zinc-950">
              Boston
            </p>
          </div>

          <motion.div
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
            className="absolute -right-8 -top-8 hidden h-32 w-32 rounded-full border border-dashed border-green-900/25 md:block"
            aria-hidden="true"
          />
        </div>
      </div>

      <AnimatePresence>
        {isInquiryOpen && (
          <ModalOverlay
            label="Service inquiry form"
            onClose={() => setIsInquiryOpen(false)}
          >
            <ServiceInquiryForm onClose={() => setIsInquiryOpen(false)} />
          </ModalOverlay>
        )}
      </AnimatePresence>

      <CostEstimationModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
      />
    </section>
  );
}

function Background() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-[url('/images/maxresdefault.jpg')] bg-cover bg-center bg-no-repeat opacity-20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_10%,rgba(22,101,52,0.16),transparent_30%),linear-gradient(115deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.9)_42%,rgba(255,255,255,0.62)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.32]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.09) 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />
    </>
  );
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative inline-flex w-full items-center justify-center
        overflow-hidden rounded-full bg-green-950
        px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]
        text-white shadow-[0_18px_45px_rgba(20,83,45,0.22)]
        transition duration-300
        hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(20,83,45,0.28)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2
        sm:w-auto sm:px-9
      "
    >
      <span className="absolute inset-0 translate-y-full bg-zinc-950 transition-transform duration-300 ease-out group-hover:translate-y-0" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group relative inline-flex w-full items-center justify-center
        overflow-hidden rounded-full border border-stone-300 bg-white/80
        px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]
        text-zinc-950 shadow-sm backdrop-blur-md
        transition duration-300
        hover:-translate-y-0.5 hover:border-green-950
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2
        sm:w-auto sm:px-9
      "
    >
      <span className="absolute inset-0 translate-y-full bg-green-950 transition-transform duration-300 ease-out group-hover:translate-y-0" />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
        {children}
      </span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-stone-200 px-4 py-5 last:border-r-0 sm:px-6">
      <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-xl leading-none text-zinc-950 sm:text-2xl">
        {value}
      </dd>
    </div>
  );
}

function ContactLink({
  href,
  label,
  ariaLabel,
  icon,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  icon: ContactIconType;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="
        group inline-flex items-center gap-3
        text-[14px] font-normal tracking-[-0.01em] text-stone-700
        transition hover:text-zinc-950
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2
      "
    >
      <span
        className="
          flex h-10 w-10 items-center justify-center rounded-full
          border border-stone-300 bg-white/80 shadow-sm backdrop-blur-md
          transition
          group-hover:-translate-y-0.5 group-hover:border-green-950 group-hover:bg-green-950 group-hover:text-white
        "
      >
        <ContactIcon type={icon} />
      </span>
      <span className="tracking-wide">{label}</span>
    </a>
  );
}

function ContactIcon({ type }: { type: ContactIconType }) {
  if (type === "phone") {
    return (
      <svg
        aria-hidden="true"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function TrustBadge({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: TrustIconType;
}) {
  return (
    <li
      className="
        inline-flex items-center gap-2 rounded-full
        border border-stone-300/80 bg-white/70
        px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em]
        text-stone-700 shadow-sm backdrop-blur-md
        transition
        hover:-translate-y-0.5 hover:border-green-900/40 hover:bg-white hover:text-zinc-950
      "
    >
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-900"
      >
        <TrustIconPath type={icon} />
      </svg>
      {children}
    </li>
  );
}

function TrustIconPath({ type }: { type: TrustIconType }) {
  if (type === "shield") {
    return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
  }

  if (type === "building") {
    return (
      <>
        <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
      </>
    );
  }

  if (type === "map") {
    return (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    );
  }

  return (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 15v4M21 17h-4" />
    </>
  );
}

function ModalOverlay({
  children,
  label,
  onClose,
}: {
  children: React.ReactNode;
  label: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onMouseDown={onClose}
      className="
        fixed inset-0 z-[99999]
        flex items-start justify-center
        overflow-y-auto
        bg-zinc-950/60 backdrop-blur-md
        px-4 pt-[7vh] pb-16
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        onMouseDown={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{
          duration: 0.35,
          ease: [0.19, 1, 0.22, 1],
        }}
        className="
          relative z-[99999]
          w-full max-w-2xl
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            scale-95 rounded-[2rem]
            bg-white/10 opacity-40 blur-2xl
          "
        />

        {children}
      </motion.div>
    </motion.div>
  );
}
