import { intlLocale } from "@/app/lib/i18n/format";
import {
  BATH_VALS,
  COMMERCIAL_ADDONS,
  COMMERCIAL_PREVIEW_IMAGES,
  DEEP_CLEAN_ADDONS,
  DEEP_CLEAN_PREVIEW_IMAGES,
  MOVE_OUT_ADDONS,
  MOVE_OUT_PREVIEW_IMAGES,
  STANDARD_ADDONS,
  STANDARD_BEDROOM_VALUES,
  STANDARD_GALLERY_DEFAULT_HEIGHT,
  STANDARD_GALLERY_DEFAULT_WIDTH,
  STANDARD_PREVIEW_IMAGES,
} from "./constants";
import type { ServiceIndex, StandardPreviewImage } from "./types";

export function formatBookingDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getBookingRoomCounts(
  serviceIdx: ServiceIndex,
  standardBedIdx: number,
  standardBathIdx: number,
): { bedrooms: number; bathrooms: number } {
  if (serviceIdx !== 0) {
    return { bedrooms: 0, bathrooms: 0 };
  }

  return {
    bedrooms: STANDARD_BEDROOM_VALUES[standardBedIdx] ?? 0,
    bathrooms: Math.ceil(BATH_VALS[standardBathIdx] ?? 1),
  };
}

export function formatDate(d: Date, locale = "en"): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function getStandardGalleryDimensions(img: StandardPreviewImage): {
  width: number;
  height: number;
} {
  return {
    width: img.width ?? STANDARD_GALLERY_DEFAULT_WIDTH,
    height: img.height ?? STANDARD_GALLERY_DEFAULT_HEIGHT,
  };
}

export function buildStandardGalleryImages(
  selectedAddons: Set<string>,
): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...STANDARD_PREVIEW_IMAGES.default];
  for (const addon of STANDARD_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(STANDARD_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}

export function buildDeepCleanGalleryImages(
  selectedAddons: Set<string>,
): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...DEEP_CLEAN_PREVIEW_IMAGES.default];
  for (const addon of DEEP_CLEAN_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(DEEP_CLEAN_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}

export function buildMoveOutGalleryImages(
  selectedAddons: Set<string>,
): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...MOVE_OUT_PREVIEW_IMAGES.default];
  for (const addon of MOVE_OUT_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(MOVE_OUT_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}

export function buildCommercialGalleryImages(
  selectedAddons: Set<string>,
): StandardPreviewImage[] {
  const images: StandardPreviewImage[] = [...COMMERCIAL_PREVIEW_IMAGES.default];
  for (const addon of COMMERCIAL_ADDONS) {
    if (selectedAddons.has(addon.label)) {
      images.push(COMMERCIAL_PREVIEW_IMAGES.addons[addon.label]);
    }
  }
  return images;
}
