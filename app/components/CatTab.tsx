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
        flex, display: "flex", alignItems: "center", gap: 10,
        padding: "0 18px", height: "100%", minWidth: 0,
        borderRight: last ? "none" : `1px solid ${K.border}`,
        cursor: "pointer", position: "relative",
        background: active ? K.blueLight : "transparent",
        transition: "background .12s",
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 18, color: active ? K.blue : K.hint, flexShrink: 0 }} aria-hidden="true" />
      <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: active ? K.blue : K.hint, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: placeholder ? K.hint : K.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
    <section ref={rootRef} style={{ background: K.white, padding: "48px 24px 64px", fontFamily: "Inter, sans-serif" }}>

      {/* Headline */}
    

    <div className="flex flex-row justify-between items-stretch gap-6 pl-20 ">

        <div className="w-2/3">
  {/* Category tabs — fixed: borderTop/Left/Right + borderBottom instead of border + borderBottom */}
  <div style={{ display: "flex", gap: 6, marginBottom: -1 }}>
        {SERVICES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setServiceIdx(i)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 5, padding: "10px 18px 13px", cursor: "pointer", outline: "none",
              borderTop:    `1.5px solid ${serviceIdx === i ? K.border : "transparent"}`,
              borderLeft:   `1.5px solid ${serviceIdx === i ? K.border : "transparent"}`,
              borderRight:  `1.5px solid ${serviceIdx === i ? K.border : "transparent"}`,
              borderBottom: "none",
              borderRadius: "10px 10px 0 0",
              background: serviceIdx === i ? K.white : "transparent",
              position: "relative", zIndex: serviceIdx === i ? 2 : 1,
              marginBottom: serviceIdx === i ? -1 : 0,
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 9, background: serviceIdx === i ? K.blue : "#DDE8F0", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .12s" }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: 19, color: serviceIdx === i ? "#fff" : K.muted }} aria-hidden="true" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: serviceIdx === i ? K.text : K.muted, whiteSpace: "nowrap" }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: K.white,
        borderTop:    `1.5px solid ${K.border}`,
        borderRight:  `1.5px solid ${K.border}`,
        borderBottom: `1.5px solid ${K.border}`,
        borderLeft:   `1.5px solid ${K.border}`,
        borderRadius: "0 12px 12px 12px",
        position: "relative", zIndex: 1,
      }}>

        {/* Search bar */}
        <div style={{
          display: "flex", height: 60,
          borderBottom: `1.5px solid ${K.border}`,
          borderRadius: "0 12px 0 0",
          overflow: "visible", position: "relative", zIndex: 50,
        // Add border radius to the top right corner
   

        }}>
          {/* Location */}
          <div style={{ flex: 1.33, position: "relative" }}>
            <SF icon="ti-map-pin" label="Location" value={`${locCity}, ${locState}`} active={locOpen} onClick={handleLocField} />
            <LocationDropdown open={locOpen} state={locState} city={locCity} onStateChange={setLocState} onCitySelect={handleCitySelect} />
          </div>

          {/* Date */}
          <div style={{ flex: 1, position: "relative", borderLeft: `1px solid ${K.border}` }}>
            <SF icon="ti-calendar" label="Date" value={date ? formatDate(date) : "Select date"} active={dateOpen} onClick={handleDateField} placeholder={!date} />
            <CalendarDropdown open={dateOpen} selected={date} onSelect={handleDateSelect} />
          </div>

          <SF icon={svc.icon}  label="Service"   value={svc.label} flex={1.1} />
          <SF icon="ti-repeat" label="Frequency" value="Bi-weekly" flex={1} last />

          {/* <button
            style={{
              background: K.blue, color: "#fff",
              borderTopRightRadius: 12,
              borderTop: "none", borderRight: "none", borderBottom: "none", borderLeft: "none",
              padding: "0 26px", fontSize: 14, fontWeight: 800,
              cursor: "pointer", letterSpacing: -0.2, flexShrink: 0, transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = K.blueHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = K.blue)}
          >
            Search
          </button> */}
        </div>

        {/* Active panel */}
        <div style={{ padding: 20, background: K.surface }}>
          <AnimatePresence mode="wait">
            <motion.div key={serviceIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {panels[serviceIdx]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Price strip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderTop: `1px solid ${K.borderLight}`, background: K.white,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: K.hint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Estimate range
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PricePill label="Low"  value={prices.low}  />
              <div style={{ width: 1, height: 26, background: K.border }} />
              <PricePill label="Mid"  value={prices.mid}  accent />
              <div style={{ width: 1, height: 26, background: K.border }} />
              <PricePill label="High" value={prices.high} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: K.greenBg, borderRadius: 6, padding: "4px 10px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: K.green }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: K.green, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Licensed & insured
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{
                background: K.blue, color: "#fff",
                borderTop: "none", borderRight: "none", borderBottom: "none", borderLeft: "none",
                borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 800,
                cursor: "pointer", letterSpacing: -0.2,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = K.blueHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = K.blue)}
            >
              {svc.bookLabel}
            </motion.button>
          </div>
        </div>

        {/* Compare bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px 14px", borderTop: `1px solid ${K.borderLight}` }}>
          <div style={{
            width: 16, height: 16, borderRadius: 4,
            background: K.blue,
            borderTop:    `1.5px solid ${K.blue}`,
            borderRight:  `1.5px solid ${K.blue}`,
            borderBottom: `1.5px solid ${K.blue}`,
            borderLeft:   `1.5px solid ${K.blue}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 12, color: K.muted, fontWeight: 500 }}>Compare vs.</span>
          {["Handy","Amazon Home","TaskRabbit"].map((s, i) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {i > 0 && <span style={{ color: K.hint, fontSize: 12 }}>·</span>}
              <span style={{ fontSize: 12, fontWeight: 700, color: K.textSub, textDecoration: "underline", cursor: "pointer" }}>{s}</span>
            </span>
          ))}
        </div>

      </div>
        </div>
        <div className="w-1/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={svc.image}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <img
                src={svc.image}
                alt={svc.label}
                className="h-full w-full rounded-xl object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
    </div>
    </section>
  );
}