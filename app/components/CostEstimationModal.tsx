"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import CleaningServicesPricing, { type PriceSummary } from "./CleaningPriceCalculator";

// ── Brand tokens — WHITE theme ────────────────────────────────────────────────
const B = {
  navy:        "#1B3A8C",
  navyDark:    "#122870",
  navyDeep:    "#0D1E5C",
  navyMid:     "#2550B8",
  navyDim:     "rgba(27,58,140,0.07)",
  navyBorder:  "rgba(27,58,140,0.15)",
  green:       "#4EAD3A",
  greenLight:  "#6DC95A",
  greenBorder: "rgba(78,173,58,0.3)",
  bg:          "#FCFAF8",
  surface:     "#F7F8FC",
  border:      "#E4E8F0",
  borderDark:  "#C8D0E2",
  textPrimary: "#0F1C3F",
  textMuted:   "#8B93AD",
};

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── Live header price chip ─────────────────────────────────────────────────────
function HeaderPrice({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  const display = fmt(value);
  return (
    <div className="flex flex-col items-center px-3 py-2 sm:px-4"
      style={{
        borderLeft:`1px solid ${accent ? B.navyBorder : B.border}`,
        background: accent ? B.navyDim : "transparent",
        minWidth:70,
      }}>
      <span className="mb-0.5 text-[7px] font-bold uppercase tracking-[0.35em]"
        style={{ color: accent ? B.navy : B.textMuted }}>{label}</span>
      <AnimatePresence mode="wait">
        <motion.span key={display}
          initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }}
          transition={{ duration:0.16, ease:"easeOut" }}
          className="font-serif tabular-nums leading-none"
          style={{ fontSize: accent ? 17 : 14, color: accent ? B.navy : B.textMuted, fontWeight: accent ? 600 : 400 }}>
          {display}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface CostEstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CostEstimationModal({ isOpen, onClose }: CostEstimationModalProps) {
  const ref    = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const [prices, setPrices] = useState<PriceSummary>({ low:144, mid:180, high:216 });
  const handlePriceChange   = useCallback((p: PriceSummary) => setPrices(p), []);

  // Subtle cursor-aware blue tint on backdrop
  const glowBg = useTransform([mouseX, mouseY], ([x, y]) =>
    `radial-gradient(800px circle at ${(x as number)*100}% ${(y as number)*100}%, rgba(27,58,140,0.04), transparent 60%)`
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey   = (e: KeyboardEvent) => { if (e.key==="Escape") onClose(); };
    const onMouse = (e: MouseEvent)    => { mouseX.set(e.clientX/window.innerWidth); mouseY.set(e.clientY/window.innerHeight); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousemove", onMouse);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [isOpen, onClose, mouseX, mouseY]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div ref={ref} className="fixed inset-0 z-[100]"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          transition={{ duration:0.3 }}>

          {/* Backdrop — white-smoke with subtle blue tint */}
          <div className="absolute inset-0"
            style={{ background:"rgba(15,28,63,0.45)", backdropFilter:"blur(4px)" }}
            onClick={onClose} />

          {/* Cursor ambient */}
          <motion.div className="pointer-events-none absolute inset-0" style={{ background:glowBg }} />

          {/* Modal positioner */}
          <div className="absolute inset-0 flex items-stretch sm:items-center sm:justify-center sm:p-4 lg:p-6">
            <motion.div
              initial={{ opacity:0, y:28, scale:0.98 }}
              animate={{ opacity:1, y:0,  scale:1    }}
              exit={{    opacity:0, y:28, scale:0.98 }}
              transition={{ duration:0.4, ease:[0.19,1,0.22,1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full flex-col overflow-hidden sm:max-h-[94vh] sm:max-w-5xl lg:max-w-6xl"
              style={{
                background: B.bg,
                boxShadow:`
                  0 0 0 1px ${B.border},
                  0 40px 100px rgba(15,28,63,0.18),
                  0 8px 32px rgba(15,28,63,0.1)
                `,
              }}>

              {/* Top navy accent stripe */}
              <div className="absolute inset-x-0 top-0 h-0.5"
                style={{ background:`linear-gradient(90deg, ${B.navy}, ${B.green}, ${B.navy})` }} />

              {/* Corner ornaments */}
              {(["top-left","top-right","bottom-left","bottom-right"] as const).map(p => (
                <CornerOrnament key={p} position={p} />
              ))}

              {/* ══════════════════════════════════════════
                  HEADER
              ══════════════════════════════════════════ */}
              <div className="relative z-20 flex-shrink-0"
                style={{ borderBottom:`1px solid ${B.border}`, background:B.bg }}>

                {/* Row 1: brand + live prices + close */}
                <div className="flex items-center justify-between px-4 py-3 sm:px-6">

                  {/* Brand */}
                  <div className="flex items-center gap-3">
                    {/* Brand Image */}
                    <img
                      src="/images/logoSaskia.png"
                      alt="Saskia Cleaning Logo"
                      className="h-14 w-14  object-cover "
                    
                    />
              


                    {/* House icon */}
                    {/* <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center sm:h-10 sm:w-10"
                      style={{
                        background:`linear-gradient(135deg, ${B.navy}, ${B.navyDeep})`,
                        boxShadow:`0 2px 12px rgba(27,58,140,0.2)`,
                      }}>
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                        <path d="M2 8L9 2L16 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="4" y="8" width="10" height="8" rx="0.5" stroke="white" strokeWidth="1.2"/>
                        <rect x="7.5" y="12" width="3" height="4" rx="0.3" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
                        <circle cx="4" cy="5" r="0.8" fill={B.greenLight} opacity="0.9"/>
                        <circle cx="2.5" cy="7.5" r="0.5" fill={B.greenLight} opacity="0.6"/>
                      </svg>
                    </div> */}

                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.5em]"
                        style={{ color:B.green }}>
                        Saskia
                        <span className="ml-2 font-normal" style={{ color:B.textMuted }}>· Boston, MA</span>
                      </p>
                      <h2 className="mt-0.5 font-serif text-lg tracking-tight sm:text-xl"
                        style={{ color:B.textPrimary }}>
                        Cost Estimation
                      </h2>
                    </div>
                  </div>

                  {/* ── Live price chips ── */}
                  {/* <div className="flex items-stretch overflow-hidden"
                    style={{ border:`1px solid ${B.border}` }}>
                    <HeaderPrice label="Low"  value={prices.low}  />
                    <HeaderPrice label="Mid"  value={prices.mid}  accent />
                    <HeaderPrice label="High" value={prices.high} />
                  </div> */}

                  {/* Live dot + close */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative hidden h-2 w-2 flex-shrink-0 items-center justify-center sm:flex">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full"
                        style={{ background:`${B.green}55` }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background:B.green }} />
                    </div>

                    <motion.button type="button" onClick={onClose} aria-label="Close modal"
                      whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                      className="group relative grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden"
                      style={{ border:`1px solid ${B.border}`, background:B.surface }}>
                      <motion.div className="absolute inset-0"
                        style={{ background:"rgba(200,30,30,0.08)" }}
                        initial={{ opacity:0 }} whileHover={{ opacity:1 }}
                        transition={{ duration:0.18 }} />
                      <span className="relative z-10 text-xs font-light transition-colors group-hover:text-red-600"
                        style={{ color:B.textMuted }}>✕</span>
                    </motion.button>
                  </div>
                </div>

                {/* Row 2: step breadcrumb */}
                <div className="hidden items-center gap-2 px-6 pb-3 sm:flex"
                  style={{ borderTop:`1px solid ${B.border}` }}>
                  {["Select Service"].map((step, i) => (
                    <div key={step} className="flex items-center gap-2 pt-2.5">
                      <div className="flex h-5 items-center gap-1.5 px-2 text-[9px] font-semibold uppercase tracking-[0.2em]"
                        style={{
                          border:`1px solid ${i===0 ? B.greenBorder : B.border}`,
                          background: i===0 ? "rgba(78,173,58,0.07)" : "transparent",
                          color: i===0 ? B.green : B.textMuted,
                        }}>
                        <span style={{ fontSize:8, color: i===0 ? B.green : B.textMuted }}>
                          {String(i+1).padStart(2,"0")}
                        </span>
                        {step}
                      </div>
                      {i < 2 && <span className="text-[8px]" style={{ color:B.textMuted }}>›</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Scrollable body ── */}
              <div className="relative min-h-0 flex-1 overflow-y-auto"
                style={{ scrollbarWidth:"thin", scrollbarColor:`${B.borderDark} transparent`, background:B.surface }}>
                <div className="relative">
                  <CleaningServicesPricing onPriceChange={handlePriceChange} />
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="relative flex-shrink-0 px-4 py-2.5 sm:px-6"
                style={{ borderTop:`1px solid ${B.border}`, background:B.bg }}>
                <div className="flex items-center justify-between">
                  <p className="text-[8px] uppercase tracking-[0.35em]" style={{ color:B.textMuted }}>
                    All estimates are non-binding
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-6" style={{ background:B.border }} />
                    <p className="text-[8px] uppercase tracking-[0.35em]" style={{ color:B.textMuted }}>
                      Licensed & insured
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom navy sweep */}
              <div className="absolute inset-x-0 bottom-0 h-0.5"
                style={{ background:`linear-gradient(90deg, transparent, ${B.navy}44, transparent)` }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Corner ornament ──────────────────────────────────────────────────────────
function CornerOrnament({ position }: {
  position: "top-left"|"top-right"|"bottom-left"|"bottom-right";
}) {
  const isRight  = position.includes("right");
  const isBottom = position.includes("bottom");
  const transform = [isRight ? "scaleX(-1)" : "", isBottom ? "scaleY(-1)" : ""]
    .filter(Boolean).join(" ") || undefined;
  return (
    <div className="pointer-events-none absolute z-10"
      style={{ top:isBottom?undefined:0, bottom:isBottom?0:undefined,
        left:isRight?undefined:0, right:isRight?0:undefined, transform }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M0 0 L12 0" stroke={`rgba(27,58,140,0.2)`} strokeWidth="1.5" />
        <path d="M0 0 L0 12" stroke={`rgba(27,58,140,0.2)`} strokeWidth="1.5" />
        <circle cx="0" cy="0" r="2" fill={`rgba(78,173,58,0.35)`} />
      </svg>
    </div>
  );
}