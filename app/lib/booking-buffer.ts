/**
 * Server-side scheduling buffer settings — Phase 11.10.
 */

import "server-only";

import { sql } from "@/app/lib/db";
import {
  DEFAULT_JOB_BUFFER_MINUTES,
  normalizeBufferMinutes,
} from "@/app/lib/booking-buffer-pure";

export type SchedulingBufferSettings = {
  jobBufferMinutes: number;
  updatedAt: string | Date | null;
};

export async function getJobBufferMinutes(): Promise<number> {
  const rows = await sql`
    SELECT job_buffer_minutes
    FROM scheduling_settings
    WHERE id = 1
    LIMIT 1
  `;
  const raw = (rows[0] as { job_buffer_minutes: number } | undefined)
    ?.job_buffer_minutes;
  const normalized = normalizeBufferMinutes(raw);
  if (normalized.ok) return normalized.minutes;
  return DEFAULT_JOB_BUFFER_MINUTES;
}

export async function getSchedulingBufferSettings(): Promise<SchedulingBufferSettings> {
  const rows = await sql`
    SELECT job_buffer_minutes, updated_at
    FROM scheduling_settings
    WHERE id = 1
    LIMIT 1
  `;
  const row = rows[0] as
    | { job_buffer_minutes: number; updated_at: string | Date }
    | undefined;
  if (!row) {
    return {
      jobBufferMinutes: DEFAULT_JOB_BUFFER_MINUTES,
      updatedAt: null,
    };
  }
  const normalized = normalizeBufferMinutes(row.job_buffer_minutes);
  return {
    jobBufferMinutes: normalized.ok
      ? normalized.minutes
      : DEFAULT_JOB_BUFFER_MINUTES,
    updatedAt: row.updated_at,
  };
}

export async function updateJobBufferMinutes(
  value: unknown,
): Promise<
  | { ok: true; jobBufferMinutes: number }
  | { ok: false; error: string }
> {
  const normalized = normalizeBufferMinutes(value);
  if (!normalized.ok) return normalized;

  const rows = await sql`
    INSERT INTO scheduling_settings (id, job_buffer_minutes, updated_at)
    VALUES (1, ${normalized.minutes}, now())
    ON CONFLICT (id) DO UPDATE
      SET
        job_buffer_minutes = EXCLUDED.job_buffer_minutes,
        updated_at = now()
    RETURNING job_buffer_minutes
  `;
  const row = rows[0] as { job_buffer_minutes: number } | undefined;
  return {
    ok: true,
    jobBufferMinutes: Number(row?.job_buffer_minutes ?? normalized.minutes),
  };
}
