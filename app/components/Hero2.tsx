// components/Hero.tsx

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const heroImages = [
  "/images/house.jpg",
  "/images/pexels-artbovich-6899345.jpg",
  "/images/pexels-salmansaqib-28456461.jpg",
] as const;

export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[600px] overflow-hidden bg-white pt-30 text-white">
      {/* Background image carousel */}
      <AnimatePresence initial={false}>
        <motion.div
          key={heroImages[activeImage]}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={heroImages[activeImage]}
            alt="Modern spotless home interior"
            fill
            priority={activeImage === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#172b45]/95 via-[#29496b]/75 to-[#7fb6e7]/55" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-full items-center px-6 py-20 lg:px-40">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="max-w-3xl">
            {/* Heading */}
            <h1 className="max-w-3xl animate-[fadeInUp_0.8s_ease-out_forwards] text-3xl font-black leading-[0.95] tracking-tight sm:text-4xl lg:text-6xl">
              Come home to spotless. Every single time.
            </h1>

            {/* Paragraph */}
            <p className="mt-8 max-w-3xl animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] text-lg font-medium leading-8 text-slate-100 opacity-0 sm:text-xl">
              Life gets busy, and cleaning is usually the first thing to slip.
              That&apos;s where we come in. Saskia Cleaning keeps homes and
              businesses spotless with reliable service, premium care, and
              attention to detail you can trust.
            </p>

            {/* CTA Buttons */}
            <div className="my-10 flex flex-col gap-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] sm:flex-row">
              <a
                href="#quote"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-4 text-lg font-extrabold text-white shadow-lg transition duration-300 hover:scale-[1.03] hover:bg-sky-300 hover:shadow-sky-400/20 active:scale-[0.98]"
              >
                Get My Free Quote →
              </a>

              <a
                href="sms:8573528554"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/90 px-8 py-4 text-lg font-extrabold text-white backdrop-blur-sm transition duration-300 hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98]"
              >
                💬 Text us: (857) 352-8554
              </a>
            </div>
          </div>

          {/* Right Logo Area */}
          <div className="flex flex-col items-center justify-center lg:items-end">
            <div className="relative flex items-center justify-center opacity-0 animate-[scaleIn_0.8s_ease-out_0.3s_forwards]">
              <div className="animate-[float_6s_ease-in-out_infinite]">
                <Image
                  src="/images/whitelogo2.png"
                  alt="Saskia Cleaning Logo"
                  width={300}
                  height={300}
                  priority
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "300px",
                  }}
                  className="relative z-10 object-contain drop-shadow-[0_0_35px_rgba(127,182,231,0.3)] transition duration-500 hover:drop-shadow-[0_0_50px_rgba(127,182,231,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to background image ${index + 1}`}
            onClick={() => setActiveImage(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              activeImage === index
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Bottom Curve */}
      <div className="absolute bottom-0 left-0 w-full rotate-180 overflow-hidden leading-[0]">
        <svg
          className="relative block h-[120px] w-[calc(100%+1.3px)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39 56.44C197.8 89.92 0 120 0 120V0h1200v27.35c-86.91 25.8-208.8 58.23-348.84 62.15-147.19 4.14-243.45-23.08-358.66-35.71-87.53-9.61-172.8-3.2-271.11 2.65Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}