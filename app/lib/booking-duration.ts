/**
 * Server-side service duration rules (Phase 11.9).
 */

import "server-only";

import { sql } from "@/app/lib/db";
import {
  calculateBookingDuration,
  normalizeDurationMinutes,
  type ServiceDurationRule,
} from "@/app/lib/booking-duration-pure";

export type { ServiceDurationRule };

export async function listServiceDurationRules(): Promise<
  Array<ServiceDurationRule & { id: number; updatedAt: Date | string }>
> {
  const rows = await sql`
    SELECT id, service_key, duration_minutes, updated_at
    FROM service_duration_rules
    ORDER BY service_key ASC
  `;
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: Number(row.id),
    serviceKey: String(row.service_key),
    durationMinutes: Number(row.duration_minutes),
    updatedAt: row.updated_at as Date | string,
  }));
}

export async function loadDurationRulesForCalc(): Promise<ServiceDurationRule[]> {
  const rows = await listServiceDurationRules();
  return rows.map((r) => ({
    serviceKey: r.serviceKey,
    durationMinutes: r.durationMinutes,
  }));
}

export async function resolveDurationForBooking(input: {
  service: string | null | undefined;
  bedrooms?: number | null;
  bathrooms?: number | null;
  extras?: unknown;
}): Promise<
  | { ok: true; minutes: number; serviceKey: string }
  | { ok: false; error: string }
> {
  const rules = await loadDurationRulesForCalc();
  return calculateBookingDuration({
    service: input.service,
    rules,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    extras: input.extras,
  });
}

export async function upsertServiceDurationRule(input: {
  id?: number;
  serviceKey: string;
  durationMinutes: number;
}): Promise<
  | { ok: true; rule: ServiceDurationRule & { id: number } }
  | { ok: false; error: string; status: number }
> {
  const key = input.serviceKey.trim();
  if (!key || key.length > 80) {
    return { ok: false, error: "Service name is required (max 80 chars).", status: 400 };
  }
  const duration = normalizeDurationMinutes(input.durationMinutes);
  if (!duration.ok) {
    return { ok: false, error: duration.error, status: 400 };
  }

  try {
    if (input.id) {
      const rows = await sql`
        UPDATE service_duration_rules
        SET
          service_key = ${key},
          duration_minutes = ${duration.minutes},
          updated_at = now()
        WHERE id = ${input.id}
        RETURNING id, service_key, duration_minutes
      `;
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) {
        return { ok: false, error: "Rule not found.", status: 404 };
      }
      return {
        ok: true,
        rule: {
          id: Number(row.id),
          serviceKey: String(row.service_key),
          durationMinutes: Number(row.duration_minutes),
        },
      };
    }

    const rows = await sql`
      INSERT INTO service_duration_rules (service_key, duration_minutes)
      VALUES (${key}, ${duration.minutes})
      RETURNING id, service_key, duration_minutes
    `;
    const row = rows[0] as Record<string, unknown>;
    return {
      ok: true,
      rule: {
        id: Number(row.id),
        serviceKey: String(row.service_key),
        durationMinutes: Number(row.duration_minutes),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("service_duration_rules_service_key_uidx")) {
      return {
        ok: false,
        error: "A duration rule for that service already exists.",
        status: 409,
      };
    }
    console.error(error);
    return { ok: false, error: "Failed to save duration rule.", status: 500 };
  }
}

export async function deleteServiceDurationRule(
  id: number,
): Promise<boolean> {
  const rows = await sql`
    DELETE FROM service_duration_rules
    WHERE id = ${id}
    RETURNING id
  `;
  return Boolean(rows[0]);
}
