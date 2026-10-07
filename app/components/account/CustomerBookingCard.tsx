import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
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
  const durationLabel = formatCustomerDurationLabel(booking.duration_minutes);
  const dateLabel = formatCustomerBookingDate(booking.booking_date);
  const timeLabel = formatBookingTime(booking.booking_time);

  return (
    <article className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_5px_18px_rgba(15,35,65,0.06)] sm:p-5">
      <div className="flex min-w-0 flex-col gap-4">
        <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <h3 className="min-w-0 break-words text-lg font-semibold leading-snug text-slate-950 sm:text-xl">
            {serviceLabel}
          </h3>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] sm:text-[11px] ${statusClass}`}
            >
              {statusLabel}
            </span>
            {hasPendingChangeRequest ? (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-800 sm:text-[11px]">
                Change requested
              </span>
            ) : null}
          </div>
        </header>

        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)] md:items-center">
          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-3">
              <CalendarDays aria-hidden="true" className="mt-1 size-5 shrink-0 text-sky-600" />
              <div className="min-w-0">
                <p className="break-words text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                  {dateLabel}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 aria-hidden="true" className="size-4 text-slate-400" />
                    {timeLabel}
                  </span>
                  {durationLabel ? (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>About {durationLabel}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </div>

          {booking.location ? (
            <div className="flex min-w-0 items-start gap-2.5 rounded-xl bg-sky-50/70 px-3 py-2.5 md:bg-transparent md:px-0 md:py-0">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sky-600" />
              <p className="min-w-0 break-words text-sm leading-5 text-slate-600">
                {booking.location}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="flex min-w-0 flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">
            <p className="font-semibold text-slate-900">
              {estimate} <span className="font-normal text-slate-500">estimate</span>
            </p>
            <p className="text-slate-500">Booking #{booking.id}</p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:min-w-[280px] sm:grid-cols-2">
          <Link
            href={`/account/bookings/${booking.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-transparent hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            View details
          </Link>
          <Link
            href={buildBookAgainHref(booking.id)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-sky-400 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Book Again
          </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
