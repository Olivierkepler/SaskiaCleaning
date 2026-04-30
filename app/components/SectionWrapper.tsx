"use client";
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function SectionWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Sophisticated transforms: subtle scale-up and 3D tilt
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3], [100, 0]);

  return (
    <motion.div
      ref={containerRef}
      style={{ 
        scale, 
        opacity,
        y,
        perspective: "1000px" 
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}