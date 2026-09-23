"use client";

import type { ReactNode } from "react";
import SectionWrapper from "./components/SectionWrapper";
import CleaningPricingCalculator from "./components/CleaningPricingCalculator";
import AutoServiceCarousel from "./components/AutoServiceCarousel";
import CommercialCleaningServices from "./components/CommercialCleaningServices";
import CommercialCleaningPlans from "./components/CommercialCleaningPlans";
import Navbar from "./components/Navbar";
import Hero2 from "./components/Hero2";
import ChatBot from "./components/ChatBot";
import LocationMap from "./components/LocationMap";
import AdCardGrid from "./components/AdCardGrid";
import Footer from "./components/Footer";

/**
 * Client home shell. CatTab is injected as a server-rendered child so
 * authenticated booking prefill can be resolved without a public API.
 */
export default function HomeClient({ catTab }: { catTab: ReactNode }) {
  return (
    <main className="relative overflow-x-hidden bg-white">
      <Navbar />

      <Hero2 />

      <section
        id="social-section"
        className="relative bg-white py-10"
        style={{ transform: "translateY(-14px)" }}
      >
        <div className=" bg-white">
          <AdCardGrid />
        </div>
        <div className="bg-white">{catTab}</div>

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

      <ChatBot />
      <Footer />
    </main>
  );
}
