"use client";
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 px-8 py-6 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-zinc-100 py-4' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-serif tracking-[0.2em] text-zinc-900">Saskia Cleaning</div>
        
        <div className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-500">
          <a href="#" className="hover:text-black transition">Expertise</a>
          <a href="#" className="hover:text-black transition">Curated Services</a>
          <a href="#" className="hover:text-black transition">Inquiry</a>
        </div>

        <button className="px-8 py-2.5 bg-zinc-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-700 transition-all">
          Request Quote
        </button>
      </div>
    </nav>
  );
}