"use client";

import { useState } from "react";

import SectionWrapper from "./components/SectionWrapper";
import CleaningPricingCalculator from "./components/CleaningPricingCalculator";
import AutoServiceCarousel from "./components/AutoServiceCarousel";
import CommercialCleaningServices from "./components/CommercialCleaningServices";
import CommercialCleaningPlans from "./components/CommercialCleaningPlans";
import Navbar from "./components/Navbar";
import Hero2 from "./components/Hero2";
import SocialCorner from "./components/SocialCorner";
import ChatBot from "./components/ChatBot";
import CatTab from "./components/CatTab";
import LocationMap from "./components/LocationMap";
import AdCardGrid from "./components/AdCardGrid";
import WhiteOverlay from "./components/WhiteOverlay";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="relative overflow-x-hidden bg-white">
      <Navbar />

      <Hero2 />

      <SocialCorner sectionId="social-section" />

      <section
        id="social-section"
        className="relative bg-white py-10"
        style={{ transform: "translateY(-14px)" }}
      >
        <div className="hidden bg-white sm:block">
          <AdCardGrid />
        </div>

        <div className="bg-white">
          <CatTab />
        </div>

        <SectionWrapper>
          <AutoServiceCarousel />
        </SectionWrapper>
      </section>

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
        <LocationMap />
      </SectionWrapper>

      {isChatOpen && <WhiteOverlay />}

      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

      <footer className="border-t border-stone-100 px-8 py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row" />
      </footer>
    </main>
  );
}