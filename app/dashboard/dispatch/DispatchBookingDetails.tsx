import Link from "next/link";
import type { DispatchBooking } from "@/app/lib/dispatch-pure";
import { formatEstimatedDuration } from "@/app/lib/booking-duration-pure";
import { resolveEffectiveBufferMinutes } from "@/app/lib/booking-buffer-pure";
import { formatBookingTime } from "@/app/lib/scheduling-pure";

function assignmentLabel(booking: DispatchBooking): string {
  switch (booking.assignmentState) {
    case "active": return booking.staffName ? `Assigned to ${booking.staffName}` : "Active assignment";
    case "assigned_to_inactive_staff": return `Assigned to inactive staff${booking.staffName ? ` · ${booking.staffName}` : ""}`;
    case "previously_released": return "Previously assigned · capacity released";
    default: return "No assignment history";
  }
}

export default function DispatchBookingDetails({ booking }: { booking: DispatchBooking | null }) {
  if (!booking) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500" aria-label="Booking details">
        Select a booking to see dispatch details.
      </aside>
    );
  }

  return (
    <aside className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6" aria-labelledby="dispatch-details-title">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">Selected booking</p>
      <h2 id="dispatch-details-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Booking #{booking.id}</h2>
      <dl className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-slate-500">Appointment</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{booking.bookingDate} · {formatBookingTime(booking.bookingTime)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Status</dt>
          <dd className="mt-1 text-sm font-semibold capitalize text-slate-900">{booking.status.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Service</dt>
          <dd className="mt-1 text-sm text-slate-900">{booking.service || "Service not specified"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Estimated service duration</dt>
          <dd className="mt-1 text-sm text-slate-900">{booking.durationMinutes == null ? "Not recorded" : formatEstimatedDuration(booking.durationMinutes)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Handoff buffer</dt>
          <dd className="mt-1 text-sm text-slate-900">{resolveEffectiveBufferMinutes(booking.bufferMinutes)} minutes</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-slate-500">Service location</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{booking.location || "Location not specified"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-slate-500">Assignment</dt>
          <dd className="mt-1 text-sm text-slate-900">{assignmentLabel(booking)}</dd>
        </div>
      </dl>
      {booking.exceptionType ? (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
          {booking.exceptionLabel}
          <span className="sr-only">, {booking.exceptionSeverity} severity</span>
        </p>
      ) : null}
      <Link href={`/dashboard?booking=${booking.id}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:w-auto">
        Open booking management
      </Link>
      <p className="mt-3 text-xs text-slate-500">Assignment changes are disabled in this read-only Dispatch phase.</p>
    </aside>
  );
}
