/**
 * Server-side capacity soft-release — Phase 11.11.
 * Primary cleanup via cron; set-based, idempotent, DB-clock based.
 */

import "server-only";

import { sql } from "@/app/lib/db";
import {
  type CapacityReleaseReason,
  isCapacityReleaseReason,
} from "@/app/lib/capacity-release-pure";

export type CapacityCleanupResult = {
  released: number;
  source: "cron" | "manual" | "completion" | "cancel" | "reschedule";
};

/**
 * Soft-release completed bookings whose capacity window has ended.
 * Uses PostgreSQL now() — never client clocks.
 * Idempotent: second run returns 0 when nothing eligible.
 */
export async function releaseExpiredCompletedCapacity(input?: {
  source?: CapacityCleanupResult["source"];
}): Promise<CapacityCleanupResult> {
  const source = input?.source ?? "cron";
  const rows = await sql`
    UPDATE booking_assignments a
    SET
      is_active = false,
      released_at = now(),
      release_reason = 'completed_window_elapsed',
      updated_at = now()
    FROM booking_requests b
    WHERE b.id = a.booking_id
      AND a.is_active = true
      AND b.status = 'completed'
      AND a.window_end IS NOT NULL
      AND a.window_end <= now()
    RETURNING a.id
  `;
  const released = Array.isArray(rows) ? rows.length : 0;
  if (released > 0) {
    console.info(
      JSON.stringify({
        event: "capacity_release",
        source,
        released_count: released,
        timestamp: new Date().toISOString(),
      }),
    );
  }
  return { released, source };
}

/**
 * Soft-release all active assignments for a booking (cancel / reschedule / admin).
 * Conditional on is_active = true to avoid racing newer claims.
 */
export async function releaseAssignmentCapacity(
  bookingId: number,
  reason: CapacityReleaseReason = "cancelled",
): Promise<number> {
  const safeReason: CapacityReleaseReason = isCapacityReleaseReason(reason)
    ? reason
    : "cancelled";

  const rows = await sql`
    UPDATE booking_assignments
    SET
      is_active = false,
      released_at = now(),
      release_reason = ${safeReason},
      updated_at = now()
    WHERE booking_id = ${bookingId}
      AND is_active = true
    RETURNING id
  `;
  return Array.isArray(rows) ? rows.length : 0;
}

/**
 * On completion: if capacity window already elapsed, release immediately.
 * Otherwise leave active for cron after window_end.
 */
export async function releaseCompletedCapacityIfWindowElapsed(
  bookingId: number,
): Promise<number> {
  const rows = await sql`
    UPDATE booking_assignments a
    SET
      is_active = false,
      released_at = now(),
      release_reason = 'completed_window_elapsed',
      updated_at = now()
    FROM booking_requests b
    WHERE b.id = a.booking_id
      AND a.booking_id = ${bookingId}
      AND a.is_active = true
      AND b.status = 'completed'
      AND a.window_end IS NOT NULL
      AND a.window_end <= now()
    RETURNING a.id
  `;
  const released = Array.isArray(rows) ? rows.length : 0;
  if (released > 0) {
    console.info(
      JSON.stringify({
        event: "capacity_release",
        source: "completion",
        released_count: released,
        timestamp: new Date().toISOString(),
      }),
    );
  }
  return released;
}

/** Read-only count of rows eligible for completed-window cleanup. */
export async function countExpiredCompletedCapacity(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.is_active = true
      AND b.status = 'completed'
      AND a.window_end IS NOT NULL
      AND a.window_end <= now()
  `;
  return Number((rows[0] as { n: number } | undefined)?.n ?? 0);
}

export type AdminCapacityHint = {
  bookingId: number;
  label: "overdue" | "capacity_held" | "released" | "active";
};

/**
 * Compact admin hints — no PII. Set-based.
 * Surfaces overdue open bookings and completed capacity-held rows.
 */
export async function listAdminCapacityHints(): Promise<AdminCapacityHint[]> {
  const rows = await sql`
    SELECT
      b.id AS booking_id,
      b.status,
      a.is_active,
      a.window_end
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.is_primary = true
      AND a.is_active = true
      AND (
        b.booking_date IS NULL
        OR b.booking_date >= (
          (CURRENT_DATE AT TIME ZONE 'America/New_York') - INTERVAL '14 days'
        )
      )
  `;

  const { classifyCapacityLifecycle } = await import(
    "@/app/lib/capacity-release-pure"
  );

  const hints: AdminCapacityHint[] = [];
  for (const row of rows as Array<{
    booking_id: number;
    status: string;
    is_active: boolean;
    window_end: string | Date | null;
  }>) {
    const label = classifyCapacityLifecycle({
      status: String(row.status),
      isActive: Boolean(row.is_active),
      windowEndUtc: row.window_end,
    });
    if (label === "overdue" || label === "capacity_held") {
      hints.push({ bookingId: Number(row.booking_id), label });
    }
  }
  return hints;
}
