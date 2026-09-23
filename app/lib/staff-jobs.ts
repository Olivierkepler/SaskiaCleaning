import "server-only";

import { sql } from "@/app/lib/db";
import {
  canStaffTransitionStatus,
  isStaffActionableStatus,
} from "@/app/lib/staff-pure";
import { normalizeBookingExtras } from "@/app/lib/customer-bookings-pure";
import { isBookingStatus, type BookingStatus } from "@/app/lib/booking-status";

/** Minimum fields a cleaner needs to perform a job. */
export type StaffJob = {
  id: number;
  name: string;
  mobile: string | null;
  bedrooms: number;
  bathrooms: number;
  status: string;
  service: string | null;
  frequency: string | null;
  location: string | null;
  booking_date: string | Date | null;
  booking_time: string | null;
  duration_minutes: number | null;
  extras: string[];
  notes: string | null;
};

function mapJob(row: Record<string, unknown>): StaffJob {
  return {
    id: Number(row.id),
    name: String(row.name),
    mobile: (row.mobile as string | null) ?? null,
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    status: String(row.status),
    service: (row.service as string | null) ?? null,
    frequency: (row.frequency as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    booking_date: (row.booking_date as string | Date | null) ?? null,
    booking_time:
      row.booking_time == null ? null : String(row.booking_time).slice(0, 8),
    duration_minutes:
      row.duration_minutes == null ? null : Number(row.duration_minutes),
    extras: normalizeBookingExtras(row.extras),
    notes: (row.notes as string | null) ?? null,
  };
}

/**
 * Server-scoped list: only bookings assigned to this staff member.
 * Never returns email, referral, estimate, or admin fields.
 */
export async function listStaffJobs(staffId: string): Promise<StaffJob[]> {
  const rows = await sql`
    SELECT
      b.id,
      b.name,
      b.mobile,
      b.bedrooms,
      b.bathrooms,
      b.status,
      b.service,
      b.frequency,
      b.location,
      b.booking_date,
      b.booking_time,
      b.duration_minutes,
      b.extras,
      b.notes
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.staff_id = ${staffId}
      AND a.is_primary = true
      AND a.is_active = true
    ORDER BY
      CASE
        WHEN b.status IN ('scheduled', 'in_progress', 'new', 'contacted') THEN 0
        ELSE 1
      END,
      b.booking_date ASC NULLS LAST,
      b.booking_time ASC NULLS LAST,
      b.id DESC
  `;
  return (rows as Array<Record<string, unknown>>).map(mapJob);
}

export async function getStaffJobById(
  staffId: string,
  bookingId: number,
): Promise<StaffJob | null> {
  if (!Number.isInteger(bookingId) || bookingId <= 0) return null;

  const rows = await sql`
    SELECT
      b.id,
      b.name,
      b.mobile,
      b.bedrooms,
      b.bathrooms,
      b.status,
      b.service,
      b.frequency,
      b.location,
      b.booking_date,
      b.booking_time,
      b.duration_minutes,
      b.extras,
      b.notes
    FROM booking_assignments a
    INNER JOIN booking_requests b ON b.id = a.booking_id
    WHERE a.staff_id = ${staffId}
      AND a.is_primary = true
      AND a.is_active = true
      AND b.id = ${bookingId}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapJob(row) : null;
}

export async function transitionStaffJobStatus(input: {
  staffId: string;
  bookingId: number;
  nextStatus: string;
}): Promise<
  | { ok: true; job: StaffJob }
  | { ok: false; error: string; status: number }
> {
  if (!isBookingStatus(input.nextStatus)) {
    return { ok: false, error: "Invalid status.", status: 400 };
  }

  const job = await getStaffJobById(input.staffId, input.bookingId);
  if (!job) {
    return { ok: false, error: "Job not found.", status: 404 };
  }

  if (job.status === "cancelled" || job.status === "completed") {
    return {
      ok: false,
      error: "This job can no longer be updated.",
      status: 400,
    };
  }

  if (!canStaffTransitionStatus(job.status, input.nextStatus)) {
    return {
      ok: false,
      error: "That status change is not allowed.",
      status: 400,
    };
  }

  if (!isStaffActionableStatus(job.status) && input.nextStatus !== "in_progress") {
    // scheduled → in_progress is the only entry; new/contacted are admin-side.
  }

  // Staff may only start from scheduled (or contacted treated as not staff-startable).
  if (
    input.nextStatus === "in_progress" &&
    job.status !== "scheduled"
  ) {
    return {
      ok: false,
      error: "Only scheduled jobs can be started.",
      status: 400,
    };
  }

  const rows = await sql`
    UPDATE booking_requests
    SET status = ${input.nextStatus}
    WHERE id = ${input.bookingId}
      AND status = ${job.status}
    RETURNING
      id,
      name,
      mobile,
      bedrooms,
      bathrooms,
      status,
      service,
      frequency,
      location,
      booking_date,
      booking_time,
      duration_minutes,
      extras,
      notes
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return {
      ok: false,
      error: "This job was already updated. Please refresh.",
      status: 409,
    };
  }

  if (input.nextStatus === "completed") {
    try {
      const { releaseAssignmentCapacity } = await import(
        "@/app/lib/staff-capacity"
      );
      await releaseAssignmentCapacity(input.bookingId);
    } catch (error) {
      console.error("Failed to release capacity on completion");
      void error;
    }
  }

  return { ok: true, job: mapJob(row) };
}

export function partitionStaffJobs(jobs: StaffJob[], today: string): {
  today: StaffJob[];
  upcoming: StaffJob[];
  history: StaffJob[];
} {
  const todayJobs: StaffJob[] = [];
  const upcoming: StaffJob[] = [];
  const history: StaffJob[] = [];

  for (const job of jobs) {
    const date =
      job.booking_date == null
        ? null
        : String(job.booking_date).slice(0, 10);
    if (
      job.status === "completed" ||
      job.status === "cancelled" ||
      (date != null && date < today)
    ) {
      history.push(job);
    } else if (date === today) {
      todayJobs.push(job);
    } else {
      upcoming.push(job);
    }
  }

  return { today: todayJobs, upcoming, history };
}

export type { BookingStatus };
