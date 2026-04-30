"use client";
import { motion, type Variants } from 'framer-motion';

export function Services() {
  // Animation variants for the container (staggers the children)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Animation variants for individual cards
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] as const } 
    },
  };

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Header Animation */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
      >
        <h2 className="text-4xl md:text-6xl font-serif text-[#1A1A1A]">Tailored Care</h2>
        <motion.p 
          whileHover={{ x: 5 }}
          className="text-stone-400 text-sm uppercase tracking-widest border-b border-stone-200 pb-2 cursor-pointer transition-colors hover:text-stone-700"
        >
          View Portfolio
        </motion.p>
      </motion.div>

      {/* Services Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        
        {/* Large Feature: Deep Restoration */}
        <motion.div 
          variants={cardVariants}
          className="md:col-span-2 group relative overflow-hidden bg-stone-100 h-[450px] shadow-sm"
        >
          {/* Pro Touch: Glassmorphism Info Box */}
          <div className="absolute inset-0 p-12 z-10 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-8 max-w-sm rounded-sm text-white"
            >
              <h3 className="text-3xl font-serif mb-2 text-white">Deep Restoration</h3>
              <p className="text-sm opacity-90 font-light leading-relaxed">
                A comprehensive overhaul of every surface, reaching the corners others ignore.
              </p>
            </motion.div>
          </div>

          <img 
            src="/cleaning1.jpg" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms] ease-out brightness-[0.85]" 
            alt="Luxury Minimalist Interior"
          />
        </motion.div>

        {/* Small Accent: Post-Event */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -5 }}
          className="bg-[#1A1A1A] text-[#FCFAF8] p-12 flex flex-col justify-between shadow-xl relative"
        >
          {/* Subtle tech-edge: Animated background element */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"
          />

          <div className="w-12 h-12 border border-stone-700 rounded-full flex items-center justify-center text-[10px] tracking-widest text-stone-300">
            01
          </div>
          
          <div>
            <h3 className="text-3xl font-serif italic mb-6">Post-Event</h3>
            <p className="text-xs text-stone-400 leading-relaxed uppercase tracking-[0.2em] font-medium">
              Rapid response restoration following gallery openings, private galas, or high-profile gatherings.
            </p>
            <motion.div 
              className="mt-8 h-px bg-stone-700 origin-left"
              whileInView={{ scaleX: [0, 1] }}
              transition={{ delay: 1, duration: 1 }}
            />
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}