"use client";

import { useCallback, useState } from "react";

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
  standard: {
    low: 0.12,
    mid: 0.15,
    high: 0.18,
    label: "Standard cleaning",
    sqftPerHour: 400,
  },
  deep: {
    low: 0.22,
    mid: 0.26,
    high: 0.3,
    label: "Deep cleaning",
    sqftPerHour: 250,
  },
  moveinout: {
    low: 0.18,
    mid: 0.23,
    high: 0.3,
    label: "Move-in / Move-out",
    sqftPerHour: 250,
  },
  commercial: {
    low: 0.05,
    mid: 0.1,
    high: 0.15,
    label: "Commercial cleaning",
    sqftPerHour: 500,
  },
  postconstruction: {
    low: 0.25,
    mid: 0.38,
    high: 0.5,
    label: "Post-construction",
    sqftPerHour: 200,
  },
};

const JOB_TYPES: { id: JobType; index: string; name: string; sub: string }[] = [
  { id: "standard", index: "01", name: "Standard", sub: "$0.12–0.18 / sqft" },
  { id: "deep", index: "02", name: "Deep Clean", sub: "$0.22–0.30 / sqft" },
  { id: "moveinout", index: "03", name: "Move-In / Out", sub: "$0.18–0.30 / sqft" },
  { id: "commercial", index: "04", name: "Commercial", sub: "$0.05–0.15 / sqft" },
  { id: "postconstruction", index: "05", name: "Post-Construction", sub: "$0.25–0.50 / sqft" },
];

const ADD_ONS: AddOn[] = [
  { id: "fridge", name: "Inside fridge", display: "+$30", price: 30 },
  { id: "oven", name: "Inside oven", display: "+$40", price: 40 },
  { id: "pethair", name: "Pet hair", display: "+$35", price: 35 },
  { id: "heavydirt", name: "Heavy dirt / neglect", display: "+$60", price: 60 },
  { id: "rush", name: "Same-day rush", display: "+35%", price: 0, isPercent: true, pct: 0.35 },
  { id: "windows", name: "Interior windows", display: "+$25", price: 25 },
];

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-stone-400">
      {children}
    </p>
  );
}

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="border border-stone-200 bg-white px-4 py-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-sm font-light text-stone-500">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-zinc-950">
          {display}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none bg-stone-200 accent-green-900"
      />
    </div>
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

  const baseLow = sqft * r.low;
  const baseMid = sqft * r.mid;
  const baseHigh = sqft * r.high;

  const totalLow = (baseLow + addonFlat) * (1 + rushPct);
  const totalMid = (baseMid + addonFlat) * (1 + rushPct);
  const totalHigh = (baseHigh + addonFlat) * (1 + rushPct);

  const hoursEst = sqft / r.sqftPerHour;
  const effectiveHourly = totalMid / hoursEst;
  const isHealthy = effectiveHourly >= 40;

  const wallTime = hoursEst / cleaners;

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

  return (
    <div className="bg-[#FCFAF8]">
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_380px] lg:p-10">
        <div className="space-y-8">
          {/* <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-green-900">
              Boston | Massachusetts
            </p>

            <h3 className="font-serif text-3xl leading-tight tracking-tight text-zinc-950 sm:text-4xl">
              Estimate Your Cleaning Cost
            </h3>

            <p className="mt-4 max-w-2xl text-sm font-light leading-7 text-stone-500 sm:text-base">
              Select a service type, adjust the property size, add any special
              requests, and receive a polished estimate range instantly.
            </p>
          </div> */}

          <div>
            <SectionLabel>Service Type</SectionLabel>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {JOB_TYPES.map((jt) => {
                const active = jobType === jt.id;

                return (
                  <button
                    key={jt.id}
                    type="button"
                    onClick={() => setJobType(jt.id)}
                    className={`group border p-4 text-left transition-all duration-300 ${
                      active
                        ? "border-green-900 bg-white shadow-[0_18px_45px_rgba(20,83,45,0.12)]"
                        : "border-stone-200 bg-white/70 hover:border-zinc-900 hover:bg-white"
                    }`}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                          active ? "text-green-900" : "text-stone-300"
                        }`}
                      >
                        {jt.index}
                      </span>

                      <span
                        className={`h-px w-8 transition-all duration-300 ${
                          active
                            ? "bg-green-900"
                            : "bg-stone-200 group-hover:bg-zinc-900"
                        }`}
                      />
                    </div>

                    <span
                      className={`block text-sm font-semibold ${
                        active ? "text-green-950" : "text-zinc-900"
                      }`}
                    >
                      {jt.name}
                    </span>

                    <span className="mt-1 block text-xs font-light text-stone-400">
                      {jt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <SectionLabel>Square Footage</SectionLabel>

              <SliderRow
                label="Property size"
                min={300}
                max={5000}
                step={50}
                value={sqft}
                display={`${sqft.toLocaleString()} sq ft`}
                onChange={setSqft}
              />
            </div>

            <div>
              <SectionLabel>Crew Size</SectionLabel>

              <SliderRow
                label="Number of cleaners"
                min={1}
                max={4}
                step={1}
                value={cleaners}
                display={`${cleaners} ${cleaners === 1 ? "cleaner" : "cleaners"}`}
                onChange={setCleaners}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Add-On Details</SectionLabel>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ADD_ONS.map((addon) => {
                const active = activeAddons.has(addon.id);

                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-center justify-between gap-4 border p-4 text-left transition-all duration-300 ${
                      active
                        ? "border-blue-900 bg-white shadow-[0_14px_35px_rgba(30,58,138,0.1)]"
                        : "border-stone-200 bg-white/70 hover:border-zinc-900 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        active ? "text-blue-950" : "text-zinc-700"
                      }`}
                    >
                      {addon.name}
                    </span>

                    <span
                      className={`shrink-0 text-xs font-bold ${
                        active ? "text-blue-900" : "text-stone-400"
                      }`}
                    >
                      {addon.display}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6">
          <div className="border border-stone-200 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:p-6">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.32em] text-stone-400">
              Quote Summary
            </p>

            <div className="mb-5 border border-stone-200">
              {[
                { label: "Low", value: fmt(totalLow), note: "Starting range" },
                { label: "Recommended", value: fmt(totalMid), note: "Best quote" },
                { label: "High", value: fmt(totalHigh), note: "Premium range" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between border-b border-stone-100 p-4 last:border-b-0 ${
                    index === 1 ? "bg-green-900 text-white" : "bg-white"
                  }`}
                >
                  <div>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-[0.24em] ${
                        index === 1 ? "text-green-100" : "text-stone-400"
                      }`}
                    >
                      {item.label}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        index === 1 ? "text-green-100/80" : "text-stone-400"
                      }`}
                    >
                      {item.note}
                    </p>
                  </div>

                  <p
                    className={`font-serif text-2xl tabular-nums ${
                      index === 1 ? "text-white" : "text-zinc-950"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-y border-stone-200">
              {[
                { label: "Service", value: r.label },
                {
                  label: "Base rate",
                  value: `$${r.low.toFixed(2)}–$${r.high.toFixed(2)} / sqft`,
                },
                { label: "Add-ons", value: addonsDisplay },
                { label: "Estimated time", value: timeDisplay },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-6 border-b border-stone-100 py-4 last:border-b-0"
                >
                  <span className="text-sm font-light text-stone-500">
                    {row.label}
                  </span>

                  <span className="text-right text-sm font-semibold text-zinc-950">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              className={`mt-5 flex items-start gap-3 border p-4 ${
                isHealthy
                  ? "border-green-900/20 bg-green-50"
                  : "border-amber-500/30 bg-amber-50"
              }`}
            >
              <span
                className={`mt-2 h-2 w-2 shrink-0 ${
                  isHealthy ? "bg-green-900" : "bg-amber-500"
                }`}
              />

              <p
                className={`text-sm leading-6 ${
                  isHealthy ? "text-green-950" : "text-amber-800"
                }`}
              >
                {isHealthy
                  ? `Effective rate is approximately ${fmt(
                      effectiveHourly
                    )}/hr — a healthy Boston service rate.`
                  : `Effective rate is approximately ${fmt(
                      effectiveHourly
                    )}/hr — consider raising the estimate.`}
              </p>
            </div>

            <button
              type="button"
              className="group relative mt-5 w-full overflow-hidden border border-zinc-950 bg-zinc-950 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-white hover:text-zinc-950"
            >
              Draft Quote Email →
            </button>

            <p className="mt-5 text-center text-[10px] font-medium uppercase leading-5 tracking-[0.22em] text-stone-400">
              Final pricing may vary by condition, frequency, and access.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}