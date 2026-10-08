import type { DispatchBooking } from "@/app/lib/dispatch-pure";
import { formatBookingTime } from "@/app/lib/scheduling-pure";

function statusStyle(status: string) {
  switch (status) {
    case "in_progress": return "bg-orange-50 text-orange-800 border-orange-200";
    case "completed": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "scheduled": return "bg-sky-50 text-sky-800 border-sky-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function DispatchBookingQueue({
  bookings,
  selectedId,
  onSelect,
}: {
  bookings: DispatchBooking[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-4" aria-labelledby="dispatch-queue-title">
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div>
          <h2 id="dispatch-queue-title" className="text-base font-semibold text-slate-950">Appointments</h2>
          <p className="mt-0.5 text-xs text-slate-500">Select a booking to review its dispatch details.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700">{bookings.length}</span>
      </div>
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No scheduled appointments in this date range.</p>
          <p className="mt-1 text-xs text-slate-500">Try another range or review undated inquiries below.</p>
        </div>
      ) : (
        <ul className="max-h-[68vh] space-y-2 overflow-y-auto pr-1">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <button
                type="button"
                onClick={() => onSelect(booking.id)}
                aria-pressed={selectedId === booking.id}
                className={`w-full min-w-0 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:p-4 ${selectedId === booking.id ? "border-sky-300 bg-sky-50/70 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">{booking.bookingDate} · {formatBookingTime(booking.bookingTime)}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-950">Booking #{booking.id} · {booking.service || "Cleaning"}</p>
                    <p className="mt-1 truncate text-xs text-slate-600">{booking.location || "Location not specified"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{booking.staffName ? `Assigned: ${booking.staffName}` : booking.assignmentState === "previously_released" ? "Previously assigned · released" : "Unassigned"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold capitalize ${statusStyle(booking.status)}`}>{booking.status.replaceAll("_", " ")}</span>
                </div>
                {booking.exceptionLabel ? <p className="mt-2 text-xs font-semibold text-rose-700">{booking.exceptionLabel}</p> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
