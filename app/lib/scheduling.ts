import "server-only";

import { sql } from "@/app/lib/db";
import type {
  BookingCapacityDiagnosticStage,
  BookingDiagnosticEvent,
} from "@/app/lib/booking-diagnostics";
import { withSchedulingTransaction } from "@/app/lib/scheduling-transaction";
import { recordSchedulingPolicyChange } from "@/app/lib/scheduling-policy-history";
import { hasPolicyValueChanged } from "@/app/lib/scheduling-policy-history-pure";
import {
  parseBookingTime,
  getZonedDateParts,
  SASKIA_TIME_ZONE,
  isValidBookingDateOnly,
  type AvailableSlot,
  type SchedulingBlock,
  type WeeklyAvailability,
} from "@/app/lib/scheduling-pure";

export type { AvailableSlot, WeeklyAvailability, SchedulingBlock };

function mapWeekly(row: Record<string, unknown>): WeeklyAvailability {
  return {
    dayOfWeek: Number(row.day_of_week),
    startTime: parseBookingTime(String(row.start_time)) ?? "09:00",
    endTime: parseBookingTime(String(row.end_time)) ?? "17:00",
    slotIntervalMinutes: Number(row.slot_interval_minutes) || 60,
    isActive: Boolean(row.is_active),
  };
}

function mapBlock(row: Record<string, unknown>): SchedulingBlock {
  const start =
    row.start_time == null ? null : parseBookingTime(String(row.start_time));
  const end =
    row.end_time == null ? null : parseBookingTime(String(row.end_time));
  const blockDate =
    row.block_date instanceof Date
      ? row.block_date.toISOString().slice(0, 10)
      : String(row.block_date).slice(0, 10);
  return {
    blockDate,
    startTime: start,
    endTime: end,
  };
}

export async function listWeeklyAvailability(): Promise<WeeklyAvailability[]> {
  const rows = await sql`
    SELECT day_of_week, start_time, end_time, slot_interval_minutes, is_active
    FROM scheduling_availability
    ORDER BY day_of_week ASC
  `;
  return (rows as Array<Record<string, unknown>>).map(mapWeekly);
}

export async function getWeeklyAvailabilityForDate(
  dateOnly: string,
): Promise<WeeklyAvailability | null> {
  if (!isValidBookingDateOnly(dateOnly)) return null;
  const [y, m, d] = dateOnly.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = getZonedDateParts(probe, SASKIA_TIME_ZONE).dayOfWeek;

  const rows = await sql`
    SELECT day_of_week, start_time, end_time, slot_interval_minutes, is_active
    FROM scheduling_availability
    WHERE day_of_week = ${dow}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapWeekly(row) : null;
}

export async function listBlocksForDate(
  dateOnly: string,
): Promise<SchedulingBlock[]> {
  const rows = await sql`
    SELECT block_date, start_time, end_time
    FROM scheduling_blocks
    WHERE block_date = ${dateOnly}::date
  `;
  return (rows as Array<Record<string, unknown>>).map(mapBlock);
}

export async function listBlocksInRange(
  fromDate: string,
  toDate: string,
): Promise<
  Array<SchedulingBlock & { id: number; reason: string | null }>
> {
  const rows = await sql`
    SELECT id, block_date, start_time, end_time, reason
    FROM scheduling_blocks
    WHERE block_date >= ${fromDate}::date
      AND block_date <= ${toDate}::date
    ORDER BY block_date ASC, start_time ASC NULLS FIRST
  `;
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: Number(row.id),
    ...mapBlock(row),
    reason: (row.reason as string | null) ?? null,
  }));
}

export async function listOccupiedTimesForDate(
  dateOnly: string,
  options?: { excludeBookingId?: number | null },
): Promise<string[]> {
  const excludeId = options?.excludeBookingId ?? null;
  const rows =
    excludeId != null
      ? await sql`
          SELECT booking_time
          FROM booking_requests
          WHERE booking_date = ${dateOnly}::date
            AND booking_time IS NOT NULL
            AND status IN ('new', 'contacted', 'scheduled', 'in_progress')
            AND id <> ${excludeId}
        `
      : await sql`
          SELECT booking_time
          FROM booking_requests
          WHERE booking_date = ${dateOnly}::date
            AND booking_time IS NOT NULL
            AND status IN ('new', 'contacted', 'scheduled', 'in_progress')
        `;

  return (rows as Array<{ booking_time: string }>)
    .map((r) => parseBookingTime(r.booking_time))
    .filter((t): t is string => Boolean(t));
}

export async function getAvailableSlotsForDate(
  dateOnly: string,
  options: {
    now?: Date;
    excludeBookingId?: number | null;
    ignoreOccupiedTime?: string | null;
    durationMinutes: number;
    bufferMinutes?: number;
  },
): Promise<AvailableSlot[]> {
  const { getAvailableSlotsWithCapacity } = await import(
    "@/app/lib/staff-capacity"
  );
  return getAvailableSlotsWithCapacity(dateOnly, {
    now: options?.now,
    excludeBookingId: options?.excludeBookingId,
    durationMinutes: options.durationMinutes,
    bufferMinutes: options.bufferMinutes,
  });
}

/**
 * Revalidate a slot at submission/approval time (staff-capacity aware).
 * Returns canonical HH:mm on success.
 */
export async function assertSlotAvailable(input: {
  dateOnly: string;
  time: unknown;
  durationMinutes: number;
  bufferMinutes?: number;
  excludeBookingId?: number | null;
  ignoreOccupiedTime?: string | null;
  requireTime?: boolean;
  diagnosticEvent?: BookingDiagnosticEvent;
  diagnosticStage?: BookingCapacityDiagnosticStage;
}): Promise<
  | { ok: true; time: string }
  | { ok: false; error: string; status: number; conflict?: boolean }
> {
  const { assertSlotHasCapacity } = await import("@/app/lib/staff-capacity");
  const result = await assertSlotHasCapacity({
    dateOnly: input.dateOnly,
    time: input.time,
    durationMinutes: input.durationMinutes,
    bufferMinutes: input.bufferMinutes,
    excludeBookingId: input.excludeBookingId,
    requireTime: input.requireTime,
    diagnosticEvent: input.diagnosticEvent,
    diagnosticStage: input.diagnosticStage,
  });
  if (!result.ok) return result;
  return { ok: true, time: result.time };
}

export async function upsertWeeklyAvailability(
  days: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotIntervalMinutes: number;
    isActive: boolean;
  }>,
  changedByAdminId?: string | null,
): Promise<WeeklyAvailability[]> {
  return withSchedulingTransaction(async () => {
  const normalizedDays = days.map((day) => {
    const start = parseBookingTime(day.startTime);
    const end = parseBookingTime(day.endTime);
    if (
      day.dayOfWeek < 0 ||
      day.dayOfWeek > 6 ||
      !start ||
      !end ||
      ![15, 30, 60].includes(day.slotIntervalMinutes)
    ) {
      throw new Error("Invalid availability row.");
    }
    return { ...day, startTime: start, endTime: end };
  });
  const existingRows = await sql`
    SELECT day_of_week, start_time, end_time, slot_interval_minutes, is_active
    FROM scheduling_availability
  `;
  const existingByDay = new Map((existingRows as Array<Record<string, unknown>>).map((row) => [
    Number(row.day_of_week),
    {
      dayOfWeek: Number(row.day_of_week),
      startTime: parseBookingTime(String(row.start_time)),
      endTime: parseBookingTime(String(row.end_time)),
      slotIntervalMinutes: Number(row.slot_interval_minutes),
      isActive: Boolean(row.is_active),
    },
  ]));
  const finalByDay = new Map(normalizedDays.map((day) => [day.dayOfWeek, day]));
  const changes = [...finalByDay.values()].flatMap((day) => {
    const before = existingByDay.get(day.dayOfWeek) ?? null;
    const after = {
      dayOfWeek: day.dayOfWeek,
      startTime: day.startTime,
      endTime: day.endTime,
      slotIntervalMinutes: day.slotIntervalMinutes,
      isActive: day.isActive,
    };
    return hasPolicyValueChanged(before, after) ? [{ before, after }] : [];
  });

  for (const day of normalizedDays) {

    await sql`
      INSERT INTO scheduling_availability (
        day_of_week, start_time, end_time, slot_interval_minutes, is_active, updated_at
      )
      VALUES (
        ${day.dayOfWeek},
        ${day.startTime}::time,
        ${day.endTime}::time,
        ${day.slotIntervalMinutes},
        ${day.isActive},
        now()
      )
      ON CONFLICT (day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        slot_interval_minutes = EXCLUDED.slot_interval_minutes,
        is_active = EXCLUDED.is_active,
        updated_at = now()
    `;
  }

  if (changes.length > 0) {
    await recordSchedulingPolicyChange({
      changeType: "weekly_availability",
      details: { changedDays: changes },
      changedByAdminId,
    });
  }

  return listWeeklyAvailability();
  });
}

export async function createSchedulingBlock(input: {
  blockDate: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}, changedByAdminId?: string | null): Promise<{ id: number } | { error: string }> {
  if (!isValidBookingDateOnly(input.blockDate)) {
    return { error: "Invalid block date." };
  }

  const start =
    input.startTime == null || input.startTime === ""
      ? null
      : parseBookingTime(input.startTime);
  const end =
    input.endTime == null || input.endTime === ""
      ? null
      : parseBookingTime(input.endTime);

  if ((start == null) !== (end == null)) {
    return { error: "Provide both start and end time, or leave both empty for a full-day block." };
  }
  if (start && end && start >= end) {
    return { error: "Block start must be before end." };
  }

  const reason =
    typeof input.reason === "string" && input.reason.trim()
      ? input.reason.trim().slice(0, 200)
      : null;

  return withSchedulingTransaction(async () => {
  const rows = await sql`
    INSERT INTO scheduling_blocks (block_date, start_time, end_time, reason)
    VALUES (
      ${input.blockDate}::date,
      ${start}::time,
      ${end}::time,
      ${reason}
    )
    RETURNING id
  `;
  const id = Number((rows[0] as { id: number }).id);
  await recordSchedulingPolicyChange({
    changeType: "scheduling_block_created",
    details: {
      operation: "create",
      blockId: id,
      blockDate: input.blockDate,
      startTime: start,
      endTime: end,
    },
    changedByAdminId,
  });

  return { id };
  });
}

export async function deleteSchedulingBlock(
  blockId: number,
  changedByAdminId?: string | null,
): Promise<boolean> {
  return withSchedulingTransaction(async () => {
  const rows = await sql`
    DELETE FROM scheduling_blocks
    WHERE id = ${blockId}
    RETURNING id, block_date, start_time, end_time
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return false;
  const blockDate = row.block_date instanceof Date
    ? row.block_date.toISOString().slice(0, 10)
    : String(row.block_date).slice(0, 10);
  await recordSchedulingPolicyChange({
    changeType: "scheduling_block_deleted",
    details: {
      operation: "delete",
      blockId: Number(row.id),
      blockDate,
      startTime: row.start_time == null ? null : parseBookingTime(String(row.start_time)),
      endTime: row.end_time == null ? null : parseBookingTime(String(row.end_time)),
    },
    changedByAdminId,
  });
  return true;
  });
}

export function isActiveSlotUniqueViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("booking_requests_active_slot_uidx") ||
    message.includes("booking_assignments_staff_active_slot_uidx") ||
    (message.includes("duplicate key") && message.includes("booking_date"))
  );
}
