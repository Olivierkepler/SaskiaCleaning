import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { CustomerBooking } from "@/app/lib/customer-bookings";
import {
  formatBookingTime,
  formatCustomerBookingDate,
  formatCustomerBookingStatus,
} from "@/app/lib/customer-bookings-pure";
import { formatCustomerDurationLabel } from "@/app/lib/booking-duration-pure";
import AccountOverviewCard from "@/app/components/account/AccountOverviewCard";

export default function AccountNextCleaning({
  booking,
  failed,
}: {
  booking: CustomerBooking | null;
  failed: boolean;
}) {
  return (
    <AccountOverviewCard title="Next Cleaning" icon={<CalendarDays className="h-5 w-5" />} className="min-h-[245px]">
      {failed ? (
        <p role="status" className="text-sm text-slate-600">We couldn&apos;t load your booking details right now.</p>
      ) : booking ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="break-words text-lg font-semibold text-slate-900">
                {booking.service?.trim() || "Cleaning service"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatCustomerBookingDate(booking.booking_date)} · {formatBookingTime(booking.booking_time)}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              {formatCustomerBookingStatus(booking.status)}
            </span>
          </div>
          <dl className="mt-4 space-y-2 text-sm text-slate-600">
            {booking.location ? (
              <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                <dt className="text-slate-400">Location</dt>
                <dd className="break-words">{booking.location}</dd>
              </div>
            ) : null}
            {formatCustomerDurationLabel(booking.duration_minutes) ? (
              <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                <dt className="text-slate-400">Duration</dt>
                <dd>{formatCustomerDurationLabel(booking.duration_minutes)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm">
            <Link href={`/account/bookings/${booking.id}`} className="font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              View booking details <ArrowRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/account/bookings" className="font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              View all bookings
            </Link>
          </div>
        </>
      ) : (
        <div className="flex min-h-[155px] flex-col items-start justify-center">
          <p className="font-medium text-slate-800">No upcoming cleaning</p>
          <p className="mt-1 text-sm text-slate-500">Your next scheduled cleaning will appear here.</p>
          <Link href="/account/book" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
            Book a cleaning
          </Link>
          <Link href="/account/bookings" className="mt-3 text-sm font-medium text-sky-700 hover:text-sky-800">View all bookings</Link>
        </div>
      )}
    </AccountOverviewCard>
  );
}
