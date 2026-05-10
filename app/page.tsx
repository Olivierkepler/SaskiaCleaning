"use client";
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import { TrustBar } from './components/TrustBar';
import { Services } from './components/Services';
import Contact from './components/Contact';
import SectionWrapper from './components/SectionWrapper';
import CleaningPricingCalculator from './components/CleaningPricingCalculator';
import { motion } from 'framer-motion';
import AutoServiceCarousel from './components/AutoServiceCarousel';
import CleaningPriceCalculator from './components/CleaningPriceCalculator';
import InfoBar from "./components/InfoBar";

export default function Home() {
  
  return (
    <main className="relative bg-white overflow-x-hidden ">
      
      {/* 1. Hero: Internal entrance animations already set */}
      <Hero />
<InfoBar />
      {/* 2. TrustBar: Gentle slide-in reveal */}
      {/* <SectionWrapper>
        <TrustBar />
      </SectionWrapper> */}

      <SectionWrapper>
        <AutoServiceCarousel/>
      </SectionWrapper>

{/* 
      <SectionWrapper>
        <CleaningPriceCalculator/>
      </SectionWrapper> */}



      <SectionWrapper>
       <CleaningPricingCalculator/>
      </SectionWrapper>




      {/* 3. BentoGrid: 3D Scale Reveal */}
      <SectionWrapper>
        <BentoGrid />
      </SectionWrapper>

      {/* 4. Services: Subtle Parallax drift */}
      <SectionWrapper>
        <Services />
      </SectionWrapper>

      {/* 5. Custom CTA with Magnet Effect */}
      <SectionWrapper>
        <section className="py-60 px-6 text-center flex flex-col items-center">
          <motion.h2 
            initial={{ letterSpacing: "0em" }}
            whileInView={{ letterSpacing: "0.05em" }}
            transition={{ duration: 1.5 }}
            className="text-5xl md:text-9xl font-serif mb-16 text-[#1A1A1A] leading-none"
          >
            Ready for <br /> 
            <span className="italic text-stone-300 font-light tracking-tighter">Restoration?</span>
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

      {/* 6. Contact Form */}
      <SectionWrapper>
        <Contact />
      </SectionWrapper>

      {/* 7. Footer - Final Polish */}
      <footer className="py-20 px-8 border-t border-stone-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-serif italic text-2xl tracking-tighter">Saskia</span>
            <span className="text-[9px] uppercase tracking-[0.5em] text-stone-400">Stewardship Group</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-stone-300">
            Boston • 2026 • Massachusetts
          </div>
        </div>
      </footer>
    </main>
  );
}
