import {
  parseAdminBookingDetailsPatch,
} from "@/app/lib/admin-booking-details-pure";
import {
  mapAppointmentMoveFailure,
  type AppointmentMoveFailure,
} from "@/app/lib/appointment-move-pure";

export type AdminBookingEditRequestResult =
  | { status: 200; booking: Record<string, unknown> }
  | { status: 400 | 401 | 404 | 409 | 500; error: string };

class RollbackRequestError extends Error {
  constructor(readonly result: AdminBookingEditRequestResult) {
    super("error" in result ? result.error : "rollback");
  }
}

export async function executeAdminBookingEditRequest(
  input: unknown,
  dependencies: {
    authorized: boolean;
    withTransaction: <T>(operation: () => Promise<T>) => Promise<T>;
    updateDetails: (input: unknown) => Promise<AdminBookingEditRequestResult>;
    moveAppointment: (input: {
      bookingDate: string;
      bookingTime: string;
    }) => Promise<{ ok: true; bookingDate: string; bookingTime: string } | { ok: false; reason: AppointmentMoveFailure }>;
    bookingId: number;
  },
): Promise<AdminBookingEditRequestResult> {
  if (!dependencies.authorized) return { status: 401, error: "Unauthorized" };
  const parsed = parseAdminBookingDetailsPatch(input);
  if (!parsed.ok) return { status: 400, error: parsed.error };
  const hasAppointment = parsed.patch.bookingDate !== undefined;
  const detailsInput = input && typeof input === "object" && !Array.isArray(input)
    ? { ...(input as Record<string, unknown>) }
    : {};
  delete detailsInput.bookingDate;
  delete detailsInput.bookingTime;

  try {
    return await dependencies.withTransaction(async () => {
      let detailsBooking: Record<string, unknown> | null = null;
      if (Object.keys(detailsInput).length > 0 || !hasAppointment) {
        const detailsResult = await dependencies.updateDetails(detailsInput);
        if (detailsResult.status !== 200) {
          if (hasAppointment) throw new RollbackRequestError(detailsResult);
          return detailsResult;
        }
        detailsBooking = detailsResult.booking;
      }

      if (!hasAppointment) {
        return { status: 200, booking: detailsBooking ?? { id: dependencies.bookingId } };
      }

      const moved = await dependencies.moveAppointment({
        bookingDate: parsed.patch.bookingDate!,
        bookingTime: parsed.patch.bookingTime!,
      });
      if (!moved.ok) {
        const mapped = mapAppointmentMoveFailure(moved.reason);
        throw new RollbackRequestError(mapped);
      }
      return {
        status: 200,
        booking: {
          ...(detailsBooking ?? { id: dependencies.bookingId }),
          booking_date: moved.bookingDate,
          booking_time: moved.bookingTime,
        },
      };
    });
  } catch (error) {
    if (error instanceof RollbackRequestError) return error.result;
    return { status: 500, error: "Booking details could not be saved." };
  }
}
