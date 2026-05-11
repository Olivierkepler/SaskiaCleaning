"use client";

import { motion } from "framer-motion";

import Hero from "./components/Hero";
import InfoBar from "./components/InfoBar";
import BentoGrid from "./components/BentoGrid";
import { TrustBar } from "./components/TrustBar";
import { Services } from "./components/Services";
import Contact from "./components/Contact";
import SectionWrapper from "./components/SectionWrapper";
import CleaningPricingCalculator from "./components/CleaningPricingCalculator";
import AutoServiceCarousel from "./components/AutoServiceCarousel";
import CleaningPriceCalculator from "./components/CleaningPriceCalculator";
import ServicesSection, {
  type ServiceItem,
} from "./components/ServicesSection";

/* ─── Data: edit copy and links in one place ─────────────────────────────── */

const COMMERCIAL_SERVICES: ServiceItem[] = [
  { icon: "office",       title: "Office Cleaning",            href: "#office-cleaning" },
  { icon: "restaurant",   title: "Restaurant Cleaning",        href: "#restaurant-cleaning" },
  { icon: "construction", title: "Post-Construction Cleaning", href: "#post-construction" },
  { icon: "floor",        title: "Floor Care & Maintenance",   href: "#floor-care" },
  { icon: "building",     title: "Building Maintenance",       href: "#building-maintenance" },
  { icon: "deep",         title: "Deep Cleaning",              href: "#deep-cleaning" },
];

const RESIDENTIAL_SERVICES: ServiceItem[] = [
  { icon: "home",    title: "Routine House Cleaning", href: "#routine" },
  { icon: "deep",    title: "Residential Deep Clean", href: "#residential-deep" },
  { icon: "moving",  title: "Move-In / Move-Out",     href: "#move" },
  { icon: "sparkle", title: "Post-Event Recovery",    href: "#post-event" },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <main className="relative bg-white overflow-x-hidden">

      {/* 1. Hero */}
      <Hero />

      {/* 2. Info bar (green) */}
      <InfoBar />

      {/* 3. Commercial services — image right */}
      <SectionWrapper>
        <ServicesSection
          eyebrow="What We Do"
          title="Commercial Cleaning"
          titleAccent="Services"
          tagline="“We keep your business sparkling clean.”"
          description="Our experienced and reliable team specializes in commercial cleaning for offices, restaurants, schools, and more — delivering spotless results every time."
          services={COMMERCIAL_SERVICES}
          imageSrc="/images/commercial-hero.jpg"
          imageAlt="Pristine commercial restaurant interior"
          ctaLabel="Start Cleaning"
          onCtaClick={() => {
            // TODO: open your inquiry modal
          }}
        />
      </SectionWrapper>

      {/* 4. Auto service carousel */}
      <SectionWrapper>
        <AutoServiceCarousel />
      </SectionWrapper>

      {/* 5. Pricing calculator */}
      <SectionWrapper>
        <CleaningPricingCalculator />
      </SectionWrapper>

      {/* 6. Bento grid */}
      <SectionWrapper>
        <BentoGrid />
      </SectionWrapper>

      {/* 7. Residential services — image left, alternates rhythm */}
      <SectionWrapper>
        <ServicesSection
          eyebrow="For Your Home"
          title="Residential Cleaning"
          titleAccent="At Its Finest"
          tagline="“A clean home changes everything.”"
          description="Thoughtful, detailed care for homes and apartments across the Boston area — from weekly maintenance to deep restorative cleans tailored to your space."
          services={RESIDENTIAL_SERVICES}
          imageSrc="/images/residential-hero.jpg"
          imageAlt="Beautifully maintained residential living room"
          layout="image-left"
          ctaLabel="Book Your Clean"
          badgeTitle="Bonded & Insured"
          badgeSubtitle="Background-Checked Team"
          onCtaClick={() => {
            // TODO: open your inquiry modal
          }}
        />
      </SectionWrapper>

      {/* 8. Existing Services (you may want to replace or keep) */}
      <SectionWrapper>
        <Services />
      </SectionWrapper>

      {/* 9. Custom CTA */}
      <SectionWrapper>
        <section className="py-60 px-6 text-center flex flex-col items-center">
          <motion.h2
            initial={{ letterSpacing: "0em" }}
            whileInView={{ letterSpacing: "0.05em" }}
            transition={{ duration: 1.5 }}
            className="text-5xl md:text-9xl font-serif mb-16 text-[#1A1A1A] leading-none"
          >
            Ready for <br />
            <span className="italic text-stone-300 font-light tracking-tighter">
              Restoration?
            </span>
          </motion.h2>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-20 py-8 bg-[#1A1A1A] text-white overflow-hidden rounded-full transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          >
            <span className="relative z-10 font-bold uppercase tracking-[0.4em] text-[10px]">
              Secure a Consultation
            </span>
            <motion.div
              className="absolute inset-0 bg-stone-700 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              whileHover={{ scale: 1.5 }}
            />
          </motion.button>
        </section>
      </SectionWrapper>

      {/* 10. Contact */}
      <SectionWrapper>
        <Contact />
      </SectionWrapper>

      {/* 11. Footer */}
      <footer className="py-20 px-8 border-t border-stone-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-serif italic text-2xl tracking-tighter">Saskia</span>
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
