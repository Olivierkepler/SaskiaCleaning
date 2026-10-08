import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/lib/admin-auth";
import { sql } from "../../../../lib/db";
import { isBookingStatus } from "../../../../lib/booking-status";
import {
  applyAdminBookingStatusTransition,
  hasValidActiveBookingReservation,
  hasValidAppointmentSlot,
} from "../../../../lib/admin-booking-status-pure";
import { withSchedulingSavepoint, withSchedulingTransaction } from "../../../../lib/scheduling-transaction";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdminApi();
    if (!gate.ok) return gate.response;

    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
    }

    const bookingId = Number.parseInt(id, 10);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: "Invalid booking ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || !("status" in body)) {
      return NextResponse.json({ error: "Missing status." }, { status: 400 });
    }

    const record = body as { status?: unknown; expectedStatus?: unknown };
    const status = record.status;

    if (typeof status !== "string" || !isBookingStatus(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const expectedStatus = record.expectedStatus;
    if (expectedStatus !== undefined &&
      (typeof expectedStatus !== "string" || !isBookingStatus(expectedStatus))) {
      return NextResponse.json({ error: "Invalid expected status." }, { status: 400 });
    }

    const result = await withSchedulingTransaction(async () => {
    const currentRows = await sql`
      SELECT
        b.status,
        b.booking_date,
        b.booking_time,
        b.duration_minutes,
        b.buffer_minutes
      FROM booking_requests b
      WHERE b.id = ${bookingId}
      FOR UPDATE OF b
    `;
    const current = currentRows[0] as
      | {
          status: string;
          booking_date: string | Date | null;
          booking_time: string | null;
          duration_minutes: number | null;
          buffer_minutes: number | null;
        }
      | undefined;
    if (!current) return { kind: "not-found" as const };
    if (!isBookingStatus(current.status)) {
      return {
        kind: "conflict" as const,
        error: "Booking status is invalid. Refresh and try again.",
      };
    }

    const assignmentRows = await sql`
      SELECT
        a.is_primary,
        a.is_active,
        a.slot_date,
        a.slot_time,
        a.window_start,
        a.window_end,
        s.is_active AS staff_is_active
      FROM booking_assignments a
      INNER JOIN staff_members s ON s.id = a.staff_id
      WHERE a.booking_id = ${bookingId}
        AND a.is_primary = true
        AND a.is_active = true
      LIMIT 1
      FOR UPDATE OF a
    `;
    const assignment = assignmentRows[0] as
      | {
          is_primary: boolean;
          is_active: boolean;
          staff_is_active: boolean;
          slot_date: string | Date | null;
          slot_time: string | null;
          window_start: string | Date | null;
          window_end: string | Date | null;
        }
      | undefined;
    const hasAppointmentSlot = hasValidAppointmentSlot({
      bookingDate: current.booking_date,
      bookingTime: current.booking_time,
    });
    const hasValidActiveAssignment = hasValidActiveBookingReservation({
      bookingDate: current.booking_date,
      bookingTime: current.booking_time,
      durationMinutes:
        current.duration_minutes == null ? null : Number(current.duration_minutes),
      bufferMinutes:
        current.buffer_minutes == null ? null : Number(current.buffer_minutes),
      assignment: assignment
        ? {
            isPrimary: assignment.is_primary,
            isActive: assignment.is_active,
            staffIsActive: assignment.staff_is_active,
            slotDate: assignment.slot_date,
            slotTime: assignment.slot_time,
            windowStart: assignment.window_start,
            windowEnd: assignment.window_end,
          }
        : null,
    });

    const transition = await applyAdminBookingStatusTransition({
      currentStatus: current.status,
      expectedStatus: expectedStatus as (typeof status) | undefined,
      nextStatus: status,
      hasValidActiveAssignment,
      hasAppointmentSlot,
      update: async () => {
        const updated = await sql`
          UPDATE booking_requests
          SET status = ${status}
          WHERE id = ${bookingId}
            AND status = ${current.status}
          RETURNING *;
        `;
        return (updated[0] as Record<string, unknown> | undefined) ?? null;
      },
    });

    if (!transition.ok) {
      if (transition.reason === "assignment_required") {
        return {
          kind: "conflict" as const,
          error: "Set an appointment and assign an active cleaner before reopening this booking for work.",
        };
      }
      return {
        kind: "conflict" as const,
        error: "Booking status changed while you were editing. Refresh and try again.",
      };
    }

    if (status === "cancelled") {
      try {
        await withSchedulingSavepoint(async () => {
          const { releaseAssignmentCapacity } = await import(
            "@/app/lib/capacity-release"
          );
          await releaseAssignmentCapacity(bookingId, "cancelled");
        });
      } catch (releaseError) {
        console.error("Failed to release assignment capacity:", releaseError);
      }
    }

    if (status === "completed") {
      try {
        await withSchedulingSavepoint(async () => {
          const { releaseCompletedCapacityIfWindowElapsed } = await import(
            "@/app/lib/capacity-release"
          );
          await releaseCompletedCapacityIfWindowElapsed(bookingId);
        });
      } catch (releaseError) {
        console.error("Failed to release completed capacity:", releaseError);
      }
    }
    return { kind: "success" as const, booking: transition.value };
    });

    if (result.kind === "not-found") {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (result.kind === "conflict") {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update booking status." },
      { status: 500 }
    );
  }
}
