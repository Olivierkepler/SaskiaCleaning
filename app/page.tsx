"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

import Hero from "./components/Hero";
import BentoGrid from "./components/BentoGrid";
import { TrustBar } from "./components/TrustBar";
import { Services } from "./components/Services";
import Contact from "./components/Contact";
import SectionWrapper from "./components/SectionWrapper";
import CleaningPricingCalculator from "./components/CleaningPricingCalculator";
import AutoServiceCarousel from "./components/AutoServiceCarousel";
import CleaningPriceCalculator from "./components/CleaningPriceCalculator";
import InfoBar from "./components/InfoBar";
import CommercialCleaningServices from "./components/CommercialCleaningServices";
import CommercialCleaningPlans from "./components/CommercialCleaningPlans";
import Navbar from "./components/Navbar";
import Hero2 from "./components/Hero2";
import SocialCorner from "./components/SocialCorner";

export default function Home() {
  const socialSectionRef = useRef<HTMLDivElement | null>(null);

  const showSocialCorner = useInView(socialSectionRef, {
    amount: 0.2,
    margin: "-10% 0px -30% 0px",
  });

  return (
    <main className="relative overflow-x-hidden bg-white">
      <Navbar />

      <Hero2 />

      <div ref={socialSectionRef} className="relative">
        {showSocialCorner && <SocialCorner />}

        <InfoBar />

        <SectionWrapper>
          <AutoServiceCarousel />
        </SectionWrapper>
      </div>

      <CommercialCleaningPlans
        backgroundImageSrc="/images/kitchen.jpg"
        onContactClick={() => {
          document.getElementById("contact")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
        onPlanClick={(id) => console.log("Selected plan:", id)}
      />

      <CommercialCleaningServices
        imageSrc="/images/kitchen.jpg"
        onCtaClick={() => console.log("Start cleaning!")}
      />

      <SectionWrapper>
        <CleaningPricingCalculator />
      </SectionWrapper>

      <SectionWrapper>
        <Contact />
      </SectionWrapper>

      <footer className="border-t border-stone-100 px-8 py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row" />
      </footer>
    </main>
  );
}