"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import ServiceInquiryForm from "./ServiceInquiryForm";
import ArchitecturalCarousel from "./ArchitecturalCarousel";
import CostEstimationModal from "./CostEstimationModal";
import Image from "next/image";

export default function Hero() {
  const containerRef = useRef(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [openEstimator, setOpenEstimator] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yLarge = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const ySmall = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const scaleImage = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  // Subtle parallax on the background itself
  const yBackground = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => {
    if (openEstimator) return; // CostEstimationModal manages overflow when open

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
      className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden px-6 pt-20 md:px-16
        bg-[url('/images/maxresdefault.jpg')]
      "
    >
      {/* Background image with subtle parallax */}
      <motion.div
        style={{ y: yBackground }}
        className="absolute inset-0 -z-20"
      >
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80"
          alt="Modern interior background"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Light overlay so dark text stays readable on top of the photo.
          The gradient fades to more transparent on the right so the visual
          column still feels connected to the background. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FCFAF8]/95 via-[#FCFAF8]/85 to-[#FCFAF8]/55" />

      {/* Optional subtle dotted texture, matches the reference's grain */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Text Content */}
        <div className="z-10 mt-10 lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="mb-5 block text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">
              Saskia Cleaning Services — Boston, Massachusetts
            </span>

            <h1 className="mb-8 max-w-3xl font-serif text-5xl leading-[0.88] tracking-tight text-zinc-950 md:text-[4.5rem] lg:text-[4.4rem]">
              A Clean Home <br />
              <span className="italic text-stone-400">Changes Everything</span>
            </h1>

            <p className="mb-8 max-w-xl text-base font-light leading-relaxed text-stone-500 md:text-xl">
              Professional deep cleaning and routine maintenance for homes,
              apartments, and commercial spaces. We deliver detailed, reliable,
              and high-quality service you can trust.
            </p>

            {/* Stats */}
            <div className="mb-10 grid max-w-xl grid-cols-2 gap-4 border-y border-stone-200 py-6 sm:grid-cols-3">
              <div>
                <p className="font-serif text-2xl text-zinc-950">24h</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                  Response
                </p>
              </div>

              <div>
                <p className="font-serif text-2xl text-zinc-950">Deep</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                  Cleaning
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="font-serif text-2xl text-zinc-950">Reliable</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                  Service
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mb-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                className="group relative overflow-hidden border border-green-900 bg-green-900 px-8 py-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:shadow-[0_18px_45px_rgba(20,83,45,0.18)] sm:px-10"
              >
                <span className="relative z-10">Book Cleaning</span>
                <span className="absolute inset-0 translate-y-full bg-zinc-950 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              </button>

              <button
                type="button"
                onClick={() => setOpenEstimator(true)}
                className="group relative overflow-hidden border border-zinc-300 bg-white px-8 py-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-900 transition-all duration-300 hover:border-blue-900 sm:px-10"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Get Estimate
                </span>
                <span className="absolute inset-0 translate-y-full bg-blue-900 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="mb-6 flex flex-col gap-2 text-sm text-stone-600">
              <a href="tel:8573528554" className="hover:text-zinc-900 transition">
                📞 857-352-8554
              </a>
              <a
                href="mailto:cleaningsaskia@gmail.com"
                className="hover:text-zinc-900 transition"
              >
                ✉️ cleaningsaskia@gmail.com
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex max-w-xl flex-col gap-3 text-sm text-stone-500 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-900" />
                Licensed & insured
              </div>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-900" />
                Residential & commercial
              </div>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-900" />
                Boston area
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visual Content */}
        <div className="relative flex h-[600px] items-center md:h-[750px] lg:col-span-6">
          <motion.div
            style={{ y: yLarge }}
            initial={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 0 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="absolute right-0 top-12 h-[80%] w-[85%] overflow-hidden rounded-sm shadow-2xl"
          >
            <motion.video
              style={{ scale: scaleImage }}
              src="/videos/cleaning2.mp4"
              className="h-full w-full object-cover grayscale-[15%] transition-all duration-1000 hover:grayscale-0"
              autoPlay
              muted
              loop
              playsInline
            />
          </motion.div>

          <motion.div
            style={{ y: ySmall }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="absolute bottom-20 left-0 z-20 hidden h-3/5 w-3/5 overflow-hidden rounded-sm border-[12px] border-[#FCFAF8] shadow-2xl md:block"
          >
            <ArchitecturalCarousel />
          </motion.div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -right-6 -top-6 hidden h-32 w-32 rounded-full border border-dashed border-stone-200 opacity-40 md:block"
          />
        </div>
      </div>

      {/* Service Inquiry Modal */}
      <AnimatePresence>
        {isInquiryOpen && (
          <motion.div
            onClick={() => setIsInquiryOpen(false)}
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

      {/* Cost Estimation Modal */}
      <CostEstimationModal
        isOpen={openEstimator}
        onClose={() => setOpenEstimator(false)}
      />
    </section>
  );
}
