"use client";

import { motion } from "framer-motion";

import Hero from "./components/Hero";
import InfoBar from "./components/InfoBar";
import ServicesSection from "./components/ServicesSection";
import type { ServiceItem } from "./components/ServicesSection";
import BentoGrid from "./components/BentoGrid";
import { Services } from "./components/Services";
import Contact from "./components/Contact";
import SectionWrapper from "./components/SectionWrapper";
import CleaningPricingCalculator from "./components/CleaningPricingCalculator";
import AutoServiceCarousel from "./components/AutoServiceCarousel";

// Unused for now — uncomment imports when re-enabling these sections:
// import { TrustBar } from './components/TrustBar';
// import CleaningPriceCalculator from './components/CleaningPriceCalculator';

/* ─── Service Data ─────────────────────────────────────────────── */

const COMMERCIAL_SERVICES: ServiceItem[] = [
  { icon: "office", title: "Office Cleaning", href: "#office" },
  { icon: "restaurant", title: "Restaurant Cleaning", href: "#restaurant" },
  { icon: "construction", title: "Post-Construction Cleaning", href: "#construction" },
  { icon: "floor", title: "Floor Care & Maintenance", href: "#floor" },
  { icon: "building", title: "Building Maintenance", href: "#building" },
  { icon: "deep", title: "Deep Cleaning", href: "#deep" },
];

const RESIDENTIAL_SERVICES: ServiceItem[] = [
  { icon: "home", title: "Routine House Cleaning", href: "#routine" },
  { icon: "deep", title: "Deep Cleaning", href: "#residential-deep" },
  { icon: "moving", title: "Move-In / Move-Out", href: "#move" },
  { icon: "sparkle", title: "Post-Event Recovery", href: "#post-event" },
];

/* ─── Page ─────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <main className="relative bg-white overflow-x-hidden">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Info bar */}
      <InfoBar />

      {/* 3. Commercial services — image on right */}
      <ServicesSection
        eyebrow="What We Do"
        title="Commercial Cleaning"
        titleAccent="Services"
        tagline="“We keep your business sparkling clean.”"
        description="Our experienced and reliable team specializes in commercial cleaning for offices, restaurants, schools, and more — delivering spotless results every time."
        services={COMMERCIAL_SERVICES}
        imageSrc="/images/commercial-hero.jpg"
        imageAlt="Pristine restaurant interior"
        ctaLabel="Start Cleaning"
        onCtaClick={() => console.log("open commercial inquiry")}
      />

      {/* 4. Residential services — image on left */}
      <ServicesSection
        eyebrow="For Your Home"
        title="Residential Cleaning"
        titleAccent="At Its Finest"
        tagline="“A clean home changes everything.”"
        description="Thoughtful, detailed care for homes and apartments across the Boston area — from weekly maintenance to deep restorative cleans."
        services={RESIDENTIAL_SERVICES}
        imageSrc="/images/residential-hero.jpg"
        imageAlt="Beautifully kept living room"
        layout="image-left"
        ctaLabel="Book Your Clean"
        badgeTitle="Bonded & Insured"
        badgeSubtitle="Background-Checked Team"
      />

      {/* 5. Auto service carousel */}
      <SectionWrapper>
        <AutoServiceCarousel />
      </SectionWrapper>

      {/* 6. Pricing calculator */}
      <SectionWrapper>
        <CleaningPricingCalculator />
      </SectionWrapper>

      {/* 7. Bento grid */}
      <SectionWrapper>
        <BentoGrid />
      </SectionWrapper>

      {/* 8. Services */}
      <SectionWrapper>
        <Services />
      </SectionWrapper>

      {/* 9. "Ready for Restoration" CTA */}
      <SectionWrapper>
        <section className="flex flex-col items-center px-6 py-60 text-center">
          <motion.h2
            initial={{ letterSpacing: "0em" }}
            whileInView={{ letterSpacing: "0.05em" }}
            transition={{ duration: 1.5 }}
            className="mb-16 font-serif text-5xl leading-none text-[#1A1A1A] md:text-9xl"
          >
            Ready for <br />
            <span className="italic font-light tracking-tighter text-stone-300">
              Restoration?
            </span>
          </motion.h2>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              group relative overflow-hidden rounded-full bg-[#1A1A1A]
              px-20 py-8 text-white
              transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]
            "
          >
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.4em]">
              Secure a Consultation
            </span>
            <motion.div
              className="absolute inset-0 bg-stone-700 opacity-0 transition-opacity group-hover:opacity-100"
              initial={false}
              whileHover={{ scale: 1.5 }}
            />
          </motion.button>
        </section>
      </SectionWrapper>

      {/* 10. Contact form */}
      <SectionWrapper>
        <Contact />
      </SectionWrapper>

      {/* 11. Footer */}
      <footer className="border-t border-stone-100 px-8 py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-serif text-2xl italic tracking-tighter">
              Saskia
            </span>
            <span className="text-[9px] uppercase tracking-[0.5em] text-stone-400">
              Stewardship Group
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-stone-300">
            Boston • 2026 • Massachusetts
          </div>
        </div>
      </footer>
    </main>
  );
}
