"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ShowcaseSlide = {
  imageSrc: string;
  title: string;
  subtitle: string;
  objectPosition?: string;
};

const slides: ShowcaseSlide[] = [
  {
    imageSrc: "/images/saskia2.JPG",
    title: "Freshly Detailed Spaces",
    subtitle: "Residential cleaning with a polished, professional finish.",
    objectPosition: "center center",
  },
  {
    imageSrc: "/images/saskia1.JPG",
    title: "Premium Cleaning Care",
    subtitle: "Reliable service for homes, apartments, and businesses.",
    objectPosition: "center center",
  },
  {
    imageSrc: "/images/saskia4.JPG",
    title: "Clean That Feels New",
    subtitle: "Thoughtful, detail-focused cleaning for everyday comfort.",
    objectPosition: "center center",
  },
];

const AUTOPLAY_DELAY = 5500;

export default function CleaningShowcaseCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  const nextSlide = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slides.length);
  }, []);

  const previousSlide = useCallback(() => {
    setActiveIndex((index) => (index === 0 ? slides.length - 1 : index - 1));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(nextSlide, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [nextSlide]);

  return (
    <section
      aria-label="Cleaning service showcase"
      className="group relative h-full min-h-[360px] w-full overflow-hidden rounded-[inherit] bg-zinc-950"
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={slide.imageSrc}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              isActive ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            <img
              src={slide.imageSrc}
              alt={slide.title}
              className={`h-full w-full object-cover transition-transform duration-[4000ms] ease-out ${
                isActive ? "scale-100" : "scale-105"
              }`}
              style={{
                objectPosition: slide.objectPosition ?? "center center",
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.28)_100%)]" />
          </div>
        );
      })}

      <div className="absolute bottom-6 left-6 right-6 z-20">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/60">
          Saskia Cleaning Services
        </p>

        <h2 className="max-w-sm font-serif text-2xl leading-[1.05] tracking-[-0.03em] text-white sm:text-3xl">
          {activeSlide.title}
        </h2>

        <p className="mt-2 max-w-xs text-sm font-light leading-6 text-white/75">
          {activeSlide.subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={previousSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-xl transition hover:bg-white/20 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <ChevronLeft size={19} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-xl transition hover:bg-white/20 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <ChevronRight size={19} />
      </button>

      <div className="absolute bottom-5 right-6 z-30 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.imageSrc}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`View ${slide.title}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              activeIndex === index
                ? "w-8 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
