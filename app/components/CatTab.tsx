"use client";

import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, MapPin, Repeat } from "lucide-react";
import { MASSACHUSETTS_LOCATIONS } from "@/app/data/massachusettsLocations";
import { RHODE_ISLAND_LOCATIONS } from "@/app/data/rhodeIslandLocations";
import BookingSummary from "@/app/components/BookingSummary";
import { ImOpera } from "react-icons/im";
import { IoChatbubblesOutline } from "react-icons/io5";
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
  hint:         "black",
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
  icon: ReactNode; label: string; value: string; flex?: number;
  last?: boolean; active?: boolean; onClick?: () => void; placeholder?: boolean;
}) {
  return (
    <div
      data-cursor-pointer="pointer"
      onClick={onClick}
      className={[
        "relative flex w-full min-w-0 cursor-pointer items-center gap-4 self-stretch px-5 py-4 transition-colors duration-200",
        "sm:min-h-0 sm:h-full sm:px-6 sm:py-0",
        "max-sm:rounded-2xl max-sm:border  max-sm:border-gray-200 max-sm:shadow-sm",
        last ? "" : "sm:border-r sm:border-gray-200",
        active ? "bg-sky-50" : "bg-transparent hover:bg-slate-50/80 ",
      ].join(" ")}
      style={{ flex }}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 ${
          active ? "text-sky-500" : "text-slate-900"
        }`}
      >
        {icon}
      </div>
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
    placeholder ? "text-slate-400" : "text-slate-900"
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
          "cursor-pointer rounded-[5px] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all duration-200",
          selected
            ? "border border-sky-500 bg-sky-50 text-sky-600 shadow-sm"
            : "border border-neutral-200 bg-white text-slate-500 shadow-sm hover:border-sky-300 hover:text-sky-500 hover:shadow-md",
        ].join(" ")}
      >
        {label}
      </motion.button>
    );
  }

// ── Addon ─────────────────────────────────────────────────────────────────────
function Addon({
  label,
  image,
  selected,
  onClick,
}: {
  label: string;
  image: string;
  selected?: boolean;
  onClick: () => void;
}) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={[
          "flex w-full cursor-pointer items-center gap-3 rounded- px-4 py-3 text-left outline-none transition-all duration-200",
          selected
            ? "border border-sky-500 bg-sky-50 shadow-sm"
            : "border border-neutral-200 bg-white shadow-sm hover:border-sky-300 hover:shadow-md",
        ].join(" ")}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <Image
            src={image}
            alt={label}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
          {selected && (
            <div className="absolute inset-0 flex items-center justify-center bg-sky-500/35">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 shadow-sm">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2.5 2.5 4-4"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${selected ? "text-sky-700" : "text-slate-500"}`}>
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
          className={`text-[20px] sm:text-[20px] font-bold leading-none tracking-tight sm:text-base ${
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
const sec:        React.CSSProperties = { fontSize: 14, fontWeight: 600, color: K.text, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 0 };
const chipsRow:   React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 };
function useIsLargeScreen() {
    const [isLarge, setIsLarge] = useState(false);
  
    useEffect(() => {
      const mediaQuery = window.matchMedia("(min-width: 1024px)");
  
      const handleChange = () => {
        setIsLarge(mediaQuery.matches);
      };
  
      handleChange();
  
      mediaQuery.addEventListener("change", handleChange);
  
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }, []);
  
    return isLarge;
  }
  function CollapsibleGroup({
    title,
    defaultOpen = false,
    children,
  }: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }) {
    const isLargeScreen = useIsLargeScreen();
    const [open, setOpen] = useState(defaultOpen);
  
    useEffect(() => {
      setOpen(isLargeScreen ? true : defaultOpen);
    }, [isLargeScreen, defaultOpen]);
  
    return (
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="text-[12px] font-black uppercase tracking-[0.14em] text-slate-900">
            {title}
          </span>
  
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-sky-500" />
          </motion.div>
        </button>
  
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }
const STANDARD_ADDONS = [
  { label: "Inside fridge", price: 15, image: "/images/standard/modernfridge.png" },
  { label: "Inside oven", price: 20, image: "/images/standard/modernoven.png" },
  { label: "Laundry fold", price: 25, image: "/images/standard/towel.png" },
  { label: "Windows", price: 30, image: "/images/standard/window.png" },
] as const;

type StandardAddonLabel = (typeof STANDARD_ADDONS)[number]["label"];

type StandardPreviewImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

const STANDARD_GALLERY_DEFAULT_WIDTH = 320;
const STANDARD_GALLERY_DEFAULT_HEIGHT = 240;

function getStandardGalleryDimensions(img: StandardPreviewImage) {
  return {
    width: img.width ?? STANDARD_GALLERY_DEFAULT_WIDTH,
    height: img.height ?? STANDARD_GALLERY_DEFAULT_HEIGHT,
  };
}

const STANDARD_PREVIEW_IMAGES = {
  default: [
    { src: "/images/standard/bed.png", alt: "Bedroom" },
    {
      src: "/images/standard/shower1.png",
      alt: "Bathroom",
      width: 100,
      height: 100,
    },
  ] satisfies StandardPreviewImage[],
  addons: {
    "Inside fridge": { src: "/images/standard/modernfridge.png", alt: "Clean refrigerator interior" , 
    width: 90, height: 90,},
    "Inside oven": { src: "/images/standard/modernoven.png", alt: "Clean oven interior" , width: 90, height: 90,},
    "Laundry fold": { src: "/images/standard/towel.png", alt: "Folded laundry" , width: 90, height: 90,},
    Windows: { src: "/images/standard/window.png", alt: "Clean windows", width: 90, height: 90,},
  } satisfies Record<StandardAddonLabel, StandardPreviewImage>,
};

function buildStandardGalleryImages(selectedAddons: Set<string>): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...STANDARD_PREVIEW_IMAGES.default];
  for (const addon of STANDARD_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(STANDARD_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}

function StandardGalleryImageCard({ img }: { img: StandardPreviewImage }) {
  const { width, height } = getStandardGalleryDimensions(img);
  const hasCustomSize = img.width != null || img.height != null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.35, ease: MOTION_EASE }}
      className={[
        "relative overflow-hidden  ",
        hasCustomSize ? "mx-auto max-w-full shrink-0" : "aspect-[4/3] w-full",
      ].join(" ")}
      style={hasCustomSize ? { width, height } : undefined}
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        sizes="(min-width: 1024px) 280px, 100vw"
        className="object-cover"
      />
    </motion.div>
  );
}

function DynamicServiceGallery({
  galleryKey,
  images,
  isDefaultOnly,
}: {
  galleryKey: string;
  images: StandardPreviewImage[];
  isDefaultOnly: boolean;
}) {
  return (
    <motion.div
      key={galleryKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: MOTION_EASE }}
      className={`flex min-h-0 flex-1 flex-col ${
        isDefaultOnly ? "justify-center" : "justify-start"
      }`}
    >
      <div
        className={
          isDefaultOnly
            ? "mx-auto flex w-full max-w-[320px] flex-col gap-3"
            : "grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2"
        }
      >
        <AnimatePresence mode="popLayout">
          {images.map((img) => (
            <StandardGalleryImageCard key={img.src} img={img} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const DEEP_CLEAN_ADDONS = [
  { label: "Wall Trim", price: 35, image: "/images/deepclean/baseboard.png" },
  { label: "Inside cabinets", price: 40, image: "/images/deepclean/cabinet.png" },
  { label: "Wall scrub", price: 30, image: "/images/deepclean/wall.png" },
  { label: "Carpet steam", price: 45, image: "/images/deepclean/carpet1.png" },
] as const;

type DeepCleanAddonLabel = (typeof DEEP_CLEAN_ADDONS)[number]["label"];

const DEEP_CLEAN_PREVIEW_IMAGES = {
  default: [
    { src: "/images/vacium/vacuum.png", alt: "Deep cleaning service" , width: 180, height: 140,},
  ] satisfies StandardPreviewImage[],
  addons: {
    "Wall Trim": { src: "/images/deepclean/baseboard.png", alt: "Wall trim cleaning", width: 90, height: 90 },
    "Inside cabinets": { src: "/images/deepclean/cabinet.png", alt: "Clean cabinet interior" , width: 90, height: 90,},
    "Wall scrub": { src: "/images/deepclean/wall.png", alt: "Wall scrub cleaning" , width: 90, height: 90,},
    "Carpet steam": { src: "/images/deepclean/carpet1.png", alt: "Carpet steam cleaning" , width: 90, height: 90,},
  } satisfies Record<DeepCleanAddonLabel, StandardPreviewImage>,
};  

function buildDeepCleanGalleryImages(selectedAddons: Set<string>): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...DEEP_CLEAN_PREVIEW_IMAGES.default];
  for (const addon of DEEP_CLEAN_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(DEEP_CLEAN_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}

const MOVE_OUT_ADDONS = [
  { label: "Carpet steam", price: 50, image: "/images/deepclean/carpet1.png" },
  { label: "Patch & paint", price: 40, image: "/images/moveout/paint.png" },
  { label: "Window wash", price: 35, image: "/images/moveout/window.png" },
  { label: "Garage clean", price: 60, image: "/images/moveout/garage.png" },
] as const;

type MoveOutAddonLabel = (typeof MOVE_OUT_ADDONS)[number]["label"];

const MOVE_OUT_PREVIEW_IMAGES = {
  default: [
    {
      src: "/images/moveout/moveout.png",
      alt: "Move-out cleaning service",
    },
  ] satisfies StandardPreviewImage[],
  addons: {
    "Carpet steam": {
      src: "/images/deepclean/carpet1.png",
      alt: "Carpet steam cleaning",
      width: 90,
      height: 90,
    },
    "Patch & paint": {
      src: "/images/moveout/paint.png",
      alt: "Patch and paint service",
      width: 90,
      height: 90,
    },
    "Window wash": {
      src: "/images/moveout/window.png",
      alt: "Window washing service",
      width: 90,
      height: 90,
    },
    "Garage clean": {
      src: "/images/moveout/garage.png",
      alt: "Garage cleaning service",
      width: 90,
      height: 90,
    },
  } satisfies Record<MoveOutAddonLabel, StandardPreviewImage>,
};

function buildMoveOutGalleryImages(selectedAddons: Set<string>): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...MOVE_OUT_PREVIEW_IMAGES.default];
  for (const addon of MOVE_OUT_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(MOVE_OUT_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}

const COMMERCIAL_ADDONS = [
  { label: "Floor wax", price: 60, image: "/images/commercial/wax.png" },
  { label: "Pressure wash", price: 45, image: "/images/commercial/pressure.png" },
  { label: "Window ext.", price: 55, image: "/images/commercial/windowext.png" },
  { label: "Sanitize", price: 40, image: "/images/commercial/sanitize.png" },
] as const;

type CommercialAddonLabel = (typeof COMMERCIAL_ADDONS)[number]["label"];

const COMMERCIAL_PREVIEW_IMAGES = {
  default: [
    {
      src: "/images/commercial/commercial.png",
      alt: "Commercial cleaning service",
    },
  ] satisfies StandardPreviewImage[],
  addons: {
    "Floor wax": {
      src: "/images/commercial/wax.png",
      alt: "Floor waxing service",
      width: 220,
      height: 100,
 
    },
    "Pressure wash": {
      src: "/images/commercial/pressure.png",
      alt: "Pressure washing service",
    },
    "Window ext.": {
      src: "/images/commercial/windowext.png",
      alt: "Exterior window cleaning",
    },
    Sanitize: {
      src: "/images/commercial/sanitize.png",
      alt: "Commercial sanitizing service",
    },
  } satisfies Record<CommercialAddonLabel, StandardPreviewImage>,
};

function buildCommercialGalleryImages(selectedAddons: Set<string>): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...COMMERCIAL_PREVIEW_IMAGES.default];
  for (const addon of COMMERCIAL_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(COMMERCIAL_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}

// ── Service panels ─────────────────────────────────────────────────────────────
function StandardPanel({
    onPrice,
    frequency,
    onFrequencyChange,
    selectedAddons,
    onSelectedAddonsChange,
  }: {
    onPrice: (p: ReturnType<typeof calc>) => void;
    frequency: string;
    onFrequencyChange: (frequency: string) => void;
    selectedAddons: Set<string>;
    onSelectedAddonsChange: (addons: Set<string>) => void;
  }) {
  const [bedIdx,  setBedIdx]  = useState(1);
  const [bathIdx, setBathIdx] = useState(0);
  const FREQS = [
    { label: "One-time",  discount: 0  },
    { label: "Bi-weekly", discount: 10 },
    { label: "Weekly",    discount: 15 },
    { label: "Monthly",   discount: 5  },
  ];
  const freqIdx = FREQS.findIndex(
    (item) => item.label === frequency
  );


  const BEDS = ["Studio", "1 bed", "2 bed", "3 bed", "4+ bed"];

  const toggle = useCallback(
    (label: StandardAddonLabel) => {
      const next = new Set(selectedAddons);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      onSelectedAddonsChange(next);
    },
    [selectedAddons, onSelectedAddonsChange],
  );
  const addonTotal = STANDARD_ADDONS.reduce(
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(() => {
    const b =
    BED_BASE[bedIdx] +
    (BATH_VALS[bathIdx] - 1) * 18 +
    addonTotal;
  
  const discount =
    freqIdx >= 0 ? FREQS[freqIdx].discount : 0;
  
  onPrice(
    calc(
      Math.round(
        b * (1 - discount / 100)
      )
    )
  );


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
          {STANDARD_ADDONS.map((a) => (
            <Addon
              key={a.label}
              label={a.label}
              image={a.image}
              selected={selectedAddons.has(a.label)}
              onClick={() => toggle(a.label)}
            />
          ))}
        </div>
      </CollapsibleGroup>
    </div>
  );
}

function DeepCleanPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
}: {
  onPrice: (p: ReturnType<typeof calc>) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
}) {
  const [sizeIdx, setSize]   = useState(1);
  const [condIdx, setCond]   = useState(0);
  const SIZES  = ["Studio","1–2 bed","3–4 bed","5+ bed"];
  const CONDS  = ["Good","Needs work","Very dirty"];

  const toggle = useCallback(
    (label: DeepCleanAddonLabel) => {
      const next = new Set(selectedAddons);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      onSelectedAddonsChange(next);
    },
    [selectedAddons, onSelectedAddonsChange],
  );
  const addonTotal = DEEP_CLEAN_ADDONS.reduce(
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(() => onPrice(calc(DEEP_BASE[sizeIdx] + DEEP_COND[condIdx] + addonTotal)), [sizeIdx, condIdx, addonTotal, onPrice]);

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
          {DEEP_CLEAN_ADDONS.map((a) => (
            <Addon
              key={a.label}
              label={a.label}
              image={a.image}
              selected={selectedAddons.has(a.label)}
              onClick={() => toggle(a.label)}
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

function MoveOutPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
}: {
  onPrice: (p: ReturnType<typeof calc>) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
}) {
  const [typeIdx, setType]   = useState(0);
  const [sqftIdx, setSqft]   = useState(1);
  const TYPES  = ["Apartment","Condo","House","Studio"];
  const SQFTS  = ["Under 500","500–1000","1000–1500","1500+"];

  const toggle = useCallback(
    (label: MoveOutAddonLabel) => {
      const next = new Set(selectedAddons);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      onSelectedAddonsChange(next);
    },
    [selectedAddons, onSelectedAddonsChange],
  );
  const addonTotal = MOVE_OUT_ADDONS.reduce(
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(() => onPrice(calc(MO_BASE[sqftIdx] + addonTotal)), [sqftIdx, addonTotal, onPrice]);

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
          {MOVE_OUT_ADDONS.map((a) => (
            <Addon
              key={a.label}
              label={a.label}
              image={a.image}
              selected={selectedAddons.has(a.label)}
              onClick={() => toggle(a.label)}
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

function CommercialPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
}: {
  onPrice: (p: ReturnType<typeof calc>) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
}) {
    const [typeIdx, setType] = useState(0);
    const [sqftIdx, setSqft] = useState(0);
    const [schedIdx, setSched] = useState(3);
    const [timingIdx, setTiming] = useState(-1);
    const [contractIdx, setContract] = useState(0); // No contract default

  const TYPES     = ["Office","Retail","Restaurant","Medical","Gym"];
  const SQFTS     = ["Under 1k","1k–2.5k","2.5k–5k","5k+"];
  const SCHEDS    = [{ label: "Daily", mult: 1.4 }, { label: "3x/week", mult: 1 }, { label: "Weekly", mult: .7 }, { label: "One-time", mult: .5 }];
  const TIMINGS   = ["Before open","After close","Weekend"];
  const CONTRACTS = ["No contract","3 months","6 months","Annual"];

  const toggle = useCallback(
    (label: CommercialAddonLabel) => {
      const next = new Set(selectedAddons);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      onSelectedAddonsChange(next);
    },
    [selectedAddons, onSelectedAddonsChange],
  );
  const addonTotal = COMMERCIAL_ADDONS.reduce(
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(
    () => onPrice(calc(Math.round((COM_BASE[sqftIdx] + addonTotal) * SCHEDS[schedIdx].mult))),
    [sqftIdx, schedIdx, addonTotal, onPrice],
  );

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
          {COMMERCIAL_ADDONS.map((a) => (
            <Addon
              key={a.label}
              label={a.label}
              image={a.image}
              selected={selectedAddons.has(a.label)}
              onClick={() => toggle(a.label)}
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
  { image: "/images/standard/bed.png", label: "Standard",  photo: "/images/booking/Designer(9).png", headline: <>Find the right cleaner<br />from Boston's best<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book now"            },
  { image: "/images/vacium/vacuum.png",        label: "Deep clean", photo: "/images/boston.jpg", headline: <>Book a deep clean<br />that actually goes deep<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book deep clean"     },
  { image: "/images/moveout/moveout.png",          label: "Move-out",   photo: "/images/boston.jpg", headline: <>Leave spotless.<br />Get your deposit back<span style={{ color: K.blue }}>.</span></>,        bookLabel: "Book move-out clean" },
  { image: "/images/commercial/commercial.png",        label: "Commercial", photo: "/images/boston.jpg", headline: <>Professional cleaning<br />for your business<span style={{ color: K.blue }}>.</span></>,      bookLabel: "Get a quote"         },
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

  const [frequency, setFrequency] = useState("One-time");
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [standardSelectedAddons, setStandardSelectedAddons] = useState<Set<string>>(new Set());

  const handleStandardAddonsChange = useCallback((addons: Set<string>) => {
    setStandardSelectedAddons(new Set(addons));
  }, []);

  const [deepCleanSelectedAddons, setDeepCleanSelectedAddons] = useState<Set<string>>(new Set());

  const handleDeepCleanAddonsChange = useCallback((addons: Set<string>) => {
    setDeepCleanSelectedAddons(new Set(addons));
  }, []);

  const standardGalleryImages = useMemo(
    () => buildStandardGalleryImages(standardSelectedAddons),
    [standardSelectedAddons],
  );
  const isDefaultGalleryOnly = standardGalleryImages.length === 2;

  const deepCleanGalleryImages = useMemo(
    () => buildDeepCleanGalleryImages(deepCleanSelectedAddons),
    [deepCleanSelectedAddons],
  );
  const isDeepCleanDefaultGalleryOnly = deepCleanGalleryImages.length === 1;

  const [moveOutSelectedAddons, setMoveOutSelectedAddons] = useState<Set<string>>(new Set());

  const handleMoveOutAddonsChange = useCallback((addons: Set<string>) => {
    setMoveOutSelectedAddons(new Set(addons));
  }, []);

  const moveOutGalleryImages = useMemo(
    () => buildMoveOutGalleryImages(moveOutSelectedAddons),
    [moveOutSelectedAddons],
  );
  const isMoveOutDefaultGalleryOnly = moveOutGalleryImages.length === 1;

  const [commercialSelectedAddons, setCommercialSelectedAddons] = useState<Set<string>>(new Set());

  const handleCommercialAddonsChange = useCallback((addons: Set<string>) => {
    setCommercialSelectedAddons(new Set(addons));
  }, []);

  const commercialGalleryImages = useMemo(
    () => buildCommercialGalleryImages(commercialSelectedAddons),
    [commercialSelectedAddons],
  );
  const isCommercialDefaultGalleryOnly = commercialGalleryImages.length === 1;

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
    selectedAddons={standardSelectedAddons}
    onSelectedAddonsChange={handleStandardAddonsChange}
  /> ,
    <DeepCleanPanel
    key="deep"
    onPrice={setPrices}
    selectedAddons={deepCleanSelectedAddons}
    onSelectedAddonsChange={handleDeepCleanAddonsChange}
  />,
    <MoveOutPanel
    key="mo"
    onPrice={setPrices}
    selectedAddons={moveOutSelectedAddons}
    onSelectedAddonsChange={handleMoveOutAddonsChange}
  />,
    <CommercialPanel
    key="com"
    onPrice={setPrices}
    selectedAddons={commercialSelectedAddons}
    onSelectedAddonsChange={handleCommercialAddonsChange}
  />,
  ];


  const summaryExtras =
  serviceIdx === 0
    ? Array.from(standardSelectedAddons)
    : serviceIdx === 1
    ? Array.from(deepCleanSelectedAddons)
    : serviceIdx === 2
    ? Array.from(moveOutSelectedAddons)
    : Array.from(commercialSelectedAddons);


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
            text-black
            dark:text-black
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
                  className={[
                    "group relative flex min-w-[145px] shrink-0 snap-start items-center gap-3",
                    "rounded-2xl px-3.5 py-3 text-left transition-all duration-300",
                    "sm:min-w-[118px] sm:flex-col sm:items-center sm:gap-2.5",
                    "sm:rounded-b-none sm:rounded-t-[20px] sm:px-4 sm:py-3.5",
                    active
                      ? "z-[2] border-x border-t border-neutral-200 bg-white shadow-[0_-4px_20px_rgba(12,26,46,0.06)]"
                      : "z-[1] border border-transparent bg-slate-50 hover:bg-white hover:shadow-md",
                  ].join(" ")}
                  style={{
                    cursor: "pointer",
                    marginBottom: active ? -1 : 0,
                  }}
                >
                  <div
                    className={[
                      "grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-all duration-300",
                      active
                        ? " ring-1 ring-sky-100"
                        : " group-hover:ring-1 group-hover:ring-sky-100",
                    ].join(" ")}
                  >
                    <Image
                      src={s.image}
                      alt={s.label}
                      width={42}
                      height={42}
                      className="transition-transform duration-300 group-hover:scale-105"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
              
                  <span
                    className={[
                      "truncate text-sm font-black uppercase tracking-[0.08em] transition-colors duration-200",
                      "sm:whitespace-nowrap sm:text-[12px]",
                      active ? "text-slate-950" : "text-slate-500 group-hover:text-slate-900",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
              
                  {active && (
                    <motion.div
                      layoutId="service-active-line"
                      className="absolute bottom-0 left-4 right-4 hidden h-[3px] rounded-full bg-sky-500 sm:block"
                      transition={{ duration: 0.25 }}
                    />
                  )}
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
            className="relative z-[1] overflow-visible rounded-b-[24px] rounded-tr-[24px] border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(12,26,46,.04),0_18px_55px_rgba(12,26,46,.08)]"    >
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
        icon={<MapPin size={20} />}
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
        icon={<Calendar size={20} />}
        label="Date"
        value={date ? formatDate(date) : "Select date"}
        active={dateOpen}
        onClick={handleDateField}
        placeholder={!frequency}
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
        icon={<Repeat size={20} />}
        label="Frequency"
        value={frequency || "Select frequency"}
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
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5 lg:hidden">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-black">
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
         
              <button
                type="button"
                className="flex hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer items-center gap-2 rounded-[10px] bg-sky-500/10 px-4 py-2"
                onClick={() => window.dispatchEvent(new Event("open-chatbot"))}
              >
                <IoChatbubblesOutline
                  size={20}
                  className="text-sky-500"
                />
                Chat with our Assistant
              </button>
  
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                {/* <div className="flex items-center justify-center gap-1.5 rounded-[] bg-emerald-50 px-3 py-1.5 sm:justify-start">
                  <div className="h-1.5 w-1.5 rounded-[] bg-emerald-600" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Licensed & insured
                  </span>
                </div> */}
  
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full cursor-pointer  border-none bg-sky-400 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(56,189,248,.35)] transition-colors duration-200 hover:bg-sky-500 sm:w-auto"
                >
                  {svc.bookLabel}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
  

  {/* right side */}
  <div className="hidden flex-col gap-6 lg:flex">
 {/* Booking Summary */}
 <motion.div
  initial="hidden"
  whileInView="visible"
  viewport={SCROLL_VIEWPORT}
  variants={slideRight}
  className="hidden lg:block"
>
  <BookingSummary
    service={svc.label}
    frequency={frequency}
    location={`${locCity}, ${locState}`}
    date={date}
    extras={summaryExtras}
    total={prices.mid}
  />
</motion.div>


          {/* Right Image Card */}
          <motion.div
  initial="hidden"
  whileInView="visible"
  viewport={SCROLL_VIEWPORT}
  variants={slideRight}
  className="hidden min-h-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:flex"
>
  {/* Estimate Header */}
  <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-4 lg:px-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Estimate Range
        </p>
       
      </div>

      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 py-2 bg-white shadow-sm">
        <PricePill label="Low" value={prices.low} />
        <div className="border-x border-slate-200 px-2">
          <PricePill label="Mid" value={prices.mid} accent />
        </div>
        <PricePill label="High" value={prices.high} />
      </div>
    </div>
  </div>

  {/* Gallery Area */}
  <div className="relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-white to-slate-50/70 p-5 lg:p-6">
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <AnimatePresence mode="wait">
        {serviceIdx === 0 ? (
          <DynamicServiceGallery
            galleryKey="standard-gallery"
            images={standardGalleryImages}
            isDefaultOnly={isDefaultGalleryOnly}
          />
        ) : serviceIdx === 1 ? (
          <DynamicServiceGallery
            galleryKey="deep-clean-gallery"
            images={deepCleanGalleryImages}
            isDefaultOnly={isDeepCleanDefaultGalleryOnly}
          />
        ) : serviceIdx === 2 ? (
          <DynamicServiceGallery
            galleryKey="move-out-gallery"
            images={moveOutGalleryImages}
            isDefaultOnly={isMoveOutDefaultGalleryOnly}
          />
        ) : (
          <DynamicServiceGallery
            galleryKey="commercial-gallery"
            images={commercialGalleryImages}
            isDefaultOnly={isCommercialDefaultGalleryOnly}
          />
        )}
      </AnimatePresence>
    </div>
  </div>
</motion.div>
       
  </div>
      </div>
    </motion.section>
  );
}