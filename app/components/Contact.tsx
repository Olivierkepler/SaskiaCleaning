"use client";
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function Contact() {
  return (
    <section className="py-32 px-6 md:px-16 bg-[#FCFAF8] overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
        
        {/* Left Side: Consultation Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-bold mb-6 block">
              Inquiry
            </span>
            <h2 className="text-5xl md:text-7xl font-serif leading-tight mb-8">
              Begin your <br />
              <span className="italic text-stone-400">Consultation.</span>
            </h2>
            <p className="text-stone-500 font-light leading-relaxed max-w-sm mb-12">
              Our stewardship teams are available for private residences across Greater Boston and the North Shore. Reach out to define your service protocol.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-all duration-500">
                <Mail size={18} strokeWidth={1} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Email</p>
                <p className="text-stone-800 font-light">concierge@Saskia.com</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-all duration-500">
                <Phone size={18} strokeWidth={1} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Direct</p>
                <p className="text-stone-800 font-light">+1 (617) 555-0128</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: The Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white p-8 md:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] rounded-sm"
        >
          <form className="space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className="w-full bg-transparent border-b border-stone-200 py-4 outline-none focus:border-stone-900 transition-colors font-light text-sm placeholder:text-stone-300"
                />
              </div>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b border-stone-200 py-4 outline-none focus:border-stone-900 transition-colors font-light text-sm placeholder:text-stone-300"
                />
              </div>
            </div>

            <div className="relative group">
              <select className="w-full bg-transparent border-b border-stone-200 py-4 outline-none focus:border-stone-900 transition-colors font-light text-sm text-stone-500 appearance-none">
                <option>Service Interest</option>
                <option>Elite Residential Stewardship</option>
                <option>Post-Construction Restoration</option>
                <option>Special Event Recovery</option>
              </select>
              <div className="absolute right-0 bottom-4 pointer-events-none text-stone-300">
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="relative group">
              <textarea 
                rows={4} 
                placeholder="Details of your residence (e.g., Sq Ft, Frequency)"
                className="w-full bg-transparent border-b border-stone-200 py-4 outline-none focus:border-stone-900 transition-colors font-light text-sm placeholder:text-stone-300 resize-none"
              />
            </div>

            <button className="w-full py-5 bg-stone-900 text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-stone-700 transition-all flex items-center justify-center gap-4 group">
              Send Inquiry
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}