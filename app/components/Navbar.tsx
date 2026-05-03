"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Expertise", href: "#expertise" },
  { label: "Services", href: "#services" },
  { label: "Standards", href: "#standards" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 lg:px-8">
        <nav
          aria-label="Main navigation"
          className={`mx-auto flex max-w-7xl items-center justify-between border px-5 py-4 transition-all duration-500 ${
            isScrolled
              ? "border-zinc-200 bg-white/90 shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
              : "border-white/40 bg-white/35 backdrop-blur-xl"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="relative flex items-center" style={{ height: "40px" }}>
              <img
                src="/images/logoSaskia.png"
                alt="Saskia Cleaning"
                className="object-contain"
                style={{
                  height: "60px",   // Make image taller
                  width: "auto",
                  maxHeight: "60px", // Prevent from exceeding this
                  maxWidth: "none",  // Let width be auto-unconstrained
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  transform: "translateY(-50%)",
                  zIndex: 1,
                  pointerEvents: "none", // Don't block clicks to the link
                }}
              />
            </div>
            <div className="leading-tight ml-18 sm:ml-24 md:ml-32 lg:ml-20">
              <p className="font-serif text-lg tracking-[-0.02em] text-zinc-900">
                Saskia
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
                Cleaning
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 transition duration-300 hover:text-zinc-950"
              >
                {link.label}
                <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-zinc-950 transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="tel:+10000000000"
              className="hidden border border-zinc-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition hover:border-zinc-950 hover:text-zinc-950 xl:block"
            >
              Call Now
            </a>

            <a
              href="#quote"
              className="group flex items-center gap-2 border border-zinc-950 bg-zinc-950 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition duration-300 hover:bg-white hover:text-zinc-950"
            >
              Request Quote
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-sidenav"
            className="grid h-11 w-11 place-items-center border border-zinc-950 bg-zinc-950 text-white transition duration-300 hover:bg-white hover:text-zinc-950 lg:hidden"
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[60] bg-zinc-950/50 backdrop-blur-sm transition-all duration-500 lg:hidden ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <aside
        id="mobile-sidenav"
        className={`fixed right-0 top-0 z-[70] h-dvh w-[88%] max-w-[440px] border-l border-zinc-200 bg-[#fbfaf8] shadow-[-40px_0_100px_rgba(0,0,0,0.22)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-6">
            <div>
              <p className="font-serif text-3xl tracking-[-0.04em] text-zinc-950">
                Saskia
              </p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.42em] text-zinc-400">
                Cleaning
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="grid h-11 w-11 place-items-center border border-zinc-300 text-zinc-950 transition duration-300 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between px-6 py-8">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between border-b border-zinc-200 py-5 text-[13px] font-bold uppercase tracking-[0.22em] text-zinc-600 transition duration-300 hover:border-zinc-950 hover:text-zinc-950"
                >
                  <span className="flex items-center">
                    <span className="mr-5 text-[10px] font-bold text-zinc-300">
                      0{index + 1}
                    </span>
                    {link.label}
                  </span>

                  <ArrowUpRight
                    size={16}
                    className="translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  />
                </a>
              ))}
            </nav>

            <div>
              <div className="mb-6 border-l border-zinc-950 pl-4">
                <p className="text-xs leading-6 text-zinc-500">
                  Premium residential and commercial cleaning delivered with
                  precision, discretion, and uncompromising standards.
                </p>
              </div>

              <div className="grid gap-3">
                <a
                  href="#quote"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition duration-300 hover:bg-transparent hover:text-zinc-950"
                >
                  Request Quote
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>

                <a
                  href="tel:+10000000000"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center border border-zinc-300 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600 transition duration-300 hover:border-zinc-950 hover:text-zinc-950"
                >
                  Call Now
                </a>
              </div>

              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-300">
                Saskia Cleaning © 2026
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}