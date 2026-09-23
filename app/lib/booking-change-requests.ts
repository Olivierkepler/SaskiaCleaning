import "server-only";

import { sql } from "@/app/lib/db";
import {
  canRequestBookingChange,
  isBookingChangeRequestType,
  normalizeChangeRequestReason,
  validateRequestedRescheduleDate,
  type BookingChangeRequestStatus,
  type BookingChangeRequestType,
} from "@/app/lib/booking-change-requests-pure";
import { getCustomerBookingById } from "@/app/lib/customer-bookings";
import {
  notifyAdminBookingChangeRequest,
  notifyCustomerBookingChangeResolution,
} from "@/app/lib/booking-change-request-emails";
import {
  assertSlotAvailable,
} from "@/app/lib/scheduling";
import {
  parseBookingTime,
} from "@/app/lib/scheduling-pure";
import { parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";

export type BookingChangeRequest = {
  id: number;
  booking_id: number;
  customer_id: string;
  request_type: BookingChangeRequestType;
  requested_date: string | Date | null;
  requested_time: string | null;
  reason: string | null;
  status: BookingChangeRequestStatus;
  customer_message: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  resolved_at: string | Date | null;
};

export type AdminBookingChangeRequest = BookingChangeRequest & {
  booking_service: string | null;
  booking_date: string | Date | null;
  booking_time: string | null;
  booking_status: string;
  booking_location: string | null;
  booking_name: string;
  booking_email: string;
  customer_email: string;
  customer_name: string | null;
  admin_note: string | null;
};

function mapRequest(row: Record<string, unknown>): BookingChangeRequest {
  return {
    id: Number(row.id),
    booking_id: Number(row.booking_id),
    customer_id: String(row.customer_id),
    request_type: row.request_type as BookingChangeRequestType,
    requested_date: (row.requested_date as string | Date | null) ?? null,
    requested_time:
      row.requested_time == null
        ? null
        : String(row.requested_time).slice(0, 8),
    reason: (row.reason as string | null) ?? null,
    status: row.status as BookingChangeRequestStatus,
    customer_message: (row.customer_message as string | null) ?? null,
    created_at: row.created_at as string | Date,
    updated_at: row.updated_at as string | Date,
    resolved_at: (row.resolved_at as string | Date | null) ?? null,
  };
}

export async function getPendingChangeRequestForBooking(
  customerId: string,
  bookingId: number,
): Promise<BookingChangeRequest | null> {
  const rows = await sql`
    SELECT
      id,
      booking_id,
      customer_id,
      request_type,
      requested_date,
      requested_time,
      reason,
      status,
      customer_message,
      created_at,
      updated_at,
      resolved_at
    FROM booking_change_requests
    WHERE booking_id = ${bookingId}
      AND customer_id = ${customerId}
      AND status = 'pending'
    LIMIT 1
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapRequest(row) : null;
}

export async function getLatestChangeRequestForBooking(
  customerId: string,
  bookingId: number,
): Promise<BookingChangeRequest | null> {
  const rows = await sql`
    SELECT
      id,
      booking_id,
      customer_id,
      request_type,
      requested_date,
      requested_time,
      reason,
      status,
      customer_message,
      created_at,
      updated_at,
      resolved_at
    FROM booking_change_requests
    WHERE booking_id = ${bookingId}
      AND customer_id = ${customerId}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapRequest(row) : null;
}

export async function getPendingChangeRequestBookingIds(
  customerId: string,
): Promise<Set<number>> {
  const rows = await sql`
    SELECT booking_id
    FROM booking_change_requests
    WHERE customer_id = ${customerId}
      AND status = 'pending'
  `;

  return new Set(
    (rows as Array<{ booking_id: number }>).map((row) => Number(row.booking_id)),
  );
}

export async function createCustomerBookingChangeRequest(input: {
  customerId: string;
  bookingId: number;
  requestType: unknown;
  requestedDate?: unknown;
  requestedTime?: unknown;
  reason?: unknown;
}): Promise<
  | { ok: true; request: BookingChangeRequest }
  | { ok: false; error: string; status: number }
> {
  if (
    typeof input.requestType !== "string" ||
    !isBookingChangeRequestType(input.requestType)
  ) {
    return { ok: false, error: "Invalid request type.", status: 400 };
  }

  const requestType = input.requestType;
  const reasonResult = normalizeChangeRequestReason(input.reason);
  if (!reasonResult.ok) {
    return { ok: false, error: reasonResult.error, status: 400 };
  }

  let requestedDate: string | null = null;
  let requestedTime: string | null = null;
  if (requestType === "reschedule") {
    const dateResult = validateRequestedRescheduleDate(input.requestedDate);
    if (!dateResult.ok) {
      return { ok: false, error: dateResult.error, status: 400 };
    }
    requestedDate = dateResult.date;

    const bookingPreview = await getCustomerBookingById(
      input.customerId,
      input.bookingId,
    );
    if (!bookingPreview) {
      return { ok: false, error: "Booking not found.", status: 404 };
    }

    const currentDate = parseBookingDateOnly(bookingPreview.booking_date);
    const currentTime = parseBookingTime(bookingPreview.booking_time);
    const { resolveEffectiveDurationMinutes } = await import(
      "@/app/lib/booking-duration-pure"
    );
    const durationMinutes = resolveEffectiveDurationMinutes(
      bookingPreview.duration_minutes,
    );
    const slotCheck = await assertSlotAvailable({
      dateOnly: requestedDate,
      time: input.requestedTime,
      durationMinutes,
      excludeBookingId: input.bookingId,
    });
    if (!slotCheck.ok) {
      return {
        ok: false,
        error: slotCheck.error,
        status: slotCheck.status,
      };
    }
    requestedTime = slotCheck.time;

    if (
      currentDate === requestedDate &&
      currentTime === requestedTime
    ) {
      return {
        ok: false,
        error: "Please choose a different date or time.",
        status: 400,
      };
    }
  }

  const booking = await getCustomerBookingById(
    input.customerId,
    input.bookingId,
  );
  if (!booking) {
    return { ok: false, error: "Booking not found.", status: 404 };
  }

  if (
    !canRequestBookingChange({
      status: booking.status,
      requestType,
    })
  ) {
    return {
      ok: false,
      error: "This booking cannot be changed right now.",
      status: 400,
    };
  }

  const pending = await getPendingChangeRequestForBooking(
    input.customerId,
    input.bookingId,
  );
  if (pending) {
    return {
      ok: false,
      error:
        "A change request is already pending for this booking. Please wait for Saskia to review it.",
      status: 409,
    };
  }

  try {
    const rows = await sql`
      INSERT INTO booking_change_requests (
        booking_id,
        customer_id,
        request_type,
        requested_date,
        requested_time,
        reason,
        status
      )
      VALUES (
        ${input.bookingId},
        ${input.customerId},
        ${requestType},
        ${requestedDate},
        ${requestedTime}::time,
        ${reasonResult.reason},
        'pending'
      )
      RETURNING
        id,
        booking_id,
        customer_id,
        request_type,
        requested_date,
        requested_time,
        reason,
        status,
        customer_message,
        created_at,
        updated_at,
        resolved_at
    `;

    const request = mapRequest(rows[0] as Record<string, unknown>);

    // Email failure must not roll back the request.
    try {
      await notifyAdminBookingChangeRequest({
        request,
        booking,
      });
    } catch (error) {
      console.error("Admin change-request notification failed");
      void error;
    }

    return { ok: true, request };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      message.includes("booking_change_requests_one_pending_per_booking_idx") ||
      message.includes("duplicate key")
    ) {
      return {
        ok: false,
        error:
          "A change request is already pending for this booking. Please wait for Saskia to review it.",
        status: 409,
      };
    }
    console.error("Failed to create booking change request");
    return {
      ok: false,
      error: "Unable to submit your request right now.",
      status: 500,
    };
  }
}

export async function listPendingAdminChangeRequests(): Promise<
  AdminBookingChangeRequest[]
> {
  const rows = await sql`
    SELECT
      r.id,
      r.booking_id,
      r.customer_id,
      r.request_type,
      r.requested_date,
      r.requested_time,
      r.reason,
      r.status,
      r.customer_message,
      r.admin_note,
      r.created_at,
      r.updated_at,
      r.resolved_at,
      b.service AS booking_service,
      b.booking_date,
      b.booking_time,
      b.status AS booking_status,
      b.location AS booking_location,
      b.name AS booking_name,
      b.email AS booking_email,
      c.email AS customer_email,
      c.name AS customer_name
    FROM booking_change_requests r
    INNER JOIN booking_requests b ON b.id = r.booking_id
    INNER JOIN customers c ON c.id = r.customer_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
  `;

  return (rows as Array<Record<string, unknown>>).map((row) => ({
    ...mapRequest(row),
    booking_service: (row.booking_service as string | null) ?? null,
    booking_date: (row.booking_date as string | Date | null) ?? null,
    booking_time:
      row.booking_time == null ? null : String(row.booking_time).slice(0, 8),
    booking_status: String(row.booking_status),
    booking_location: (row.booking_location as string | null) ?? null,
    booking_name: String(row.booking_name),
    booking_email: String(row.booking_email),
    customer_email: String(row.customer_email),
    customer_name: (row.customer_name as string | null) ?? null,
    admin_note: (row.admin_note as string | null) ?? null,
  }));
}

export async function countPendingAdminChangeRequests(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM booking_change_requests
    WHERE status = 'pending'
  `;
  return Number((rows[0] as { count: number } | undefined)?.count ?? 0);
}

export async function approveBookingChangeRequest(input: {
  requestId: number;
  customerMessage?: string | null;
}): Promise<
  | { ok: true; request: BookingChangeRequest }
  | { ok: false; error: string; status: number }
> {
  const customerMessage =
    typeof input.customerMessage === "string" &&
    input.customerMessage.trim().length > 0
      ? input.customerMessage.trim().slice(0, 500)
      : null;

  const existingRows = await sql`
    SELECT
      request_type,
      booking_id,
      status,
      requested_date,
      requested_time
    FROM booking_change_requests
    WHERE id = ${input.requestId}
    LIMIT 1
  `;
  const existing = existingRows[0] as
    | {
        request_type: BookingChangeRequestType;
        booking_id: number;
        status: string;
        requested_date: string | Date | null;
        requested_time: string | null;
      }
    | undefined;

  if (!existing) {
    return { ok: false, error: "Request not found.", status: 404 };
  }
  if (existing.status !== "pending") {
    return {
      ok: false,
      error: "This request was already resolved.",
      status: 409,
    };
  }

  let rows: unknown[];
  if (existing.request_type === "cancel") {
    rows = await sql`
      WITH updated_request AS (
        UPDATE booking_change_requests
        SET
          status = 'approved',
          customer_message = ${customerMessage},
          updated_at = now(),
          resolved_at = now()
        WHERE id = ${input.requestId}
          AND status = 'pending'
        RETURNING *
      )
      UPDATE booking_requests b
      SET status = 'cancelled'
      FROM updated_request r
      WHERE b.id = r.booking_id
      RETURNING
        r.id,
        r.booking_id,
        r.customer_id,
        r.request_type,
        r.requested_date,
        r.requested_time,
        r.reason,
        r.status,
        r.customer_message,
        r.created_at,
        r.updated_at,
        r.resolved_at
    `;
  } else {
    const dateOnly = parseBookingDateOnly(existing.requested_date);
    if (!dateOnly) {
      return { ok: false, error: "Invalid requested date.", status: 400 };
    }

    const requestedTime = parseBookingTime(
      existing.requested_time == null
        ? null
        : String(existing.requested_time),
    );

    // New reschedule requests include a time; legacy date-only keep date update only.
    if (requestedTime) {
      const bookingDurationRows = await sql`
        SELECT duration_minutes
        FROM booking_requests
        WHERE id = ${existing.booking_id}
        LIMIT 1
      `;
      const { resolveEffectiveDurationMinutes } = await import(
        "@/app/lib/booking-duration-pure"
      );
      const storedDuration = (
        bookingDurationRows[0] as { duration_minutes: number | null } | undefined
      )?.duration_minutes;
      const durationMinutes = resolveEffectiveDurationMinutes(
        storedDuration == null ? null : Number(storedDuration),
      );

      const slotCheck = await assertSlotAvailable({
        dateOnly,
        time: requestedTime,
        durationMinutes,
        excludeBookingId: existing.booking_id,
      });
      if (!slotCheck.ok) {
        return {
          ok: false,
          error: slotCheck.error,
          status: slotCheck.status,
        };
      }

      const { rescheduleBookingWithCapacityClaim } = await import(
        "@/app/lib/staff-capacity"
      );
      const moved = await rescheduleBookingWithCapacityClaim({
        bookingId: existing.booking_id,
        newDate: dateOnly,
        newTime: slotCheck.time,
        changeRequestId: input.requestId,
        customerMessage,
      });
      if (!moved.ok) {
        return {
          ok: false,
          error: moved.error,
          status: moved.status,
        };
      }

      const approvedRows = await sql`
        SELECT
          id,
          booking_id,
          customer_id,
          request_type,
          requested_date,
          requested_time,
          reason,
          status,
          customer_message,
          created_at,
          updated_at,
          resolved_at
        FROM booking_change_requests
        WHERE id = ${input.requestId}
        LIMIT 1
      `;
      rows = approvedRows;
    } else {
      rows = await sql`
        WITH updated_request AS (
          UPDATE booking_change_requests
          SET
            status = 'approved',
            customer_message = ${customerMessage},
            updated_at = now(),
            resolved_at = now()
          WHERE id = ${input.requestId}
            AND status = 'pending'
          RETURNING *
        )
        UPDATE booking_requests b
        SET booking_date = r.requested_date
        FROM updated_request r
        WHERE b.id = r.booking_id
        RETURNING
          r.id,
          r.booking_id,
          r.customer_id,
          r.request_type,
          r.requested_date,
          r.requested_time,
          r.reason,
          r.status,
          r.customer_message,
          r.created_at,
          r.updated_at,
          r.resolved_at
      `;
    }
  }

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return {
      ok: false,
      error: "This request was already resolved.",
      status: 409,
    };
  }

  const request = mapRequest(row);

  if (request.request_type === "reschedule") {
    // Timed reschedules already moved capacity inside the claim transaction.
    // Legacy date-only reschedules still revalidate assignment eligibility.
    const requestedTime = parseBookingTime(
      request.requested_time == null ? null : String(request.requested_time),
    );
    if (!requestedTime) {
      try {
        const { revalidateAssignmentAfterReschedule } = await import(
          "@/app/lib/staff"
        );
        await revalidateAssignmentAfterReschedule(request.booking_id);
      } catch (error) {
        console.error("Assignment revalidation after reschedule failed");
        void error;
      }
    }
  }

  if (request.request_type === "cancel") {
    try {
      const { getAssignmentForBooking } = await import("@/app/lib/staff");
      const { releaseAssignmentCapacity } = await import(
        "@/app/lib/staff-capacity"
      );
      const { sendEmail } = await import("@/app/lib/email");
      const assignment = await getAssignmentForBooking(request.booking_id);
      if (assignment?.staffEmail) {
        await sendEmail({
          to: assignment.staffEmail,
          subject: `Job cancelled — Saskia Cleaning (#${request.booking_id})`,
          text: [
            `Hi ${assignment.staffName ?? "there"},`,
            "",
            `Booking #${request.booking_id} was cancelled.`,
            "It is no longer an active job.",
            "",
            "— Saskia Cleaning",
          ].join("\n"),
        });
      }
      await releaseAssignmentCapacity(request.booking_id);
    } catch (error) {
      console.error("Cancel assignment cleanup failed");
      void error;
    }
  }

  try {
    const bookingRows = await sql`
      SELECT id, name, email, service, booking_date, booking_time, location, status
      FROM booking_requests
      WHERE id = ${request.booking_id}
      LIMIT 1
    `;
    const booking = bookingRows[0] as
      | {
          id: number;
          name: string;
          email: string;
          service: string | null;
          booking_date: string | Date | null;
          location: string | null;
          status: string;
        }
      | undefined;

    if (booking) {
      await notifyCustomerBookingChangeResolution({
        request,
        bookingEmail: booking.email,
        bookingName: booking.name,
        service: booking.service,
        outcome: "approved",
      });
    }
  } catch (error) {
    console.error("Customer change-request approval email failed");
    void error;
  }

  return { ok: true, request };
}

export async function rejectBookingChangeRequest(input: {
  requestId: number;
  customerMessage?: string | null;
  adminNote?: string | null;
}): Promise<
  | { ok: true; request: BookingChangeRequest }
  | { ok: false; error: string; status: number }
> {
  const customerMessage =
    typeof input.customerMessage === "string" &&
    input.customerMessage.trim().length > 0
      ? input.customerMessage.trim().slice(0, 500)
      : "We could not approve this change request. Please submit another request if you still need a change.";

  const adminNote =
    typeof input.adminNote === "string" && input.adminNote.trim().length > 0
      ? input.adminNote.trim().slice(0, 500)
      : null;

  const rows = await sql`
    UPDATE booking_change_requests
    SET
      status = 'rejected',
      customer_message = ${customerMessage},
      admin_note = ${adminNote},
      updated_at = now(),
      resolved_at = now()
    WHERE id = ${input.requestId}
      AND status = 'pending'
    RETURNING
      id,
      booking_id,
      customer_id,
      request_type,
      requested_date,
      requested_time,
      reason,
      status,
      customer_message,
      created_at,
      updated_at,
      resolved_at
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    const exists = await sql`
      SELECT id, status FROM booking_change_requests WHERE id = ${input.requestId} LIMIT 1
    `;
    if (!exists[0]) {
      return { ok: false, error: "Request not found.", status: 404 };
    }
    return {
      ok: false,
      error: "This request was already resolved.",
      status: 409,
    };
  }

  const request = mapRequest(row);

  try {
    const bookingRows = await sql`
      SELECT name, email, service
      FROM booking_requests
      WHERE id = ${request.booking_id}
      LIMIT 1
    `;
    const booking = bookingRows[0] as
      | { name: string; email: string; service: string | null }
      | undefined;
    if (booking) {
      await notifyCustomerBookingChangeResolution({
        request,
        bookingEmail: booking.email,
        bookingName: booking.name,
        service: booking.service,
        outcome: "rejected",
      });
    }
  } catch (error) {
    console.error("Customer change-request rejection email failed");
    void error;
  }

  return { ok: true, request };
}
