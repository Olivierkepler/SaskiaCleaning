import "server-only";

import { sql } from "@/app/lib/db";
import {
  formatStaffRole,
  hasOverlappingStaffConflict,
  isStaffRole,
  isTimeWithinStaffAvailability,
  normalizeStaffEmail,
  normalizeStaffName,
  normalizeStaffPhone,
  type StaffRole,
} from "@/app/lib/staff-pure";
import {
  dayOfWeekForDateOnly,
  parseBookingTime,
  isValidBookingDateOnly,
  isCapacityConsumingStatus,
} from "@/app/lib/scheduling-pure";
import { parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";
import { sendEmail } from "@/app/lib/email";
import {
  getBookingWindow,
  resolveEffectiveDurationMinutes,
  staffAvailabilityCoversWindow,
  staffTimeOffOverlapsWindow,
  formatEstimatedDuration,
} from "@/app/lib/booking-duration-pure";

export type StaffMember = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: StaffRole;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type StaffAvailabilityDay = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type StaffTimeOff = {
  id: number;
  staffId: string;
  offDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};

export type BookingAssignment = {
  id: string;
  bookingId: number;
  staffId: string;
  assignedAt: Date | string;
  assignedBy: string | null;
  isPrimary: boolean;
  staffName?: string;
  staffEmail?: string;
};

function mapStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    phone: (row.phone as string | null) ?? null,
    role: row.role as StaffRole,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as Date | string,
    updatedAt: row.updated_at as Date | string,
  };
}

export async function findStaffByEmail(
  email: string,
): Promise<StaffMember | null> {
  const normalized = normalizeStaffEmail(email);
  if (!normalized.ok) return null;
  const rows = await sql`
    SELECT *
    FROM staff_members
    WHERE lower(btrim(email)) = ${normalized.email}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapStaff(row) : null;
}

export async function findStaffById(
  id: string,
): Promise<StaffMember | null> {
  const rows = await sql`
    SELECT *
    FROM staff_members
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapStaff(row) : null;
}

export async function findActiveStaffByEmail(
  email: string,
): Promise<StaffMember | null> {
  const staff = await findStaffByEmail(email);
  if (!staff || !staff.isActive) return null;
  return staff;
}

export async function listStaffMembers(): Promise<StaffMember[]> {
  const rows = await sql`
    SELECT *
    FROM staff_members
    ORDER BY is_active DESC, name ASC
  `;
  return (rows as Array<Record<string, unknown>>).map(mapStaff);
}

async function seedDefaultStaffAvailability(staffId: string): Promise<void> {
  // Mon–Fri 09:00–17:00 active; Sat/Sun inactive (mirrors business defaults).
  for (let dow = 0; dow <= 6; dow++) {
    const active = dow >= 1 && dow <= 5;
    await sql`
      INSERT INTO staff_availability (
        staff_id, day_of_week, start_time, end_time, is_active
      )
      VALUES (
        ${staffId},
        ${dow},
        '09:00'::time,
        '17:00'::time,
        ${active}
      )
      ON CONFLICT (staff_id, day_of_week) DO NOTHING
    `;
  }
}

export async function createStaffMember(input: unknown): Promise<
  | { ok: true; staff: StaffMember }
  | { ok: false; error: string; status: number }
> {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid staff data.", status: 400 };
  }
  const record = input as Record<string, unknown>;
  const nameResult = normalizeStaffName(record.name);
  if (!nameResult.ok) {
    return { ok: false, error: nameResult.error, status: 400 };
  }
  const emailResult = normalizeStaffEmail(String(record.email ?? ""));
  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error, status: 400 };
  }
  const phoneResult = normalizeStaffPhone(record.phone);
  if (!phoneResult.ok) {
    return { ok: false, error: phoneResult.error, status: 400 };
  }
  const role =
    typeof record.role === "string" && isStaffRole(record.role)
      ? record.role
      : "cleaner";
  const isActive = record.isActive !== false;

  try {
    const rows = await sql`
      INSERT INTO staff_members (email, name, phone, role, is_active)
      VALUES (
        ${emailResult.email},
        ${nameResult.name},
        ${phoneResult.phone},
        ${role},
        ${isActive}
      )
      RETURNING *
    `;
    const staff = mapStaff(rows[0] as Record<string, unknown>);
    await seedDefaultStaffAvailability(staff.id);

    // Invite email failure must not roll back creation.
    try {
      await sendEmail({
        to: staff.email,
        subject: "You've been added to Saskia Cleaning",
        text: [
          `Hi ${staff.name},`,
          "",
          "You've been added as a staff member at Saskia Cleaning.",
          `Role: ${formatStaffRole(staff.role)}`,
          "",
          "Sign in with your Google account here:",
          "https://saskiaservices.com/staff/login",
          "",
          "Only approved staff Google accounts can access the staff portal.",
          "",
          "— Saskia Cleaning",
        ].join("\n"),
      });
    } catch (error) {
      console.error("Staff invite email failed");
      void error;
    }

    return { ok: true, staff };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("staff_members_email_uidx") || message.includes("duplicate")) {
      return {
        ok: false,
        error: "A staff member with this email already exists.",
        status: 409,
      };
    }
    console.error(error);
    return { ok: false, error: "Failed to create staff member.", status: 500 };
  }
}

export async function updateStaffMember(
  staffId: string,
  input: unknown,
): Promise<
  | { ok: true; staff: StaffMember }
  | { ok: false; error: string; status: number }
> {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid staff data.", status: 400 };
  }
  const record = input as Record<string, unknown>;
  const nameResult = normalizeStaffName(record.name);
  if (!nameResult.ok) {
    return { ok: false, error: nameResult.error, status: 400 };
  }
  const phoneResult = normalizeStaffPhone(record.phone);
  if (!phoneResult.ok) {
    return { ok: false, error: phoneResult.error, status: 400 };
  }
  const role =
    typeof record.role === "string" && isStaffRole(record.role)
      ? record.role
      : "cleaner";
  const isActive = Boolean(record.isActive);

  if (!isActive) {
    const upcoming = await countUpcomingAssignmentsForStaff(staffId);
    if (upcoming > 0) {
      return {
        ok: false,
        error: `Cannot deactivate: this staff member has ${upcoming} upcoming assigned job(s). Reassign those bookings first.`,
        status: 409,
      };
    }
  }

  const rows = await sql`
    UPDATE staff_members
    SET
      name = ${nameResult.name},
      phone = ${phoneResult.phone},
      role = ${role},
      is_active = ${isActive},
      updated_at = now()
    WHERE id = ${staffId}
    RETURNING *
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, error: "Staff member not found.", status: 404 };
  }
  return { ok: true, staff: mapStaff(row) };
}

export async function countUpcomingAssignmentsForStaff(
  staffId: string,
): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.staff_id = ${staffId}
      AND a.is_active = true
      AND a.is_primary = true
      AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
      AND (
        b.booking_date IS NULL
        OR b.booking_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York')
      )
  `;
  return Number((rows[0] as { count: number }).count);
}

export async function listStaffAvailability(
  staffId: string,
): Promise<StaffAvailabilityDay[]> {
  const rows = await sql`
    SELECT day_of_week, start_time, end_time, is_active
    FROM staff_availability
    WHERE staff_id = ${staffId}
    ORDER BY day_of_week ASC
  `;
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    dayOfWeek: Number(row.day_of_week),
    startTime: parseBookingTime(String(row.start_time)) ?? "09:00",
    endTime: parseBookingTime(String(row.end_time)) ?? "17:00",
    isActive: Boolean(row.is_active),
  }));
}

export async function upsertStaffAvailability(
  staffId: string,
  days: StaffAvailabilityDay[],
): Promise<
  | { ok: true; days: StaffAvailabilityDay[] }
  | { ok: false; error: string; status: number; conflictCount?: number }
> {
  // Detect future assignments that would fall outside the new weekly windows.
  const futureRows = await sql`
    SELECT a.slot_date, a.slot_time, b.duration_minutes
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.staff_id = ${staffId}
      AND a.is_active = true
      AND a.is_primary = true
      AND a.slot_date IS NOT NULL
      AND a.slot_time IS NOT NULL
      AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
      AND a.slot_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York')
  `;

  const dayMap = new Map(days.map((d) => [d.dayOfWeek, d]));
  let conflictCount = 0;
  for (const row of futureRows as Array<{
    slot_date: string | Date;
    slot_time: string;
    duration_minutes: number | null;
  }>) {
    const dateOnly = parseBookingDateOnly(row.slot_date);
    const time = parseBookingTime(String(row.slot_time));
    if (!dateOnly || !time) continue;
    const dow = dayOfWeekForDateOnly(dateOnly);
    if (dow == null) continue;
    const day = dayMap.get(dow);
    if (!day || !day.isActive) {
      conflictCount += 1;
      continue;
    }
    const start = parseBookingTime(day.startTime);
    const end = parseBookingTime(day.endTime);
    const durationMinutes = resolveEffectiveDurationMinutes(
      row.duration_minutes == null ? null : Number(row.duration_minutes),
    );
    const window = getBookingWindow({
      dateOnly,
      startTime: time,
      durationMinutes,
    });
    if (
      !start ||
      !end ||
      !window ||
      !staffAvailabilityCoversWindow({
        availStartTime: start,
        availEndTime: end,
        window,
      })
    ) {
      conflictCount += 1;
    }
  }

  if (conflictCount > 0) {
    return {
      ok: false,
      error: `This availability change would invalidate ${conflictCount} upcoming assigned job(s). Reassign those bookings first.`,
      status: 409,
      conflictCount,
    };
  }

  for (const day of days) {
    const start = parseBookingTime(day.startTime);
    const end = parseBookingTime(day.endTime);
    if (
      day.dayOfWeek < 0 ||
      day.dayOfWeek > 6 ||
      !start ||
      !end ||
      start >= end
    ) {
      return { ok: false, error: "Invalid availability day.", status: 400 };
    }
    await sql`
      INSERT INTO staff_availability (
        staff_id, day_of_week, start_time, end_time, is_active, updated_at
      )
      VALUES (
        ${staffId},
        ${day.dayOfWeek},
        ${start}::time,
        ${end}::time,
        ${day.isActive},
        now()
      )
      ON CONFLICT (staff_id, day_of_week) DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        is_active = EXCLUDED.is_active,
        updated_at = now()
    `;
  }
  return { ok: true, days: await listStaffAvailability(staffId) };
}

export async function listStaffTimeOff(
  staffId: string,
): Promise<StaffTimeOff[]> {
  const rows = await sql`
    SELECT id, staff_id, off_date, start_time, end_time, reason
    FROM staff_time_off
    WHERE staff_id = ${staffId}
      AND off_date >= (CURRENT_DATE AT TIME ZONE 'America/New_York') - INTERVAL '1 day'
    ORDER BY off_date ASC
  `;
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: Number(row.id),
    staffId: String(row.staff_id),
    offDate:
      row.off_date instanceof Date
        ? row.off_date.toISOString().slice(0, 10)
        : String(row.off_date).slice(0, 10),
    startTime:
      row.start_time == null ? null : parseBookingTime(String(row.start_time)),
    endTime:
      row.end_time == null ? null : parseBookingTime(String(row.end_time)),
    reason: (row.reason as string | null) ?? null,
  }));
}

export async function createStaffTimeOff(input: {
  staffId: string;
  offDate: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}): Promise<
  | { ok: true; id: number }
  | { ok: false; error: string; status?: number; conflictCount?: number }
> {
  if (!isValidBookingDateOnly(input.offDate)) {
    return { ok: false, error: "Invalid date." };
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
    return { ok: false, error: "Provide both start and end, or leave both empty." };
  }
  if (start && end && start >= end) {
    return { ok: false, error: "Start must be before end." };
  }
  const reason =
    typeof input.reason === "string" && input.reason.trim()
      ? input.reason.trim().slice(0, 200)
      : null;

  const assignmentRows = await sql`
    SELECT a.slot_time, b.duration_minutes
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.staff_id = ${input.staffId}
      AND a.is_active = true
      AND a.is_primary = true
      AND a.slot_date = ${input.offDate}::date
      AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
  `;

  let conflictCount = 0;
  for (const row of assignmentRows as Array<{
    slot_time: string | null;
    duration_minutes: number | null;
  }>) {
    const slotTime = parseBookingTime(
      row.slot_time == null ? null : String(row.slot_time),
    );
    if (!slotTime) continue;
    const durationMinutes = resolveEffectiveDurationMinutes(
      row.duration_minutes == null ? null : Number(row.duration_minutes),
    );
    const window = getBookingWindow({
      dateOnly: input.offDate,
      startTime: slotTime,
      durationMinutes,
    });
    if (!window) continue;
    if (
      staffTimeOffOverlapsWindow({
        offStartTime: start,
        offEndTime: end,
        window,
      })
    ) {
      conflictCount += 1;
    }
  }

  if (conflictCount > 0) {
    return {
      ok: false,
      error: `This time off conflicts with ${conflictCount} assigned job(s). Reassign those bookings first.`,
      status: 409,
      conflictCount,
    };
  }

  const rows = await sql`
    INSERT INTO staff_time_off (staff_id, off_date, start_time, end_time, reason)
    VALUES (
      ${input.staffId},
      ${input.offDate}::date,
      ${start}::time,
      ${end}::time,
      ${reason}
    )
    RETURNING id
  `;
  return { ok: true, id: Number((rows[0] as { id: number }).id) };
}

export async function deleteStaffTimeOff(
  staffId: string,
  timeOffId: number,
): Promise<boolean> {
  const rows = await sql`
    DELETE FROM staff_time_off
    WHERE id = ${timeOffId}
      AND staff_id = ${staffId}
    RETURNING id
  `;
  return Boolean(rows[0]);
}

export async function getAssignmentForBooking(
  bookingId: number,
): Promise<BookingAssignment | null> {
  const rows = await sql`
    SELECT
      a.id,
      a.booking_id,
      a.staff_id,
      a.assigned_at,
      a.assigned_by,
      a.is_primary,
      s.name AS staff_name,
      s.email AS staff_email
    FROM booking_assignments a
    INNER JOIN staff_members s ON s.id = a.staff_id
    WHERE a.booking_id = ${bookingId}
      AND a.is_primary = true
      AND a.is_active = true
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    bookingId: Number(row.booking_id),
    staffId: String(row.staff_id),
    assignedAt: row.assigned_at as Date | string,
    assignedBy: (row.assigned_by as string | null) ?? null,
    isPrimary: Boolean(row.is_primary),
    staffName: String(row.staff_name),
    staffEmail: String(row.staff_email),
  };
}

export async function listAssignmentBookingIds(): Promise<Set<number>> {
  const rows = await sql`
    SELECT booking_id
    FROM booking_assignments
    WHERE is_primary = true
      AND is_active = true
  `;
  return new Set(
    (rows as Array<{ booking_id: number }>).map((r) => Number(r.booking_id)),
  );
}

async function staffIsEligibleForSlot(input: {
  staffId: string;
  dateOnly: string;
  time: string;
  durationMinutes: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const staff = await findStaffById(input.staffId);
  if (!staff || !staff.isActive) {
    return { ok: false, error: "That staff member is not available." };
  }

  const window = getBookingWindow({
    dateOnly: input.dateOnly,
    startTime: input.time,
    durationMinutes: input.durationMinutes,
  });
  if (!window) {
    return { ok: false, error: "Invalid booking time window." };
  }

  const dow = dayOfWeekForDateOnly(input.dateOnly);
  if (dow == null) {
    return { ok: false, error: "Invalid booking date." };
  }

  const availabilityRows = await sql`
    SELECT start_time, end_time, is_active
    FROM staff_availability
    WHERE staff_id = ${input.staffId}
      AND day_of_week = ${dow}
    LIMIT 1
  `;
  const avail = availabilityRows[0] as
    | { start_time: string; end_time: string; is_active: boolean }
    | undefined;

  if (!avail || !avail.is_active) {
    return {
      ok: false,
      error: "This cleaner is not scheduled to work that day.",
    };
  }

  const start = parseBookingTime(String(avail.start_time));
  const end = parseBookingTime(String(avail.end_time));
  if (
    !start ||
    !end ||
    !staffAvailabilityCoversWindow({
      availStartTime: start,
      availEndTime: end,
      window,
    })
  ) {
    return {
      ok: false,
      error: "This cleaner is not available for the full appointment window.",
    };
  }

  const offRows = await sql`
    SELECT start_time, end_time
    FROM staff_time_off
    WHERE staff_id = ${input.staffId}
      AND off_date = ${input.dateOnly}::date
  `;
  for (const off of offRows as Array<{
    start_time: string | null;
    end_time: string | null;
  }>) {
    if (
      staffTimeOffOverlapsWindow({
        offStartTime:
          off.start_time == null
            ? null
            : parseBookingTime(String(off.start_time)),
        offEndTime:
          off.end_time == null ? null : parseBookingTime(String(off.end_time)),
        window,
      })
    ) {
      return {
        ok: false,
        error: "This cleaner has time off during that appointment.",
      };
    }
  }

  return { ok: true };
}

export async function listEligibleStaffForBooking(bookingId: number): Promise<
  StaffMember[]
> {
  const bookingRows = await sql`
    SELECT id, booking_date, booking_time, status, duration_minutes
    FROM booking_requests
    WHERE id = ${bookingId}
    LIMIT 1
  `;
  const booking = bookingRows[0] as
    | {
        id: number;
        booking_date: string | Date | null;
        booking_time: string | null;
        status: string;
        duration_minutes: number | null;
      }
    | undefined;
  if (!booking) return [];

  const dateOnly = parseBookingDateOnly(booking.booking_date);
  const time = parseBookingTime(
    booking.booking_time == null ? null : String(booking.booking_time),
  );
  if (!dateOnly || !time) return [];
  const durationMinutes = resolveEffectiveDurationMinutes(
    booking.duration_minutes == null ? null : Number(booking.duration_minutes),
  );

  const active = await sql`
    SELECT *
    FROM staff_members
    WHERE is_active = true
    ORDER BY name ASC
  `;

  const eligible: StaffMember[] = [];
  for (const row of active as Array<Record<string, unknown>>) {
    const staff = mapStaff(row);
    const base = await staffIsEligibleForSlot({
      staffId: staff.id,
      dateOnly,
      time,
      durationMinutes,
    });
    if (!base.ok) continue;

    const conflictRows = await sql`
      SELECT
        a.booking_id,
        COALESCE(a.slot_date, b.booking_date) AS booking_date,
        COALESCE(a.slot_time, b.booking_time) AS booking_time,
        b.duration_minutes,
        b.status
      FROM booking_assignments a
      INNER JOIN booking_requests b ON b.id = a.booking_id
      WHERE a.staff_id = ${staff.id}
        AND a.is_primary = true
        AND a.is_active = true
        AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
    `;
    if (
      hasOverlappingStaffConflict({
        existingAssignments: (
          conflictRows as Array<Record<string, unknown>>
        ).map((r) => ({
          bookingId: Number(r.booking_id),
          bookingDate: parseBookingDateOnly(
            r.booking_date as string | Date | null,
          ),
          bookingTime:
            r.booking_time == null ? null : String(r.booking_time),
          durationMinutes:
            r.duration_minutes == null ? null : Number(r.duration_minutes),
          status: String(r.status),
        })),
        candidateBookingId: bookingId,
        candidateDate: dateOnly,
        candidateTime: time,
        candidateDurationMinutes: durationMinutes,
      })
    ) {
      continue;
    }
    eligible.push(staff);
  }

  return eligible;
}

export async function assignStaffToBooking(input: {
  bookingId: number;
  staffId: string;
  assignedBy?: string | null;
}): Promise<
  | { ok: true; assignment: BookingAssignment }
  | { ok: false; error: string; status: number }
> {
  const bookingRows = await sql`
    SELECT id, booking_date, booking_time, duration_minutes, status, name, email, service, location, mobile
    FROM booking_requests
    WHERE id = ${input.bookingId}
    LIMIT 1
  `;
  const booking = bookingRows[0] as Record<string, unknown> | undefined;
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }
  if (String(booking.status) === "cancelled") {
    return { ok: false, error: "Cannot assign a cancelled booking.", status: 400 };
  }

  const dateOnly = parseBookingDateOnly(
    booking.booking_date as string | Date | null,
  );
  const time = parseBookingTime(
    booking.booking_time == null ? null : String(booking.booking_time),
  );
  if (!dateOnly || !time) {
    return {
      ok: false,
      error: "Booking must have a date and time before assignment.",
      status: 400,
    };
  }
  const durationMinutes = resolveEffectiveDurationMinutes(
    booking.duration_minutes == null
      ? null
      : Number(booking.duration_minutes),
  );
  const window = getBookingWindow({
    dateOnly,
    startTime: time,
    durationMinutes,
  });
  if (!window) {
    return { ok: false, error: "Invalid booking time window.", status: 400 };
  }

  const eligibility = await staffIsEligibleForSlot({
    staffId: input.staffId,
    dateOnly,
    time,
    durationMinutes,
  });
  if (!eligibility.ok) {
    return { ok: false, error: eligibility.error, status: 400 };
  }

  const conflictRows = await sql`
    SELECT
      a.booking_id,
      COALESCE(a.slot_date, b.booking_date) AS booking_date,
      COALESCE(a.slot_time, b.booking_time) AS booking_time,
      b.duration_minutes,
      b.status
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.staff_id = ${input.staffId}
      AND a.is_primary = true
      AND a.is_active = true
      AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
  `;
  if (
    hasOverlappingStaffConflict({
      existingAssignments: (
        conflictRows as Array<Record<string, unknown>>
      ).map((r) => ({
        bookingId: Number(r.booking_id),
        bookingDate: parseBookingDateOnly(
          r.booking_date as string | Date | null,
        ),
        bookingTime:
          r.booking_time == null ? null : String(r.booking_time),
        durationMinutes:
          r.duration_minutes == null ? null : Number(r.duration_minutes),
        status: String(r.status),
      })),
      candidateBookingId: input.bookingId,
      candidateDate: dateOnly,
      candidateTime: time,
      candidateDurationMinutes: durationMinutes,
    })
  ) {
    return {
      ok: false,
      error: "This cleaner already has an overlapping job.",
      status: 409,
    };
  }

  const previous = await getAssignmentForBooking(input.bookingId);
  const assignedBy = input.assignedBy?.trim() || "dashboard";
  const windowStartIso = window.windowStartUtc.toISOString();
  const windowEndIso = window.windowEndUtc.toISOString();

  try {
    // Soft-release any prior active primary, then insert new claim with slot fields.
    await sql`
      UPDATE booking_assignments
      SET is_active = false, updated_at = now()
      WHERE booking_id = ${input.bookingId}
        AND is_active = true
    `;

    const rows = await sql`
      INSERT INTO booking_assignments (
        booking_id, staff_id, assigned_by, is_primary,
        slot_date, slot_time, is_active,
        window_start, window_end
      )
      VALUES (
        ${input.bookingId},
        ${input.staffId},
        ${assignedBy},
        true,
        ${dateOnly}::date,
        ${time}::time,
        true,
        ${windowStartIso}::timestamptz,
        ${windowEndIso}::timestamptz
      )
      RETURNING *
    `;

    const assignmentRow = rows[0] as Record<string, unknown>;
    const staff = await findStaffById(input.staffId);
    const assignment: BookingAssignment = {
      id: String(assignmentRow.id),
      bookingId: Number(assignmentRow.booking_id),
      staffId: String(assignmentRow.staff_id),
      assignedAt: assignmentRow.assigned_at as Date | string,
      assignedBy: (assignmentRow.assigned_by as string | null) ?? null,
      isPrimary: true,
      staffName: staff?.name,
      staffEmail: staff?.email,
    };

    // Notify new assignee (and previous if reassigned). Failures are non-fatal.
    try {
      if (staff?.email) {
        await sendEmail({
          to: staff.email,
          subject: `New job assignment — Saskia Cleaning (#${input.bookingId})`,
          text: [
            `Hi ${staff.name},`,
            "",
            "You've been assigned a cleaning job.",
            `Booking #: ${input.bookingId}`,
            `Service: ${String(booking.service ?? "Cleaning")}`,
            `Date: ${dateOnly}`,
            `Time: ${time}`,
            `Estimated duration: ${formatEstimatedDuration(durationMinutes)}`,
            `Location: ${String(booking.location ?? "—")}`,
            "",
            "View your jobs: https://saskiaservices.com/staff",
            "",
            "— Saskia Cleaning",
          ].join("\n"),
        });
      }
      if (
        previous &&
        previous.staffId !== input.staffId &&
        previous.staffEmail
      ) {
        await sendEmail({
          to: previous.staffEmail,
          subject: `Job reassigned — Saskia Cleaning (#${input.bookingId})`,
          text: [
            `Hi ${previous.staffName ?? "there"},`,
            "",
            `Booking #${input.bookingId} has been reassigned to another cleaner.`,
            "It will no longer appear in your job list.",
            "",
            "— Saskia Cleaning",
          ].join("\n"),
        });
      }
    } catch (error) {
      console.error("Assignment notification failed");
      void error;
    }

    return { ok: true, assignment };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("booking_assignments_staff_active_slot_uidx") ||
      message.includes("booking_assignments_staff_window_excl") ||
      message.includes("exclusion")
    ) {
      return {
        ok: false,
        error: "This cleaner already has an overlapping job.",
        status: 409,
      };
    }
    throw error;
  }
}

export async function unassignBooking(
  bookingId: number,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const bookingRows = await sql`
    SELECT status, booking_date, booking_time
    FROM booking_requests
    WHERE id = ${bookingId}
    LIMIT 1
  `;
  const booking = bookingRows[0] as
    | {
        status: string;
        booking_date: string | Date | null;
        booking_time: string | null;
      }
    | undefined;
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  // Phase 11.8: active timed bookings must keep a primary claim so capacity
  // cannot silently free. Admin must reassign instead of leaving unassigned.
  const dateOnly = parseBookingDateOnly(booking.booking_date);
  const time = parseBookingTime(
    booking.booking_time == null ? null : String(booking.booking_time),
  );
  if (
    isCapacityConsumingStatus(booking.status) &&
    dateOnly &&
    time
  ) {
    return {
      ok: false,
      error:
        "Active bookings must stay assigned. Reassign to another cleaner instead of unassigning.",
      status: 400,
    };
  }

  const previous = await getAssignmentForBooking(bookingId);
  const rows = await sql`
    UPDATE booking_assignments
    SET is_active = false, updated_at = now()
    WHERE booking_id = ${bookingId}
      AND is_active = true
    RETURNING id
  `;
  if (!rows[0]) {
    return { ok: false, error: "No assignment found.", status: 404 };
  }

  if (previous?.staffEmail) {
    try {
      await sendEmail({
        to: previous.staffEmail,
        subject: `Job unassigned — Saskia Cleaning (#${bookingId})`,
        text: [
          `Hi ${previous.staffName ?? "there"},`,
          "",
          `Booking #${bookingId} is no longer assigned to you.`,
          "",
          "— Saskia Cleaning",
        ].join("\n"),
      });
    } catch (error) {
      console.error("Unassign notification failed");
      void error;
    }
  }

  return { ok: true };
}

/**
 * After legacy date-only reschedule: keep assignment if still eligible,
 * sync slot fields, or auto-claim another cleaner. Never silently free
 * capacity for an active timed booking.
 */
export async function revalidateAssignmentAfterReschedule(
  bookingId: number,
): Promise<"retained" | "reassigned" | "unassigned" | "none"> {
  const assignment = await getAssignmentForBooking(bookingId);

  const bookingRows = await sql`
    SELECT booking_date, booking_time, status, duration_minutes
    FROM booking_requests
    WHERE id = ${bookingId}
    LIMIT 1
  `;
  const booking = bookingRows[0] as
    | {
        booking_date: string | Date | null;
        booking_time: string | null;
        status: string;
        duration_minutes: number | null;
      }
    | undefined;
  if (!booking) return "none";

  const dateOnly = parseBookingDateOnly(booking.booking_date);
  const time = parseBookingTime(
    booking.booking_time == null ? null : String(booking.booking_time),
  );

  if (!dateOnly || !time) {
    if (assignment) {
      await sql`
        UPDATE booking_assignments
        SET is_active = false, updated_at = now()
        WHERE booking_id = ${bookingId}
          AND is_active = true
      `;
      return "unassigned";
    }
    return "none";
  }

  const durationMinutes = resolveEffectiveDurationMinutes(
    booking.duration_minutes == null
      ? null
      : Number(booking.duration_minutes),
  );
  const window = getBookingWindow({
    dateOnly,
    startTime: time,
    durationMinutes,
  });

  if (assignment && window) {
    const eligibility = await staffIsEligibleForSlot({
      staffId: assignment.staffId,
      dateOnly,
      time,
      durationMinutes,
    });
    const conflictRows = await sql`
      SELECT
        a.booking_id,
        COALESCE(a.slot_date, b.booking_date) AS booking_date,
        COALESCE(a.slot_time, b.booking_time) AS booking_time,
        b.duration_minutes,
        b.status
      FROM booking_assignments a
      INNER JOIN booking_requests b ON b.id = a.booking_id
      WHERE a.staff_id = ${assignment.staffId}
        AND a.is_primary = true
        AND a.is_active = true
        AND b.status IN ('new', 'contacted', 'scheduled', 'in_progress')
    `;
    const conflict = hasOverlappingStaffConflict({
      existingAssignments: (
        conflictRows as Array<Record<string, unknown>>
      ).map((r) => ({
        bookingId: Number(r.booking_id),
        bookingDate: parseBookingDateOnly(
          r.booking_date as string | Date | null,
        ),
        bookingTime:
          r.booking_time == null ? null : String(r.booking_time),
        durationMinutes:
          r.duration_minutes == null ? null : Number(r.duration_minutes),
        status: String(r.status),
      })),
      candidateBookingId: bookingId,
      candidateDate: dateOnly,
      candidateTime: time,
      candidateDurationMinutes: durationMinutes,
    });

    if (eligibility.ok && !conflict) {
      await sql`
        UPDATE booking_assignments
        SET
          slot_date = ${dateOnly}::date,
          slot_time = ${time}::time,
          window_start = ${window.windowStartUtc.toISOString()}::timestamptz,
          window_end = ${window.windowEndUtc.toISOString()}::timestamptz,
          updated_at = now()
        WHERE id = ${assignment.id}::uuid
          AND is_active = true
      `;
      return "retained";
    }
  }

  const eligible = await listEligibleStaffForBooking(bookingId);
  if (eligible[0]) {
    const assigned = await assignStaffToBooking({
      bookingId,
      staffId: eligible[0].id,
      assignedBy: "reschedule-revalidate",
    });
    if (assigned.ok) return "reassigned";
  }

  // Keep prior assignment active if we could not move — safer than freeing capacity.
  return assignment ? "retained" : "none";
}
