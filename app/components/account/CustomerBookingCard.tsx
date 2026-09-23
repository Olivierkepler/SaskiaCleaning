import Link from "next/link";
import type { CustomerBooking } from "@/app/lib/customer-bookings";
import {
  buildBookAgainHref,
  formatBookingTime,
  formatCustomerBookingDate,
  formatCustomerBookingStatus,
  formatCustomerEstimate,
  getCustomerBookingStatusBadgeClass,
} from "@/app/lib/customer-bookings-pure";
import { formatCustomerDurationLabel } from "@/app/lib/booking-duration-pure";

type CustomerBookingCardProps = {
  booking: CustomerBooking;
  hasPendingChangeRequest?: boolean;
};

export default function CustomerBookingCard({
  booking,
  hasPendingChangeRequest = false,
}: CustomerBookingCardProps) {
  const statusLabel = formatCustomerBookingStatus(booking.status);
  const statusClass = getCustomerBookingStatusBadgeClass(booking.status);
  const estimate = formatCustomerEstimate(
    booking.estimate_low,
    booking.estimate_mid,
    booking.estimate_high,
  );
  const serviceLabel = booking.service?.trim() || "Cleaning service";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-950">
              {serviceLabel}
            </h3>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusClass}`}
            >
              {statusLabel}
            </span>
            {hasPendingChangeRequest ? (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                Change requested
              </span>
            ) : null}
          </div>

          <dl className="mt-3 grid gap-1.5 text-sm text-slate-600">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-slate-400">Date</dt>
              <dd>{formatCustomerBookingDate(booking.booking_date)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-slate-400">Time</dt>
              <dd>{formatBookingTime(booking.booking_time)}</dd>
            </div>
            {formatCustomerDurationLabel(booking.duration_minutes) ? (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-400">Duration</dt>
                <dd>{formatCustomerDurationLabel(booking.duration_minutes)}</dd>
              </div>
            ) : null}
            {booking.location ? (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-slate-400">Location</dt>
                <dd className="min-w-0 break-words">{booking.location}</dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-slate-400">Estimate</dt>
              <dd className="font-semibold text-slate-900">{estimate}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-slate-400">Ref</dt>
              <dd>#{booking.id}</dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            href={`/account/bookings/${booking.id}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-transparent hover:text-slate-900"
          >
            View details
          </Link>
          <Link
            href={buildBookAgainHref({ service: booking.service })}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-sky-400 hover:text-sky-600"
          >
            Book Again
          </Link>
        </div>
      </div>
    </article>
  );
}
