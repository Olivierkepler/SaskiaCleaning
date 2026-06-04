"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const K = {
  blue:         "#38BDF8",
  blueHover:    "#0EA5E9",
  blueLight:    "#E0F4FE",
  blueFaint:    "#F0F8FF",
  pageBg:       "#FFFFFF",
  white:        "#FFFFFF",
  surface:      "#F8FAFC",
  border:       "#CBD5E1",
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
  MA: [
    { city: "Boston",           sub: "Suffolk County"    },
    { city: "Cambridge",        sub: "Middlesex County"  },
    { city: "Somerville",       sub: "Middlesex County"  },
    { city: "Brookline",        sub: "Norfolk County"    },
    { city: "Newton",           sub: "Middlesex County"  },
    { city: "Quincy",           sub: "Norfolk County"    },
    { city: "Worcester",        sub: "Worcester County"  },
    { city: "Springfield",      sub: "Hampden County"    },
  ],
  RI: [
    { city: "Providence",       sub: "Providence County" },
    { city: "Cranston",         sub: "Providence County" },
    { city: "Warwick",          sub: "Kent County"       },
    { city: "Pawtucket",        sub: "Providence County" },
    { city: "East Providence",  sub: "Providence County" },
    { city: "Newport",          sub: "Newport County"    },
    { city: "North Providence", sub: "Providence County" },
    { city: "Johnston",         sub: "Providence County" },
  ],
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
            zIndex: 200, minWidth, overflow: "hidden",
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

      <div style={{ padding: 6 }}>
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
      onClick={onClick}
      style={{
        flex, display: "flex", alignItems: "center", alignSelf: "stretch", gap: 14,
        padding: "0 28px", height: "100%", minWidth: 0,
        borderRight: last ? "none" : `1px solid ${K.border}`,
        cursor: "pointer", position: "relative",
        background: active ? K.blueLight : "transparent",
        transition: "background .12s",
      }}
    >
      <i
        className={`ti ${icon}`}
        style={{
          fontSize: 18,
          color: active ? K.blue : K.hint,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          lineHeight: 1,
        }}
        aria-hidden="true"
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 1, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: active ? K.blue : K.hint, textTransform: "uppercase", letterSpacing: "0.14em", lineHeight: 1, display: "block" }}>
          {label}
        </span>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: placeholder ? K.hint : K.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1, display: "block" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12, fontWeight: 600, cursor: "pointer",
        padding: "5px 13px", borderRadius: 20, outline: "none",
        borderTop:    `1.5px solid ${selected ? K.blue : K.border}`,
        borderRight:  `1.5px solid ${selected ? K.blue : K.border}`,
        borderBottom: `1.5px solid ${selected ? K.blue : K.border}`,
        borderLeft:   `1.5px solid ${selected ? K.blue : K.border}`,
        background: selected ? K.blueLight : K.chipBg,
        color: selected ? K.chipText : K.textSub,
        transition: "all .12s",
      }}
    >
      {label}
    </button>
  );
}

// ── Addon ─────────────────────────────────────────────────────────────────────
function Addon({ label, selected, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        cursor: "pointer", outline: "none",
        borderTop:    `1.5px solid ${selected ? K.blue : K.border}`,
        borderRight:  `1.5px solid ${selected ? K.blue : K.border}`,
        borderBottom: `1.5px solid ${selected ? K.blue : K.border}`,
        borderLeft:   `1.5px solid ${selected ? K.blue : K.border}`,
        borderRadius: 8,
        background: selected ? K.blueLight : K.white,
        transition: "all .12s", textAlign: "left", width: "100%",
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        borderTop:    `1.5px solid ${selected ? K.blue : "#CBD5E1"}`,
        borderRight:  `1.5px solid ${selected ? K.blue : "#CBD5E1"}`,
        borderBottom: `1.5px solid ${selected ? K.blue : "#CBD5E1"}`,
        borderLeft:   `1.5px solid ${selected ? K.blue : "#CBD5E1"}`,
        background: selected ? K.blue : K.white,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: selected ? K.chipText : K.textSub }}>
        {label}
      </span>
    </button>
  );
}

// ── Price pill ────────────────────────────────────────────────────────────────
function PricePill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const display = "$" + value.toLocaleString("en-US");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: K.hint, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={display}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.13 }}
          style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1, color: accent ? K.blue : K.text }}
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
const sec:        React.CSSProperties = { fontSize: 10, fontWeight: 800, color: K.hint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 };
const chipsRow:   React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 };

// ── Service panels ─────────────────────────────────────────────────────────────
function StandardPanel({ onPrice }: { onPrice: (p: ReturnType<typeof calc>) => void }) {
  const [bedIdx,  setBedIdx]  = useState(2);
  const [bathIdx, setBathIdx] = useState(0);
  const [freqIdx, setFreqIdx] = useState(1);
  const [addons,  setAddons]  = useState<Set<number>>(new Set([1]));

  const BEDS  = ["Studio","1 bed","2 bed","3 bed","4+ bed"];
  const FREQS = [
    { label: "One-time",  discount: 0  },
    { label: "Bi-weekly", discount: 10 },
    { label: "Weekly",    discount: 15 },
    { label: "Monthly",   discount: 5  },
  ];
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
  }, [bedIdx, bathIdx, freqIdx, addonTotal]);

  return (
    <div style={twoCol}>
      <div><p style={sec}>Bedrooms</p><div style={chipsRow}>{BEDS.map((b, i) => <Chip key={b} label={b} selected={bedIdx === i} onClick={() => setBedIdx(i)} />)}</div></div>
      <div><p style={sec}>Bathrooms</p><div style={chipsRow}>{[1, 1.5, 2, 2.5, 3].map((b, i) => <Chip key={b} label={String(b)} selected={bathIdx === i} onClick={() => setBathIdx(i)} />)}</div></div>
      <div><p style={sec}>Frequency</p><div style={chipsRow}>{FREQS.map((f, i) => <Chip key={f.label} label={f.label} selected={freqIdx === i} onClick={() => setFreqIdx(i)} />)}</div></div>
      <div><p style={sec}>Add-ons</p><div style={addonsGrid}>{ADDONS.map((a, i) => <Addon key={a.label} label={a.label} selected={addons.has(i)} onClick={() => toggle(i)} />)}</div></div>
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
    <div style={twoCol}>
      <div><p style={sec}>Home size</p><div style={chipsRow}>{SIZES.map((s, i) => <Chip key={s} label={s} selected={sizeIdx === i} onClick={() => setSize(i)} />)}</div></div>
      <div><p style={sec}>Condition</p><div style={chipsRow}>{CONDS.map((c, i) => <Chip key={c} label={c} selected={condIdx === i} onClick={() => setCond(i)} />)}</div></div>
      <div><p style={sec}>Deep clean extras</p><div style={addonsGrid}>{ADDONS.map((a, i) => <Addon key={a.label} label={a.label} selected={addons.has(i)} onClick={() => toggle(i)} />)}</div></div>
      <div>
        <p style={sec}>What's included</p>
        <Checklist items={["Everything in Standard clean","Inside appliances (fridge + oven)","Light fixtures & ceiling fans","Behind & under furniture","Window sills & tracks","Sanitize all surfaces"]} />
      </div>
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
    <div style={twoCol}>
      <div><p style={sec}>Property type</p><div style={chipsRow}>{TYPES.map((t, i) => <Chip key={t} label={t} selected={typeIdx === i} onClick={() => setType(i)} />)}</div></div>
      <div><p style={sec}>Square footage</p><div style={chipsRow}>{SQFTS.map((s, i) => <Chip key={s} label={s} selected={sqftIdx === i} onClick={() => setSqft(i)} />)}</div></div>
      <div><p style={sec}>Move-out extras</p><div style={addonsGrid}>{ADDONS.map((a, i) => <Addon key={a.label} label={a.label} selected={addons.has(i)} onClick={() => toggle(i)} />)}</div></div>
      <div>
        <Notice text={
          <><strong style={{ color: "#082F49" }}>Deposit-back guarantee.</strong> Our move-out clean meets most landlord inspection standards. If your deposit is withheld for cleaning reasons, we'll re-clean for free.</>
        } />
      </div>
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
    <div style={threeCol}>
      <div><p style={sec}>Space type</p><div style={chipsRow}>{TYPES.map((t, i) => <Chip key={t} label={t} selected={typeIdx === i} onClick={() => setType(i)} />)}</div></div>
      <div><p style={sec}>Square footage</p><div style={chipsRow}>{SQFTS.map((s, i) => <Chip key={s} label={s} selected={sqftIdx === i} onClick={() => setSqft(i)} />)}</div></div>
      <div><p style={sec}>Schedule</p><div style={chipsRow}>{SCHEDS.map((s, i) => <Chip key={s.label} label={s.label} selected={schedIdx === i} onClick={() => setSched(i)} />)}</div></div>
      <div><p style={sec}>Add-ons</p><div style={addonsGrid}>{ADDONS.map((a, i) => <Addon key={a.label} label={a.label} selected={addons.has(i)} onClick={() => toggle(i)} />)}</div></div>
      <div><p style={sec}>Timing</p><div style={chipsRow}>{TIMINGS.map((t, i) => <Chip key={t} label={t} selected={timingIdx === i} onClick={() => setTiming(i)} />)}</div></div>
      <div><p style={sec}>Contract</p><div style={chipsRow}>{CONTRACTS.map((c, i) => <Chip key={c} label={c} selected={contractIdx === i} onClick={() => setContract(i)} />)}</div></div>
    </div>
  );
}

// ── Service config ─────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "ti-home",     label: "Standard",  image: "/images/Designer(2).png",     headline: <>Find the right cleaner<br />from Boston's best<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book now"            },
  { icon: "ti-sparkles", label: "Deep clean", image: "/images/Designer(5).png",  headline: <>Book a deep clean<br />that actually goes deep<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book deep clean"     },
  { icon: "ti-box",      label: "Move-out",   image: "/images/Designer(6).png",    headline: <>Leave spotless.<br />Get your deposit back<span style={{ color: K.blue }}>.</span></>,        bookLabel: "Book move-out clean" },
  { icon: "ti-building", label: "Commercial", image: "/images/Designer(7).png",  headline: <>Professional cleaning<br />for your business<span style={{ color: K.blue }}>.</span></>,      bookLabel: "Get a quote"         },
];

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

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setLocOpen(false); setDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleLocField()  { setDateOpen(false); setLocOpen(v => !v); }
  function handleDateField() { setLocOpen(false);  setDateOpen(v => !v); }
  function handleCitySelect(city: string, state: StateKey) { setLocCity(city); setLocState(state); setLocOpen(false); }
  function handleDateSelect(d: Date) { setDate(d); setDateOpen(false); }

  const panels = [
    <StandardPanel   key="std"  onPrice={setPrices} />,
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
    style={{
      background: K.white,
      fontFamily: "Inter, sans-serif",
    }}
  >
      <div
     
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.65fr 1fr",
          gap: 28,
          alignItems: "stretch",
        }}
      >
        {/* Left Column */}
        <div style={{ minWidth: 0 }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: -1,
              overflowX: "auto",
              paddingBottom: 1,
            }}
          >
            {SERVICES.map((s, i) => {
              const active = serviceIdx === i;
  
              return (
                <button
                  key={s.label}
                  onClick={() => setServiceIdx(i)}
                  style={{
                    minWidth: 108,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 7,
                    padding: "12px 18px 14px 12px",

                    
                    cursor: "pointer",
                    outline: "none",


                    borderTop: `1.5px solid ${active ? K.border : "transparent"}`,
                    borderLeft: `1.5px solid ${active ? K.border : "transparent"}`,
                    borderRight: `1.5px solid ${active ? K.border : "transparent"}`,


                    borderBottom: "none",
                    borderRadius: "14px 14px 0 0",
                    background: active ? K.white : "#FAFCFD",
                    position: "relative",
                    zIndex: active ? 2 : 1,
                    marginBottom: active ? -1 : 0,
                    boxShadow: active ? "0 -2px 16px rgba(12,26,46,0.04)" : "none",
                    transition: "all .18s ease",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      background: active ? K.blue : "#DDE8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: active
                        ? "0 10px 22px rgba(56,189,248,0.28)"
                        : "none",
                    }}
                  >
                    <i
                      className={`ti ${s.icon}`}
                      style={{
                        fontSize: 20,
                        color: active ? "#fff" : K.muted,
                      }}
                      aria-hidden="true"
                    />
                  </div>
  
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: active ? K.text : K.muted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
  
          {/* Main Card */}
          <div
            style={{
              background: K.white,
              border: `1.5px solid ${K.border}`,
              borderRadius: "0 18px 18px 18px",
              position: "relative",
              zIndex: 1,
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(12,26,46,.04), 0 20px 60px rgba(12,26,46,.08)",
            }}
          >
            {/* Search Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                height: 88,
                borderBottom: `1.5px solid ${K.border}`,
                background: K.white,
                position: "relative",
                zIndex: 50,
              }}
            >
              <div style={{ flex: 1.33, position: "relative", display: "flex", alignItems: "stretch" }}>
                <SF
                  icon="ti-map-pin"
                  label="Location"
                  value={`${locCity}, ${locState}`}
                  active={locOpen}
                  onClick={handleLocField}
                />
                <LocationDropdown
                  open={locOpen}
                  state={locState}
                  city={locCity}
                  onStateChange={setLocState}
                  onCitySelect={handleCitySelect}
                />
              </div>
  
              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "stretch" }}>
                <SF
                  icon="ti-calendar"
                  label="Date"
                  value={date ? formatDate(date) : "Select date"}
                  active={dateOpen}
                  onClick={handleDateField}
                  placeholder={!date}
                />
                <CalendarDropdown open={dateOpen} selected={date} onSelect={handleDateSelect} />
              </div>
  
              <SF icon={svc.icon} label="Service" value={svc.label} flex={1.1} />
              <SF icon="ti-repeat" label="Frequency" value="Bi-weekly" flex={1} last />
            </div>
  
            {/* Active Panel */}
            <div style={{ padding: 24, background: K.surface }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={serviceIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                >
                  {panels[serviceIdx]}
                </motion.div>
              </AnimatePresence>
            </div>
  
            {/* Price Strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                padding: "18px 24px",
                borderTop: `1px solid ${K.borderLight}`,
                background: K.white,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: K.hint,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Estimate range
                </span>
  
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <PricePill label="Low" value={prices.low} />
                  <div style={{ width: 1, height: 28, background: K.border }} />
                  <PricePill label="Mid" value={prices.mid} accent />
                  <div style={{ width: 1, height: 28, background: K.border }} />
                  <PricePill label="High" value={prices.high} />
                </div>
              </div>
  
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: K.greenBg,
                    borderRadius: 999,
                    padding: "6px 12px",
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: K.green }} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: K.green,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Licensed & insured
                  </span>
                </div>
  
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: K.blue,
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 28px",
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(56,189,248,.25)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = K.blueHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = K.blue)}
                >
                  {svc.bookLabel}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Right Image Card */}
        <div
          style={{
            minHeight: 440,
            background: K.white,
            // border: `1px solid ${K.borderLight}`,
            // borderRadius: 22,
            overflow: "hidden",
            position: "relative",
            display: "flex",
          
            flexDirection: "column",
            // boxShadow: "0 1px 2px rgba(12,26,46,.04), 0 20px 60px rgba(12,26,46,.08)",
          }}
        >
          {/* <div style={{ padding: "32px 32px 24px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={serviceIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2
                  style={{
                    fontSize: 38,
                    lineHeight: 1.05,
                    fontWeight: 900,
                    color: K.text,
                    letterSpacing: "-0.05em",
                    margin: 0,
                  }}
                >
                  {svc.headline}
                </h2>
              </motion.div>
            </AnimatePresence>
          </div> */}

          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={svc.image}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ height: "100%" }}
                className="flex justify-center items-center"
              >
                <img
                  src={svc.image}
                  alt={svc.label}
                  className="w-[400px] h-[300px]"
                  style={{
                    width: "[400px]",
                    height: "[300px]",
                   

                  }}
                />
              </motion.div>
            </AnimatePresence>

            <div
              style={{
                position: "absolute",
                left: 20,
                bottom: 20,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                background: K.blueLight,
                color: K.blue,
              }}
            >
              <i className={`ti ${svc.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {svc.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}