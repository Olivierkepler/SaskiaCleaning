"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Brand tokens — WHITE theme ───────────────────────────────────────────────
const B = {
  navy:         "#1B3A8C",
  navyDark:     "#122870",
  navyDeep:     "#0D1E5C",   // ← used in service card active text
  navyMid:      "#2550B8",
  navyDim:      "rgba(27,58,140,0.08)",
  navyBorder:   "rgba(27,58,140,0.18)",
  green:        "#4EAD3A",
  greenDark:    "#357A27",
  greenBorder:  "rgba(78,173,58,0.3)",
  bg:           "#FFFFFF",
  surface:      "#F8F9FC",
  border:       "#E4E8F0",
  textPrimary:  "#0F1C3F",
  textSecondary:"#4A5578",
  textMuted:    "#8B93AD",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type JobType = "standard" | "deep" | "moveinout" | "commercial" | "postconstruction";

interface RateConfig {
  low: number; mid: number; high: number;
  label: string; sqftPerHour: number;
}

interface AddOn {
  id: string; name: string; display: string; price: number;
  isPercent?: boolean; pct?: number;
}

export interface PriceSummary { low: number; mid: number; high: number; }

// ── Data ──────────────────────────────────────────────────────────────────────
const RATES: Record<JobType, RateConfig> = {
  standard:         { low:0.12, mid:0.15, high:0.18, label:"Standard cleaning",    sqftPerHour:400 },
  deep:             { low:0.22, mid:0.26, high:0.30, label:"Deep cleaning",         sqftPerHour:250 },
  moveinout:        { low:0.18, mid:0.23, high:0.30, label:"Move-in / Move-out",    sqftPerHour:250 },
  commercial:       { low:0.05, mid:0.10, high:0.15, label:"Commercial cleaning",   sqftPerHour:500 },
  postconstruction: { low:0.25, mid:0.38, high:0.50, label:"Post-construction",     sqftPerHour:200 },
};

const JOB_TYPES: { id: JobType; index: string; name: string; sub: string }[] = [
  { id:"standard",         index:"01", name:"Standard",          sub:"$0.12–0.18 / sqft" },
  { id:"deep",             index:"02", name:"Deep Clean",         sub:"$0.22–0.30 / sqft" },
  { id:"moveinout",        index:"03", name:"Move-In / Out",      sub:"$0.18–0.30 / sqft" },
  { id:"commercial",       index:"04", name:"Commercial",         sub:"$0.05–0.15 / sqft" },
  { id:"postconstruction", index:"05", name:"Post-Construction",  sub:"$0.25–0.50 / sqft" },
];

const ADD_ONS: AddOn[] = [
  { id:"fridge",    name:"Inside fridge",       display:"+$30",  price:30 },
  { id:"oven",      name:"Inside oven",          display:"+$40",  price:40 },
  { id:"pethair",   name:"Pet hair",             display:"+$35",  price:35 },
  { id:"heavydirt", name:"Heavy dirt / neglect", display:"+$60",  price:60 },
  { id:"rush",      name:"Same-day rush",        display:"+35%",  price:0, isPercent:true, pct:0.35 },
  { id:"windows",   name:"Interior windows",     display:"+$25",  price:25 },
];

const fmt = (n: number): string => "$" + Math.round(n).toLocaleString("en-US");

// ── Sub-components ────────────────────────────────────────────────────────────

// FIX 1: Added `style` prop so call-sites that pass style={{ color:… }} don't error
interface AnimatedPriceProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}
function AnimatedPrice({ value, className, style }: AnimatedPriceProps) {
  const d = fmt(value);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={d}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={className}
        style={style}
      >
        {d}
      </motion.span>
    </AnimatePresence>
  );
}

function SliderRow({
  label, min, max, step, value, display, onChange,
}: {
  label: string; min: number; max: number; step: number;
  value: number; display: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div
      className="px-4 py-4"
      style={{ border:`1px solid ${B.border}`, background:B.bg, borderRadius:2 }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-xs font-light" style={{ color:B.textSecondary }}>{label}</span>
        {/* FIX 2: motion.span key change triggers animation on display change */}
        <motion.span
          key={display}
          initial={{ opacity:0, y:-4 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.15 }}
          className="font-serif text-base tabular-nums"
          style={{ color:B.textPrimary }}
        >
          {display}
        </motion.span>
      </div>
      <div
        className="relative h-1.5 w-full rounded-full"
        style={{ background:B.border }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${B.navy}, ${B.green})` }}
        />
        {/* Transparent range input sits on top for interaction */}
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {/* Custom thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: B.bg,
            borderColor: B.green,
            boxShadow: `0 1px 6px rgba(78,173,58,0.3)`,
          }}
        />
      </div>
    </div>
  );
}

// FIX 3: Explicit React import used here via React.ReactNode
function SL({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-3 text-[9px] font-bold uppercase tracking-[0.42em]"
      style={{ color:B.textMuted }}
    >
      {children}
    </p>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface CleaningPriceCalculatorProps {
  onPriceChange?: (prices: PriceSummary) => void;
}

export default function CleaningPriceCalculator({ onPriceChange }: CleaningPriceCalculatorProps) {
  const [jobType,      setJobType]      = useState<JobType>("standard");
  const [sqft,         setSqft]         = useState(1200);
  const [cleaners,     setCleaners]     = useState(1);
  const [activeAddons, setActiveAddons] = useState<Set<string>>(new Set());

  const toggleAddon = useCallback((id: string) => {
    setActiveAddons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const r = RATES[jobType];

  let addonFlat = 0;
  let rushPct   = 0;
  ADD_ONS.forEach(a => {
    if (!activeAddons.has(a.id)) return;
    if (a.isPercent && a.pct != null) rushPct  += a.pct;
    else                              addonFlat += a.price;
  });

  const totalLow  = (sqft * r.low  + addonFlat) * (1 + rushPct);
  const totalMid  = (sqft * r.mid  + addonFlat) * (1 + rushPct);
  const totalHigh = (sqft * r.high + addonFlat) * (1 + rushPct);

  // FIX 4: stable callback ref avoids infinite re-render loop
  // (parent must wrap onPriceChange in useCallback — already done in CostEstimationModal)
  useEffect(() => {
    onPriceChange?.({ low: totalLow, mid: totalMid, high: totalHigh });
  }, [totalLow, totalMid, totalHigh, onPriceChange]);

  const hoursEst        = sqft / r.sqftPerHour;
  const effectiveHourly = totalMid / hoursEst;
  const isHealthy       = effectiveHourly >= 40;
  const wallTime        = hoursEst / cleaners;

  const timeDisplay =
    cleaners > 1
      ? `${wallTime.toFixed(1)} hrs · ${cleaners} cleaners`
      : hoursEst < 1
      ? `${Math.round(hoursEst * 60)} min`
      : `${hoursEst.toFixed(1)} hrs`;

  const addonsDisplay =
    addonFlat > 0
      ? `${fmt(addonFlat)}${rushPct > 0 ? " + 35% rush" : ""}`
      : rushPct > 0
      ? "+35% rush"
      : "None";

  const quoteRows = [
    { label:"Service",   value: r.label },
    { label:"Base rate", value: `$${r.low.toFixed(2)}–$${r.high.toFixed(2)} / sqft` },
    { label:"Add-ons",   value: addonsDisplay },
    { label:"Est. time", value: timeDisplay },
  ];

  return (
    <div style={{ background:B.surface }}>

      {/* ══════════════════════════════════════════════════════════
          MOBILE STICKY PRICE BAR  (hidden on lg+)
      ══════════════════════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-30 lg:hidden"
        style={{
          background: B.bg,
          borderBottom: `1px solid ${B.border}`,
          boxShadow: "0 2px 12px rgba(27,58,140,0.08)",
        }}
      >
        {/* Top gradient stripe */}
        <div
          className="h-0.5 w-full"
          style={{ background:`linear-gradient(90deg, ${B.navy}, ${B.green})` }}
        />

        {/* Three price columns */}
        <div className="grid grid-cols-3" style={{ borderBottom:`1px solid ${B.border}` }}>
          {([
            { label:"Low",         value:totalLow,  accent:false },
            { label:"Recommended", value:totalMid,  accent:true  },
            { label:"High",        value:totalHigh, accent:false },
          ] as const).map(({ label, value, accent }, i) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-3"
              style={{
                borderRight: i < 2 ? `1px solid ${B.border}` : "none",
                background:  accent ? B.navyDim : "transparent",
              }}
            >
              <span
                className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.3em]"
                style={{ color: accent ? B.navy : B.textMuted }}
              >
                {label}
              </span>
              <AnimatedPrice
                value={value}
                className="font-serif text-xl tabular-nums"
                style={{ color: accent ? B.navy : B.textSecondary }}
              />
            </div>
          ))}
        </div>

        {/* Add-on progress bar */}
        <div className="h-0.5 w-full" style={{ background:B.border }}>
          <motion.div
            className="h-0.5"
            style={{ background:`linear-gradient(90deg, ${B.navy}, ${B.green})` }}
            animate={{ width:`${Math.min(100, (activeAddons.size / ADD_ONS.length) * 100)}%` }}
            transition={{ duration:0.4 }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_360px]">

        {/* ── LEFT: options ──────────────────────────────────── */}
        <div className="space-y-7 p-4 sm:p-6 lg:p-8">

          {/* Service Type */}
          <div>
            <SL>Service Type</SL>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
              {JOB_TYPES.map((jt) => {
                const active = jobType === jt.id;
                return (
                  <motion.button
                    key={jt.id}
                    type="button"
                    onClick={() => setJobType(jt.id)}
                    whileTap={{ scale:0.97 }}
                    className="relative p-3 text-left transition-all duration-200"
                    style={{
                      border:     `1px solid ${active ? B.green : B.border}`,
                      background: B.bg,
                      boxShadow:  active
                        ? `0 0 0 1px ${B.green}, 0 4px 20px rgba(78,173,58,0.12)`
                        : "none",
                      borderRadius: 2,
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="svcActive"
                        className="absolute inset-0"
                        style={{ background:`linear-gradient(135deg, rgba(78,173,58,0.05), rgba(27,58,140,0.04))` }}
                        transition={{ type:"spring", bounce:0.2, duration:0.4 }}
                      />
                    )}
                    <span
                      className="relative block text-[9px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: active ? B.green : B.textMuted }}
                    >
                      {jt.index}
                    </span>
                    <span
                      className="relative mt-2 block text-xs font-semibold leading-tight"
                      style={{ color: active ? B.navyDeep : B.textPrimary }}
                    >
                      {jt.name}
                    </span>
                    <span
                      className="relative mt-1 block text-[10px] font-light"
                      style={{ color: active ? B.green : B.textMuted }}
                    >
                      {jt.sub}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <SL>Square Footage</SL>
              <SliderRow
                label="Property size"
                min={300} max={5000} step={50}
                value={sqft}
                display={`${sqft.toLocaleString()} sq ft`}
                onChange={setSqft}
              />
            </div>
            <div>
              <SL>Crew Size</SL>
              <SliderRow
                label="Number of cleaners"
                min={1} max={4} step={1}
                value={cleaners}
                display={`${cleaners} ${cleaners === 1 ? "cleaner" : "cleaners"}`}
                onChange={setCleaners}
              />
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <SL>Add-On Details</SL>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ADD_ONS.map((addon) => {
                const active = activeAddons.has(addon.id);
                return (
                  <motion.button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    whileTap={{ scale:0.96 }}
                    className="relative flex flex-col gap-1.5 p-3 text-left transition-all duration-200"
                    style={{
                      border:     `1px solid ${active ? B.navy : B.border}`,
                      background: active ? B.navyDim : B.bg,
                      boxShadow:  active
                        ? `0 0 0 1px ${B.navy}, 0 4px 16px rgba(27,58,140,0.1)`
                        : "none",
                      borderRadius: 2,
                    }}
                  >
                    <span
                      className="block text-xs font-medium leading-tight"
                      style={{ color: active ? B.navy : B.textPrimary }}
                    >
                      {addon.name}
                    </span>
                    <span
                      className="block text-sm font-bold tabular-nums"
                      style={{ color: active ? B.navyMid : B.textMuted }}
                    >
                      {addon.display}
                    </span>
                    {active && (
                      <motion.span
                        initial={{ scale:0 }}
                        animate={{ scale:1 }}
                        className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ background:B.navy }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4L3.2 5.8L6.5 2"
                            stroke="white"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Mobile-only quote summary */}
          <div
            className="lg:hidden overflow-hidden"
            style={{ border:`1px solid ${B.border}`, background:B.bg, borderRadius:2 }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom:`1px solid ${B.border}`, background:B.surface }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-[0.4em]"
                style={{ color:B.textMuted }}
              >
                Quote Summary
              </p>
            </div>

            {/* FIX 5: replaced divide-y + borderColor style (unreliable) with explicit border-b on each row */}
            <div>
              {quoteRows.map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                  style={{
                    borderBottom: i < quoteRows.length - 1 ? `1px solid ${B.border}` : "none",
                  }}
                >
                  <span className="text-xs font-light" style={{ color:B.textSecondary }}>
                    {row.label}
                  </span>
                  <span className="text-right text-xs font-semibold" style={{ color:B.textPrimary }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Health indicator */}
            <div
              className="mx-4 mb-4 mt-2 flex items-start gap-3 p-3"
              style={{
                border:     `1px solid ${isHealthy ? B.greenBorder : "rgba(217,119,6,0.25)"}`,
                background: isHealthy ? "rgba(78,173,58,0.05)" : "rgba(245,158,11,0.05)",
                borderRadius: 2,
              }}
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: isHealthy ? B.green : "#d97706" }}
              />
              <p className="text-xs leading-5" style={{ color: isHealthy ? B.greenDark : "#92400e" }}>
                {isHealthy
                  ? `Effective rate ~${fmt(effectiveHourly)}/hr — healthy Boston rate.`
                  : `Effective rate ~${fmt(effectiveHourly)}/hr — consider raising estimate.`}
              </p>
            </div>

            {/* Mobile CTA */}
            <div className="px-4 pb-4">
              <motion.button
                type="button"
                whileHover={{ scale:1.01 }}
                whileTap={{ scale:0.98 }}
                className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
                style={{
                  background:  `linear-gradient(90deg, ${B.navyDark}, ${B.navy})`,
                  boxShadow:   `0 4px 20px rgba(27,58,140,0.25)`,
                  borderRadius: 2,
                }}
              >
                Draft Quote Email →
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: sticky quote panel (desktop only) ──────── */}
        <aside
          className="hidden lg:block"
          style={{ borderLeft:`1px solid ${B.border}`, background:B.bg }}
        >
          <div className="sticky top-0 p-6">
            <p
              className="mb-5 text-[9px] font-bold uppercase tracking-[0.42em]"
              style={{ color:B.textMuted }}
            >
              Quote Summary
            </p>

            {/* Price bands */}
            <div
              className="mb-5 overflow-hidden"
              style={{ border:`1px solid ${B.border}`, borderRadius:2 }}
            >
              {([
                { label:"Low",         value:totalLow,  accent:false, note:"Starting range" },
                { label:"Recommended", value:totalMid,  accent:true,  note:"Best quote"     },
                { label:"High",        value:totalHigh, accent:false, note:"Premium range"  },
              ] as const).map(({ label, value, accent, note }, i) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    borderBottom: i < 2 ? `1px solid ${B.border}` : "none",
                    background:   accent
                      ? `linear-gradient(90deg, ${B.navyDim}, rgba(78,173,58,0.06))`
                      : B.bg,
                  }}
                >
                  <div>
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.28em]"
                      style={{ color: accent ? B.navy : B.textMuted }}
                    >
                      {label}
                    </p>
                    <p
                      className="mt-0.5 text-[10px]"
                      style={{ color: accent ? B.navyMid : B.textMuted }}
                    >
                      {note}
                    </p>
                  </div>
                  <AnimatedPrice
                    value={value}
                    className="font-serif text-2xl tabular-nums"
                    style={{ color: accent ? B.navy : B.textSecondary }}
                  />
                </div>
              ))}
            </div>

            {/* Detail rows */}
            <div
              className="mb-5"
              style={{ borderTop:`1px solid ${B.border}`, borderBottom:`1px solid ${B.border}` }}
            >
              {quoteRows.map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-6 py-3"
                  style={{
                    borderBottom: i < quoteRows.length - 1 ? `1px solid ${B.border}` : "none",
                  }}
                >
                  <span className="text-xs font-light" style={{ color:B.textSecondary }}>
                    {row.label}
                  </span>
                  <span className="text-right text-xs font-semibold" style={{ color:B.textPrimary }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Health indicator */}
            <div
              className="mb-5 flex items-start gap-3 p-4"
              style={{
                border:     `1px solid ${isHealthy ? B.greenBorder : "rgba(217,119,6,0.25)"}`,
                background: isHealthy ? "rgba(78,173,58,0.05)" : "rgba(245,158,11,0.05)",
                borderRadius: 2,
              }}
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0"
                style={{ background: isHealthy ? B.green : "#d97706" }}
              />
              <p className="text-xs leading-6" style={{ color: isHealthy ? B.greenDark : "#92400e" }}>
                {isHealthy
                  ? `Effective rate ~${fmt(effectiveHourly)}/hr — a healthy Boston service rate.`
                  : `Effective rate ~${fmt(effectiveHourly)}/hr — consider raising the estimate.`}
              </p>
            </div>

            {/* CTA */}
            <motion.button
              type="button"
              whileHover={{ scale:1.01 }}
              whileTap={{ scale:0.98 }}
              className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
              style={{
                background:  `linear-gradient(90deg, ${B.navyDark}, ${B.navy})`,
                boxShadow:   `0 4px 24px rgba(27,58,140,0.25)`,
                borderRadius: 2,
              }}
            >
              Draft Quote Email →
            </motion.button>

            <p
              className="mt-4 text-center text-[9px] font-medium uppercase leading-5 tracking-[0.22em]"
              style={{ color:B.textMuted }}
            >
              Final pricing may vary by condition & access.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}