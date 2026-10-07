/** Strict validation and orchestration for safe admin booking snapshot edits. */

export const MAX_ADMIN_BOOKING_LOCATION_LENGTH = 500;
export const MAX_ADMIN_BOOKING_NOTES_LENGTH = 4_000;

export type AdminBookingDetailsPatch = {
  location?: string;
  notes?: string | null;
};

export function parseAdminBookingDetailsPatch(
  input: unknown,
):
  | { ok: true; patch: AdminBookingDetailsPatch }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Invalid booking details." };
  }

  const record = input as Record<string, unknown>;
  const allowed = new Set(["location", "notes"]);
  if (Object.keys(record).some((key) => !allowed.has(key))) {
    return { ok: false, error: "Only booking location and notes can be edited here." };
  }
  if (Object.keys(record).length === 0) {
    return { ok: false, error: "Enter a booking location or notes to update." };
  }

  const patch: AdminBookingDetailsPatch = {};
  if (Object.hasOwn(record, "location")) {
    if (typeof record.location !== "string") {
      return { ok: false, error: "Enter a valid booking location." };
    }
    const location = record.location.trim().replace(/\s+/g, " ");
    if (!location) {
      return { ok: false, error: "Booking location is required." };
    }
    if (location.length > MAX_ADMIN_BOOKING_LOCATION_LENGTH) {
      return {
        ok: false,
        error: `Booking location must be ${MAX_ADMIN_BOOKING_LOCATION_LENGTH} characters or fewer.`,
      };
    }
    patch.location = location;
  }

  if (Object.hasOwn(record, "notes")) {
    if (record.notes == null) {
      patch.notes = null;
    } else if (typeof record.notes !== "string") {
      return { ok: false, error: "Enter valid booking notes." };
    } else {
      const notes = record.notes.trim();
      if (notes.length > MAX_ADMIN_BOOKING_NOTES_LENGTH) {
        return {
          ok: false,
          error: `Notes must be ${MAX_ADMIN_BOOKING_NOTES_LENGTH} characters or fewer.`,
        };
      }
      patch.notes = notes || null;
    }
  }

  return { ok: true, patch };
}

export async function executeAdminBookingDetailsPatch<T>(
  input: unknown,
  dependencies: {
    authorized: boolean;
    update: (patch: AdminBookingDetailsPatch) => Promise<T | null>;
  },
): Promise<
  | { status: 200; booking: T }
  | { status: 400 | 401 | 404; error: string }
> {
  if (!dependencies.authorized) {
    return { status: 401, error: "Unauthorized" };
  }
  const parsed = parseAdminBookingDetailsPatch(input);
  if (!parsed.ok) return { status: 400, error: parsed.error };
  const booking = await dependencies.update(parsed.patch);
  if (!booking) return { status: 404, error: "Booking not found." };
  return { status: 200, booking };
}
