/**
 * Server-side operational exceptions queue — Phase 11.12.
 */

import "server-only";

import { sql } from "@/app/lib/db";
import { parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";
import {
  formatBookingTime,
  getZonedDateParts,
  parseBookingTime,
  SASKIA_TIME_ZONE,
} from "@/app/lib/scheduling-pure";
import {
  formatBookingTimeRange,
  resolveEffectiveDurationMinutes,
} from "@/app/lib/booking-duration-pure";
import {
  resolveEffectiveBufferMinutes,
  getCapacityWindow,
} from "@/app/lib/booking-buffer-pure";
import {
  classifyOpsException,
  countsAsNeedsAttention,
  opsExceptionSeverity,
  validateAdminReleaseRequest,
  OPS_EXCEPTION_LABELS,
  type OpsExceptionType,
  type OpsSeverity,
} from "@/app/lib/ops-exceptions-pure";

export type OpsExceptionItem = {
  bookingId: number;
  service: string | null;
  bookingDate: string | null;
  bookingTime: string | null;
  serviceRange: string | null;
  reservedUntil: string | null;
  status: string;
  assignmentActive: boolean;
  staffId: string | null;
  staffName: string | null;
  staffActive: boolean | null;
  exceptionType: OpsExceptionType;
  exceptionLabel: string;
  severity: OpsSeverity;
  windowEndIso: string | null;
  followupLatestAt: string | null;
  followupNextAt: string | null;
  followupUnresolvedCount: number;
  followupDue: boolean;
};

export type OpsExceptionSummary = {
  needsAttention: number;
  overdue: number;
  capacityHeld: number;
  releasePending: number;
  unassigned: number;
  critical: number;
  followupDue: number;
  total: number;
};

function todayInSaskiaZone(now = new Date()): string {
  return getZonedDateParts(now, SASKIA_TIME_ZONE).dateOnly;
}

function formatNyTime(iso: string | Date | null): string | null {
  if (iso == null) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SASKIA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Set-based load + classify. No PII (no name/email/mobile/location).
 */
export async function listOpsExceptions(options?: {
  now?: Date;
}): Promise<{
  items: OpsExceptionItem[];
  summary: OpsExceptionSummary;
}> {
  const now = options?.now ?? new Date();
  const today = todayInSaskiaZone(now);

  const [assignedRows, unassignedRows] = await Promise.all([
    sql`
      SELECT
        b.id AS booking_id,
        b.service,
        b.status,
        b.booking_date,
        b.booking_time,
        b.duration_minutes,
        b.buffer_minutes,
        a.is_active AS assignment_active,
        a.window_start,
        a.window_end,
        a.staff_id,
        s.name AS staff_name,
        s.is_active AS staff_active
      FROM booking_assignments a
      INNER JOIN booking_requests b ON b.id = a.booking_id
      LEFT JOIN staff_members s ON s.id = a.staff_id
      WHERE a.is_primary = true
        AND a.is_active = true
        AND (
          b.booking_date IS NULL
          OR b.booking_date >= (${today}::date - INTERVAL '30 days')
        )
    `,
    sql`
      SELECT
        b.id AS booking_id,
        b.service,
        b.status,
        b.booking_date,
        b.booking_time,
        b.duration_minutes,
        b.buffer_minutes
      FROM booking_requests b
      WHERE b.booking_time IS NOT NULL
        AND b.booking_date IS NOT NULL
        AND b.booking_date >= ${today}::date
        AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
        AND NOT EXISTS (
          SELECT 1
          FROM booking_assignments a
          WHERE a.booking_id = b.id
            AND a.is_primary = true
            AND a.is_active = true
        )
    `,
  ]);

  const items: OpsExceptionItem[] = [];

  for (const row of assignedRows as Array<Record<string, unknown>>) {
    const bookingId = Number(row.booking_id);
    const status = String(row.status);
    const bookingDate = parseBookingDateOnly(
      row.booking_date as string | Date | null,
    );
    const bookingTime = parseBookingTime(
      row.booking_time == null ? null : String(row.booking_time),
    );
    const duration = resolveEffectiveDurationMinutes(
      row.duration_minutes == null ? null : Number(row.duration_minutes),
    );
    const buffer = resolveEffectiveBufferMinutes(
      row.buffer_minutes == null ? null : Number(row.buffer_minutes),
    );
    const windowEnd = row.window_end as string | Date | null;
    const staffActive =
      row.staff_active == null ? null : Boolean(row.staff_active);

    const type = classifyOpsException({
      status,
      bookingDate,
      hasActiveAssignment: true,
      windowEndUtc: windowEnd,
      staffIsActive: staffActive,
      todayDateOnly: today,
      now,
    });
    if (!type) continue;

    let serviceRange: string | null = null;
    let reservedUntil: string | null = null;
    if (bookingDate && bookingTime) {
      serviceRange = formatBookingTimeRange(bookingTime, duration);
      const capacity = getCapacityWindow({
        dateOnly: bookingDate,
        startTime: bookingTime,
        durationMinutes: duration,
        bufferMinutes: buffer,
      });
      reservedUntil = capacity
        ? formatBookingTime(capacity.endTime)
        : formatNyTime(windowEnd);
    } else {
      reservedUntil = formatNyTime(windowEnd);
    }

    items.push({
      bookingId,
      service: row.service == null ? null : String(row.service),
      bookingDate,
      bookingTime,
      serviceRange,
      reservedUntil,
      status,
      assignmentActive: true,
      staffId: row.staff_id == null ? null : String(row.staff_id),
      staffName: row.staff_name == null ? null : String(row.staff_name),
      staffActive,
      exceptionType: type,
      exceptionLabel: OPS_EXCEPTION_LABELS[type],
      severity: opsExceptionSeverity(type),
      windowEndIso:
        windowEnd == null ? null : new Date(windowEnd).toISOString(),
      followupLatestAt: null,
      followupNextAt: null,
      followupUnresolvedCount: 0,
      followupDue: false,
    });
  }

  for (const row of unassignedRows as Array<Record<string, unknown>>) {
    const bookingId = Number(row.booking_id);
    const status = String(row.status);
    const bookingDate = parseBookingDateOnly(
      row.booking_date as string | Date | null,
    );
    const bookingTime = parseBookingTime(
      row.booking_time == null ? null : String(row.booking_time),
    );
    const duration = resolveEffectiveDurationMinutes(
      row.duration_minutes == null ? null : Number(row.duration_minutes),
    );
    const buffer = resolveEffectiveBufferMinutes(
      row.buffer_minutes == null ? null : Number(row.buffer_minutes),
    );

    const type = classifyOpsException({
      status,
      bookingDate,
      hasActiveAssignment: false,
      windowEndUtc: null,
      staffIsActive: null,
      todayDateOnly: today,
      now,
    });
    if (!type) continue;

    let serviceRange: string | null = null;
    let reservedUntil: string | null = null;
    if (bookingDate && bookingTime) {
      serviceRange = formatBookingTimeRange(bookingTime, duration);
      const capacity = getCapacityWindow({
        dateOnly: bookingDate,
        startTime: bookingTime,
        durationMinutes: duration,
        bufferMinutes: buffer,
      });
      reservedUntil = capacity ? formatBookingTime(capacity.endTime) : null;
    }

    items.push({
      bookingId,
      service: row.service == null ? null : String(row.service),
      bookingDate,
      bookingTime,
      serviceRange,
      reservedUntil,
      status,
      assignmentActive: false,
      staffId: null,
      staffName: null,
      staffActive: null,
      exceptionType: type,
      exceptionLabel: OPS_EXCEPTION_LABELS[type],
      severity: opsExceptionSeverity(type),
      windowEndIso: null,
      followupLatestAt: null,
      followupNextAt: null,
      followupUnresolvedCount: 0,
      followupDue: false,
    });
  }

  // Batch-attach follow-up summaries (set-based).
  const { listFollowupSummariesForBookings, countDueFollowups } = await import(
    "@/app/lib/booking-followups"
  );
  const summaries = await listFollowupSummariesForBookings(
    items.map((i) => i.bookingId),
  );
  for (const item of items) {
    const s = summaries.get(item.bookingId);
    if (!s) continue;
    item.followupLatestAt = s.latestCreatedAt;
    item.followupNextAt = s.nextFollowupAt;
    item.followupUnresolvedCount = s.unresolvedCount;
    item.followupDue = s.hasDue;
  }

  items.sort((a, b) => {
    const sevRank = { critical: 0, warning: 1, info: 2 };
    const d = sevRank[a.severity] - sevRank[b.severity];
    if (d !== 0) return d;
    return b.bookingId - a.bookingId;
  });

  const dueTotal = await countDueFollowups();

  const summary: OpsExceptionSummary = {
    needsAttention: 0,
    overdue: 0,
    capacityHeld: 0,
    releasePending: 0,
    unassigned: 0,
    critical: 0,
    followupDue: dueTotal,
    total: items.length,
  };

  for (const item of items) {
    if (countsAsNeedsAttention(item.exceptionType)) {
      summary.needsAttention += 1;
    }
    if (
      item.exceptionType === "OVERDUE_NOT_STARTED" ||
      item.exceptionType === "OVERDUE_IN_PROGRESS"
    ) {
      summary.overdue += 1;
    }
    if (item.exceptionType === "CAPACITY_HELD_AFTER_COMPLETION") {
      summary.capacityHeld += 1;
    }
    if (item.exceptionType === "RELEASE_PENDING") {
      summary.releasePending += 1;
    }
    if (item.exceptionType === "UNASSIGNED_FUTURE_BOOKING") {
      summary.unassigned += 1;
    }
    if (item.severity === "critical") {
      summary.critical += 1;
    }
  }

  return { items, summary };
}

export async function countOpsNeedsAttention(): Promise<number> {
  const { summary } = await listOpsExceptions();
  return summary.needsAttention;
}

/**
 * Admin manual soft-release for one booking.
 * Does NOT change booking status.
 */
export async function adminReleaseBookingCapacity(input: {
  bookingId: number;
  confirm: unknown;
  reason?: unknown;
}): Promise<
  | {
      ok: true;
      released: true;
      assignmentId: string;
      releaseReason: "admin_release";
    }
  | { ok: true; released: false; alreadyReleased: true }
  | { ok: false; error: string; status: number }
> {
  if (!Number.isInteger(input.bookingId) || input.bookingId <= 0) {
    return { ok: false, error: "Invalid booking.", status: 400 };
  }

  const bookingRows = await sql`
    SELECT id, status
    FROM booking_requests
    WHERE id = ${input.bookingId}
    LIMIT 1
  `;
  const booking = bookingRows[0] as
    | { id: number; status: string }
    | undefined;
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const validation = validateAdminReleaseRequest({
    status: String(booking.status),
    confirm: input.confirm,
    reason: input.reason,
  });
  if (!validation.ok) {
    return { ok: false, error: validation.error, status: 400 };
  }

  const activeRows = await sql`
    SELECT id
    FROM booking_assignments
    WHERE booking_id = ${input.bookingId}
      AND is_active = true
    LIMIT 1
  `;
  if (!activeRows[0]) {
    return { ok: true, released: false, alreadyReleased: true };
  }

  const updated = await sql`
    UPDATE booking_assignments
    SET
      is_active = false,
      released_at = now(),
      release_reason = 'admin_release',
      updated_at = now()
    WHERE booking_id = ${input.bookingId}
      AND is_active = true
    RETURNING id
  `;

  const row = updated[0] as { id: string } | undefined;
  if (!row) {
    // Race with cron/cancel — treat as already released.
    return { ok: true, released: false, alreadyReleased: true };
  }

  console.info(
    JSON.stringify({
      event: "capacity_release",
      source: "manual",
      released_count: 1,
      booking_id: input.bookingId,
      timestamp: new Date().toISOString(),
    }),
  );

  return {
    ok: true,
    released: true,
    assignmentId: String(row.id),
    releaseReason: "admin_release",
  };
}
