"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Expertise", href: "#expertise" },
  { label: "Services", href: "#services" },
  { label: "Standards", href: "#standards" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({
  hideNavbar = false,
}: {
  hideNavbar?: boolean;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (hideNavbar) setIsOpen(false);
  }, [hideNavbar]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsInfoOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <header
        data-native-cursor
        className={`
          fixed inset-x-0 top-0 z-50
          px-3 pt-3 sm:px-5 lg:px-8
          transition-all duration-300
          ${
            hideNavbar
              ? "pointer-events-none invisible -translate-y-4 opacity-0"
              : "visible translate-y-0 opacity-100"
          }
        `}
      >
        <nav
          aria-label="Main navigation"
          className={`mx-auto flex max-w-7xl items-center justify-between px-6 py-5 transition-all duration-500 ${
            isScrolled
              ? "rounded-2xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
              : "bg-transparent"
          }`}
        >
          <a href="#" className="flex items-center gap-4">
            <div
              className="relative flex items-center"
              style={{ height: "42px", width: "92px" }}
            >
              <img
                src={isScrolled ? "/images/logoSaskia.png" : "/images/whitelogo.png"}
                alt="Saskia Cleaning"
                className="object-contain transition-all duration-300"
                style={{
                  height: "62px",
                  width: "auto",
                  maxHeight: "62px",
                  maxWidth: "none",
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  transform: "translateY(-50%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
            </div>

            <div className="leading-none">
              <p
                className={`font-[family-name:var(--font-cormorant)] text-[1.65rem] font-semibold tracking-[-0.04em] transition-colors duration-300 ${
                  isScrolled ? "text-sky-500" : "text-white"
                }`}
              >
                Saskia
              </p>

              <p
                className={`mt-1 text-[0.62rem] font-medium uppercase tracking-[0.38em] transition-colors duration-300 ${
                  isScrolled ? "text-slate-500" : "text-white/70"
                }`}
              >
                Cleaning
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`group cursor-pointer relative text-[11px] font-semibold uppercase tracking-[0.16em] transition duration-300 ${
                  isScrolled
                    ? "text-sky-500 hover:text-sky-500"
                    : "text-white hover:text-white/80"
                }`}
              >
                {link.label}

                <span
                  className={`absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                    isScrolled ? "bg-slate-950" : "bg-white"
                  }`}
                />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <button
                type="button"
                aria-label="More information"
                aria-expanded={isInfoOpen}
                aria-controls="info-popover-desktop"
                onClick={() => setIsInfoOpen((open) => !open)}
                className={`rounded-full border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] transition ${
                  isScrolled
                    ? "border-slate-200 text-slate-600 hover:border-slate-950 hover:text-slate-950"
                    : "border-white/40 text-white hover:border-white hover:bg-white hover:text-slate-950"
                }`}
              >
                Info
              </button>

              {isInfoOpen && (
                <div
                  id="info-popover-desktop"
                  role="status"
                  className="absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600 shadow-lg"
                >
                  More information coming soon.
                </div>
              )}
            </div>

            <a
              href="tel:+18573528554"
              className={`hidden rounded-full border px-6 py-3 text-[11px] font-medium uppercase tracking-[0.14em] transition xl:block ${
                isScrolled
                  ? "border-slate-200 text-slate-600 hover:border-slate-950 hover:text-slate-950"
                  : "border-white/40 text-white hover:border-white hover:bg-white hover:text-slate-950"
              }`}
            >
              Call Now
            </a>

            <a
              href="#quote"
              className={`group cursor-pointer flex items-center gap-2 rounded-full border px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-300 ${
                isScrolled
                  ? "border-sky-500 bg-sky-500 text-white hover:bg-white hover:text-sky-500"
                  : "border-white bg-white text-slate-950 hover:bg-transparent hover:text-white"
              }`}
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
            className={`grid cursor-pointer h-11 w-11 place-items-center rounded-full border transition duration-300 lg:hidden ${
              isScrolled
                ? "border-sky-500 bg-sky-500 text-white hover:bg-white hover:text-sky-500"
                : "border-white bg-white text-slate-950 hover:bg-transparent hover:text-white"
            }`}
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      {!hideNavbar && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm transition-all duration-500 lg:hidden ${
              isOpen ? "visible opacity-100" : "invisible opacity-0"
            }`}
          />

          <aside
            id="mobile-sidenav"
            className={`fixed right-0 top-0 z-[70] h-dvh w-[88%] max-w-[440px] bg-white shadow-[-40px_0_100px_rgba(0,0,0,0.18)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-hidden={!isOpen}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
                <div>
                  <p className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                    Saskia
                  </p>

                  <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.4em] text-slate-400">
                    Cleaning
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close navigation menu"
                  className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-950 transition duration-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white"
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
                      className="group flex items-center justify-between border-b border-slate-100 py-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-600 transition duration-300 hover:border-slate-950 hover:text-slate-950"
                    >
                      <span className="flex items-center">
                        <span className="mr-5 text-[10px] font-semibold text-slate-300">
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
                  <div className="mb-6 border-l border-slate-950 pl-4">
                    <p className="text-sm leading-6 text-slate-500">
                      Premium residential and commercial cleaning delivered with
                      care, consistency, and uncompromising attention to detail.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <button
                      type="button"
                      aria-label="More information"
                      aria-expanded={isInfoOpen}
                      aria-controls="info-popover-mobile"
                      onClick={() => setIsInfoOpen((open) => !open)}
                      className="flex items-center justify-center rounded-full border border-slate-200 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 transition duration-300 hover:border-slate-950 hover:text-slate-950"
                    >
                      Info
                    </button>

                    {isInfoOpen && (
                      <p
                        id="info-popover-mobile"
                        role="status"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
                      >
                        More information coming soon.
                      </p>
                    )}

                    <a
                      href="#quote"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition duration-300 hover:bg-transparent hover:text-slate-950"
                    >
                      Request Quote
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>

                    <a
                      href="tel:+18573528554"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center rounded-full border border-slate-200 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 transition duration-300 hover:border-slate-950 hover:text-slate-950"
                    >
                      Call Now
                    </a>
                  </div>

                  <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.28em] text-slate-300">
                    Saskia Cleaning © 2026
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}