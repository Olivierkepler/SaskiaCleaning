/** Shared estimator pricing rules. Keep this module free of React and I/O. */

import {
  BATH_VALS,
  BED_BASE,
  COM_BASE,
  COMMERCIAL_ADDONS,
  DEEP_BASE,
  DEEP_CLEAN_ADDONS,
  DEEP_COND,
  MO_BASE,
  MOVE_OUT_ADDONS,
  STANDARD_ADDONS,
} from "@/app/components/estimator/constants";
import type { PriceRange } from "@/app/components/estimator/types";

export type PricingInputSnapshot =
  | { version: 1; kind: "standard"; bathroomIndex: number }
  | { version: 1; kind: "deep-clean"; sizeIndex: number; conditionIndex: number }
  | { version: 1; kind: "move-out"; squareFootageIndex: number }
  | { version: 1; kind: "commercial"; squareFootageIndex: number; scheduleIndex: number };

export type BookingPricingSelections = {
  service: unknown;
  frequency: unknown;
  bedrooms: unknown;
  bathrooms: unknown;
  extras: unknown;
  pricingInputs: unknown;
};

export type BookingPricingResult =
  | {
      ok: true;
      estimate: PriceRange;
      extras: string[];
      pricingInputs: PricingInputSnapshot;
    }
  | { ok: false; error: string };

export const STANDARD_FREQUENCY_DISCOUNTS = {
  "One-time": 0,
  "Bi-weekly": 10,
  Weekly: 15,
  Monthly: 5,
} as const;
export const STANDARD_FREQUENCIES = Object.keys(STANDARD_FREQUENCY_DISCOUNTS) as Array<keyof typeof STANDARD_FREQUENCY_DISCOUNTS>;
export const COMMERCIAL_SCHEDULES = [
  { label: "Daily", multiplier: 1.4 },
  { label: "3x/week", multiplier: 1 },
  { label: "Weekly", multiplier: 0.7 },
  { label: "One-time", multiplier: 0.5 },
] as const;

export function calculateEstimateRange(mid: number): PriceRange {
  return {
    low: Math.round(mid * 0.85),
    mid,
    high: Math.round(mid * 1.18),
  };
}

function sumSelectedAddons(extras: readonly string[], catalog: readonly { label: string; price: number }[]): number {
  return catalog.reduce(
    (total, addon) => total + (extras.includes(addon.label) ? addon.price : 0),
    0,
  );
}

export function calculateStandardEstimate(input: {
  bedrooms: number;
  bathroomIndex: number;
  frequency: string;
  extras: readonly string[];
}): PriceRange {
  const base =
    BED_BASE[input.bedrooms] +
    (BATH_VALS[input.bathroomIndex] - 1) * 18 +
    sumSelectedAddons(input.extras, STANDARD_ADDONS);
  const discount = STANDARD_FREQUENCY_DISCOUNTS[input.frequency as keyof typeof STANDARD_FREQUENCY_DISCOUNTS] ?? 0;
  return calculateEstimateRange(Math.round(base * (1 - discount / 100)));
}

export function calculateDeepCleanEstimate(input: {
  sizeIndex: number;
  conditionIndex: number;
  extras: readonly string[];
}): PriceRange {
  return calculateEstimateRange(
    DEEP_BASE[input.sizeIndex] +
      DEEP_COND[input.conditionIndex] +
      sumSelectedAddons(input.extras, DEEP_CLEAN_ADDONS),
  );
}

export function calculateMoveOutEstimate(input: {
  squareFootageIndex: number;
  extras: readonly string[];
}): PriceRange {
  return calculateEstimateRange(
    MO_BASE[input.squareFootageIndex] + sumSelectedAddons(input.extras, MOVE_OUT_ADDONS),
  );
}

export function calculateCommercialEstimate(input: {
  squareFootageIndex: number;
  scheduleIndex: number;
  extras: readonly string[];
}): PriceRange {
  return calculateEstimateRange(
    Math.round(
      (COM_BASE[input.squareFootageIndex] + sumSelectedAddons(input.extras, COMMERCIAL_ADDONS)) *
        COMMERCIAL_SCHEDULES[input.scheduleIndex].multiplier,
    ),
  );
}

function isIndex(value: unknown, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max;
}

function validateExtras(value: unknown, catalog: readonly { label: string; price: number }[]): string[] | null {
  if (!Array.isArray(value) || value.some((extra) => typeof extra !== "string")) return null;
  const extras = value as string[];
  if (new Set(extras).size !== extras.length) return null;
  const allowed = new Set(catalog.map((addon) => addon.label));
  return extras.every((extra) => allowed.has(extra)) ? extras : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

/** Validate client selections, discard client estimates, and calculate canonically. */
export function priceBookingSelections(input: BookingPricingSelections): BookingPricingResult {
  if (!isRecord(input.pricingInputs) || input.pricingInputs.version !== 1) {
    return { ok: false, error: "Pricing selections are missing or invalid." };
  }
  const snapshot = input.pricingInputs;

  if (input.service === "Standard") {
    const extras = validateExtras(input.extras, STANDARD_ADDONS);
    const bedrooms = Number(input.bedrooms);
    const bathrooms = Number(input.bathrooms);
    if (
      snapshot.kind !== "standard" ||
      !hasExactKeys(snapshot, ["version", "kind", "bathroomIndex"]) ||
      !isIndex(snapshot.bathroomIndex, BATH_VALS.length - 1) ||
      !Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms >= BED_BASE.length ||
      !Number.isInteger(bathrooms) || bathrooms !== Math.ceil(BATH_VALS[snapshot.bathroomIndex]) ||
      typeof input.frequency !== "string" ||
      !Object.hasOwn(STANDARD_FREQUENCY_DISCOUNTS, input.frequency) ||
      !extras
    ) return { ok: false, error: "Standard cleaning pricing selections are invalid." };
    const pricingInputs: PricingInputSnapshot = {
      version: 1,
      kind: "standard",
      bathroomIndex: snapshot.bathroomIndex,
    };
    return {
      ok: true,
      estimate: calculateStandardEstimate({ bedrooms, bathroomIndex: snapshot.bathroomIndex, frequency: input.frequency, extras }),
      extras,
      pricingInputs,
    };
  }

  if (input.service === "Deep clean") {
    const extras = validateExtras(input.extras, DEEP_CLEAN_ADDONS);
    if (snapshot.kind !== "deep-clean" || !hasExactKeys(snapshot, ["version", "kind", "sizeIndex", "conditionIndex"]) || !isIndex(snapshot.sizeIndex, DEEP_BASE.length - 1) || !isIndex(snapshot.conditionIndex, DEEP_COND.length - 1) || !extras) {
      return { ok: false, error: "Deep clean pricing selections are invalid." };
    }
    const pricingInputs: PricingInputSnapshot = { version: 1, kind: "deep-clean", sizeIndex: snapshot.sizeIndex, conditionIndex: snapshot.conditionIndex };
    return { ok: true, estimate: calculateDeepCleanEstimate({ sizeIndex: snapshot.sizeIndex, conditionIndex: snapshot.conditionIndex, extras }), extras, pricingInputs };
  }

  if (input.service === "Move-out") {
    const extras = validateExtras(input.extras, MOVE_OUT_ADDONS);
    if (snapshot.kind !== "move-out" || !hasExactKeys(snapshot, ["version", "kind", "squareFootageIndex"]) || !isIndex(snapshot.squareFootageIndex, MO_BASE.length - 1) || !extras) {
      return { ok: false, error: "Move-out pricing selections are invalid." };
    }
    const pricingInputs: PricingInputSnapshot = { version: 1, kind: "move-out", squareFootageIndex: snapshot.squareFootageIndex };
    return { ok: true, estimate: calculateMoveOutEstimate({ squareFootageIndex: snapshot.squareFootageIndex, extras }), extras, pricingInputs };
  }

  if (input.service === "Commercial") {
    const extras = validateExtras(input.extras, COMMERCIAL_ADDONS);
    if (snapshot.kind !== "commercial" || !hasExactKeys(snapshot, ["version", "kind", "squareFootageIndex", "scheduleIndex"]) || !isIndex(snapshot.squareFootageIndex, COM_BASE.length - 1) || !isIndex(snapshot.scheduleIndex, COMMERCIAL_SCHEDULES.length - 1) || !extras) {
      return { ok: false, error: "Commercial pricing selections are invalid." };
    }
    const pricingInputs: PricingInputSnapshot = { version: 1, kind: "commercial", squareFootageIndex: snapshot.squareFootageIndex, scheduleIndex: snapshot.scheduleIndex };
    return { ok: true, estimate: calculateCommercialEstimate({ squareFootageIndex: snapshot.squareFootageIndex, scheduleIndex: snapshot.scheduleIndex, extras }), extras, pricingInputs };
  }

  return { ok: false, error: "Unsupported cleaning service." };
}

/** Extract only pricing selections from a request body; client estimates are never read. */
export function priceBookingRequest(body: unknown): BookingPricingResult {
  if (!isRecord(body)) {
    return { ok: false, error: "Booking pricing selections are invalid." };
  }
  return priceBookingSelections({
    service: body.service,
    frequency: body.frequency,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    extras: body.extras,
    pricingInputs: body.pricingInputs,
  });
}
