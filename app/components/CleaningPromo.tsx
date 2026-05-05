"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type JobType =
  | "standard"
  | "deep"
  | "moveinout"
  | "commercial"
  | "postconstruction";

interface RateConfig {
  low: number;
  mid: number;
  high: number;
  label: string;
  sqftPerHour: number;
}

interface AddOn {
  id: string;
  name: string;
  display: string;
  price: number;
  isPercent?: boolean;
  pct?: number;
}

const RATES: Record<JobType, RateConfig> = {
  standard: { low: 0.12, mid: 0.15, high: 0.18, label: "Standard cleaning", sqftPerHour: 400 },
  deep: { low: 0.22, mid: 0.26, high: 0.3, label: "Deep cleaning", sqftPerHour: 250 },
  moveinout: { low: 0.18, mid: 0.23, high: 0.3, label: "Move-in / Move-out", sqftPerHour: 250 },
  commercial: { low: 0.05, mid: 0.1, high: 0.15, label: "Commercial cleaning", sqftPerHour: 500 },
  postconstruction: { low: 0.25, mid: 0.38, high: 0.5, label: "Post-construction", sqftPerHour: 200 },
};

const JOB_TYPES: { id: JobType; index: string; name: string; sub: string }[] = [
  { id: "standard",        index: "01", name: "Standard",         sub: "$0.12–0.18 / sqft" },
  { id: "deep",            index: "02", name: "Deep Clean",        sub: "$0.22–0.30 / sqft" },
  { id: "moveinout",       index: "03", name: "Move-In / Out",     sub: "$0.18–0.30 / sqft" },
  { id: "commercial",      index: "04", name: "Commercial",        sub: "$0.05–0.15 / sqft" },
  { id: "postconstruction",index: "05", name: "Post-Construction", sub: "$0.25–0.50 / sqft" },
];

const ADD_ONS: AddOn[] = [
  { id: "fridge",    name: "Inside fridge",        display: "+$30",  price: 30 },
  { id: "oven",      name: "Inside oven",           display: "+$40",  price: 40 },
  { id: "pethair",   name: "Pet hair",              display: "+$35",  price: 35 },
  { id: "heavydirt", name: "Heavy dirt / neglect",  display: "+$60",  price: 60 },
  { id: "rush",      name: "Same-day rush",         display: "+35%",  price: 0, isPercent: true, pct: 0.35 },
  { id: "windows",   name: "Interior windows",      display: "+$25",  price: 25 },
];

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── Dark themed section label ──────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.42em] text-stone-500">
      {children}
    </p>
  );
}

// ── Dark slider ────────────────────────────────────────────────────────────
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
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-xs font-light text-stone-400">{label}</span>
        <motion.span
          key={display}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-base tabular-nums text-white"
        >
          {display}
        </motion.span>
      </div>

      <div className="relative h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-green-600"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {/* Thumb indicator */}
        <div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-green-500 bg-[#111]"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
    </div>
  );
}

// ── Animated price number ──────────────────────────────────────────────────
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const display = fmt(value);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={display}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={className}
      >
        {display}
      </motion.span>
    </AnimatePresence>
  );
}

export default function CleaningPriceCalculator() {
  const [jobType, setJobType] = useState<JobType>("standard");
  const [sqft, setSqft] = useState(1200);
  const [cleaners, setCleaners] = useState(1);
  const [activeAddons, setActiveAddons] = useState<Set<string>>(new Set());

  const toggleAddon = useCallback((id: string) => {
    setActiveAddons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const r = RATES[jobType];

  let addonFlat = 0;
  let rushPct = 0;

  ADD_ONS.forEach((addon) => {
    if (!activeAddons.has(addon.id)) return;
    if (addon.isPercent && addon.pct) rushPct += addon.pct;
    else addonFlat += addon.price;
  });

  const baseLow  = sqft * r.low;
  const baseMid  = sqft * r.mid;
  const baseHigh = sqft * r.high;

  const totalLow  = (baseLow  + addonFlat) * (1 + rushPct);
  const totalMid  = (baseMid  + addonFlat) * (1 + rushPct);
  const totalHigh = (baseHigh + addonFlat) * (1 + rushPct);

  const hoursEst       = sqft / r.sqftPerHour;
  const effectiveHourly = totalMid / hoursEst;
  const isHealthy      = effectiveHourly >= 40;
  const wallTime       = hoursEst / cleaners;

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

  // ── shared quote rows ──
  const quoteRows = [
    { label: "Service",      value: r.label },
    { label: "Base rate",    value: `$${r.low.toFixed(2)}–$${r.high.toFixed(2)} / sqft` },
    { label: "Add-ons",      value: addonsDisplay },
    { label: "Est. time",    value: timeDisplay },
  ];

  return (
    <div className="relative" style={{ background: "transparent" }}>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE STICKY PRICE BAR  (hidden on lg+)
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-30 lg:hidden"
        style={{
          background: "linear-gradient(180deg,#0a0a0a 0%,rgba(10,10,10,0.97) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Three-column price strip */}
        <div className="grid grid-cols-3 divide-x" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            { label: "Low",         value: totalLow,  muted: true  },
            { label: "Recommended", value: totalMid,  muted: false },
            { label: "High",        value: totalHigh, muted: true  },
          ].map(({ label, value, muted }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-3"
              style={!muted ? { background: "rgba(20,83,45,0.15)" } : {}}
            >
              <span
                className="mb-0.5 text-[8px] font-bold uppercase tracking-[0.3em]"
                style={{ color: muted ? "rgba(255,255,255,0.3)" : "rgba(134,239,172,0.9)" }}
              >
                {label}
              </span>
              <AnimatedPrice
                value={value}
                className={`font-serif text-xl tabular-nums ${muted ? "text-stone-400" : "text-white"}`}
              />
            </div>
          ))}
        </div>

        {/* Thin progress bar showing addon activity */}
        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.04)" }}>
          <motion.div
            className="h-px bg-green-600"
            animate={{ width: `${Math.min(100, (activeAddons.size / ADD_ONS.length) * 100)}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          MAIN GRID
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">

        {/* ── LEFT: options ─────────────────────────────────────────── */}
        <div className="space-y-7 p-4 sm:p-6 lg:p-8">

          {/* Service Type */}
          <div>
            <SectionLabel>Service Type</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
              {JOB_TYPES.map((jt) => {
                const active = jobType === jt.id;
                return (
                  <motion.button
                    key={jt.id}
                    type="button"
                    onClick={() => setJobType(jt.id)}
                    whileTap={{ scale: 0.97 }}
                    className="relative p-3 text-left transition-all duration-200"
                    style={{
                      border: `1px solid ${active ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.07)"}`,
                      background: active ? "rgba(20,83,45,0.18)" : "rgba(255,255,255,0.02)",
                      boxShadow: active ? "0 0 24px rgba(20,83,45,0.2)" : "none",
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="serviceActive"
                        className="absolute inset-0"
                        style={{ background: "rgba(20,83,45,0.1)" }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span
                      className="relative block text-[9px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: active ? "rgba(134,239,172,0.8)" : "rgba(255,255,255,0.2)" }}
                    >
                      {jt.index}
                    </span>
                    <span
                      className="relative mt-2 block text-xs font-semibold leading-tight"
                      style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)" }}
                    >
                      {jt.name}
                    </span>
                    <span
                      className="relative mt-1 block text-[10px] font-light"
                      style={{ color: active ? "rgba(134,239,172,0.6)" : "rgba(255,255,255,0.2)" }}
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
              <SectionLabel>Square Footage</SectionLabel>
              <SliderRow
                label="Property size"
                min={300} max={5000} step={50}
                value={sqft}
                display={`${sqft.toLocaleString()} sq ft`}
                onChange={setSqft}
              />
            </div>
            <div>
              <SectionLabel>Crew Size</SectionLabel>
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
            <SectionLabel>Add-On Details</SectionLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ADD_ONS.map((addon) => {
                const active = activeAddons.has(addon.id);
                return (
                  <motion.button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex flex-col gap-1.5 p-3 text-left transition-all duration-200"
                    style={{
                      border: `1px solid ${active ? "rgba(96,165,250,0.45)" : "rgba(255,255,255,0.07)"}`,
                      background: active ? "rgba(30,58,138,0.18)" : "rgba(255,255,255,0.02)",
                      boxShadow: active ? "0 0 20px rgba(30,58,138,0.2)" : "none",
                    }}
                  >
                    <span
                      className="block text-xs font-medium leading-tight"
                      style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)" }}
                    >
                      {addon.name}
                    </span>
                    <span
                      className="block text-sm font-bold tabular-nums"
                      style={{ color: active ? "rgba(147,197,253,0.9)" : "rgba(255,255,255,0.25)" }}
                    >
                      {addon.display}
                    </span>

                    {/* Active checkmark */}
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500"
                      >
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                          <path d="M1 3.5L2.8 5.3L6 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Mobile-only quote details (shown below add-ons, above CTA) */}
          <div
            className="lg:hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {quoteRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-3">
                  <span className="text-xs font-light text-stone-500">{row.label}</span>
                  <span className="text-right text-xs font-semibold text-stone-300">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Health indicator */}
            <div
              className="mx-4 mb-4 mt-1 flex items-start gap-3 px-3 py-3"
              style={{
                border: `1px solid ${isHealthy ? "rgba(20,83,45,0.4)" : "rgba(245,158,11,0.3)"}`,
                background: isHealthy ? "rgba(20,83,45,0.12)" : "rgba(245,158,11,0.08)",
              }}
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: isHealthy ? "#16a34a" : "#f59e0b" }}
              />
              <p
                className="text-xs leading-5"
                style={{ color: isHealthy ? "rgba(134,239,172,0.85)" : "rgba(252,211,77,0.85)" }}
              >
                {isHealthy
                  ? `Effective rate ~${fmt(effectiveHourly)}/hr — healthy Boston rate.`
                  : `Effective rate ~${fmt(effectiveHourly)}/hr — consider raising estimate.`}
              </p>
            </div>

            {/* Mobile CTA */}
            <div className="px-4 pb-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all"
                style={{ background: "rgba(20,83,45,0.9)", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                Draft Quote Email →
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: sticky quote panel (desktop only) ──────────────── */}
        <aside
          className="hidden lg:block"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="sticky top-0 p-6">
            <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.42em] text-stone-500">
              Quote Summary
            </p>

            {/* Price bands */}
            <div
              className="mb-5 overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[
                { label: "Low",         value: totalLow,  accent: false },
                { label: "Recommended", value: totalMid,  accent: true  },
                { label: "High",        value: totalHigh, accent: false },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: accent ? "rgba(20,83,45,0.22)" : "transparent",
                  }}
                >
                  <div>
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.28em]"
                      style={{ color: accent ? "rgba(134,239,172,0.7)" : "rgba(255,255,255,0.3)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="mt-0.5 text-[10px]"
                      style={{ color: accent ? "rgba(134,239,172,0.5)" : "rgba(255,255,255,0.2)" }}
                    >
                      {accent ? "Best quote" : label === "Low" ? "Starting range" : "Premium range"}
                    </p>
                  </div>
                  <AnimatedPrice
                    value={value}
                    className={`font-serif text-2xl tabular-nums ${accent ? "text-white" : "text-stone-500"}`}
                  />
                </div>
              ))}
            </div>

            {/* Detail rows */}
            <div
              className="mb-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {quoteRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-6 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span className="text-xs font-light text-stone-500">{row.label}</span>
                  <span className="text-right text-xs font-semibold text-stone-300">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Health indicator */}
            <div
              className="mb-5 flex items-start gap-3 p-4"
              style={{
                border: `1px solid ${isHealthy ? "rgba(20,83,45,0.4)" : "rgba(245,158,11,0.3)"}`,
                background: isHealthy ? "rgba(20,83,45,0.12)" : "rgba(245,158,11,0.08)",
              }}
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0"
                style={{ background: isHealthy ? "#16a34a" : "#f59e0b" }}
              />
              <p
                className="text-xs leading-6"
                style={{ color: isHealthy ? "rgba(134,239,172,0.85)" : "rgba(252,211,77,0.85)" }}
              >
                {isHealthy
                  ? `Effective rate ~${fmt(effectiveHourly)}/hr — a healthy Boston service rate.`
                  : `Effective rate ~${fmt(effectiveHourly)}/hr — consider raising the estimate.`}
              </p>
            </div>

            {/* CTA */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white"
              style={{ background: "rgba(20,83,45,0.9)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              Draft Quote Email →
            </motion.button>

            <p
              className="mt-4 text-center text-[9px] font-medium uppercase leading-5 tracking-[0.22em]"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              Final pricing may vary by condition & access.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}