"use client";

import { useState, useCallback, useRef, useEffect, useMemo, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, MapPin, SlidersHorizontal } from "lucide-react";
import { MASSACHUSETTS_LOCATIONS } from "@/app/data/massachusettsLocations";
import { RHODE_ISLAND_LOCATIONS } from "@/app/data/rhodeIslandLocations";
import BookingSummary from "@/app/components/BookingSummary";
import { normalizeReferralCode, parseReferralCodeFromSearchParams } from "@/app/lib/referrals";
import {
  applyBookingPrefillOnce,
  formatSavedAddressForBooking,
  formatSavedAddressLabel,
  matchServiceAreaFromAddress,
  type BookingPrefill,
} from "@/app/lib/booking-prefill";
import { formatBookingTime } from "@/app/lib/scheduling-pure";
import { IoChatbubblesOutline } from "react-icons/io5";
import { useLocale, useTranslations } from "next-intl";
import { formatUsd, intlLocale } from "@/app/lib/i18n/format";
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
type PriceRange = ReturnType<typeof calc>;
type ServiceIndex = 0 | 1 | 2 | 3;

const BED_BASE  = [90, 120, 150, 180, 210];
const BATH_VALS = [1, 1.5, 2, 2.5, 3];
const STANDARD_BEDROOM_VALUES = [0, 1, 2, 3, 4] as const;
const DEEP_BASE = [160, 220, 300, 400];
const DEEP_COND = [0, 40, 80];
const MO_BASE   = [180, 240, 320, 420];
const COM_BASE  = [200, 320, 480, 700];

function calc(mid: number) {
  return { low: Math.round(mid * 0.85), mid, high: Math.round(mid * 1.18) };
}

type BookingSubmitStatus = "idle" | "loading" | "success" | "error";

type ReferralValidationState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; code: string; friendDiscountAmount: number }
  | { status: "invalid" };

function formatBookingDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBookingRoomCounts(
  serviceIdx: ServiceIndex,
  standardBedIdx: number,
  standardBathIdx: number,
) {
  if (serviceIdx !== 0) {
    return { bedrooms: 0, bathrooms: 0 };
  }

  return {
    bedrooms: STANDARD_BEDROOM_VALUES[standardBedIdx] ?? 0,
    bathrooms: Math.ceil(BATH_VALS[standardBathIdx] ?? 1),
  };
}

const bookingInputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const MONTHS       = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW          = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const DOW_SHORT    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatDate(d: Date, locale = "en") {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toggleInSet<T>(set: Set<T>, value: T) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
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
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0,
            background: K.white,
            border: `1.5px solid ${K.border}`,
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
      {/* State tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${K.borderLight}` }}>
        {(["MA", "RI"] as StateKey[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStateChange(s);
            }}
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
              onClick={(e) => {
                e.stopPropagation();
                onCitySelect(loc.city, state);
              }}
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
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(-1);
            }}
            style={{
              width: 28, height: 28, borderRadius: 6,
              border: `1.5px solid ${K.border}`,
              background: K.white, cursor: "pointer", fontSize: 14,
              color: K.textSub, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>
          <span style={{ fontSize: 14, fontWeight: 800, color: K.text }}>{MONTHS[month]} {year}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(1);
            }}
            style={{
              width: 28, height: 28, borderRadius: 6,
              border: `1.5px solid ${K.border}`,
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
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(date);
                }}
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
  error = false, shakeKey = 0,
}: {
  icon: ReactNode; label: string; value: string; flex?: number;
  last?: boolean; active?: boolean; onClick?: () => void; placeholder?: boolean;
  error?: boolean; shakeKey?: number;
}) {
  return (
    <motion.div
      data-cursor-pointer="pointer"
      onClick={onClick}
      animate={
        shakeKey > 0
          ? { x: [0, -6, 6, -5, 5, -2, 2, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cx(
        "relative flex w-full min-w-0 cursor-pointer items-center gap-2.5 self-stretch bg-white px-3.5 py-3 transition-colors duration-200",
        "sm:min-h-0 sm:h-full sm:px-4 sm:py-0",
        "max-sm:rounded-xl  max-sm:shadow-sm",
        error ? "sm:bg-red-50/40" : active ? "sm:bg-white" : "hover:bg-slate-50/80",
      )}
      style={{ flex }}
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          error ? "bg-red-50" : "bg-slate-50"
        } ${error ? "text-red-500" : active ? "text-sky-500" : "text-slate-900"}`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-0">
        <span
          className={`block text-[10px] font-semibold uppercase tracking-[0.08em] leading-none sm:text-[10px] ${
            error ? "text-red-500" : active ? "text-sky-500" : "text-slate-400"
          }`}
        >
          {label}
        </span>
        <span
  className={`block whitespace-normal text-sm font-semibold leading-tight tracking-tight sm:truncate sm:text-sm ${
    placeholder ? (error ? "text-red-400" : "text-slate-400") : "text-slate-900"
  }`}
>
  {value}
</span>
      </div>
    </motion.div>
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
        className={cx(
          "cursor-pointer rounded-[5px] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all duration-200",
          selected
            ? " bg-sky-50 text-sky-600 shadow-sm"
            : "border border-neutral-200 bg-white text-slate-500 shadow-sm  hover:text-sky-500 hover:shadow-md",
        )}
      >
        {label}
      </motion.button>
    );
  }

// ── Addon ─────────────────────────────────────────────────────────────────────
function Addon({
  label,
  displayLabel,
  image,
  selected,
  onClick,
}: {
  label: string;
  displayLabel?: string;
  image: string;
  selected?: boolean;
  onClick: () => void;
}) {
  const shown = displayLabel ?? label;
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cx(
          "flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left outline-none transition-all duration-200",
          selected
            ? " bg-sky-50 shadow-sm"
            : " bg-white shadow-sm hover:shadow-md",
        )}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <Image
            src={image}
            alt={shown}
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
          {shown}
        </span>
      </motion.button>
    );
  }

// ── Price pill ────────────────────────────────────────────────────────────────


type PricedAddon<L extends string = string> = {
  label: L;
  price: number;
  image: string;
};

function ChipGroup({
  options,
  selectedIndex,
  onSelect,
  className = "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap",
  getDisplayLabel,
}: {
  options: readonly string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
  getDisplayLabel?: (option: string) => string;
}) {
  return (
    <div className={className}>
      {options.map((option, index) => (
        <Chip
          key={option}
          label={getDisplayLabel ? getDisplayLabel(option) : option}
          selected={selectedIndex === index}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

function AddonGrid<L extends string>({
  addons,
  selectedAddons,
  onToggle,
  getDisplayLabel,
}: {
  addons: readonly PricedAddon<L>[];
  selectedAddons: Set<string>;
  onToggle: (label: L) => void;
  getDisplayLabel?: (label: string) => string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {addons.map((addon) => (
        <Addon
          key={addon.label}
          label={addon.label}
          displayLabel={getDisplayLabel?.(addon.label)}
          image={addon.image}
          selected={selectedAddons.has(addon.label)}
          onClick={() => onToggle(addon.label)}
        />
      ))}
    </div>
  );
}

function PricePill({ label, value, accent, locale = "en" }: { label: string; value: number; accent?: boolean; locale?: string }) {
  const display = formatUsd(value, locale);
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
      border: `1.5px solid ${K.noticeBorder}`,
      borderRadius: 10, padding: "12px 16px",
      display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <i className="ti ti-info-circle" style={{ fontSize: 16, color: K.blue, marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
      <p style={{ fontSize: 12, color: K.noticeText, fontWeight: 500, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

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
      <section className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_4px_10px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_8px_16px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3.5 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-900">
            {title}
          </span>
  
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-sky-500" />
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
              <div className="px-4 pb-4">{children}</div>
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
    { src: "/images/standard/Designer(15).png", alt: "Bedroom" },
    {
      src: "/images/standard/Designer(20).png",
      alt: "Bathroom",
      width: 200,
      height: 220,
    
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
      className="flex items-center justify-center overflow-hidden"
    >
      <div
        className="relative max-w-full"
        style={
          hasCustomSize
            ? {
                width,
                height,
              }
            : {
                width: "100%",
                maxWidth: 260,
                aspectRatio: "4 / 3",
              }
        }
      >
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 240px, 50vw"
          className="object-contain"
        />
      </div>
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
            : "grid w-full grid-cols-2 items-start gap-x-6 gap-y-5 overflow-y-auto pr-1"
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
    { src: "/images/deepclean/Designer(19).png", alt: "Deep cleaning service", 
    width: 300,
    height: 300,
    },
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


const ADDON_DISPLAY_KEYS: Record<string, string> = {
  "Inside fridge": "insideFridge",
  "Inside oven": "insideOven",
  "Laundry fold": "laundryFold",
  Windows: "windows",
  "Wall Trim": "wallTrim",
  "Inside cabinets": "insideCabinets",
  "Wall scrub": "wallScrub",
  "Carpet steam": "carpetSteam",
  "Patch & paint": "patchPaint",
  "Window wash": "windowWash",
  "Garage clean": "garageClean",
  "Floor wax": "floorWax",
  "Pressure wash": "pressureWash",
  "Window ext.": "windowExt",
  Sanitize: "sanitize",
};

const FREQ_DISPLAY_KEYS: Record<string, string> = {
  "One-time": "oneTime",
  "Bi-weekly": "biWeekly",
  Weekly: "weekly",
  Monthly: "monthly",
  Daily: "daily",
  "3x/week": "threeXWeek",
};

// ── Service panels ─────────────────────────────────────────────────────────────
function StandardPanel({
    onPrice,
    frequency,
    onFrequencyChange,
    selectedAddons,
    onSelectedAddonsChange,
    bedIdx,
    bathIdx,
    onBedIdxChange,
    onBathIdxChange,
  }: {
    onPrice: (p: PriceRange) => void;
    frequency: string;
    onFrequencyChange: (frequency: string) => void;
    selectedAddons: Set<string>;
    onSelectedAddonsChange: (addons: Set<string>) => void;
    bedIdx: number;
    bathIdx: number;
    onBedIdxChange: (index: number) => void;
    onBathIdxChange: (index: number) => void;
  }) {
  const t = useTranslations("booking");
  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };
  const translateFreq = (label: string) => {
    const key = FREQ_DISPLAY_KEYS[label];
    return key ? t(key as "oneTime") : label;
  };
  const FREQS = [
    { label: "One-time",  discount: 0  },
    { label: "Bi-weekly", discount: 10 },
    { label: "Weekly",    discount: 15 },
    { label: "Monthly",   discount: 5  },
  ];
  const freqIdx = FREQS.findIndex(
    (item) => item.label === frequency
  );


  const BEDS = [t("studio"), t("oneRoom"), t("twoRooms"), t("threeRooms"), t("fourPlusRooms")];

  const toggle = useCallback(
    (label: StandardAddonLabel) => {
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
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
      <CollapsibleGroup title={t("bedrooms")} defaultOpen>
<ChipGroup options={BEDS} selectedIndex={bedIdx} onSelect={onBedIdxChange} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title={t("bathrooms")} defaultOpen>
<ChipGroup options={BATH_VALS.map(String)} selectedIndex={bathIdx} onSelect={onBathIdxChange} className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap" />
      </CollapsibleGroup>
  
      <CollapsibleGroup title={t("frequency")}>
<ChipGroup options={FREQS.map((f) => f.label)} selectedIndex={freqIdx} onSelect={(index) => onFrequencyChange(FREQS[index].label)} getDisplayLabel={translateFreq} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title={t("addOns")}>
<AddonGrid addons={STANDARD_ADDONS} selectedAddons={selectedAddons} onToggle={toggle} getDisplayLabel={translateAddon} />
      </CollapsibleGroup>
    </div>
  );
}

function DeepCleanPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
}: {
  onPrice: (p: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
}) {
  const t = useTranslations("booking");
  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };
  const [sizeIdx, setSize]   = useState(1);
  const [condIdx, setCond]   = useState(0);
  const SIZES  = ["Studio","1–2 bed","3–4 bed","5+ bed"];
  const CONDS  = ["Good","Needs work","Very dirty"];

  const toggle = useCallback(
    (label: DeepCleanAddonLabel) => {
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
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
<ChipGroup options={SIZES} selectedIndex={sizeIdx} onSelect={setSize} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Condition" defaultOpen>
<ChipGroup options={CONDS} selectedIndex={condIdx} onSelect={setCond} className="grid grid-cols-1 gap-2 sm:grid-cols-3" />
      </CollapsibleGroup>
  
      <CollapsibleGroup title={t("deepCleanExtras")}>
<AddonGrid addons={DEEP_CLEAN_ADDONS} selectedAddons={selectedAddons} onToggle={toggle} getDisplayLabel={translateAddon} />
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
  onPrice: (p: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
}) {
  const t = useTranslations("booking");
  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };
  const [typeIdx, setType]   = useState(0);
  const [sqftIdx, setSqft]   = useState(1);
  const TYPES  = ["Apartment","Condo","House","Studio"];
  const SQFTS  = ["Under 500","500–1000","1000–1500","1500+"];

  const toggle = useCallback(
    (label: MoveOutAddonLabel) => {
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
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
<ChipGroup options={TYPES} selectedIndex={typeIdx} onSelect={setType} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Square footage" defaultOpen>
<ChipGroup options={SQFTS} selectedIndex={sqftIdx} onSelect={setSqft} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title={t("moveOutExtras")}>
<AddonGrid addons={MOVE_OUT_ADDONS} selectedAddons={selectedAddons} onToggle={toggle} getDisplayLabel={translateAddon} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Deposit Protection">
        <div className="rounded-2xl  bg-sky-50 p-4">
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
  onPrice: (p: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
}) {
  const t = useTranslations("booking");
  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };
  const translateFreq = (label: string) => {
    const key = FREQ_DISPLAY_KEYS[label];
    return key ? t(key as "oneTime") : label;
  };
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
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
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
<ChipGroup options={TYPES} selectedIndex={typeIdx} onSelect={setType} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Square footage" defaultOpen>
<ChipGroup options={SQFTS} selectedIndex={sqftIdx} onSelect={setSqft} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title={t("schedule")} defaultOpen>
<ChipGroup options={SCHEDS.map((s) => s.label)} selectedIndex={schedIdx} onSelect={setSched} getDisplayLabel={translateFreq} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title={t("addOns")}>
<AddonGrid addons={COMMERCIAL_ADDONS} selectedAddons={selectedAddons} onToggle={toggle} getDisplayLabel={translateAddon} />
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Timing">
<ChipGroup options={TIMINGS} selectedIndex={timingIdx} onSelect={setTiming} className="grid grid-cols-1 gap-2 sm:grid-cols-3" />
      </CollapsibleGroup>
  
      <CollapsibleGroup title="Contract">
<ChipGroup options={CONTRACTS} selectedIndex={contractIdx} onSelect={setContract} />
      </CollapsibleGroup>
    </div>
  );
}

// ── Service config ─────────────────────────────────────────────────────────────
const SERVICES = [
  { image: "/images/standard/Designer(15).png", label: "Standard",  photo: "/images/booking/Designer(9).png", headline: <>Find the right cleaner<br />from Boston's best<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book now"            },
  { image: "/images/deepclean/Designer(19).png",        label: "Deep clean", photo: "/images/boston.jpg", headline: <>Book a deep clean<br />that actually goes deep<span style={{ color: K.blue }}>.</span></>,   bookLabel: "Book deep clean"     },
  { image: "/images/moveout/moveout.png",          label: "Move-out",   photo: "/images/boston.jpg", headline: <>Leave spotless.<br />Get your deposit back<span style={{ color: K.blue }}>.</span></>,        bookLabel: "Book move-out clean" },
  { image: "/images/commercial/commercial.png",        label: "Commercial", photo: "/images/boston.jpg", headline: <>Professional cleaning<br />for your business<span style={{ color: K.blue }}>.</span></>,      bookLabel: "Book commercial clean"         },
];

// ── Booking modal (rendered through a portal) ──────────────────────────────────
function BookingModal({
  open,
  svc,
  bookingStatus,
  bookingErrorMessage,
  contactName,
  contactEmail,
  contactMobile,
  contactNotes,
  referralCode,
  referralCodeError,
  referralValidation,
  referralDiscountAmount,
  estimatedTotalAfterDiscount,
  prices,
  locationSummary,
  bookingPrefill,
  locationMode,
  selectedAddressId,
  emailReadOnly,
  bookingTime,
  bookingTimeLabel,
  onClose,
  onSubmit,
  onNameChange,
  onEmailChange,
  onMobileChange,
  onNotesChange,
  onReferralCodeChange,
  onSelectSavedAddress,
  onSelectManualLocation,
}: {
  open: boolean;
  svc: (typeof SERVICES)[number];
  bookingStatus: BookingSubmitStatus;
  bookingErrorMessage: string;
  contactName: string;
  contactEmail: string;
  contactMobile: string;
  contactNotes: string;
  referralCode: string;
  referralCodeError: string;
  referralValidation: ReferralValidationState;
  referralDiscountAmount: number;
  estimatedTotalAfterDiscount: number;
  prices: PriceRange;
  locationSummary: string;
  bookingPrefill: BookingPrefill | null;
  locationMode: "saved" | "manual";
  selectedAddressId: string | null;
  emailReadOnly: boolean;
  bookingTime: string | null;
  bookingTimeLabel: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onReferralCodeChange: (value: string) => void;
  onSelectSavedAddress: (addressId: string) => void;
  onSelectManualLocation: () => void;
}) {
  const tBooking = useTranslations("booking");
  const tEstimate = useTranslations("estimate");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while the modal is open so the fixed backdrop never
  // appears to "scroll away" on mobile browsers.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: MOTION_EASE }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 sm:p-7"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-form-title"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="mb-5 pr-8">
              <h3
                id="booking-form-title"
                className="text-xl font-bold text-slate-900"
              >
                {svc.bookLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Share your contact details and we&apos;ll confirm your{" "}
                {svc.label.toLowerCase()} request.
              </p>
            </div>

            {bookingStatus === "success" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  Thanks! Your booking request was submitted successfully.
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full cursor-pointer rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {bookingPrefill && (
                  <p className="text-sm text-slate-500">
                    Using your Saskia profile ·{" "}
                    <Link
                      href="/account/profile"
                      className="font-medium text-sky-600 underline-offset-2 hover:underline"
                    >
                      Manage profile
                    </Link>
                  </p>
                )}

                <div>
                  <label
                    htmlFor="booking-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("fullName")}
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(event) => onNameChange(event.target.value)}
                    className={bookingInputClassName}
                    placeholder={tBooking("yourName")}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("email")}
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(event) => onEmailChange(event.target.value)}
                    className={`${bookingInputClassName}${
                      emailReadOnly ? " bg-slate-50 text-slate-700" : ""
                    }`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    readOnly={emailReadOnly}
                    aria-readonly={emailReadOnly || undefined}
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-mobile"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("mobile")}
                  </label>
                  <input
                    id="booking-mobile"
                    type="tel"
                    value={contactMobile}
                    onChange={(event) => onMobileChange(event.target.value)}
                    className={bookingInputClassName}
                    placeholder="Phone number"
                    autoComplete="tel"
                  />
                  {bookingPrefill && !bookingPrefill.phone && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Save this in your profile for faster booking next time.
                    </p>
                  )}
                </div>

                {bookingPrefill && bookingPrefill.savedAddresses.length > 0 && (
                  <fieldset className="space-y-2">
                    <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service location
                    </legend>
                    <div className="space-y-2">
                      {bookingPrefill.savedAddresses.map((address) => {
                        const checked =
                          locationMode === "saved" &&
                          selectedAddressId === address.id;
                        return (
                          <label
                            key={address.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                              checked
                                ? "border-sky-300 bg-sky-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="booking-location-mode"
                              className="mt-1"
                              checked={checked}
                              onChange={() => onSelectSavedAddress(address.id)}
                            />
                            <span className="text-slate-700">
                              {formatSavedAddressLabel(address)}
                            </span>
                          </label>
                        );
                      })}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                          locationMode === "manual"
                            ? "border-sky-300 bg-sky-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="booking-location-mode"
                          className="mt-1"
                          checked={locationMode === "manual"}
                          onChange={onSelectManualLocation}
                        />
                        <span className="text-slate-700">
                          Enter another location
                          {locationMode === "manual" ? (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              Uses the city/state selected in the estimator
                              above.
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </div>
                    {!bookingPrefill.defaultAddress &&
                      locationMode === "manual" &&
                      !selectedAddressId && (
                        <p className="text-xs text-slate-500">
                          Choose a saved address or continue with the
                          estimator location.
                        </p>
                      )}
                  </fieldset>
                )}

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location on this booking
                  </span>
                  <p className="mt-1 font-medium text-slate-800">
                    {locationSummary}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Appointment time
                  </span>
                  <p className="mt-1 font-medium text-slate-800">
                    {bookingTimeLabel ?? tBooking("selectTimeAbove")}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="booking-referral-code"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Referral code
                  </label>
                  <input
                    id="booking-referral-code"
                    type="text"
                    value={referralCode}
                    onChange={(event) => onReferralCodeChange(event.target.value)}
                    className={`${bookingInputClassName}${
                      referralCodeError || referralValidation.status === "invalid"
                        ? " border-red-300 focus:border-red-400 focus:ring-red-100"
                        : referralValidation.status === "valid"
                          ? " border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                          : ""
                    }`}
                    placeholder="Have a referral code?"
                    autoComplete="off"
                    aria-invalid={
                      referralCodeError || referralValidation.status === "invalid"
                        ? true
                        : undefined
                    }
                    aria-describedby={
                      referralCodeError
                        ? "booking-referral-code-error"
                        : referralValidation.status === "invalid"
                          ? "booking-referral-code-validation"
                          : referralValidation.status === "valid"
                            ? "booking-referral-code-success"
                            : undefined
                    }
                  />
                  {referralValidation.status === "invalid" && !referralCodeError && (
                    <p
                      id="booking-referral-code-validation"
                      className="mt-1.5 text-sm font-medium text-red-600"
                    >
                      Invalid referral code.
                    </p>
                  )}
                  {referralCodeError && (
                    <p
                      id="booking-referral-code-error"
                      className="mt-1.5 text-sm font-medium text-red-600"
                    >
                      {referralCodeError}
                    </p>
                  )}
                  {referralValidation.status === "valid" && (
                    <div
                      id="booking-referral-code-success"
                      className="mt-3 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm"
                    >
                      <p className="font-medium text-emerald-800">
                        Referral applied: ${referralDiscountAmount} off your
                        first cleaning.
                      </p>
                      <div className="space-y-1 text-slate-700">
                        <div className="flex items-center justify-between gap-4">
                          <span>Original estimate</span>
                          <span className="font-semibold text-slate-900">
                            ${prices.mid}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-700">
                          <span>Referral discount</span>
                          <span className="font-semibold">
                            -${referralDiscountAmount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-emerald-200 pt-2 font-bold text-slate-900">
                          <span>Estimated total after discount</span>
                          <span>${estimatedTotalAfterDiscount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-notes"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="booking-notes"
                    rows={3}
                    value={contactNotes}
                    onChange={(event) => onNotesChange(event.target.value)}
                    className={`${bookingInputClassName} resize-none`}
                    placeholder="Access instructions, pets, special requests..."
                  />
                </div>

                {bookingStatus === "error" && bookingErrorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {bookingErrorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={bookingStatus === "loading"}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tBooking("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={bookingStatus === "loading"}
                    className="cursor-pointer rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(56,189,248,.35)] transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bookingStatus === "loading"
                      ? tBooking("submitting")
                      : tBooking("submitRequest")}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function CleaningEstimator({
  bookingPrefill = null,
}: {
  bookingPrefill?: BookingPrefill | null;
} = {}) {
  const t = useTranslations("booking");
  const tEstimate = useTranslations("estimate");
  const locale = useLocale();
  const [serviceIdx, setServiceIdx] = useState<ServiceIndex>(0);
  const [prices,     setPrices]     = useState({ low: 144, mid: 180, high: 216 });

  const [locState, setLocState] = useState<StateKey>("MA");
  const [locCity,  setLocCity]  = useState("Boston");
  const [locOpen,  setLocOpen]  = useState(false);
  // "Boston, MA" is only a pre-filled default, not a real user choice.
  // Customize is blocked until the user actively opens this field and
  // picks a city, even if they end up re-selecting Boston.
  const [locConfirmed, setLocConfirmed] = useState(false);

  const [date,     setDate]     = useState<Date | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ time: string; label: string }>
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const slotsRequestIdRef = useRef(0);

  const svc     = SERVICES[serviceIdx];
  const rootRef = useRef<HTMLElement>(null);

  // Drives the shake animation + inline error state on the Location/Date
  // fields when "Customize" is clicked before both are confirmed.
  const [locError, setLocError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [requiredFieldsMessage, setRequiredFieldsMessage] = useState("");

  const [frequency, setFrequency] = useState("One-time");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [standardBedIdx, setStandardBedIdx] = useState(1);
  const [standardBathIdx, setStandardBathIdx] = useState(0);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingSubmitStatus>("idle");
  const [bookingErrorMessage, setBookingErrorMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [locationMode, setLocationMode] = useState<"saved" | "manual">("manual");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const prefillAppliedRef = useRef(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCodeError, setReferralCodeError] = useState("");
  const [referralValidation, setReferralValidation] =
    useState<ReferralValidationState>({ status: "idle" });
  const [referralLinkCode, setReferralLinkCode] = useState<string | null>(null);
  const urlPrefilledReferralCode = useRef<string | null>(null);
  const [standardSelectedAddons, setStandardSelectedAddons] = useState<Set<string>>(new Set());

  const applyPrefillSnapshot = useCallback(
    (force = false) => {
      if (!force && prefillAppliedRef.current) return;

      if (!bookingPrefill) {
        if (force) {
          setContactName("");
          setContactEmail("");
          setContactMobile("");
          setLocationMode("manual");
          setSelectedAddressId(null);
        }
        prefillAppliedRef.current = true;
        return;
      }

      const result = applyBookingPrefillOnce({
        alreadyApplied: false,
        prefill: bookingPrefill,
      });
      setContactName(result.contact.name);
      setContactEmail(result.contact.email);
      setContactMobile(result.contact.phone);
      setLocationMode(result.locationMode);
      setSelectedAddressId(result.selectedAddressId);

      if (
        result.selectedAddressId &&
        bookingPrefill.defaultAddress &&
        result.selectedAddressId === bookingPrefill.defaultAddress.id
      ) {
        const matched = matchServiceAreaFromAddress(
          bookingPrefill.defaultAddress,
          LOCATIONS,
        );
        if (matched) {
          setLocCity(matched.city);
          setLocState(matched.state as StateKey);
          setLocConfirmed(true);
        }
      }

      prefillAppliedRef.current = true;
    },
    [bookingPrefill],
  );

  useEffect(() => {
    applyPrefillSnapshot(false);
  }, [applyPrefillSnapshot]);

  const handleSelectSavedAddress = useCallback(
    (addressId: string) => {
      const address = bookingPrefill?.savedAddresses.find((a) => a.id === addressId);
      setLocationMode("saved");
      setSelectedAddressId(addressId);
      if (address) {
        const matched = matchServiceAreaFromAddress(address, LOCATIONS);
        if (matched) {
          setLocCity(matched.city);
          setLocState(matched.state as StateKey);
          setLocConfirmed(true);
        }
      }
    },
    [bookingPrefill],
  );

  const handleSelectManualLocation = useCallback(() => {
    setLocationMode("manual");
    setSelectedAddressId(null);
  }, []);

  const bookingLocationSummary = useMemo(() => {
    if (locationMode === "saved" && selectedAddressId && bookingPrefill) {
      const address = bookingPrefill.savedAddresses.find(
        (entry) => entry.id === selectedAddressId,
      );
      if (address) return formatSavedAddressForBooking(address);
    }
    return `${locCity}, ${locState}`;
  }, [
    locationMode,
    selectedAddressId,
    bookingPrefill,
    locCity,
    locState,
  ]);

  const emailReadOnly = Boolean(bookingPrefill?.email);

  const selectedDateOnly = useMemo(
    () => (date ? formatBookingDateForApi(date) ?? null : null),
    [date],
  );

  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<
    number | null
  >(null);
  const [slotRefreshMessage, setSlotRefreshMessage] = useState("");

  const availabilityQuery = useMemo(() => {
    if (!selectedDateOnly) return null;
    const { bedrooms, bathrooms } = getBookingRoomCounts(
      serviceIdx,
      standardBedIdx,
      standardBathIdx,
    );
    const params = new URLSearchParams({
      date: selectedDateOnly,
      service: SERVICES[serviceIdx]!.label,
      bedrooms: String(bedrooms),
      bathrooms: String(bathrooms),
    });
    return params.toString();
  }, [selectedDateOnly, serviceIdx, standardBedIdx, standardBathIdx]);

  useEffect(() => {
    if (!availabilityQuery) {
      setAvailableSlots([]);
      setBookingTime(null);
      setSlotsLoading(false);
      setSlotsError("");
      setEstimatedDurationMinutes(null);
      return;
    }

    const requestId = ++slotsRequestIdRef.current;
    setSlotsLoading(true);
    setSlotsError("");
    setAvailableSlots([]);
    setBookingTime(null);
    setSlotRefreshMessage("");

    fetch(`/api/availability?${availabilityQuery}`)
      .then(async (response) => {
        const data = (await response.json()) as {
          slots?: Array<{ time: string; label: string }>;
          estimatedDurationMinutes?: number;
          error?: string;
        };
        if (requestId !== slotsRequestIdRef.current) return;
        if (!response.ok) {
          setSlotsError(data.error || "Could not load available times.");
          setAvailableSlots([]);
          setEstimatedDurationMinutes(null);
          return;
        }
        setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
        setEstimatedDurationMinutes(
          typeof data.estimatedDurationMinutes === "number"
            ? data.estimatedDurationMinutes
            : null,
        );
      })
      .catch(() => {
        if (requestId !== slotsRequestIdRef.current) return;
        setSlotsError("Could not load available times.");
        setAvailableSlots([]);
        setEstimatedDurationMinutes(null);
      })
      .finally(() => {
        if (requestId !== slotsRequestIdRef.current) return;
        setSlotsLoading(false);
      });
  }, [availabilityQuery]);

  const bookingTimeLabel = bookingTime
    ? availableSlots.find((s) => s.time === bookingTime)?.label ??
      formatBookingTime(bookingTime)
    : null;

  async function refreshSlotsForSelectedDate() {
    if (!availabilityQuery) return;
    const requestId = ++slotsRequestIdRef.current;
    setSlotsLoading(true);
    setSlotsError("");
    try {
      const response = await fetch(`/api/availability?${availabilityQuery}`);
      const data = (await response.json()) as {
        slots?: Array<{ time: string; label: string }>;
        estimatedDurationMinutes?: number;
        error?: string;
      };
      if (requestId !== slotsRequestIdRef.current) return;
      if (!response.ok) {
        setSlotsError(data.error || "Could not load available times.");
        setAvailableSlots([]);
        setBookingTime(null);
        setEstimatedDurationMinutes(null);
        return;
      }
      const nextSlots = Array.isArray(data.slots) ? data.slots : [];
      setAvailableSlots(nextSlots);
      setEstimatedDurationMinutes(
        typeof data.estimatedDurationMinutes === "number"
          ? data.estimatedDurationMinutes
          : null,
      );
      if (bookingTime && !nextSlots.some((s) => s.time === bookingTime)) {
        setBookingTime(null);
        setSlotRefreshMessage(
          "Please choose a new time for the updated service.",
        );
      }
    } catch {
      if (requestId !== slotsRequestIdRef.current) return;
      setSlotsError("Could not load available times.");
      setAvailableSlots([]);
      setBookingTime(null);
      setEstimatedDurationMinutes(null);
    } finally {
      if (requestId !== slotsRequestIdRef.current) return;
      setSlotsLoading(false);
    }
  }

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

  const activeGallery = useMemo(() => {
    const galleries = [
      { galleryKey: "standard-gallery", images: standardGalleryImages, isDefaultOnly: isDefaultGalleryOnly },
      { galleryKey: "deep-clean-gallery", images: deepCleanGalleryImages, isDefaultOnly: isDeepCleanDefaultGalleryOnly },
      { galleryKey: "move-out-gallery", images: moveOutGalleryImages, isDefaultOnly: isMoveOutDefaultGalleryOnly },
      { galleryKey: "commercial-gallery", images: commercialGalleryImages, isDefaultOnly: isCommercialDefaultGalleryOnly },
    ];

    return galleries[serviceIdx]!;
  }, [
    serviceIdx,
    standardGalleryImages,
    isDefaultGalleryOnly,
    deepCleanGalleryImages,
    isDeepCleanDefaultGalleryOnly,
    moveOutGalleryImages,
    isMoveOutDefaultGalleryOnly,
    commercialGalleryImages,
    isCommercialDefaultGalleryOnly,
  ]);

  const mobileSearchSummary = `${locCity}, ${locState} · ${date ? formatDate(date, locale) : t("selectDate")} · ${optionsOpen ? t("detailsOpen") : t("customize")}`;

  useEffect(() => {
    const prefilledReferralCode = parseReferralCodeFromSearchParams(
      window.location.search,
    );
    if (!prefilledReferralCode) return;

    urlPrefilledReferralCode.current = prefilledReferralCode;
    setReferralLinkCode(prefilledReferralCode);
    setReferralCode(prefilledReferralCode);
  }, []);

  useEffect(() => {
    const trimmed = referralCode.trim();
    if (!trimmed) {
      setReferralValidation({ status: "idle" });
      return;
    }

    const normalizedCode = normalizeReferralCode(referralCode);
    if (!normalizedCode) {
      setReferralValidation({ status: "idle" });
      return;
    }

    setReferralValidation({ status: "checking" });

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/referral-codes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: normalizedCode }),
        });

        const data = (await response.json()) as {
          valid?: boolean;
          code?: string;
          friendDiscountAmount?: number;
        };

        if (!response.ok) {
          setReferralValidation({ status: "idle" });
          return;
        }

        if (data.valid && data.code && data.friendDiscountAmount != null) {
          setReferralValidation({
            status: "valid",
            code: data.code,
            friendDiscountAmount: data.friendDiscountAmount,
          });
          return;
        }

        setReferralValidation({ status: "invalid" });
      } catch {
        setReferralValidation({ status: "idle" });
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [referralCode]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setLocOpen(false);
        setDateOpen(false);
      }
    }
    // Use "click" instead of "mousedown" so this fires in the same phase as
    // the row/day onClick handlers inside the dropdowns. Mixing mousedown
    // (here) with click (selection rows) created a race where the outside
    // handler could interfere before the selection click ever registered,
    // which is what made city/date selection appear to do nothing.
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  function handleLocField() {
    setDateOpen(false);
    setLocOpen((value) => !value);
  }
  function handleDateField() {
    setLocOpen(false);
    setDateOpen((value) => !value);
  }

  function handleCustomizeClick() {
    const missingLocation = !locConfirmed;
    const missingDate = !date;

    if (missingLocation || missingDate) {
      setLocOpen(false);
      setDateOpen(false);
      setLocError(missingLocation);
      setDateError(missingDate);
      setShakeKey((value) => value + 1);

      const missingLabels = [
        missingLocation ? "a location" : null,
        missingDate ? "a date" : null,
      ].filter(Boolean);
      setRequiredFieldsMessage(
        `Please select ${missingLabels.join(" and ")} before customizing your clean.`,
      );
      return;
    }

    setLocError(false);
    setDateError(false);
    setRequiredFieldsMessage("");
    setLocOpen(false);
    setDateOpen(false);
    setOptionsOpen((value) => !value);
  }
  function handleCitySelect(city: string, state: StateKey) {
    setLocCity(city);
    setLocState(state);
    setLocOpen(false);
    setDateOpen(false);
    setLocConfirmed(true);
    setLocError(false);
  }
  
  
  function handleDateSelect(d: Date) {
    setDate(d);
    setLocOpen(false);
    setDateOpen(false);
    setDateError(false);
    setBookingTime(null);

    // Automatically open Customize once both required fields are valid.
    if (locConfirmed) {
      setLocError(false);
      setRequiredFieldsMessage("");
      setOptionsOpen(true);
    }
  }

  function openBookingForm() {
    if (!date || !bookingTime) {
      setDateError(!date);
      setRequiredFieldsMessage(
        !date
          ? "Please select a date and available time."
          : "Please select an available time.",
      );
      return;
    }
    setBookingFormOpen(true);
    setBookingStatus("idle");
    setBookingErrorMessage("");
    setReferralCodeError("");
  }

  function closeBookingForm() {
    if (bookingStatus === "loading") return;
    setBookingFormOpen(false);
    setBookingStatus("idle");
    setBookingErrorMessage("");
    setReferralCode(urlPrefilledReferralCode.current ?? "");
    setReferralCodeError("");
  }

  function handleReferralCodeChange(value: string) {
    setReferralCode(value);
    if (referralCodeError) {
      setReferralCodeError("");
    }
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingStatus("loading");
    setBookingErrorMessage("");
    setReferralCodeError("");

    const { bedrooms, bathrooms } = getBookingRoomCounts(
      serviceIdx,
      standardBedIdx,
      standardBathIdx,
    );

    const extras =
      serviceIdx === 0
        ? Array.from(standardSelectedAddons)
        : serviceIdx === 1
        ? Array.from(deepCleanSelectedAddons)
        : serviceIdx === 2
        ? Array.from(moveOutSelectedAddons)
        : Array.from(commercialSelectedAddons);

    const normalizedReferralCode = referralCode.trim()
      ? normalizeReferralCode(referralCode)
      : "";

    const payload = {
      name: contactName.trim(),
      email: contactEmail.trim(),
      mobile: contactMobile.trim() || undefined,
      bedrooms,
      bathrooms,
      service: svc.label,
      frequency,
      location: bookingLocationSummary,
      bookingDate: formatBookingDateForApi(date),
      bookingTime: bookingTime ?? undefined,
      extras,
      estimateLow: prices.low,
      estimateMid: prices.mid,
      estimateHigh: prices.high,
      notes: contactNotes.trim() || undefined,
      ...(normalizedReferralCode ? { referralCode: normalizedReferralCode } : {}),
      ...(locationMode === "saved" && selectedAddressId
        ? { selectedAddressId }
        : {}),
    };

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.error === "Invalid referral code."
        ) {
          setReferralCodeError("Invalid referral code.");
          setBookingStatus("idle");
          return;
        }

        if (response.status === 409) {
          setBookingStatus("error");
          setBookingErrorMessage(
            data.error ||
              "That time was just booked. Please choose another available time.",
          );
          setBookingTime(null);
          void refreshSlotsForSelectedDate();
          return;
        }

        throw new Error(data.error || "Failed to submit booking request.");
      }

      setBookingStatus("success");
      setContactNotes("");
      setReferralCode(urlPrefilledReferralCode.current ?? "");
      setReferralCodeError("");
      setBookingTime(null);
      // Re-apply initial profile snapshot for a subsequent booking — never
      // mutate saved profile/addresses from this submit.
      prefillAppliedRef.current = false;
      applyPrefillSnapshot(true);
      void refreshSlotsForSelectedDate();
    } catch (error) {
      setBookingStatus("error");
      setBookingErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit booking request.",
      );
    }
  }

  const panels = [

    
    <StandardPanel
    key="std"
    onPrice={setPrices}
    frequency={frequency}
    onFrequencyChange={setFrequency}
    selectedAddons={standardSelectedAddons}
    onSelectedAddonsChange={handleStandardAddonsChange}
    bedIdx={standardBedIdx}
    bathIdx={standardBathIdx}
    onBedIdxChange={setStandardBedIdx}
    onBathIdxChange={setStandardBathIdx}
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

  const referralDiscountAmount =
    referralValidation.status === "valid"
      ? referralValidation.friendDiscountAmount
      : 0;
  const estimatedTotalAfterDiscount = Math.max(0, prices.mid - referralDiscountAmount);

  const isLinkReferralCodeActive =
    referralLinkCode != null &&
    referralCode.trim() !== "" &&
    normalizeReferralCode(referralCode) === referralLinkCode;

  const showReferralLinkSuccessBanner =
    isLinkReferralCodeActive && referralValidation.status === "valid";

  const showReferralLinkWarningBanner =
    isLinkReferralCodeActive && referralValidation.status === "invalid";


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
          See Your Cleaning Price. <span style={{ color: K.blue }}>Instantly</span>
        </motion.h2>
   
        
        <motion.p
          variants={fadeUp}
          className="my-4 mx-auto w-[80%] text-[16px] font-medium uppercase tracking-[0.09em] text-slate-600"
        >
          Instant estimate. Book when you&apos;re ready.
        </motion.p>

        {(showReferralLinkSuccessBanner || showReferralLinkWarningBanner) && (
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
        {showReferralLinkSuccessBanner && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left text-sm leading-relaxed text-emerald-900 shadow-sm"
          >
            🎉 Referral discount applied! You&apos;re booking with referral code{" "}
            <span className="font-bold">{referralValidation.code}</span>. You&apos;ll
            receive ${referralValidation.friendDiscountAmount} off your first
            cleaning when you submit your booking request.
          </div>
        )}
        {showReferralLinkWarningBanner && (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left text-sm leading-relaxed text-amber-900 shadow-sm"
          >
            Referral code{" "}
            <span className="font-semibold">{referralLinkCode}</span> could not be
            applied. You can still book normally
          </div>
        )}
      </div>
    )}
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
            className="overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max min-w-full snap-x snap-mandatory justify-start gap-8 scroll-smooth px-2 sm:px-0">
              {SERVICES.map((s, i) => {
                const active = serviceIdx === i;

                return (
                  <motion.button
                    key={s.label}
                    type="button"
                    variants={staggerItem}
                    onClick={() => setServiceIdx(i as ServiceIndex)}
                    whileTap={{ scale: 0.98 }}
                    className="group flex w-[96px] shrink-0 snap-center flex-col items-center gap-3.5 border-none bg-transparent p-0"
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={[
                        "grid h-24 w-24 place-items-center rounded-3xl  transition-all duration-200",
                        active
                          ? "bg-sky-50 shadow-sm"
                          : " bg-white ",
                      ].join(" ")}
                    >
                      <Image
                        src={s.image}
                        alt={s.label}
                        width={52}
                        height={52}
                        className="transition-transform duration-200 group-hover:scale-105"
                        style={{ objectFit: "contain" }}
                      />
                    </div>

                    <span
                      className={[
                        "text-center text-sm font-semibold leading-tight transition-colors duration-200",
                        active ? "text-sky-600" : "text-slate-500 group-hover:text-slate-600",
                      ].join(" ")}
                    >
                      {s.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={SCROLL_VIEWPORT}
            variants={slideLeft}
            className="relative z-[1] overflow-visible rounded-[24px] border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(12,26,46,.04),0_18px_55px_rgba(12,26,46,.08)]"
          >
            {/* Search Bar */}
            <div className="p-3 sm:p-5">
              <button
                type="button"
                className="mb-3 flex w-full items-center justify-between gap-3 rounded-xl  bg-white px-4 py-4 text-left shadow-sm sm:hidden"
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
                className={`relative z-50 ${
                  mobileSearchOpen ? "flex" : "hidden"
                } sm:flex`}
              >
                <div className="flex w-full flex-col gap-2 sm:min-h-[64px] sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-xl  sm:bg-white sm:p-1 sm:shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
                  {/* Location */}
                  <div
                    className="relative flex w-full items-stretch sm:min-h-0 sm:flex-[1.33] sm:rounded-lg sm:bg-white"
                    style={{ zIndex: locOpen ? 99999 : undefined }}
                  >
                    <SF
                      icon={<MapPin size={18} />}
                      label="Location"
                      value={`${locCity}, ${locState}`}
                      active={locOpen}
                      onClick={handleLocField}
                      placeholder={!locConfirmed}
                      error={locError}
                      shakeKey={locError ? shakeKey : 0}
                      last
                    />

                    <motion.div
                      animate={{ rotate: locOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 sm:right-4"
                      style={{ color: locOpen ? K.blue : K.hint }}
                    >
                      <ChevronDown size={16} strokeWidth={2.2} />
                    </motion.div>

                    <LocationDropdown
                      open={locOpen}
                      state={locState}
                      city={locCity}
                      onStateChange={setLocState}
                      onCitySelect={handleCitySelect}
                    />
                  </div>

                  <div
                    aria-hidden="true"
                    className="hidden w-px shrink-0 self-stretch bg-slate-200 sm:my-2 sm:block"
                  />

                  {/* Date */}
                  <div
                    className="relative flex w-full items-stretch sm:min-h-0 sm:flex-1 sm:rounded-lg sm:bg-white"
                    style={{ zIndex: dateOpen ? 99999 : undefined }}
                  >
                    <SF
                      icon={<Calendar size={18} />}
                      label={t("date")}
                      value={date ? formatDate(date, locale) : t("selectDate")}
                      active={dateOpen}
                      onClick={handleDateField}
                      placeholder={!date}
                      error={dateError}
                      shakeKey={dateError ? shakeKey : 0}
                      last
                    />

                    <motion.div
                      animate={{ rotate: dateOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 sm:right-4"
                      style={{ color: dateOpen ? K.blue : K.hint }}
                    >
                      <ChevronDown size={16} strokeWidth={2.2} />
                    </motion.div>

                    <CalendarDropdown
                      open={dateOpen}
                      selected={date}
                      onSelect={handleDateSelect}
                    />
                  </div>

                  <div
                    aria-hidden="true"
                    className="hidden w-px shrink-0 self-stretch bg-slate-200 sm:my-2 sm:block"
                  />

                  {/* Options toggle */}
                  <div className="relative flex w-full items-center justify-center p-2 sm:min-h-0 sm:w-auto sm:flex-initial sm:p-1">
                    <button
                      type="button"
                      onClick={handleCustomizeClick}
                      className={[
                        "flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-xs font-bold text-white shadow-sm transition-all duration-200",
                        "max-sm:border-0 sm:h-full sm:min-h-[48px] sm:px-5",
                        optionsOpen
                          ? "bg-sky-500 hover:bg-sky-600"
                          : "bg-sky-500 hover:bg-sky-600",
                      ].join(" ")}
                 
                    >
                      <SlidersHorizontal size={15} strokeWidth={2.25} />
                      <span>{t("customize")}</span>
                      <motion.div
                        animate={{ rotate: optionsOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <ChevronDown size={15} strokeWidth={2.25} />
                      </motion.div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {requiredFieldsMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden px-3 sm:px-5"
                >
                  <p
                    role="alert"
                    aria-live="assertive"
                    className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                  >
                    {requiredFieldsMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {date ? (
              <div className="border-t border-slate-100 px-3 py-3 sm:px-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("selectATime")}
                </p>
                {estimatedDurationMinutes != null ? (
                  <p className="mb-2 text-sm text-slate-600">
                    Estimated duration:{" "}
                    {estimatedDurationMinutes < 60
                      ? `About ${estimatedDurationMinutes} min`
                      : estimatedDurationMinutes % 60 === 0
                        ? `About ${estimatedDurationMinutes / 60} hour${
                            estimatedDurationMinutes === 60 ? "" : "s"
                          }`
                        : `About ${Math.floor(estimatedDurationMinutes / 60)} hr ${
                            estimatedDurationMinutes % 60
                          } min`}
                  </p>
                ) : null}
                {slotRefreshMessage ? (
                  <p className="mb-2 text-sm font-medium text-amber-700">
                    {slotRefreshMessage}
                  </p>
                ) : null}
                {slotsLoading ? (
                  <p className="text-sm text-slate-500">{t("loadingSlots")}</p>
                ) : slotsError ? (
                  <p className="text-sm font-medium text-red-600">{slotsError}</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    {t("noTimes")}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => {
                      const selected = bookingTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => {
                            setBookingTime(slot.time);
                            setRequiredFieldsMessage("");
                          }}
                          className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                            selected
                              ? "border-sky-400 bg-sky-50 text-sky-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
  
            {/* Active Panel: hidden by default, opened from the Options button */}
            <AnimatePresence initial={false}>
              {optionsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden bg-white shadow-[inset_0_1px_0_rgba(15,23,42,0.06)]"
                >
                  <div className="px-4 py-5 sm:px-6 sm:py-6">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {t("customizeYourClean")}
                    </p>
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
                </motion.div>
              )}
            </AnimatePresence>
  
            {/* Price Strip */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={SCROLL_VIEWPORT}
              variants={fadeUp}
              className="flex flex-col gap-5 to-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8"
            >
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5 lg:hidden">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-black">
                  {t("estimateRange")}
                </span>

                <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
                  <PricePill label={t("low")} value={prices.low} locale={locale} />
                  <div className="hidden h-7 w-px bg-gray-200 sm:block" />
                  <PricePill label={t("mid")} value={prices.mid} accent locale={locale} />
                  <div className="hidden h-7 w-px bg-gray-200 sm:block" />
                  <PricePill label={t("high")} value={prices.high} locale={locale} />
                </div>
              </div>
         
              <button
                type="button"
                className="flex hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer items-center gap-2 rounded-[10px] bg-sky-500/10 px-4 py-2"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("open-chatbot", {
                      detail: {
                        service: svc.label,
                        location: `${locCity}, ${locState}`,
                        date: date ? formatDate(date, locale) : undefined,
                        frequency,
                        extras: summaryExtras,
                        estimateLow: prices.low,
                        estimateMid: prices.mid,
                        estimateHigh: prices.high,
                      },
                    }),
                  );
                }}
              >
                <IoChatbubblesOutline
                  size={20}
                  className="text-sky-500"
                />
                Chat with our Assistant
              </button>

              
  
              <AnimatePresence initial={false}>
                {optionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25, ease: MOTION_EASE }}
                    className="flex w-full flex-col gap-3 overflow-hidden sm:w-auto sm:flex-row sm:items-center sm:gap-4"
                  >
                    {/* <div className="flex items-center justify-center gap-1.5 rounded-[] bg-emerald-50 px-3 py-1.5 sm:justify-start">
                      <div className="h-1.5 w-1.5 rounded-[] bg-emerald-600" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Licensed & insured
                      </span>
                    </div> */}

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={openBookingForm}
                      className="w-full cursor-pointer  border-none bg-sky-400 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(56,189,248,.35)] transition-colors duration-200 hover:bg-sky-500 sm:w-auto"
                    >
                      {svc.bookLabel}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
  

  {/* right side */}
  <div className="hidden flex-col gap-6 lg:flex">
 {/* Booking Summary — hidden until "Customize" is opened */}
 <AnimatePresence initial={false}>
   {optionsOpen && (
     <motion.div
       initial={{ opacity: 0, height: 0, y: -8 }}
       animate={{ opacity: 1, height: "auto", y: 0 }}
       exit={{ opacity: 0, height: 0, y: -8 }}
       transition={{ duration: 0.3, ease: MOTION_EASE }}
       className="hidden overflow-hidden lg:block"
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
   )}
 </AnimatePresence>


          {/* Right Image Card */}
          <motion.div
  initial="hidden"
  whileInView="visible"
  viewport={SCROLL_VIEWPORT}
  variants={slideRight}
  className="hidden min-h-[440px] flex-col overflow-hidden rounded-2xl lg:flex"
>
  {/* Estimate Header — hidden until "Customize" is opened */}
  <AnimatePresence initial={false}>
    {optionsOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: MOTION_EASE }}
        className="overflow-hidden border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50"
      >
        <div className="px-5 py-4 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {tEstimate("estimate")}
              </p>
             
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-xl  py-2 ">
              <PricePill label={t("low")} value={prices.low} locale={locale} />
              <div className=" px-2">
                <PricePill label={t("mid")} value={prices.mid} accent locale={locale} />
              </div>
              <PricePill label={t("high")} value={prices.high} locale={locale} />
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Gallery Area */}
  <div className="relative overflow-hidden  flex min-h-0 flex-1 flex-col p-5 lg:p-6">
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl ">
      <AnimatePresence mode="wait">
        <DynamicServiceGallery
          galleryKey={activeGallery.galleryKey}
          images={activeGallery.images}
          isDefaultOnly={activeGallery.isDefaultOnly}
        />
      </AnimatePresence>
    </div>
  </div>
</motion.div>
       
  </div>
      </div>

      <BookingModal
        open={bookingFormOpen}
        svc={svc}
        bookingStatus={bookingStatus}
        bookingErrorMessage={bookingErrorMessage}
        contactName={contactName}
        contactEmail={contactEmail}
        contactMobile={contactMobile}
        contactNotes={contactNotes}
        referralCode={referralCode}
        referralCodeError={referralCodeError}
        referralValidation={referralValidation}
        referralDiscountAmount={referralDiscountAmount}
        estimatedTotalAfterDiscount={estimatedTotalAfterDiscount}
        prices={prices}
        locationSummary={bookingLocationSummary}
        bookingPrefill={bookingPrefill}
        locationMode={locationMode}
        selectedAddressId={selectedAddressId}
        emailReadOnly={emailReadOnly}
        bookingTime={bookingTime}
        bookingTimeLabel={bookingTimeLabel}
        onClose={closeBookingForm}
        onSubmit={handleBookingSubmit}
        onNameChange={setContactName}
        onEmailChange={setContactEmail}
        onMobileChange={setContactMobile}
        onNotesChange={setContactNotes}
        onReferralCodeChange={handleReferralCodeChange}
        onSelectSavedAddress={handleSelectSavedAddress}
        onSelectManualLocation={handleSelectManualLocation}
      />
    </motion.section>
  );
}