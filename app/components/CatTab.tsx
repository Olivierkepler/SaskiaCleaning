"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MASSACHUSETTS_LOCATIONS } from "@/app/data/massachusettsLocations";
import { RHODE_ISLAND_LOCATIONS } from "@/app/data/rhodeIslandLocations";

const K = {
  blue:         "#38BDF8",
  blueHover:    "#0EA5E9",
  blueLight:    "#E0F4FE",
  blueFaint:    "#F0F8FF",
  pageBg:       "#FFFFFF",
  white:        "#FFFFFF",
  surface:      "#F8FAFC",
  border:       "#E5E7EB",
  borderLight:  "#F1F5F9",
  text:         "#0C1A2E",
  textSub:      "#374151",
  muted:        "#64748B",
  hint:         "#94A3B8",
  chipBg:       "#F1F5F9",
  chipText:     "#0369A1",
  noticeText:   "#0C4A6E",
  noticeBg:     "#E0F4FE",
  noticeBorder: "#BAE6FD",
  green:        "#15803D",
  greenBg:      "#F0FDF4",
};
const LOCATIONS = {
    MA: MASSACHUSETTS_LOCATIONS,
    RI: RHODE_ISLAND_LOCATIONS,
  } as const;

type StateKey = keyof typeof LOCATIONS;

const BED_BASE  = [90, 120, 150, 180, 210];
const BATH_VALS = [1, 1.5, 2, 2.5, 3];
const DEEP_BASE = [160, 220, 300, 400];
const DEEP_COND = [0, 40, 80];
const MO_BASE   = [180, 240, 320, 420];
const COM_BASE  = [200, 320, 480, 700];

function calc(mid: number) {
  return { low: Math.round(mid * 0.85), mid, high: Math.round(mid * 1.18) };
}

const MONTHS       = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW          = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const DOW_SHORT    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDate(d: Date) {
  return `${DOW_SHORT[d.getDay()]} ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

const SCROLL_VIEWPORT = { once: false, amount: 0.2 };

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
    transition: { duration: 0.5, ease: MOTION_EASE },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: MOTION_EASE },
  },
};

const slideLeft = {
  hidden: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.5, ease: MOTION_EASE },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: MOTION_EASE },
  },
};

const slideRight = {
  hidden: {
    opacity: 0,
    x: 50,
    transition: { duration: 0.5, ease: MOTION_EASE },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: MOTION_EASE },
  },
};

const staggerContainer = {
  hidden: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.4, ease: MOTION_EASE },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: MOTION_EASE },
  },
};

// ── Dropdown wrapper ──────────────────────────────────────────────────────────
function Dropdown({ open, children, minWidth = 260 }: { open: boolean; children: React.ReactNode; minWidth?: number }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0,
            background: K.white,
            borderTop:    `1.5px solid ${K.border}`,
            borderRight:  `1.5px solid ${K.border}`,
            borderBottom: `1.5px solid ${K.border}`,
            borderLeft:   `1.5px solid ${K.border}`,
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(14,165,233,0.1)",
            zIndex: 99999, minWidth, overflow: "hidden",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Location dropdown ─────────────────────────────────────────────────────────
function LocationDropdown({
  open, state, city, onStateChange, onCitySelect,
}: {
  open: boolean; state: StateKey; city: string;
  onStateChange: (s: StateKey) => void;
  onCitySelect: (city: string, state: StateKey) => void;
}) {
  return (
    <Dropdown open={open} minWidth={280}>
      {/* State tabs — fixed: no border shorthand + borderBottom conflict */}
      <div style={{ display: "flex", borderBottom: `1px solid ${K.borderLight}` }}>
        {(["MA", "RI"] as StateKey[]).map((s) => (
          <button
            key={s}
            onClick={() => onStateChange(s)}
            style={{
              flex: 1, padding: 10, fontSize: 11, fontWeight: 700, cursor: "pointer",
              color: state === s ? K.blue : K.muted,
              background: "none",
              borderTop:    "none",
              borderLeft:   "none",
              borderRight:  "none",
              borderBottom: `2px solid ${state === s ? K.blue : "transparent"}`,
            }}
          >
            {s === "MA" ? "Massachusetts" : "Rhode Island"}
          </button>
        ))}
      </div>

      <div
  style={{
    padding: 6,
    maxHeight: 320,
    overflowY: "auto",
    overflowX: "hidden",
  }}
>
        {LOCATIONS[state].map((loc) => {
          const active = loc.city === city;
          return (
            <div
              key={loc.city}
              onClick={() => onCitySelect(loc.city, state)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                background: active ? K.blueLight : "transparent",
                transition: "background .12s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = K.blueFaint; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <i className="ti ti-map-pin" style={{ fontSize: 16, color: active ? K.blue : K.hint }} aria-hidden="true" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: K.text }}>{loc.city}</div>
                <div style={{ fontSize: 11, color: K.hint, fontWeight: 500 }}>{loc.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Dropdown>
  );
}

// ── Calendar dropdown ─────────────────────────────────────────────────────────
function CalendarDropdown({
  open, selected, onSelect,
}: {
  open: boolean; selected: Date | null; onSelect: (d: Date) => void;
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function changeMonth(dir: number) {
    let m = month + dir, y = year;
    if (m > 11) { m = 0;  y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m); setYear(y);
  }

  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <Dropdown open={open} minWidth={300}>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button
            onClick={() => changeMonth(-1)}
            style={{
              width: 28, height: 28, borderRadius: 6,
              borderTop:    `1.5px solid ${K.border}`,
              borderRight:  `1.5px solid ${K.border}`,
              borderBottom: `1.5px solid ${K.border}`,
              borderLeft:   `1.5px solid ${K.border}`,
              background: K.white, cursor: "pointer", fontSize: 14,
              color: K.textSub, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>
          <span style={{ fontSize: 14, fontWeight: 800, color: K.text }}>{MONTHS[month]} {year}</span>
          <button
            onClick={() => changeMonth(1)}
            style={{
              width: 28, height: 28, borderRadius: 6,
              borderTop:    `1.5px solid ${K.border}`,
              borderRight:  `1.5px solid ${K.border}`,
              borderBottom: `1.5px solid ${K.border}`,
              borderLeft:   `1.5px solid ${K.border}`,
              background: K.white, cursor: "pointer", fontSize: 14,
              color: K.textSub, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {DOW.map((d) => (
            <div key={d} style={{ fontSize: 10, fontWeight: 700, color: K.hint, textAlign: "center", padding: "4px 0", textTransform: "uppercase" }}>
              {d}
            </div>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const date    = new Date(year, month, d);
            const isPast  = date < today;
            const isSel   = selected?.toDateString() === date.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            return (
              <button
                key={d}
                disabled={isPast}
                onClick={() => onSelect(date)}
                style={{
                  width: "100%", aspectRatio: "1", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: isSel ? 700 : 600,
                  borderRadius: 6,
                  borderTop: "none", borderRight: "none",
                  borderBottom: "none", borderLeft: "none",
                  cursor: isPast ? "default" : "pointer",
                  background: isSel ? K.blue : "transparent",
                  color: isSel ? "#fff" : isPast ? "#CBD5E1" : isToday ? K.blue : K.text,
                  transition: "all .12s",
                }}
                onMouseEnter={(e) => { if (!isPast && !isSel) e.currentTarget.style.background = K.blueLight; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </Dropdown>
  );
}

// ── Search field ──────────────────────────────────────────────────────────────
function SF({
  icon, label, value, flex = 1, last = false, active = false, onClick, placeholder = false,
}: {
  icon: string; label: string; value: string; flex?: number;
  last?: boolean; active?: boolean; onClick?: () => void; placeholder?: boolean;
}) {
  return (
    <div
      data-cursor-pointer="pointer"
      onClick={onClick}
      className={[
        "relative flex w-full min-w-0 cursor-pointer items-center gap-3.5 self-stretch px-4 py-4 transition-colors duration-200",
        "sm:min-h-0 sm:h-full sm:px-6 sm:py-0",
        "max-sm:rounded-2xl max-sm:border max-sm:border-gray-200 max-sm:shadow-sm",
        last ? "" : "sm:border-r sm:border-gray-200",
        active ? "bg-sky-50" : "bg-transparent hover:bg-slate-50/80",
      ].join(" ")}
      style={{ flex }}
    >
      <i
        className={`ti ${icon} shrink-0 text-lg leading-none ${active ? "text-sky-400" : "text-slate-400"}`}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <span
          className={`block text-[11px] font-semibold uppercase tracking-[0.12em] leading-none sm:text-xs ${
            active ? "text-sky-500" : "text-slate-400"
          }`}
        >
          {label}
        </span>
        <span
          className={`block whitespace-normal text-base font-semibold leading-tight tracking-tight sm:truncate sm:text-lg ${
            placeholder ? "text-sky-400/80" : "text-sky-500"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: selected ? 1 : 1.03, y: selected ? 0 : -1 }}
      whileTap={{ scale: 0.97 }}
      className={[
        "cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold outline-none transition-colors duration-150",
        selected
          ? "border border-sky-400 bg-sky-50 text-sky-700 shadow-sm"
          : "border border-gray-200 bg-slate-100 text-slate-600 hover:border-sky-200 hover:bg-white",
      ].join(" ")}
    >
      {label}
    </motion.button>
  );
}

// ── Addon ─────────────────────────────────────────────────────────────────────
function Addon({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left outline-none transition-colors duration-150",
        selected
          ? "border border-sky-400 bg-sky-50"
          : "border border-gray-200 bg-white hover:border-sky-200 hover:bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
          selected ? "border-sky-400 bg-sky-400" : "border-gray-300 bg-white",
        ].join(" ")}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-xs font-semibold ${selected ? "text-sky-700" : "text-slate-600"}`}>
        {label}
      </span>
    </motion.button>
  );
}

// ── Price pill ────────────────────────────────────────────────────────────────
function PricePill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const display = "$" + value.toLocaleString("en-US");
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={display}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.13 }}
          className={`text-xl font-bold leading-none tracking-tight sm:text-2xl ${
            accent ? "text-sky-400" : "text-slate-900"
          }`}
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ── Checklist ─────────────────────────────────────────────────────────────────
function Checklist({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
        <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: K.textSub, fontWeight: 500, lineHeight: 1.4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: K.blue, flexShrink: 0, marginTop: 5 }} />
          {item}
        </div>
      ))}
    </div>
  );
}

// ── Notice ────────────────────────────────────────────────────────────────────
function Notice({ text }: { text: React.ReactNode }) {
  return (
    <div style={{
      background: K.noticeBg,
      borderTop:    `1.5px solid ${K.noticeBorder}`,
      borderRight:  `1.5px solid ${K.noticeBorder}`,
      borderBottom: `1.5px solid ${K.noticeBorder}`,
      borderLeft:   `1.5px solid ${K.noticeBorder}`,
      borderRadius: 10, padding: "12px 16px",
      display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <i className="ti ti-info-circle" style={{ fontSize: 16, color: K.blue, marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
      <p style={{ fontSize: 12, color: K.noticeText, fontWeight: 500, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────────
const twoCol:     React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr",     gap: 20 };
const threeCol:   React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 };
const addonsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr",     gap: 6  };
const sec:        React.CSSProperties = { fontSize: 14, fontWeight: 600, color: K.hint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 0 };
const chipsRow:   React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 };
function CollapsibleGroup({
    title,
    defaultOpen = false,
    children,
  }: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }) {
    const [open, setOpen] = useState(defaultOpen);
  
    return (
      <section className="overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left sm:p-5"
        >
          <span style={sec}>{title}</span>
  
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
          >
            <ChevronDown size={18} className="cursor-pointer text-sky-400" />
          </motion.div>
        </button>
  
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: MOTION_EASE }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }
// ── Service panels ─────────────────────────────────────────────────────────────
function StandardPanel({
    onPrice,
    frequency,
    onFrequencyChange,
  }: {
    onPrice: (p: ReturnType<typeof calc>) => void;
    frequency: string;
    onFrequencyChange: (frequency: string) => void;
  }) {
  const [bedIdx,  setBedIdx]  = useState(2);
  const [bathIdx, setBathIdx] = useState(0);
  const FREQS = [
    { label: "One-time",  discount: 0  },
    { label: "Bi-weekly", discount: 10 },
    { label: "Weekly",    discount: 15 },
    { label: "Monthly",   discount: 5  },
  ];
  const freqIdx = Math.max(
    0,
    FREQS.findIndex((item) => item.label === frequency)
  );
  const [addons,  setAddons]  = useState<Set<number>>(new Set([1]));

  const BEDS  = ["Studio","1 bed","2 bed","3 bed","4+ bed"];
  const ADDONS = [
    { label: "Inside fridge", price: 15 },
    { label: "Inside oven",   price: 20 },
    { label: "Laundry fold",  price: 25 },
    { label: "Windows",       price: 30 },
  ];

  const toggle     = useCallback((i: number) => setAddons(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }), []);
  const addonTotal = [...addons].reduce((s, i) => s + ADDONS[i].price, 0);

  useEffect(() => {
    const b = BED_BASE[bedIdx] + (BATH_VALS[bathIdx] - 1) * 18 + addonTotal;
    onPrice(calc(Math.round(b * (1 - FREQS[freqIdx].discount / 100))));
  }, [bedIdx, bathIdx, freqIdx, addonTotal, onPrice]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CollapsibleGroup title="Bedrooms" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {BEDS.map((b, i) => (
            <Chip key={b} label={b} selected={bedIdx === i} onClick={() => setBedIdx(i)} />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Bathrooms" defaultOpen>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {[1, 1.5, 2, 2.5, 3].map((b, i) => (
            <Chip key={b} label={String(b)} selected={bathIdx === i} onClick={() => setBathIdx(i)} />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Frequency">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {FREQS.map((f) => (
            <Chip key={f.label} label={f.label} selected={frequency === f.label} onClick={() => onFrequencyChange(f.label)} />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Add-ons">
        <div className="grid gap-2 sm:grid-cols-2">
          {ADDONS.map((a, i) => (
            <Addon key={a.label} label={a.label} selected={addons.has(i)} onClick={() => toggle(i)} />
          ))}
        </div>
      </CollapsibleGroup>
    </div>
  );
}

function DeepCleanPanel({ onPrice }: { onPrice: (p: ReturnType<typeof calc>) => void }) {
  const [sizeIdx, setSize]   = useState(1);
  const [condIdx, setCond]   = useState(0);
  const [addons,  setAddons] = useState<Set<number>>(new Set([0, 2]));

  const SIZES  = ["Studio","1–2 bed","3–4 bed","5+ bed"];
  const CONDS  = ["Good","Needs work","Very dirty"];
  const ADDONS = [
    { label: "Baseboards",      price: 35 },
    { label: "Inside cabinets", price: 40 },
    { label: "Wall scrub",      price: 30 },
    { label: "Carpet steam",    price: 45 },
  ];

  const toggle     = useCallback((i: number) => setAddons(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }), []);
  const addonTotal = [...addons].reduce((s, i) => s + ADDONS[i].price, 0);

  useEffect(() => onPrice(calc(DEEP_BASE[sizeIdx] + DEEP_COND[condIdx] + addonTotal)), [sizeIdx, condIdx, addonTotal]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CollapsibleGroup title="Home size" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {SIZES.map((s, i) => (
            <Chip
              key={s}
              label={s}
              selected={sizeIdx === i}
              onClick={() => setSize(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Condition" defaultOpen>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CONDS.map((c, i) => (
            <Chip
              key={c}
              label={c}
              selected={condIdx === i}
              onClick={() => setCond(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Deep clean extras">
        <div className="grid gap-2 sm:grid-cols-2">
          {ADDONS.map((a, i) => (
            <Addon
              key={a.label}
              label={a.label}
              selected={addons.has(i)}
              onClick={() => toggle(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="What's included">
        <div className="rounded-xl bg-slate-50 p-4">
          <Checklist
            items={[
              "Everything in Standard clean",
              "Inside appliances (fridge + oven)",
              "Light fixtures & ceiling fans",
              "Behind & under furniture",
              "Window sills & tracks",
              "Sanitize all surfaces",
            ]}
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

function MoveOutPanel({ onPrice }: { onPrice: (p: ReturnType<typeof calc>) => void }) {
  const [typeIdx, setType]   = useState(0);
  const [sqftIdx, setSqft]   = useState(1);
  const [addons,  setAddons] = useState<Set<number>>(new Set([0, 2]));

  const TYPES  = ["Apartment","Condo","House","Studio"];
  const SQFTS  = ["Under 500","500–1000","1000–1500","1500+"];
  const ADDONS = [
    { label: "Carpet steam",  price: 50 },
    { label: "Patch & paint", price: 40 },
    { label: "Window wash",   price: 35 },
    { label: "Garage clean",  price: 60 },
  ];

  const toggle     = useCallback((i: number) => setAddons(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }), []);
  const addonTotal = [...addons].reduce((s, i) => s + ADDONS[i].price, 0);

  useEffect(() => onPrice(calc(MO_BASE[sqftIdx] + addonTotal)), [sqftIdx, addonTotal]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CollapsibleGroup title="Property type" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {TYPES.map((t, i) => (
            <Chip
              key={t}
              label={t}
              selected={typeIdx === i}
              onClick={() => setType(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Square footage" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {SQFTS.map((s, i) => (
            <Chip
              key={s}
              label={s}
              selected={sqftIdx === i}
              onClick={() => setSqft(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Move-out extras">
        <div className="grid gap-2 sm:grid-cols-2">
          {ADDONS.map((a, i) => (
            <Addon
              key={a.label}
              label={a.label}
              selected={addons.has(i)}
              onClick={() => toggle(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Deposit Protection">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <Notice
            text={
              <>
                <strong style={{ color: "#082F49" }}>
                  Deposit-back guarantee.
                </strong>{" "}
                Our move-out clean meets most landlord inspection standards. If
                your deposit is withheld for cleaning reasons, we'll re-clean for
                free.
              </>
            }
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

function CommercialPanel({ onPrice }: { onPrice: (p: ReturnType<typeof calc>) => void }) {
  const [typeIdx,     setType]     = useState(0);
  const [sqftIdx,     setSqft]     = useState(1);
  const [schedIdx,    setSched]    = useState(1);
  const [timingIdx,   setTiming]   = useState(1);
  const [contractIdx, setContract] = useState(1);
  const [addons,      setAddons]   = useState<Set<number>>(new Set([0, 3]));

  const TYPES     = ["Office","Retail","Restaurant","Medical","Gym"];
  const SQFTS     = ["Under 1k","1k–2.5k","2.5k–5k","5k+"];
  const SCHEDS    = [{ label: "Daily", mult: 1.4 }, { label: "3x/week", mult: 1 }, { label: "Weekly", mult: .7 }, { label: "One-time", mult: .5 }];
  const TIMINGS   = ["Before open","After close","Weekend"];
  const CONTRACTS = ["No contract","3 months","6 months","Annual"];
  const ADDONS    = [
    { label: "Floor wax",     price: 60 },
    { label: "Pressure wash", price: 45 },
    { label: "Window ext.",   price: 55 },
    { label: "Sanitize",      price: 40 },
  ];

  const toggle     = useCallback((i: number) => setAddons(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }), []);
  const addonTotal = [...addons].reduce((s, i) => s + ADDONS[i].price, 0);

  useEffect(() => onPrice(calc(Math.round((COM_BASE[sqftIdx] + addonTotal) * SCHEDS[schedIdx].mult))), [sqftIdx, schedIdx, addonTotal]);

  return (
    <div className="grid gap-4 lg:grid-cols-2 ">
      <CollapsibleGroup title="Space type" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {TYPES.map((t, i) => (
            <Chip
              key={t}
              label={t}
              selected={typeIdx === i}
              onClick={() => setType(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Square footage" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {SQFTS.map((s, i) => (
            <Chip
              key={s}
              label={s}
              selected={sqftIdx === i}
              onClick={() => setSqft(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Schedule" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {SCHEDS.map((s, i) => (
            <Chip
              key={s.label}
              label={s.label}
              selected={schedIdx === i}
              onClick={() => setSched(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Add-ons">
        <div className="grid gap-2 sm:grid-cols-2">
          {ADDONS.map((a, i) => (
            <Addon
              key={a.label}
              label={a.label}
              selected={addons.has(i)}
              onClick={() => toggle(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Timing">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TIMINGS.map((t, i) => (
            <Chip
              key={t}
              label={t}
              selected={timingIdx === i}
              onClick={() => setTiming(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Contract">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {CONTRACTS.map((c, i) => (
            <Chip
              key={c}
              label={c}
              selected={contractIdx === i}
              onClick={() => setContract(i)}
            />
          ))}
        </div>
      </CollapsibleGroup>
    </div>
  );
}

// ── Service config ─────────────────────────────────────────────────────────────
const SERVICES = [
  { image: "/images/Designer(2).png", label: "Standard",  photo: "/images/Designer(2).png", headline: <>Find the right cleaner<br />from Boston's best<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book now"            },
  { image: "/images/Designer(5).png",        label: "Deep clean", photo: "/images/Designer(5).png", headline: <>Book a deep clean<br />that actually goes deep<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book deep clean"     },
  { image: "/images/Designer(6).png",          label: "Move-out",   photo: "/images/Designer(6).png", headline: <>Leave spotless.<br />Get your deposit back<span style={{ color: K.blue }}>.</span></>,        bookLabel: "Book move-out clean" },
  { image: "/images/Designer(7).png",        label: "Commercial", photo: "/images/Designer(7).png", headline: <>Professional cleaning<br />for your business<span style={{ color: K.blue }}>.</span></>,      bookLabel: "Get a quote"         },
];
function FrequencyDropdown({
    open,
    selected,
    onSelect,
  }: {
    open: boolean;
    selected: string;
    onSelect: (frequency: string) => void;
  }) {
    const options = ["One-time", "Weekly", "Bi-weekly", "Monthly"];
  
    return (
      <Dropdown open={open} minWidth={220}>
        <div style={{ padding: 6 }}>
          {options.map((option) => {
            const active = option === selected;
  
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  border: "none",
                  borderRadius: 8,
                  background: active ? K.blueLight : "transparent",
                  color: active ? K.blue : K.text,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 700,
                  transition: "background .12s",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = K.blueFaint;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </Dropdown>
    );
  }
// ── Root ──────────────────────────────────────────────────────────────────────
export default function CleaningEstimator() {
  const [serviceIdx, setServiceIdx] = useState(0);
  const [prices,     setPrices]     = useState({ low: 144, mid: 180, high: 216 });

  const [locState, setLocState] = useState<StateKey>("MA");
  const [locCity,  setLocCity]  = useState("Boston");
  const [locOpen,  setLocOpen]  = useState(false);

  const [date,     setDate]     = useState<Date | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const svc     = SERVICES[serviceIdx];
  const rootRef = useRef<HTMLElement>(null);

  const [frequency, setFrequency] = useState("Bi-weekly");
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const mobileSearchSummary = `${locCity}, ${locState} · ${date ? formatDate(date) : "Select date"} · ${frequency}`;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setLocOpen(false);
        setDateOpen(false);
        setFrequencyOpen(false);   
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleLocField() {
    setDateOpen(false);
    setFrequencyOpen(false);
    setLocOpen((value) => !value);
  }
  function handleDateField() {
    setLocOpen(false);
    setFrequencyOpen(false);
    setDateOpen((value) => !value);
  }
  function handleCitySelect(city: string, state: StateKey) {
    setLocCity(city);
    setLocState(state);
    setLocOpen(false);
    setDateOpen(false);
    setFrequencyOpen(false);
  }
  
  
  function handleDateSelect(d: Date) {
    setDate(d);
    setLocOpen(false);
    setDateOpen(false);
    setFrequencyOpen(false);
  }


function handleFrequencyField() {
    setLocOpen(false);
    setDateOpen(false);
    setFrequencyOpen((value) => !value);
  }
  function handleFrequencySelect(value: string) {
    setFrequency(value);
    setLocOpen(false);
    setDateOpen(false);
    setFrequencyOpen(false);
  }
  const panels = [

    
    <StandardPanel
    key="std"
    onPrice={setPrices}
    frequency={frequency}
    onFrequencyChange={setFrequency}
  /> ,
    <DeepCleanPanel  key="deep" onPrice={setPrices} />,
    <MoveOutPanel    key="mo"   onPrice={setPrices} />,
    <CommercialPanel key="com"  onPrice={setPrices} />,
  ];

  return (
    <motion.section
    id="quote"
    ref={rootRef}
    initial={{ opacity: 0, y: 70 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="overflow-x-hidden bg-white"
  >
    <div className="mx-auto mt-12 max-w-4xl px-4 text-center sm:mt-16 sm:px-6 lg:mt-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_VIEWPORT}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeUp}
          className="
            font-heading
            max-w-3xl
            text-3xl
            font-thin
            leading-[0.95]
            tracking-tight
            sm:text-4xl
            lg:text-5xl
          "
          style={{
            fontWeight: 300,
            letterSpacing: "-0.01em",
          }}
        >
          See Your Cleaning Price <span style={{ color: K.blue }}>Instantly</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="my-4 mx-auto w-[80%] text-[16px] font-medium uppercase tracking-[0.09em] text-slate-600"
        >
          Instant estimate. Book when you&apos;re ready.
        </motion.p>
      </motion.div>
    </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-12 sm:gap-7 sm:px-6 sm:py-16 lg:grid-cols-[1.65fr_1fr] lg:gap-8 lg:px-8 lg:py-20">
        
        {/* Left Column */}
        <div className="min-w-0">
          {/* Tabs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={SCROLL_VIEWPORT}
            variants={staggerContainer}
            className="
              -mb-px flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 scroll-smooth
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              sm:pb-px lg:gap-2
            "
          >
            {SERVICES.map((s, i) => {
              const active = serviceIdx === i;

              return (
                <motion.button
                  key={s.label}
                  type="button"
                  variants={staggerItem}
                  onClick={() => setServiceIdx(i)}
                  whileHover={active ? undefined : { y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    flex min-w-[140px] shrink-0 snap-start items-center gap-3 rounded-2xl
                    px-3 py-3 text-left transition-all duration-200
                    sm:min-w-[112px] sm:flex-col sm:items-center sm:gap-2
                    sm:rounded-b-none sm:rounded-t-[18px] sm:px-4 sm:py-3
                  "
                  style={{
                    cursor: "pointer",
                    outline: "none",
                    borderTop: `1px solid ${active ? K.border : "transparent"}`,
                    borderLeft: `1px solid ${active ? K.border : "transparent"}`,
                    borderRight: `1px solid ${active ? K.border : "transparent"}`,
                    borderBottom: "none",
                    background: active ? K.white : "#F8FAFC",
                    position: "relative",
                    zIndex: active ? 2 : 1,
                    marginBottom: active ? -1 : 0,
                    boxShadow: active
                      ? "0 -4px 20px rgba(12,26,46,0.06), 0 1px 0 rgba(255,255,255,0.8) inset"
                      : "none",
                  }}
                >
        <div
          className="
            grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm
            sm:h-11 sm:w-11 sm:rounded-[14px]
          "
        >
          <Image
            src={s.image}
            alt={s.label}
            width={34}
            height={34}
            style={{ objectFit: "contain" }}
          />
        </div>

        <span
          className="
            truncate text-sm font-semibold
            sm:whitespace-nowrap sm:text-base
          "
          style={{
            color: active ? K.text : K.muted,
          }}
        >
          {s.label}
        </span>
                </motion.button>
              );
            })}
          </motion.div>
  
          {/* Main Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={SCROLL_VIEWPORT}
            variants={slideLeft}
            className="relative z-[1] overflow-visible rounded-b-[20px] rounded-tr-[20px] border border-gray-200 bg-white shadow-[0_1px_3px_rgba(12,26,46,.04),0_16px_48px_rgba(12,26,46,.07)]"
          >
            {/* Search Bar */}
<div className="border-b border-gray-200 bg-white">
  <button
    type="button"
    className="flex w-full items-center justify-between gap-3 rounded-none border-none bg-slate-50 px-4 py-4 text-left sm:hidden"
    onClick={() => setMobileSearchOpen((value) => !value)}
  >
    <span className="whitespace-normal text-base font-semibold leading-snug tracking-tight text-slate-900">
      {mobileSearchSummary}
    </span>

    <motion.div
      animate={{ rotate: mobileSearchOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="shrink-0 text-slate-400"
    >
      <ChevronDown size={20} />
    </motion.div>
  </button>

  <div
    className={`relative z-50 flex-col gap-2 p-3 sm:gap-0 sm:p-0 ${
      mobileSearchOpen ? "flex" : "hidden"
    } sm:flex sm:h-[88px] sm:flex-row sm:items-stretch`}
  >
    {/* Location */}
    <div
      className="relative flex w-full items-stretch sm:min-h-0 sm:flex-[1.33]"
      style={{ zIndex: locOpen ? 99999 : undefined }}
    >
      <SF
        icon="ti-map-pin"
        label="Location"
        value={`${locCity}, ${locState}`}
        active={locOpen}
        onClick={handleLocField}
      />

      <motion.div
        animate={{ rotate: locOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 sm:right-5"
        style={{ color: locOpen ? K.blue : K.hint }}
      >
        <ChevronDown size={20} strokeWidth={2.2} />
      </motion.div>

      <LocationDropdown
        open={locOpen}
        state={locState}
        city={locCity}
        onStateChange={setLocState}
        onCitySelect={handleCitySelect}
      />
    </div>

    {/* Date */}
    <div
      className="relative flex w-full items-stretch sm:min-h-0 sm:flex-1"
      style={{ zIndex: dateOpen ? 99999 : undefined }}
    >
      <SF
        icon="ti-calendar"
        label="Date"
        value={date ? formatDate(date) : "Select date"}
        active={dateOpen}
        onClick={handleDateField}
        placeholder={!date}
      />

      <motion.div
        animate={{ rotate: dateOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 sm:right-5"
        style={{ color: dateOpen ? K.blue : K.hint }}
      >
        <ChevronDown size={20} strokeWidth={2.2} />
      </motion.div>

      <CalendarDropdown
        open={dateOpen}
        selected={date}
        onSelect={handleDateSelect}
      />
    </div>

    {/* Frequency */}
    <div
      className="relative flex w-full items-stretch sm:min-h-0 sm:flex-1"
      style={{ zIndex: frequencyOpen ? 99999 : undefined }}
    >
      <SF
        icon="ti-repeat"
        label="Frequency"
        value={frequency}
        active={frequencyOpen}
        onClick={handleFrequencyField}
        flex={1}
        last
      />

      <motion.div
        animate={{ rotate: frequencyOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 sm:right-5"
        style={{ color: frequencyOpen ? K.blue : K.hint }}
      >
        <ChevronDown size={20} strokeWidth={2.2} />
      </motion.div>

      <FrequencyDropdown
        open={frequencyOpen}
        selected={frequency}
        onSelect={handleFrequencySelect}
      />
    </div>
  </div>
</div>
  
            {/* Active Panel */}
            <div className="bg-slate-50/80 p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={serviceIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: MOTION_EASE }}
                >
                  {panels[serviceIdx]}
                </motion.div>
              </AnimatePresence>
            </div>
  
            {/* Price Strip */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={SCROLL_VIEWPORT}
              variants={fadeUp}
              className="flex flex-col gap-5 border-t border-gray-200 bg-gradient-to-b from-slate-50 to-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8"
            >
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Estimate range
                </span>
  
                <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
                  <PricePill label="Low" value={prices.low} />
                  <div className="hidden h-7 w-px bg-gray-200 sm:block" />
                  <PricePill label="Mid" value={prices.mid} accent />
                  <div className="hidden h-7 w-px bg-gray-200 sm:block" />
                  <PricePill label="High" value={prices.high} />
                </div>
              </div>
  
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 sm:justify-start">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Licensed & insured
                  </span>
                </div>
  
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full cursor-pointer rounded-xl border-none bg-sky-400 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(56,189,248,.35)] transition-colors duration-200 hover:bg-sky-500 sm:w-auto"
                >
                  {svc.bookLabel}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
  
        {/* Right Image Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_VIEWPORT}
          variants={slideRight}
          className="hidden min-h-[440px] flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-gradient-to-b from-slate-50 to-white shadow-[0_1px_3px_rgba(12,26,46,.04),0_16px_48px_rgba(12,26,46,.07)] lg:flex"
        >
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={svc.photo}
                initial={{ opacity: 0, scale: 0.96, x: 12 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -8 }}
                transition={{ duration: 0.4, ease: MOTION_EASE }}
                className="flex h-full w-full items-center justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3, ease: MOTION_EASE }}
                  className="relative max-h-[320px] w-full max-w-[400px]"
                >
                  <Image
                    src={svc.photo}
                    alt={svc.label}
                    width={400}
                    height={320}
                    className="h-auto max-h-[320px] w-full object-contain drop-shadow-[0_12px_32px_rgba(12,26,46,0.12)]"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/95 px-4 py-2 shadow-sm backdrop-blur-sm">
              <Image src={svc.image} alt={svc.label} width={16} height={16} style={{ objectFit: "contain" }} />
              <span className="text-sm font-semibold tracking-tight text-sky-600">
                {svc.label}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}