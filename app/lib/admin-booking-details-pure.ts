/** Strict validation and orchestration for safe admin booking snapshot edits. */

import {
  BOOKING_SERVICE_LABELS,
  priceBookingSelections,
  resolveBookingPricingInputs,
  STANDARD_FREQUENCIES,
  type BookingPricingResult,
  type PricingInputSnapshot,
} from "@/app/lib/booking-pricing-pure";
import { isValidBookingDateOnly, parseBookingTime } from "@/app/lib/scheduling-pure";

export const MAX_ADMIN_BOOKING_LOCATION_LENGTH = 500;
export const MAX_ADMIN_BOOKING_NOTES_LENGTH = 4_000;

export type AdminBookingDetailsPatch = {
  location?: string;
  notes?: string | null;
  service?: string;
  frequency?: string;
  bedrooms?: number;
  bathrooms?: number;
  extras?: string[];
  pricingInputs?: PricingInputSnapshot;
  bookingDate?: string;
  bookingTime?: string;
};

export type AdminBookingForEdit = {
  id: number;
  location: string | null;
  notes: string | null;
  service: string | null;
  frequency: string | null;
  bedrooms: number;
  bathrooms: number;
  extras: unknown;
  pricing_inputs: unknown;
  duration_minutes: number | null;
  has_active_assignment: boolean;
  can_be_assigned: boolean;
};

export type PreparedAdminBookingUpdate = {
  location?: string;
  notes?: string | null;
  pricing: Extract<BookingPricingResult, { ok: true }> | null;
  service: string | null;
  frequency: string | null;
  bedrooms: number;
  bathrooms: number;
  durationMinutes: number | null;
  durationChanged: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function normalizeStoredExtras(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return [value];
  }
}

export function parseAdminBookingDetailsPatch(
  input: unknown,
):
  | { ok: true; patch: AdminBookingDetailsPatch }
  | { ok: false; error: string } {
  if (!isRecord(input)) return { ok: false, error: "Invalid booking details." };

  const allowed = new Set([
    "location", "notes", "service", "frequency", "bedrooms", "bathrooms", "extras", "pricingInputs", "bookingDate", "bookingTime",
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    return { ok: false, error: "This booking field cannot be edited here." };
  }
  if (Object.keys(input).length === 0) {
    return { ok: false, error: "Enter booking details to update." };
  }

  const hasBookingDate = Object.hasOwn(input, "bookingDate");
  const hasBookingTime = Object.hasOwn(input, "bookingTime");
  if (hasBookingDate !== hasBookingTime) {
    return { ok: false, error: "Choose both an appointment date and time." };
  }
  if (hasBookingDate) {
    if (typeof input.bookingDate !== "string" || !isValidBookingDateOnly(input.bookingDate)) {
      return { ok: false, error: "Choose a valid appointment date." };
    }
    if (typeof input.bookingTime !== "string" || !parseBookingTime(input.bookingTime)) {
      return { ok: false, error: "Choose a valid appointment time." };
    }
  }

  const patch: AdminBookingDetailsPatch = {};
  if (Object.hasOwn(input, "location")) {
    if (typeof input.location !== "string") return { ok: false, error: "Enter a valid booking location." };
    const location = input.location.trim().replace(/\s+/g, " ");
    if (!location) return { ok: false, error: "Booking location is required." };
    if (location.length > MAX_ADMIN_BOOKING_LOCATION_LENGTH) {
      return { ok: false, error: `Booking location must be ${MAX_ADMIN_BOOKING_LOCATION_LENGTH} characters or fewer.` };
    }
    patch.location = location;
  }

  if (Object.hasOwn(input, "notes")) {
    if (input.notes == null) patch.notes = null;
    else if (typeof input.notes !== "string") return { ok: false, error: "Enter valid booking notes." };
    else {
      const notes = input.notes.trim();
      if (notes.length > MAX_ADMIN_BOOKING_NOTES_LENGTH) {
        return { ok: false, error: `Notes must be ${MAX_ADMIN_BOOKING_NOTES_LENGTH} characters or fewer.` };
      }
      patch.notes = notes || null;
    }
  }

  if (Object.hasOwn(input, "service")) {
    if (typeof input.service !== "string" || !BOOKING_SERVICE_LABELS.includes(input.service as (typeof BOOKING_SERVICE_LABELS)[number])) {
      return { ok: false, error: "Choose a supported booking service." };
    }
    patch.service = input.service;
  }
  if (Object.hasOwn(input, "frequency")) {
    if (typeof input.frequency !== "string" || !STANDARD_FREQUENCIES.includes(input.frequency as (typeof STANDARD_FREQUENCIES)[number])) {
      return { ok: false, error: "Choose a supported booking frequency." };
    }
    patch.frequency = input.frequency;
  }
  if (Object.hasOwn(input, "bedrooms")) {
    if (!isIntegerInRange(input.bedrooms, 0, 4)) return { ok: false, error: "Choose a valid bedroom count." };
    patch.bedrooms = input.bedrooms;
  }
  if (Object.hasOwn(input, "bathrooms")) {
    if (!isIntegerInRange(input.bathrooms, 0, 3)) return { ok: false, error: "Choose a valid bathroom count." };
    patch.bathrooms = input.bathrooms;
  }
  if (Object.hasOwn(input, "extras")) {
    if (!Array.isArray(input.extras) || input.extras.some((extra) => typeof extra !== "string")) {
      return { ok: false, error: "Choose valid booking extras." };
    }
    patch.extras = input.extras as string[];
  }
  if (Object.hasOwn(input, "pricingInputs")) {
    if (!isRecord(input.pricingInputs)) return { ok: false, error: "Pricing details are missing or invalid." };
    patch.pricingInputs = input.pricingInputs as unknown as PricingInputSnapshot;
  }

  if (hasBookingDate) {
    patch.bookingDate = input.bookingDate as string;
    patch.bookingTime = parseBookingTime(input.bookingTime as string)!;
  }
  const priceSensitive = ["service", "frequency", "bedrooms", "bathrooms", "extras", "pricingInputs"]
    .some((key) => Object.hasOwn(patch, key));
  if (hasBookingDate && priceSensitive) {
    return { ok: false, error: "Save the service change first, then edit the appointment." };
  }

  return { ok: true, patch };
}

export function prepareAdminBookingDetailsUpdate(
  patch: AdminBookingDetailsPatch,
  current: AdminBookingForEdit,
  resolvedDurationMinutes?: number,
):
  | { ok: true; update: PreparedAdminBookingUpdate }
  | { ok: false; status: 400 | 409; error: string } {
  const priceSensitive = ["service", "frequency", "bedrooms", "bathrooms", "extras", "pricingInputs"]
    .some((key) => Object.hasOwn(patch, key));
  const nextService = patch.service ?? current.service;
  const nextFrequency = patch.frequency ?? current.frequency;
  const nextBedrooms = patch.bedrooms ?? current.bedrooms;
  const nextBathrooms = patch.bathrooms ?? current.bathrooms;
  const currentExtras = normalizeStoredExtras(current.extras);
  const nextExtras = patch.extras ?? currentExtras;
  const serviceChanged = nextService !== current.service;
  const durationChanged = serviceChanged && resolvedDurationMinutes != null && resolvedDurationMinutes !== current.duration_minutes;

  if (!priceSensitive) {
    return {
      ok: true,
      update: {
        location: patch.location,
        notes: patch.notes,
        pricing: null,
        service: current.service,
        frequency: current.frequency,
        bedrooms: current.bedrooms,
        bathrooms: current.bathrooms,
        durationMinutes: current.duration_minutes,
        durationChanged: false,
      },
    };
  }

  const currentPricingInputs = resolveBookingPricingInputs({
    service: current.service,
    frequency: current.frequency,
    bedrooms: current.bedrooms,
    bathrooms: current.bathrooms,
    extras: currentExtras,
    pricingInputs: current.pricing_inputs,
  });
  if (!currentPricingInputs) {
    return {
      ok: false,
      status: 409,
      error: "Pricing details for this older booking cannot be safely edited.",
    };
  }

  const nextPricingInputs = patch.pricingInputs ?? (serviceChanged ? null : currentPricingInputs);
  if (!nextPricingInputs) {
    return { ok: false, status: 400, error: "Select the pricing details for the new service." };
  }

  const pricing = priceBookingSelections({
    service: nextService,
    frequency: nextFrequency,
    bedrooms: nextBedrooms,
    bathrooms: nextBathrooms,
    extras: nextExtras,
    pricingInputs: nextPricingInputs,
  });
  if (!pricing.ok) return { ok: false, status: 400, error: pricing.error };

  if (serviceChanged && resolvedDurationMinutes == null) {
    return { ok: false, status: 400, error: "No duration rule is configured for this service." };
  }
  if (durationChanged && current.has_active_assignment) {
    return {
      ok: false,
      status: 409,
      error: "This booking has an active cleaner assignment. Unassign the cleaner before changing the service.",
    };
  }
  if (durationChanged && current.can_be_assigned) {
    return {
      ok: false,
      status: 409,
      error: "This appointment can still be assigned. Service changes that alter duration are unavailable until scheduling can be revalidated.",
    };
  }

  return {
    ok: true,
    update: {
      location: patch.location,
      notes: patch.notes,
      pricing,
      service: nextService,
      frequency: nextFrequency,
      bedrooms: nextBedrooms,
      bathrooms: nextBathrooms,
      durationMinutes: serviceChanged ? resolvedDurationMinutes! : current.duration_minutes,
      durationChanged,
    },
  };
}

export async function executeAdminBookingDetailsPatch<T>(
  input: unknown,
  dependencies: {
    authorized: boolean;
    load: () => Promise<AdminBookingForEdit | null>;
    resolveDuration: (input: { service: string; bedrooms: number; bathrooms: number; extras: unknown }) => Promise<number | null>;
    update: (update: PreparedAdminBookingUpdate) => Promise<
      | { ok: true; booking: T }
      | { ok: false; reason: "not-found" | "assignment-conflict" | "scheduling-conflict" }
    >;
  },
): Promise<
  | { status: 200; booking: T }
  | { status: 400 | 401 | 404 | 409; error: string }
> {
  if (!dependencies.authorized) return { status: 401, error: "Unauthorized" };
  const parsed = parseAdminBookingDetailsPatch(input);
  if (!parsed.ok) return { status: 400, error: parsed.error };
  if (parsed.patch.bookingDate !== undefined || parsed.patch.bookingTime !== undefined) {
    return { status: 400, error: "Appointment changes must use the scheduling move authority." };
  }

  const current = await dependencies.load();
  if (!current) return { status: 404, error: "Booking not found." };

  const priceSensitive = ["service", "frequency", "bedrooms", "bathrooms", "extras", "pricingInputs"]
    .some((key) => Object.hasOwn(parsed.patch, key));
  const proposedService = parsed.patch.service ?? current.service;
  const serviceChanged = priceSensitive && proposedService !== current.service;
  let durationMinutes: number | undefined;
  if (serviceChanged) {
    const result = await dependencies.resolveDuration({
      service: proposedService!,
      bedrooms: parsed.patch.bedrooms ?? current.bedrooms,
      bathrooms: parsed.patch.bathrooms ?? current.bathrooms,
      extras: parsed.patch.extras ?? normalizeStoredExtras(current.extras),
    });
    if (result == null) return { status: 400, error: "No duration rule is configured for this service." };
    durationMinutes = result;
  }

  const prepared = prepareAdminBookingDetailsUpdate(parsed.patch, current, durationMinutes);
  if (!prepared.ok) return { status: prepared.status, error: prepared.error };
  const persisted = await dependencies.update(prepared.update);
  if (persisted.ok) return { status: 200, booking: persisted.booking };
  if (persisted.reason === "not-found") return { status: 404, error: "Booking not found." };
  if (persisted.reason === "scheduling-conflict") {
    return { status: 409, error: "This appointment can still be assigned. Service changes that alter duration are unavailable until scheduling can be revalidated." };
  }
  return {
    status: 409,
    error: "This booking has an active cleaner assignment. Unassign the cleaner before changing the service.",
  };
}
