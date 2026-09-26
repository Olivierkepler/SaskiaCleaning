import { MASSACHUSETTS_LOCATIONS } from "@/app/data/massachusettsLocations";
import { RHODE_ISLAND_LOCATIONS } from "@/app/data/rhodeIslandLocations";
import type {
  CommercialAddonLabel,
  DeepCleanAddonLabel,
  MoveOutAddonLabel,
  StandardAddonLabel,
  StandardPreviewImage,
} from "./types";

export const K = {
  blue: "#38BDF8",
  blueHover: "#0EA5E9",
  blueLight: "#E0F4FE",
  blueFaint: "#F0F8FF",
  pageBg: "#FFFFFF",
  white: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E5E7EB",
  borderLight: "#F1F5F9",
  text: "#0C1A2E",
  textSub: "#374151",
  muted: "#64748B",
  hint: "black",
  chipBg: "#F1F5F9",
  chipText: "#0369A1",
  noticeText: "#0C4A6E",
  noticeBg: "#E0F4FE",
  noticeBorder: "#BAE6FD",
  green: "#15803D",
  greenBg: "#F0FDF4",
} as const;

export const LOCATIONS = {
  MA: MASSACHUSETTS_LOCATIONS,
  RI: RHODE_ISLAND_LOCATIONS,
} as const;

export const BED_BASE = [90, 120, 150, 180, 210];
export const BATH_VALS = [1, 1.5, 2, 2.5, 3];
export const STANDARD_BEDROOM_VALUES = [0, 1, 2, 3, 4] as const;
export const DEEP_BASE = [160, 220, 300, 400];
export const DEEP_COND = [0, 40, 80];
export const MO_BASE = [180, 240, 320, 420];
export const COM_BASE = [200, 320, 480, 700];

export const bookingInputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const SCROLL_VIEWPORT = { once: false, amount: 0.2 };

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
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

export const slideLeft = {
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

export const slideRight = {
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

export const staggerContainer = {
  hidden: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export const staggerItem = {
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

export const STANDARD_GALLERY_DEFAULT_WIDTH = 320;
export const STANDARD_GALLERY_DEFAULT_HEIGHT = 300;

export const STANDARD_ADDONS = [
  { label: "Inside fridge", price: 15, image: "/images/standard/modernfridge.png" },
  { label: "Inside oven", price: 20, image: "/images/standard/modernoven.png" },
  { label: "Laundry fold", price: 25, image: "/images/standard/towel.png" },
  { label: "Windows", price: 30, image: "/images/standard/window.png" },
] as const;

export const STANDARD_PREVIEW_IMAGES = {
  default: [
    { src: "/images/standard/roomandbedroom.png", alt: "Bedroom",  },
  ] satisfies StandardPreviewImage[],
  addons: {
    "Inside fridge": {
      src: "/images/standard/modernfridge.png",
      alt: "Clean refrigerator interior",
      width: 90,
      height: 90,
    },
    "Inside oven": {
      src: "/images/standard/modernoven.png",
      alt: "Clean oven interior",
      width: 90,
      height: 90,
    },
    "Laundry fold": {
      src: "/images/standard/towel.png",
      alt: "Folded laundry",
      width: 90,
      height: 90,
    },
    Windows: {
      src: "/images/standard/window.png",
      alt: "Clean windows",
      width: 90,
      height: 90,
    },
  } satisfies Record<StandardAddonLabel, StandardPreviewImage>,
};

export const DEEP_CLEAN_ADDONS = [
  { label: "Wall Trim", price: 35, image: "/images/deepclean/baseboard.png" },
  { label: "Inside cabinets", price: 40, image: "/images/deepclean/cabinet.png" },
  { label: "Wall scrub", price: 30, image: "/images/deepclean/wall.png" },
  { label: "Carpet steam", price: 45, image: "/images/deepclean/carpet1.png" },
] as const;

export const DEEP_CLEAN_PREVIEW_IMAGES = {
  default: [
    {
      src: "/images/deepclean/Designer(19).png",
      alt: "Deep cleaning service",
      width: 300,
      height: 300,
    },
  ] satisfies StandardPreviewImage[],
  addons: {
    "Wall Trim": {
      src: "/images/deepclean/baseboard.png",
      alt: "Wall trim cleaning",
      width: 90,
      height: 90,
    },
    "Inside cabinets": {
      src: "/images/deepclean/cabinet.png",
      alt: "Clean cabinet interior",
      width: 90,
      height: 90,
    },
    "Wall scrub": {
      src: "/images/deepclean/wall.png",
      alt: "Wall scrub cleaning",
      width: 90,
      height: 90,
    },
    "Carpet steam": {
      src: "/images/deepclean/carpet1.png",
      alt: "Carpet steam cleaning",
      width: 90,
      height: 90,
    },
  } satisfies Record<DeepCleanAddonLabel, StandardPreviewImage>,
};

export const MOVE_OUT_ADDONS = [
  { label: "Carpet steam", price: 50, image: "/images/deepclean/carpet1.png" },
  { label: "Patch & paint", price: 40, image: "/images/moveout/paint.png" },
  { label: "Window wash", price: 35, image: "/images/moveout/window.png" },
  { label: "Garage clean", price: 60, image: "/images/moveout/garage.png" },
] as const;

export const MOVE_OUT_PREVIEW_IMAGES = {
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

export const COMMERCIAL_ADDONS = [
  { label: "Floor wax", price: 60, image: "/images/commercial/wax.png" },
  { label: "Pressure wash", price: 45, image: "/images/commercial/pressure.png" },
  { label: "Window ext.", price: 55, image: "/images/commercial/windowext.png" },
  { label: "Sanitize", price: 40, image: "/images/commercial/sanitize.png" },
] as const;

export const COMMERCIAL_PREVIEW_IMAGES = {
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

export const ADDON_DISPLAY_KEYS: Record<string, string> = {
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

export const FREQ_DISPLAY_KEYS: Record<string, string> = {
  "One-time": "oneTime",
  "Bi-weekly": "biWeekly",
  Weekly: "weekly",
  Monthly: "monthly",
  Daily: "daily",
  "3x/week": "threeXWeek",
};
