"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Brand tokens — editorial white theme ─────────────────────────────────────
const B = {
  sky:          "#38BDF8",
  skyDark:      "#0EA5E9",
  skyLight:     "#F0F9FF",
  skyDim:       "rgba(56,189,248,0.08)",
  green:        "#4EAD3A",
  greenDark:    "#357A27",
  greenBorder:  "rgba(78,173,58,0.3)",
  bg:           "#FFFFFF",
  surface:      "#FFFFFF",
  cardMuted:    "#F8F8F8",
  border:       "#E5E7EB",
  textPrimary:  "#0F172A",
  textSecondary:"#475569",
  textMuted:    "#94A3B8",
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
    <div className="rounded-[10px] border border-neutral-200 bg-white px-4 py-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <motion.span
          key={display}
          initial={{ opacity:0, y:-4 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.15 }}
          className="font-serif text-base tabular-nums text-slate-900"
        >
          {display}
        </motion.span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-neutral-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-sky-400"
          style={{ width:`${pct}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-sky-400 bg-white shadow-sm"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}

// FIX 3: Explicit React import used here via React.ReactNode
function SL({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.42em] text-slate-400">
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
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════════════
          MOBILE STICKY PRICE BAR  (hidden on lg+)
      ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white shadow-sm lg:hidden">
        <div className="h-px w-full bg-sky-200" />

        <div className="grid grid-cols-3 border-b border-neutral-200">
          {([
            { label:"Low",         value:totalLow,  accent:false },
            { label:"Recommended", value:totalMid,  accent:true  },
            { label:"High",        value:totalHigh, accent:false },
          ] as const).map(({ label, value, accent }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-3 ${
                i < 2 ? "border-r border-neutral-200" : ""
              } ${accent ? "bg-sky-50" : "bg-white"}`}
            >
              <span
                className={`mb-0.5 text-[8px] font-bold uppercase tracking-[0.3em] ${
                  accent ? "text-sky-500" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              <AnimatedPrice
                value={value}
                className={`font-serif text-xl tabular-nums ${
                  accent ? "text-sky-600" : "text-slate-600"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="h-0.5 w-full bg-neutral-200">
          <motion.div
            className="h-0.5 bg-sky-400"
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
                    className={[
                      "relative rounded-[10px] border p-3 text-left transition-all duration-200",
                      active
                        ? "border-sky-500 bg-sky-50 shadow-sm"
                        : "border-neutral-200 bg-white hover:border-sky-200",
                    ].join(" ")}
                  >
                    {active && (
                      <motion.div
                        layoutId="svcActive"
                        className="absolute inset-0 rounded-[10px] bg-sky-50/80"
                        transition={{ type:"spring", bounce:0.2, duration:0.4 }}
                      />
                    )}
                    <span
                      className={`relative block text-[9px] font-bold uppercase tracking-[0.3em] ${
                        active ? "text-sky-500" : "text-slate-400"
                      }`}
                    >
                      {jt.index}
                    </span>
                    <span
                      className={`relative mt-2 block text-xs font-semibold leading-tight ${
                        active ? "text-slate-900" : "text-slate-900"
                      }`}
                    >
                      {jt.name}
                    </span>
                    <span
                      className={`relative mt-1 block text-[10px] font-medium ${
                        active ? "text-sky-600" : "text-slate-400"
                      }`}
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
                    className={[
                      "relative flex flex-col gap-1.5 rounded-[10px] border p-3 text-left transition-all duration-200",
                      active
                        ? "border-sky-500 bg-sky-50"
                        : "border-neutral-200 bg-[#F8F8F8] hover:border-sky-200 hover:bg-white",
                    ].join(" ")}
                  >
                    <span
                      className={`block text-[10px] font-bold uppercase tracking-[0.08em] leading-tight ${
                        active ? "text-sky-700" : "text-slate-700"
                      }`}
                    >
                      {addon.name}
                    </span>
                    <span
                      className={`block text-xs font-semibold tabular-nums ${
                        active ? "text-sky-600" : "text-slate-400"
                      }`}
                    >
                      {addon.display}
                    </span>
                    {active && (
                      <motion.span
                        initial={{ scale:0 }}
                        animate={{ scale:1 }}
                        className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500"
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
          <div className="overflow-hidden rounded-[10px] border border-neutral-200 bg-white lg:hidden">
            <div className="border-b border-neutral-200 bg-white px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Quote Summary
              </p>
            </div>

            <div>
              {quoteRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-start justify-between gap-4 px-4 py-3 ${
                    i < quoteRows.length - 1 ? "border-b border-neutral-200" : ""
                  }`}
                >
                  <span className="text-xs font-medium text-slate-500">
                    {row.label}
                  </span>
                  <span className="text-right text-xs font-semibold text-slate-900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="mx-4 mb-4 mt-2 flex items-start gap-3 rounded-[10px] p-3"
              style={{
                border:     `1px solid ${isHealthy ? B.greenBorder : "rgba(217,119,6,0.25)"}`,
                background: isHealthy ? "rgba(78,173,58,0.05)" : "rgba(245,158,11,0.05)",
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
                className="w-full rounded-[10px] bg-sky-500 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-sky-600"
              >
                Draft Quote Email →
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: sticky quote panel (desktop only) ──────── */}
        <aside className="hidden border-l border-neutral-200 bg-white lg:block">
          <div className="sticky top-0 p-6">
            <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.42em] text-slate-400">
              Quote Summary
            </p>

            <div className="mb-5 overflow-hidden rounded-[10px] border border-neutral-200 bg-white">
              {([
                { label:"Low",         value:totalLow,  accent:false, note:"Starting range" },
                { label:"Recommended", value:totalMid,  accent:true,  note:"Best quote"     },
                { label:"High",        value:totalHigh, accent:false, note:"Premium range"  },
              ] as const).map(({ label, value, accent, note }, i) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < 2 ? "border-b border-neutral-200" : ""
                  } ${accent ? "bg-sky-50" : "bg-white"}`}
                >
                  <div>
                    <p
                      className={`text-[9px] font-bold uppercase tracking-[0.28em] ${
                        accent ? "text-sky-500" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </p>
                    <p
                      className={`mt-0.5 text-[10px] ${
                        accent ? "text-sky-600" : "text-slate-400"
                      }`}
                    >
                      {note}
                    </p>
                  </div>
                  <AnimatedPrice
                    value={value}
                    className={`font-serif text-2xl tabular-nums ${
                      accent ? "text-sky-600" : "text-slate-600"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="mb-5 border-y border-neutral-200">
              {quoteRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-start justify-between gap-6 py-3 ${
                    i < quoteRows.length - 1 ? "border-b border-neutral-200" : ""
                  }`}
                >
                  <span className="text-xs font-medium text-slate-500">
                    {row.label}
                  </span>
                  <span className="text-right text-xs font-semibold text-slate-900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="mb-5 flex items-start gap-3 rounded-[10px] p-4"
              style={{
                border:     `1px solid ${isHealthy ? B.greenBorder : "rgba(217,119,6,0.25)"}`,
                background: isHealthy ? "rgba(78,173,58,0.05)" : "rgba(245,158,11,0.05)",
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
              className="w-full rounded-[10px] bg-sky-500 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-sky-600"
            >
              Draft Quote Email →
            </motion.button>

            <p className="mt-4 text-center text-[9px] font-medium uppercase leading-5 tracking-[0.22em] text-slate-400">
              Final pricing may vary by condition & access.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}