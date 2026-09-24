/**
 * Server-side multi-cleaner capacity + atomic booking claim
 * (Phase 11.8 exact claim + Phase 11.9 overlap + Phase 11.10 buffers).
 */

import "server-only";

import { sql } from "@/app/lib/db";
import {
  dayOfWeekForDateOnly,
  generateAvailableSlots,
  isValidBookingDateOnly,
  parseBookingTime,
  SLOT_UNAVAILABLE_MESSAGE,
  type AvailableSlot,
  type SchedulingBlock,
  type WeeklyAvailability,
} from "@/app/lib/scheduling-pure";
import { parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";
import {
  getWeeklyAvailabilityForDate,
  listBlocksForDate,
} from "@/app/lib/scheduling";
import {
  bookingFitsBusinessHours,
  getBookingWindow,
  resolveEffectiveDurationMinutes,
  schedulingBlockOverlapsWindow,
} from "@/app/lib/booking-duration-pure";
import {
  getCapacityWindow,
  resolveEffectiveBufferMinutes,
  type CapacityWindow,
} from "@/app/lib/booking-buffer-pure";
import { getJobBufferMinutes } from "@/app/lib/booking-buffer";
import {
  CAPACITY_CONFLICT_MESSAGE,
  CAPACITY_UNAVAILABLE_MESSAGE,
  buildAssignedWindow,
  compareStaffForAutoAssign,
  pickAutoAssignStaffIdForWindow,
  staffIsEligibleForCapacityWindow,
  summarizeSlotCapacityForDuration,
  type SlotCapacitySummary,
  type StaffCapacitySnapshot,
} from "@/app/lib/staff-capacity-pure";
import { sendEmail } from "@/app/lib/email";
import { formatEstimatedDuration } from "@/app/lib/booking-duration-pure";

function mapTimeOff(
  start: unknown,
  end: unknown,
): { startTime: string | null; endTime: string | null } {
  return {
    startTime: start == null ? null : parseBookingTime(String(start)),
    endTime: end == null ? null : parseBookingTime(String(end)),
  };
}

/**
 * Load capacity-role staff with weekly window, time off, and assignment
 * windows for one date — set-based, not N+1 per slot.
 */
export async function loadStaffCapacitySnapshotsForDate(
  dateOnly: string,
): Promise<StaffCapacitySnapshot[]> {
  if (!isValidBookingDateOnly(dateOnly)) return [];
  const dow = dayOfWeekForDateOnly(dateOnly);
  if (dow == null) return [];

  const [staffRows, availRows, offRows, assignmentRows, upcomingRows] =
    await Promise.all([
      sql`
        SELECT id, role, is_active, created_at
        FROM staff_members
        WHERE role = 'cleaner'
      `,
      sql`
        SELECT staff_id, start_time, end_time, is_active
        FROM staff_availability
        WHERE day_of_week = ${dow}
      `,
      sql`
        SELECT staff_id, start_time, end_time
        FROM staff_time_off
        WHERE off_date = ${dateOnly}::date
      `,
      sql`
        SELECT
          a.staff_id,
          a.slot_time,
          b.duration_minutes,
          b.buffer_minutes
        FROM booking_assignments a
        INNER JOIN booking_requests b ON b.id = a.booking_id
        WHERE a.is_active = true
          AND a.is_primary = true
          AND a.slot_date = ${dateOnly}::date
          AND a.slot_time IS NOT NULL
          AND b.status IN (
            'new', 'contacted', 'scheduled', 'in_progress', 'completed'
          )
      `,
      sql`
        SELECT a.staff_id, COUNT(*)::int AS count
        FROM booking_assignments a
        INNER JOIN booking_requests b ON b.id = a.booking_id
        WHERE a.is_active = true
          AND a.is_primary = true
          AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
          AND (
            b.booking_date IS NULL
            OR b.booking_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York')
          )
        GROUP BY a.staff_id
      `,
    ]);

  const availByStaff = new Map<
    string,
    { startTime: string; endTime: string; isActive: boolean }
  >();
  for (const row of availRows as Array<Record<string, unknown>>) {
    const start = parseBookingTime(String(row.start_time));
    const end = parseBookingTime(String(row.end_time));
    if (!start || !end) continue;
    availByStaff.set(String(row.staff_id), {
      startTime: start,
      endTime: end,
      isActive: Boolean(row.is_active),
    });
  }

  const offByStaff = new Map<
    string,
    Array<{ startTime: string | null; endTime: string | null }>
  >();
  for (const row of offRows as Array<Record<string, unknown>>) {
    const id = String(row.staff_id);
    const list = offByStaff.get(id) ?? [];
    list.push(mapTimeOff(row.start_time, row.end_time));
    offByStaff.set(id, list);
  }

  const assignedByStaff = new Map<
    string,
    NonNullable<ReturnType<typeof buildAssignedWindow>>[]
  >();
  for (const row of assignmentRows as Array<Record<string, unknown>>) {
    const id = String(row.staff_id);
    const time = parseBookingTime(String(row.slot_time));
    if (!time) continue;
    const duration =
      row.duration_minutes == null ? null : Number(row.duration_minutes);
    const buffer =
      row.buffer_minutes == null ? null : Number(row.buffer_minutes);
    const window = buildAssignedWindow(time, duration, buffer);
    if (!window) continue;
    const list = assignedByStaff.get(id) ?? [];
    list.push(window);
    assignedByStaff.set(id, list);
  }

  const upcomingByStaff = new Map<string, number>();
  for (const row of upcomingRows as Array<{ staff_id: string; count: number }>) {
    upcomingByStaff.set(String(row.staff_id), Number(row.count));
  }

  return (staffRows as Array<Record<string, unknown>>).map((row) => {
    const id = String(row.id);
    return {
      id,
      role: String(row.role),
      isActive: Boolean(row.is_active),
      createdAt: row.created_at as string | Date,
      upcomingCount: upcomingByStaff.get(id) ?? 0,
      weekly: availByStaff.get(id) ?? null,
      timeOff: offByStaff.get(id) ?? [],
      assignedWindows: assignedByStaff.get(id) ?? [],
    };
  });
}

function filterCandidatesForDuration(input: {
  dateOnly: string;
  weekly: WeeklyAvailability | null;
  blocks: SchedulingBlock[];
  durationMinutes: number;
  now?: Date;
}): AvailableSlot[] {
  const raw = generateAvailableSlots({
    dateOnly: input.dateOnly,
    weekly: input.weekly,
    blocks: [],
    occupiedTimes: [],
    now: input.now,
  });
  if (!input.weekly || !input.weekly.isActive) return [];

  return raw.filter((slot) => {
    const window = getBookingWindow({
      dateOnly: input.dateOnly,
      startTime: slot.time,
      durationMinutes: input.durationMinutes,
    });
    if (!window) return false;
    if (
      !bookingFitsBusinessHours({
        window,
        businessStartTime: input.weekly!.startTime,
        businessEndTime: input.weekly!.endTime,
      })
    ) {
      return false;
    }
    for (const block of input.blocks) {
      if (block.blockDate !== input.dateOnly) continue;
      if (
        schedulingBlockOverlapsWindow({
          blockStartTime: block.startTime,
          blockEndTime: block.endTime,
          window,
        })
      ) {
        return false;
      }
    }
    return true;
  });
}

export async function getCapacityAwareSlotsForDate(
  dateOnly: string,
  options?: {
    now?: Date;
    excludeBookingId?: number | null;
    durationMinutes: number;
    /** When omitted, loads current scheduling_settings buffer. */
    bufferMinutes?: number;
  },
): Promise<SlotCapacitySummary[]> {
  if (!isValidBookingDateOnly(dateOnly)) return [];
  const durationMinutes = options?.durationMinutes;
  if (
    durationMinutes == null ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    return [];
  }

  const bufferMinutes =
    options?.bufferMinutes != null
      ? resolveEffectiveBufferMinutes(options.bufferMinutes)
      : await getJobBufferMinutes();

  const [weekly, blocks, staff] = await Promise.all([
    getWeeklyAvailabilityForDate(dateOnly),
    listBlocksForDate(dateOnly),
    loadStaffCapacitySnapshotsForDate(dateOnly),
  ]);

  // When excluding a booking (reschedule), drop its window from staff snapshots.
  let staffForEval = staff;
  if (options?.excludeBookingId) {
    const excludeRows = await sql`
      SELECT slot_time, duration_minutes, buffer_minutes
      FROM booking_assignments a
      INNER JOIN booking_requests b ON b.id = a.booking_id
      WHERE a.booking_id = ${options.excludeBookingId}
        AND a.is_active = true
        AND a.slot_date = ${dateOnly}::date
      LIMIT 1
    `;
    const ex = excludeRows[0] as
      | {
          slot_time: string;
          duration_minutes: number | null;
          buffer_minutes: number | null;
        }
      | undefined;
    if (ex) {
      const exTime = parseBookingTime(String(ex.slot_time));
      if (exTime) {
        staffForEval = staff.map((s) => ({
          ...s,
          assignedWindows: s.assignedWindows.filter(
            (w) => w.startTime !== exTime,
          ),
        }));
      }
    }
  }

  // Business hours: SERVICE window only (buffer may extend past close).
  const candidates = filterCandidatesForDuration({
    dateOnly,
    weekly,
    blocks,
    durationMinutes,
    now: options?.now,
  });

  // Staff eligibility: CAPACITY window (service + buffer).
  return summarizeSlotCapacityForDuration({
    candidateSlots: candidates,
    staff: staffForEval,
    durationMinutes,
    bufferMinutes,
    dateOnly,
  });
}

export async function getAvailableSlotsWithCapacity(
  dateOnly: string,
  options: {
    now?: Date;
    excludeBookingId?: number | null;
    durationMinutes: number;
    bufferMinutes?: number;
  },
): Promise<AvailableSlot[]> {
  const summaries = await getCapacityAwareSlotsForDate(dateOnly, options);
  return summaries
    .filter((s) => s.available)
    .map((s) => ({ time: s.time, label: s.label }));
}

export async function assertSlotHasCapacity(input: {
  dateOnly: string;
  time: unknown;
  durationMinutes: number;
  bufferMinutes?: number;
  excludeBookingId?: number | null;
  requireTime?: boolean;
}): Promise<
  | { ok: true; time: string; window: CapacityWindow }
  | { ok: false; error: string; status: number; conflict?: boolean }
> {
  const requireTime = input.requireTime !== false;
  const parsed = parseBookingTime(
    typeof input.time === "string" ? input.time : null,
  );
  if (!parsed) {
    return {
      ok: false,
      error: requireTime
        ? "Please select an available appointment time."
        : "Invalid appointment time.",
      status: 400,
    };
  }
  if (!isValidBookingDateOnly(input.dateOnly)) {
    return { ok: false, error: "Invalid booking date.", status: 400 };
  }

  const bufferMinutes =
    input.bufferMinutes != null
      ? resolveEffectiveBufferMinutes(input.bufferMinutes)
      : await getJobBufferMinutes();

  const window = getCapacityWindow({
    dateOnly: input.dateOnly,
    startTime: parsed,
    durationMinutes: input.durationMinutes,
    bufferMinutes,
  });
  if (!window) {
    return {
      ok: false,
      error: SLOT_UNAVAILABLE_MESSAGE,
      status: 400,
    };
  }

  try {
    const summaries = await getCapacityAwareSlotsForDate(input.dateOnly, {
      excludeBookingId: input.excludeBookingId,
      durationMinutes: input.durationMinutes,
      bufferMinutes,
    });

    const match = summaries.find((s) => s.time === parsed);
    if (!match) {
      return {
        ok: false,
        error: SLOT_UNAVAILABLE_MESSAGE,
        status: 400,
      };
    }
    if (!match.available) {
      return {
        ok: false,
        error: CAPACITY_CONFLICT_MESSAGE,
        status: 409,
        conflict: true,
      };
    }
    return { ok: true, time: parsed, window };
  } catch (error) {
    console.error("Capacity check failed:", error);
    return {
      ok: false,
      error: CAPACITY_UNAVAILABLE_MESSAGE,
      status: 503,
    };
  }
}

export type BookingInsertFields = {
  name: string;
  email: string;
  mobile: string | null;
  bedrooms: number;
  bathrooms: number;
  service: string | null;
  frequency: string | null;
  location: string;
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  extrasJson: string;
  estimateLow: number | null;
  estimateMid: number | null;
  estimateHigh: number | null;
  notes: string | null;
  referralCode: string | null;
  customerId: string | null;
};

function isOverlapClaimViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("booking_assignments_staff_active_slot_uidx") ||
    message.includes("booking_assignments_one_active_primary_uidx") ||
    message.includes("booking_assignments_staff_window_excl") ||
    message.includes("exclusion") ||
    message.includes("overlapping")
  );
}

/**
 * Atomically insert booking + primary assignment with capacity window
 * (service duration + post-job buffer snapshot).
 * Retries next cleaner on unique/exclusion conflict.
 */
export async function createBookingWithCapacityClaim(
  fields: BookingInsertFields,
): Promise<
  | { ok: true; booking: Record<string, unknown>; staffId: string }
  | { ok: false; error: string; status: number }
> {
  const bufferMinutes = resolveEffectiveBufferMinutes(fields.bufferMinutes);
  const window = getCapacityWindow({
    dateOnly: fields.bookingDate,
    startTime: fields.bookingTime,
    durationMinutes: fields.durationMinutes,
    bufferMinutes,
  });
  if (!window) {
    return { ok: false, error: SLOT_UNAVAILABLE_MESSAGE, status: 400 };
  }

  let staff: StaffCapacitySnapshot[];
  try {
    staff = await loadStaffCapacitySnapshotsForDate(fields.bookingDate);
  } catch (error) {
    console.error("Capacity infrastructure error:", error);
    return { ok: false, error: CAPACITY_UNAVAILABLE_MESSAGE, status: 503 };
  }

  const ordered = [...staff]
    .filter((s) => staffIsEligibleForCapacityWindow(s, window))
    .sort(compareStaffForAutoAssign);

  if (ordered.length === 0) {
    return { ok: false, error: CAPACITY_CONFLICT_MESSAGE, status: 409 };
  }

  const windowStartIso = window.windowStartUtc.toISOString();
  const windowEndIso = window.windowEndUtc.toISOString();

  for (const candidate of ordered) {
    try {
      const rows = await sql`
        WITH new_booking AS (
          INSERT INTO booking_requests (
            name, email, mobile, bedrooms, bathrooms, service, frequency,
            location, booking_date, booking_time, duration_minutes,
            buffer_minutes, extras,
            estimate_low, estimate_mid, estimate_high, notes,
            referral_code, seen, customer_id
          )
          VALUES (
            ${fields.name}, ${fields.email}, ${fields.mobile},
            ${fields.bedrooms}, ${fields.bathrooms}, ${fields.service},
            ${fields.frequency}, ${fields.location},
            ${fields.bookingDate}::date, ${fields.bookingTime}::time,
            ${fields.durationMinutes},
            ${bufferMinutes},
            ${fields.extrasJson},
            ${fields.estimateLow}, ${fields.estimateMid}, ${fields.estimateHigh},
            ${fields.notes}, ${fields.referralCode}, false, ${fields.customerId}
          )
          RETURNING *
        ),
        new_assignment AS (
          INSERT INTO booking_assignments (
            booking_id, staff_id, assigned_by, is_primary,
            slot_date, slot_time, is_active,
            window_start, window_end
          )
          SELECT
            nb.id, ${candidate.id}::uuid, 'auto', true,
            ${fields.bookingDate}::date, ${fields.bookingTime}::time, true,
            ${windowStartIso}::timestamptz,
            ${windowEndIso}::timestamptz
          FROM new_booking nb
          RETURNING booking_id, staff_id
        )
        SELECT nb.*, na.staff_id AS claimed_staff_id
        FROM new_booking nb
        INNER JOIN new_assignment na ON na.booking_id = nb.id
      `;

      const booking = rows[0] as Record<string, unknown> | undefined;
      if (!booking) {
        return { ok: false, error: CAPACITY_UNAVAILABLE_MESSAGE, status: 503 };
      }

      try {
        const staffRows = await sql`
          SELECT name, email FROM staff_members WHERE id = ${candidate.id} LIMIT 1
        `;
        const member = staffRows[0] as
          | { name: string; email: string }
          | undefined;
        if (member?.email) {
          await sendEmail({
            to: member.email,
            subject: `New job assignment — Saskia Cleaning (#${booking.id})`,
            text: [
              `Hi ${member.name},`,
              "",
              "You've been assigned a cleaning job.",
              `Booking #: ${booking.id}`,
              `Service: ${fields.service ?? "Cleaning"}`,
              `Date: ${fields.bookingDate}`,
              `Time: ${fields.bookingTime}`,
              `Estimated duration: ${formatEstimatedDuration(fields.durationMinutes)}`,
              `Reserved until: ${window.endTime}`,
              `Location: ${fields.location}`,
              "",
              "View your jobs: https://saskiaservices.com/staff",
              "",
              "— Saskia Cleaning",
            ].join("\n"),
          });
        }
      } catch (emailError) {
        console.error("Auto-assignment email failed");
        void emailError;
      }

      return {
        ok: true,
        booking,
        staffId: String(booking.claimed_staff_id ?? candidate.id),
      };
    } catch (error) {
      if (isOverlapClaimViolation(error)) continue;
      console.error("Booking capacity claim failed:", error);
      return { ok: false, error: CAPACITY_UNAVAILABLE_MESSAGE, status: 503 };
    }
  }

  return { ok: false, error: CAPACITY_CONFLICT_MESSAGE, status: 409 };
}

/**
 * Atomically approve reschedule using stored duration_minutes + buffer_minutes.
 */
export async function rescheduleBookingWithCapacityClaim(input: {
  bookingId: number;
  newDate: string;
  newTime: string;
  changeRequestId: number;
  customerMessage: string | null;
  preferStaffId?: string | null;
}): Promise<
  | { ok: true; staffId: string; retained: boolean }
  | { ok: false; error: string; status: number }
> {
  const bookingRows = await sql`
    SELECT id, booking_date, booking_time, status, duration_minutes, buffer_minutes
    FROM booking_requests
    WHERE id = ${input.bookingId}
    LIMIT 1
  `;
  const booking = bookingRows[0] as Record<string, unknown> | undefined;
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  const durationMinutes = resolveEffectiveDurationMinutes(
    booking.duration_minutes == null
      ? null
      : Number(booking.duration_minutes),
  );
  const bufferMinutes = resolveEffectiveBufferMinutes(
    booking.buffer_minutes == null ? null : Number(booking.buffer_minutes),
  );

  const window = getCapacityWindow({
    dateOnly: input.newDate,
    startTime: input.newTime,
    durationMinutes,
    bufferMinutes,
  });
  if (!window) {
    return { ok: false, error: SLOT_UNAVAILABLE_MESSAGE, status: 400 };
  }

  const assignmentRows = await sql`
    SELECT id, staff_id
    FROM booking_assignments
    WHERE booking_id = ${input.bookingId}
      AND is_primary = true
      AND is_active = true
    LIMIT 1
  `;
  const currentStaffId = assignmentRows[0]
    ? String((assignmentRows[0] as { staff_id: string }).staff_id)
    : input.preferStaffId ?? null;

  let staff: StaffCapacitySnapshot[];
  try {
    staff = await loadStaffCapacitySnapshotsForDate(input.newDate);
  } catch (error) {
    console.error("Reschedule capacity load failed:", error);
    return { ok: false, error: CAPACITY_UNAVAILABLE_MESSAGE, status: 503 };
  }

  // Free this booking's current window from eligibility evaluation.
  const staffForPick = staff.map((s) => {
    if (s.id !== currentStaffId) return s;
    return {
      ...s,
      assignedWindows: s.assignedWindows.filter((w) => {
        const oldDate = parseBookingDateOnly(
          booking.booking_date as string | Date | null,
        );
        const oldTime = parseBookingTime(
          booking.booking_time == null
            ? null
            : String(booking.booking_time),
        );
        if (oldDate === input.newDate && oldTime && w.startTime === oldTime) {
          return false;
        }
        return true;
      }),
    };
  });

  const candidates: string[] = [];
  if (currentStaffId) {
    const current = staffForPick.find((s) => s.id === currentStaffId);
    if (current && staffIsEligibleForCapacityWindow(current, window)) {
      candidates.push(currentStaffId);
    }
  }
  for (const id of [...staffForPick]
    .filter((s) => staffIsEligibleForCapacityWindow(s, window))
    .sort(compareStaffForAutoAssign)
    .map((s) => s.id)) {
    if (!candidates.includes(id)) candidates.push(id);
  }

  if (candidates.length === 0) {
    return { ok: false, error: CAPACITY_CONFLICT_MESSAGE, status: 409 };
  }

  const windowStartIso = window.windowStartUtc.toISOString();
  const windowEndIso = window.windowEndUtc.toISOString();

  for (const chosenId of candidates) {
    const retained = chosenId === currentStaffId;
    try {
      const rows = await sql`
        WITH claim_request AS (
          UPDATE booking_change_requests
          SET
            status = 'approved',
            customer_message = ${input.customerMessage},
            updated_at = now(),
            resolved_at = now()
          WHERE id = ${input.changeRequestId}
            AND status = 'pending'
          RETURNING id, booking_id
        ),
        updated_booking AS (
          UPDATE booking_requests b
          SET
            booking_date = ${input.newDate}::date,
            booking_time = ${input.newTime}::time
          FROM claim_request r
          WHERE b.id = r.booking_id
          RETURNING b.id
        ),
        released AS (
          UPDATE booking_assignments
          SET
            is_active = false,
            released_at = now(),
            release_reason = 'rescheduled',
            updated_at = now()
          WHERE booking_id = ${input.bookingId}
            AND is_active = true
          RETURNING id
        ),
        new_assignment AS (
          INSERT INTO booking_assignments (
            booking_id, staff_id, assigned_by, is_primary,
            slot_date, slot_time, is_active,
            window_start, window_end
          )
          SELECT
            ${input.bookingId},
            ${chosenId}::uuid,
            ${retained ? "reschedule-retain" : "reschedule-auto"},
            true,
            ${input.newDate}::date,
            ${input.newTime}::time,
            true,
            ${windowStartIso}::timestamptz,
            ${windowEndIso}::timestamptz
          FROM updated_booking
          RETURNING staff_id
        )
        SELECT staff_id FROM new_assignment
      `;

      if (!rows[0]) {
        return {
          ok: false,
          error: "This request was already resolved.",
          status: 409,
        };
      }

      if (!retained && currentStaffId && currentStaffId !== chosenId) {
        try {
          const [prevRows, nextRows] = await Promise.all([
            sql`SELECT name, email FROM staff_members WHERE id = ${currentStaffId} LIMIT 1`,
            sql`SELECT name, email FROM staff_members WHERE id = ${chosenId} LIMIT 1`,
          ]);
          const prev = prevRows[0] as
            | { name: string; email: string }
            | undefined;
          const next = nextRows[0] as
            | { name: string; email: string }
            | undefined;
          if (prev?.email) {
            await sendEmail({
              to: prev.email,
              subject: `Job reassigned — Saskia Cleaning (#${input.bookingId})`,
              text: [
                `Hi ${prev.name},`,
                "",
                `Booking #${input.bookingId} was rescheduled and is no longer assigned to you.`,
                "",
                "— Saskia Cleaning",
              ].join("\n"),
            });
          }
          if (next?.email) {
            await sendEmail({
              to: next.email,
              subject: `New job assignment — Saskia Cleaning (#${input.bookingId})`,
              text: [
                `Hi ${next.name},`,
                "",
                "You've been assigned a cleaning job (reschedule).",
                `Booking #: ${input.bookingId}`,
                `Date: ${input.newDate}`,
                `Time: ${input.newTime}`,
                `Estimated duration: ${formatEstimatedDuration(durationMinutes)}`,
                `Reserved until: ${window.endTime}`,
                "",
                "— Saskia Cleaning",
              ].join("\n"),
            });
          }
        } catch (emailError) {
          console.error("Reschedule assignment email failed");
          void emailError;
        }
      }

      return { ok: true, staffId: chosenId, retained };
    } catch (error) {
      if (isOverlapClaimViolation(error)) continue;
      console.error("Reschedule capacity claim failed:", error);
      return { ok: false, error: CAPACITY_UNAVAILABLE_MESSAGE, status: 503 };
    }
  }

  return { ok: false, error: CAPACITY_CONFLICT_MESSAGE, status: 409 };
}

export { releaseAssignmentCapacity } from "@/app/lib/capacity-release";

export async function backfillUnassignedFutureBookings(): Promise<{
  assigned: number;
  remaining: number;
  remainingIds: number[];
}> {
  const rows = await sql`
    SELECT id, booking_date, booking_time, duration_minutes, buffer_minutes, service
    FROM booking_requests b
    WHERE b.booking_time IS NOT NULL
      AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
      AND b.booking_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York')
      AND NOT EXISTS (
        SELECT 1 FROM booking_assignments a
        WHERE a.booking_id = b.id
          AND a.is_primary = true
          AND a.is_active = true
      )
    ORDER BY b.booking_date ASC, b.booking_time ASC, b.id ASC
  `;

  let assigned = 0;
  const remainingIds: number[] = [];

  for (const row of rows as Array<{
    id: number;
    booking_date: string | Date;
    booking_time: string;
    duration_minutes: number | null;
    buffer_minutes: number | null;
  }>) {
    const dateOnly = parseBookingDateOnly(row.booking_date);
    const time = parseBookingTime(String(row.booking_time));
    if (!dateOnly || !time) {
      remainingIds.push(Number(row.id));
      continue;
    }
    const durationMinutes = resolveEffectiveDurationMinutes(
      row.duration_minutes == null ? null : Number(row.duration_minutes),
    );
    const bufferMinutes = resolveEffectiveBufferMinutes(
      row.buffer_minutes == null ? null : Number(row.buffer_minutes),
    );
    const window = getCapacityWindow({
      dateOnly,
      startTime: time,
      durationMinutes,
      bufferMinutes,
    });
    if (!window) {
      remainingIds.push(Number(row.id));
      continue;
    }
    const snapshots = await loadStaffCapacitySnapshotsForDate(dateOnly);
    const pick = pickAutoAssignStaffIdForWindow(snapshots, window);
    if (!pick) {
      remainingIds.push(Number(row.id));
      continue;
    }
    try {
      await sql`
        INSERT INTO booking_assignments (
          booking_id, staff_id, assigned_by, is_primary,
          slot_date, slot_time, is_active,
          window_start, window_end
        )
        VALUES (
          ${Number(row.id)}, ${pick}::uuid, 'backfill-11.10', true,
          ${dateOnly}::date, ${time}::time, true,
          ${window.windowStartUtc.toISOString()}::timestamptz,
          ${window.windowEndUtc.toISOString()}::timestamptz
        )
      `;
      assigned += 1;
    } catch {
      remainingIds.push(Number(row.id));
    }
  }

  return { assigned, remaining: remainingIds.length, remainingIds };
}
