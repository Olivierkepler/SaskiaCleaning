"use client";
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ServiceInquiryForm from "./ServiceInquiryForm";

export default function Hero() {
  const containerRef = useRef(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  // Scroll tracking for the parallax effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax: Main image shifts up, smaller image shifts down
  const yLarge = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const ySmall = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const scaleImage = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-16 pt-20 overflow-hidden">
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        
        {/* Text Content */}
        <div className="lg:col-span-6 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-semibold mb-4 block">
              Established 2026 — Boston | Massachusetts
            </span>
            <h1 className="text-2xl md:text-[5.5rem] font-serif leading-[0.85] tracking-tight mb-8">
              A Study in <br />
              <span className="italic text-stone-400">Purity.</span>
            </h1>
            <p className="text-lg md:text-xl font-light text-stone-500 max-w-md leading-relaxed mb-10">
              Bespoke residential stewardship for those who value time and tranquility above all else. 
            </p>
            <div className="flex gap-4">
            <button
  onClick={() => setIsInquiryOpen(true)}
  className="group relative bg-[#1A1A1A] text-white px-10 py-4 text-xs uppercase tracking-widest overflow-hidden transition-all"
>
  <span className="relative z-10">Begin Inquiry</span>
  <div className="absolute inset-0 bg-stone-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
</button>
            </div>
          </motion.div>
        </div>

        {/* Visual Content - Pro Animated Images */}
        <div className="lg:col-span-6 relative h-[600px] md:h-[750px] flex items-center">
          
          {/* Main Large Image with Reveal & Parallax */}
          <motion.div 
            style={{ y: yLarge }}
            initial={{ clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="absolute right-0 top-12 w-[85%] h-[80%] overflow-hidden rounded-sm shadow-2xl"
          >
            <motion.img 
              style={{ scale: scaleImage }}
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974" 
              className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-1000" 
              alt="Luxury Living"
            />
          </motion.div>

          {/* Floating Secondary Image with Offset Parallax */}
          <motion.div 
            style={{ y: ySmall }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="absolute left-0 bottom-20 w-3/5 h-3/5 border-[12px] border-[#FCFAF8] overflow-hidden rounded-sm shadow-2xl hidden md:block z-20"
          >
            <div className="relative w-full h-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=2070" 
                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[2.5s] ease-out" 
                alt="Meticulous Architectural Detail"
              />
            </div>
          </motion.div>

          {/* Tech Edge: Minimalist Decorative Graphic */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -right-6 -top-6 w-32 h-32 border border-stone-200 rounded-full border-dashed opacity-40 hidden md:block"
          />
        </div>
      </div>
      <AnimatePresence>
  {isInquiryOpen && (
    <motion.div
      onClick={() => setIsInquiryOpen(false)}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-10 overflow-y-auto"
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
    </section>
  );
}