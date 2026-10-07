import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { CustomerBooking } from "@/app/lib/customer-bookings";
import { formatBookingTime, formatCustomerBookingDate, formatCustomerBookingStatus } from "@/app/lib/customer-bookings-pure";
import AccountOverviewCard from "@/app/components/account/AccountOverviewCard";

export default function AccountRecentBookings({
  bookings,
  failed,
}: {
  bookings: CustomerBooking[];
  failed: boolean;
}) {
  return (
    <AccountOverviewCard title="Recent Bookings" icon={<CalendarClock className="h-5 w-5" />}>
      {failed ? (
        <p role="status" className="text-sm text-slate-600">We couldn&apos;t load your bookings right now.</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-600">Your bookings will appear here after you book a cleaning.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {bookings.map((booking) => (
            <li key={booking.id} className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-900">{booking.service?.trim() || "Cleaning service"}</p>
                <p className="mt-1 text-xs text-slate-500">{formatCustomerBookingDate(booking.booking_date)}{booking.booking_time ? ` · ${formatBookingTime(booking.booking_time)}` : ""}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="max-w-[130px] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">{formatCustomerBookingStatus(booking.status)}</span>
                <Link href={`/account/bookings/${booking.id}`} className="inline-flex items-center text-xs font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                  View <ArrowRight className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/account/bookings" className="mt-5 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
        View all bookings <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
      </Link>
    </AccountOverviewCard>
  );
}
