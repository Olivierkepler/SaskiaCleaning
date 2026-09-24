/**
 * Server-side booking follow-ups — Phase 11.13 (admin-only).
 */

import "server-only";

import { sql } from "@/app/lib/db";
import {
  isFollowupDue,
  validateCreateFollowup,
  type CreateFollowupInput,
  type FollowupContactMethod,
  type FollowupOutcome,
  type FollowupType,
} from "@/app/lib/booking-followups-pure";

export type BookingFollowup = {
  id: number;
  bookingId: number;
  followupType: FollowupType;
  contactMethod: FollowupContactMethod;
  outcome: FollowupOutcome;
  note: string;
  nextFollowupAt: string | null;
  resolvedAt: string | null;
  createdByLabel: string | null;
  createdAt: string;
  updatedAt: string;
  isDue: boolean;
};

export type BookingFollowupSummary = {
  bookingId: number;
  latestCreatedAt: string | null;
  nextFollowupAt: string | null;
  unresolvedCount: number;
  hasDue: boolean;
};

function mapFollowup(
  row: Record<string, unknown>,
  now = new Date(),
): BookingFollowup {
  const nextFollowupAt =
    row.next_followup_at == null
      ? null
      : new Date(row.next_followup_at as string | Date).toISOString();
  const resolvedAt =
    row.resolved_at == null
      ? null
      : new Date(row.resolved_at as string | Date).toISOString();
  return {
    id: Number(row.id),
    bookingId: Number(row.booking_id),
    followupType: String(row.followup_type) as FollowupType,
    contactMethod: String(row.contact_method) as FollowupContactMethod,
    outcome: String(row.outcome) as FollowupOutcome,
    note: String(row.note),
    nextFollowupAt,
    resolvedAt,
    createdByLabel:
      row.created_by_label == null ? null : String(row.created_by_label),
    createdAt: new Date(row.created_at as string | Date).toISOString(),
    updatedAt: new Date(row.updated_at as string | Date).toISOString(),
    isDue: isFollowupDue({
      nextFollowupAt,
      resolvedAt,
      now,
    }),
  };
}

export async function listFollowupsForBooking(
  bookingId: number,
): Promise<BookingFollowup[]> {
  if (!Number.isInteger(bookingId) || bookingId <= 0) return [];
  const rows = await sql`
    SELECT *
    FROM booking_followups
    WHERE booking_id = ${bookingId}
    ORDER BY created_at DESC, id DESC
  `;
  const now = new Date();
  return (rows as Array<Record<string, unknown>>).map((r) =>
    mapFollowup(r, now),
  );
}

/**
 * Batched summaries for many bookings — set-based, no N+1.
 */
export async function listFollowupSummariesForBookings(
  bookingIds: number[],
): Promise<Map<number, BookingFollowupSummary>> {
  const map = new Map<number, BookingFollowupSummary>();
  const ids = [...new Set(bookingIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (ids.length === 0) return map;

  const rows = await sql`
    SELECT
      booking_id,
      MAX(created_at) AS latest_created_at,
      MIN(next_followup_at) FILTER (
        WHERE resolved_at IS NULL AND next_followup_at IS NOT NULL
      ) AS next_followup_at,
      COUNT(*) FILTER (WHERE resolved_at IS NULL)::int AS unresolved_count,
      COUNT(*) FILTER (
        WHERE resolved_at IS NULL
          AND next_followup_at IS NOT NULL
          AND next_followup_at <= now()
      )::int AS due_count
    FROM booking_followups
    WHERE booking_id = ANY(${ids})
    GROUP BY booking_id
  `;

  for (const row of rows as Array<Record<string, unknown>>) {
    const bookingId = Number(row.booking_id);
    map.set(bookingId, {
      bookingId,
      latestCreatedAt:
        row.latest_created_at == null
          ? null
          : new Date(row.latest_created_at as string | Date).toISOString(),
      nextFollowupAt:
        row.next_followup_at == null
          ? null
          : new Date(row.next_followup_at as string | Date).toISOString(),
      unresolvedCount: Number(row.unresolved_count ?? 0),
      hasDue: Number(row.due_count ?? 0) > 0,
    });
  }
  return map;
}

export async function countDueFollowups(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM booking_followups
    WHERE resolved_at IS NULL
      AND next_followup_at IS NOT NULL
      AND next_followup_at <= now()
  `;
  return Number((rows[0] as { n: number } | undefined)?.n ?? 0);
}

export async function createBookingFollowup(input: {
  bookingId: number;
  payload: CreateFollowupInput;
}): Promise<
  | { ok: true; followup: BookingFollowup }
  | { ok: false; error: string; status: number }
> {
  if (!Number.isInteger(input.bookingId) || input.bookingId <= 0) {
    return { ok: false, error: "Invalid booking.", status: 400 };
  }

  const validated = validateCreateFollowup(input.payload);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 400 };
  }

  const exists = await sql`
    SELECT id FROM booking_requests WHERE id = ${input.bookingId} LIMIT 1
  `;
  if (!exists[0]) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const v = validated.value;
  const rows = await sql`
    INSERT INTO booking_followups (
      booking_id,
      followup_type,
      contact_method,
      outcome,
      note,
      next_followup_at,
      created_by_label
    )
    VALUES (
      ${input.bookingId},
      ${v.followupType},
      ${v.contactMethod},
      ${v.outcome},
      ${v.note},
      ${v.nextFollowupAt}::timestamptz,
      ${v.createdByLabel}
    )
    RETURNING *
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Failed to create follow-up.", status: 500 };
  }

  return { ok: true, followup: mapFollowup(row) };
}

export async function resolveBookingFollowup(
  followupId: number,
): Promise<
  | { ok: true; followup: BookingFollowup; alreadyResolved: boolean }
  | { ok: false; error: string; status: number }
> {
  if (!Number.isInteger(followupId) || followupId <= 0) {
    return { ok: false, error: "Invalid follow-up.", status: 400 };
  }

  const existingRows = await sql`
    SELECT * FROM booking_followups WHERE id = ${followupId} LIMIT 1
  `;
  const existing = existingRows[0] as Record<string, unknown> | undefined;
  if (!existing) {
    return { ok: false, error: "Follow-up not found.", status: 404 };
  }

  if (existing.resolved_at != null) {
    return {
      ok: true,
      followup: mapFollowup(existing),
      alreadyResolved: true,
    };
  }

  const rows = await sql`
    UPDATE booking_followups
    SET
      resolved_at = now(),
      updated_at = now()
    WHERE id = ${followupId}
      AND resolved_at IS NULL
    RETURNING *
  `;
  const row = (rows[0] as Record<string, unknown> | undefined) ?? existing;
  return { ok: true, followup: mapFollowup(row), alreadyResolved: false };
}
