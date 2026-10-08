/**
 * Server-side service duration rules (Phase 11.9).
 */

import "server-only";

import { sql } from "@/app/lib/db";
import { withSchedulingTransaction } from "@/app/lib/scheduling-transaction";
import { isSchedulingPolicyHistoryError, recordSchedulingPolicyChange } from "@/app/lib/scheduling-policy-history";
import { hasPolicyValueChanged } from "@/app/lib/scheduling-policy-history-pure";
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
  changedByAdminId?: string | null;
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

  return withSchedulingTransaction(async () => {
  try {
    if (input.id) {
      const previousRows = await sql`
        SELECT service_key, duration_minutes
        FROM service_duration_rules
        WHERE id = ${input.id}
        LIMIT 1
      `;
      const previous = previousRows[0] as { service_key: string; duration_minutes: number } | undefined;
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
      const next = { serviceKey: String(row.service_key), durationMinutes: Number(row.duration_minutes) };
      if (hasPolicyValueChanged(
        previous ? { serviceKey: previous.service_key, durationMinutes: Number(previous.duration_minutes) } : null,
        next,
      )) {
        await recordSchedulingPolicyChange({
          changeType: "service_duration_rule",
          details: {
            operation: "update",
            ruleId: Number(row.id),
            previous: previous ? { serviceKey: previous.service_key, durationMinutes: Number(previous.duration_minutes) } : null,
            next,
          },
          changedByAdminId: input.changedByAdminId,
        });
      }
      return {
        ok: true,
        rule: {
          id: Number(row.id),
          ...next,
        },
      };
    }

    const rows = await sql`
      INSERT INTO service_duration_rules (service_key, duration_minutes)
      VALUES (${key}, ${duration.minutes})
      RETURNING id, service_key, duration_minutes
    `;
    const row = rows[0] as Record<string, unknown>;
    const next = { serviceKey: String(row.service_key), durationMinutes: Number(row.duration_minutes) };
    await recordSchedulingPolicyChange({
      changeType: "service_duration_rule",
      details: { operation: "create", ruleId: Number(row.id), previous: null, next },
      changedByAdminId: input.changedByAdminId,
    });
    return {
      ok: true,
      rule: {
        id: Number(row.id),
          ...next,
      },
    };
  } catch (error) {
    if (isSchedulingPolicyHistoryError(error)) throw error;
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
  });
}

export async function deleteServiceDurationRule(
  id: number,
  changedByAdminId?: string | null,
): Promise<boolean> {
  return withSchedulingTransaction(async () => {
  const rows = await sql`
    DELETE FROM service_duration_rules
    WHERE id = ${id}
    RETURNING id, service_key, duration_minutes
  `;
  const row = rows[0] as { id: number; service_key: string; duration_minutes: number } | undefined;
  if (!row) return false;
  await recordSchedulingPolicyChange({
    changeType: "service_duration_rule",
    details: {
      operation: "delete",
      ruleId: Number(row.id),
      previous: { serviceKey: row.service_key, durationMinutes: Number(row.duration_minutes) },
      next: null,
    },
    changedByAdminId,
  });
  return true;
  });
}
