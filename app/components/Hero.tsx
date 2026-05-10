"use client";

import { useEffect, useRef, useState } from "react";
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

export default function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [openEstimator, setOpenEstimator] = useState(false);

  // Respect users who prefer reduced motion
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Disable parallax / heavy motion if user prefers reduced motion
  const yLarge = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -100]
  );
  const ySmall = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 60]
  );
  const scaleImage = useTransform(
    scrollYProgress,
    [0, 0.5],
    prefersReducedMotion ? [1, 1] : [1.1, 1]
  );

  // Body scroll lock for the inquiry modal
  useEffect(() => {
    if (openEstimator) return; // CostEstimationModal handles its own overflow

    document.body.style.overflow = isInquiryOpen ? "hidden" : "";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsInquiryOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInquiryOpen, openEstimator]);

  return (
    <section
      ref={containerRef}
      aria-label="Hero — Saskia Cleaning Services"
      className="
        relative isolate flex flex-col justify-center overflow-hidden
        min-h-[100svh] sm:min-h-[90vh]
        px-4 pt-16 pb-16
        sm:px-6 sm:pt-20 sm:pb-20
        md:px-12 md:pt-24 md:pb-24
        lg:px-16 lg:pt-28 lg:pb-32
        bg-[url('/images/maxresdefault.jpg')]
        bg-cover bg-center bg-no-repeat
        sm:bg-fixed
      "
    >
      {/* Light gradient overlay — keeps dark text readable on the photo. */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 -z-10
          bg-gradient-to-b from-[#FCFAF8]/95 via-[#FCFAF8]/80 to-[#FCFAF8]/60
          lg:bg-gradient-to-r lg:from-[#FCFAF8]/95 lg:via-[#FCFAF8]/85 lg:to-[#FCFAF8]/45
        "
      />

      {/* Subtle dotted grain texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Content grid */}
      <div className="mx-auto grid w-full max-w-7xl items-start gap-10 md:gap-12 lg:grid-cols-12 lg:gap-8">
        {/* ─── Text Column ─────────────────────────────── */}
        <div className="z-10 lg:col-span-6 lg:mt-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Eyebrow */}
            <span className="mb-4 block text-[9px] font-semibold uppercase tracking-[0.35em] text-stone-500 sm:mb-5 sm:text-[10px] sm:tracking-[0.4em]">
              Saskia Cleaning Services — Boston, Massachusetts
            </span>

            {/* Headline */}
            <h1
              className="
                mb-6 max-w-3xl font-serif tracking-tight text-zinc-950
                text-4xl leading-[0.95]
                sm:text-5xl sm:leading-[0.9]
                md:text-6xl md:leading-[0.88]
                lg:text-[4.4rem]
                xl:text-[5rem]
                sm:mb-8
              "
            >
              A Clean Home <br />
              <span className="italic text-stone-400">Changes Everything</span>
            </h1>

            {/* Lead paragraph */}
            <p className="mb-8 max-w-xl text-sm font-light leading-relaxed text-stone-600 sm:text-base md:text-lg lg:text-xl">
              Professional deep cleaning and routine maintenance for homes,
              apartments, and commercial spaces. We deliver detailed, reliable,
              and high-quality service you can trust.
            </p>

            {/* Stats */}
            <dl className="mb-8 grid max-w-xl grid-cols-3 gap-3 border-y border-stone-200/80 py-5 sm:gap-4 sm:py-6 md:mb-10">
              <Stat label="Response" value="24h" />
              <Stat label="Cleaning" value="Deep" />
              <Stat label="Service" value="Reliable" />
            </dl>

            {/* CTAs */}
            <div className="mb-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center md:mb-10">
              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                className="
                  group relative w-full overflow-hidden border border-green-900 bg-green-900
                  px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white
                  transition-all duration-300 hover:shadow-[0_18px_45px_rgba(20,83,45,0.18)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2
                  sm:w-auto sm:px-8 md:px-10 md:py-4
                "
              >
                <span className="relative z-10">Book Cleaning</span>
                <span className="absolute inset-0 translate-y-full bg-zinc-950 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              </button>

              <button
                type="button"
                onClick={() => setOpenEstimator(true)}
                className="
                  group relative w-full overflow-hidden border border-zinc-300 bg-white
                  px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-900
                  transition-all duration-300 hover:border-blue-900
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2
                  sm:w-auto sm:px-8 md:px-10 md:py-4
                "
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Get Estimate
                </span>
                <span className="absolute inset-0 translate-y-full bg-blue-900 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              </button>
            </div>

            {/* Contact */}
            <div className="mb-6 flex flex-col gap-2 text-sm text-stone-700 sm:flex-row sm:gap-6">
              <a
                href="tel:8573528554"
                className="inline-flex items-center gap-2 transition hover:text-zinc-950 focus-visible:outline-none focus-visible:text-zinc-950"
                aria-label="Call Saskia Cleaning at 857-352-8554"
              >
                <span aria-hidden="true">📞</span> 857-352-8554
              </a>
              <a
                href="mailto:cleaningsaskia@gmail.com"
                className="inline-flex items-center gap-2 transition hover:text-zinc-950 focus-visible:outline-none focus-visible:text-zinc-950"
                aria-label="Email cleaningsaskia@gmail.com"
              >
                <span aria-hidden="true">✉️</span> cleaningsaskia@gmail.com
              </a>
            </div>

            {/* Trust badges */}
            <ul className="flex max-w-xl flex-wrap gap-x-6 gap-y-2 text-xs text-stone-600 sm:text-sm">
              <TrustBadge>Licensed &amp; insured</TrustBadge>
              <TrustBadge>Residential &amp; commercial</TrustBadge>
              <TrustBadge>Boston area</TrustBadge>
            </ul>
          </motion.div>
        </div>

        {/* ─── Visual Column ─────────────────────────────── */}
        <div
          className="
            relative flex items-center lg:col-span-6
            h-[380px] sm:h-[480px] md:h-[600px] lg:h-[700px] xl:h-[750px]
          "
        >
          {/* Primary image */}
          <motion.div
            style={{ y: yLarge }}
            initial={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 0 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="absolute right-0 top-6 h-[78%] w-[88%] overflow-hidden rounded-sm shadow-2xl sm:top-10 md:top-12 md:h-[80%] md:w-[85%]"
          >
            <motion.div
              style={{ scale: scaleImage }}
              className="relative h-full w-full"
            >
              <Image
                src="/images/PHOTO-2026-05-06-23-30-38 (1).jpg"
                alt="Professional cleaning service in action"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover grayscale-[15%] transition-all duration-1000 hover:grayscale-0"
              />
            </motion.div>
          </motion.div>

          {/* Secondary carousel — hidden on small screens to keep things calm */}
          <motion.div
            style={{ y: ySmall }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="
              absolute bottom-10 left-0 z-20 hidden overflow-hidden rounded-sm
              border-[10px] border-[#FCFAF8] shadow-2xl
              md:block md:h-3/5 md:w-3/5 md:bottom-16
              lg:bottom-20 lg:border-[12px]
            "
          >
            <ArchitecturalCarousel />
          </motion.div>

          {/* Decorative ring */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -right-6 -top-6 hidden h-24 w-24 rounded-full border border-dashed border-stone-300/60 opacity-40 md:block lg:h-32 lg:w-32"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ─── Service Inquiry Modal ─────────────────────── */}
      <AnimatePresence>
        {isInquiryOpen && (
          <motion.div
            onClick={() => setIsInquiryOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Service inquiry form"
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ServiceInquiryForm onClose={() => setIsInquiryOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cost Estimation Modal ─────────────────────── */}
      <CostEstimationModal
        isOpen={openEstimator}
        onClose={() => setOpenEstimator(false)}
      />
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   Small presentational helpers — keep markup readable.
   ──────────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-serif text-xl text-zinc-950 sm:text-2xl">{value}</dd>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-stone-500 sm:text-[10px] sm:tracking-[0.25em]">
        {label}
      </p>
    </div>
  );
}

function TrustBadge({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-green-900" />
      {children}
    </li>
  );
}
