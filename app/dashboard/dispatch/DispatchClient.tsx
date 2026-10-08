"use client";

import { useMemo, useState } from "react";
import DispatchBookingDetails from "./DispatchBookingDetails";
import DispatchBookingQueue from "./DispatchBookingQueue";
import DispatchOverviewCards from "./DispatchOverviewCards";
import { isDispatchBookingAssigned, isDispatchBookingAwaitingAssignment, type DispatchBooking, type DispatchSummary, type UndatedInquiry } from "@/app/lib/dispatch-pure";

type QueueFilter = "all" | "awaiting" | "assigned" | "in_progress" | "completed" | "exceptions";

const filters: Array<{ value: QueueFilter; label: string }> = [
  { value: "all", label: "All appointments" },
  { value: "awaiting", label: "Awaiting assignment" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "exceptions", label: "Exceptions" },
];

export default function DispatchClient({
  from,
  to,
  bookings,
  summary,
  truncated,
  undatedInquiries,
  undatedCount,
  undatedTruncated,
  error,
}: {
  from: string;
  to: string;
  bookings: DispatchBooking[];
  summary: DispatchSummary;
  truncated: boolean;
  undatedInquiries: UndatedInquiry[];
  undatedCount: number;
  undatedTruncated: boolean;
  error?: string | null;
}) {
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(bookings[0]?.id ?? null);
  const selected = bookings.find((booking) => booking.id === selectedId) ?? null;
  const filtered = useMemo(() => bookings.filter((booking) => {
    switch (filter) {
      case "awaiting": return ["new", "contacted", "scheduled"].includes(booking.status) && isDispatchBookingAwaitingAssignment(booking);
      case "assigned": return ["new", "contacted", "scheduled"].includes(booking.status) && isDispatchBookingAssigned(booking);
      case "in_progress": return booking.status === "in_progress";
      case "completed": return booking.status === "completed";
      case "exceptions": return booking.exceptionType !== null;
      default: return true;
    }
  }), [bookings, filter]);

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:flex sm:items-end sm:justify-between sm:gap-6 sm:p-5" aria-label="Dispatch date range">
        <div className="mb-3 sm:mb-0">
          <h2 className="text-sm font-semibold text-slate-900">Appointment window</h2>
          <p className="mt-1 text-xs text-slate-500">Dates and times use America/New_York.</p>
        </div>
        <form method="get" action="/dashboard/dispatch" className="grid min-w-0 grid-cols-2 gap-3 sm:flex sm:items-end">
          <label className="min-w-0 text-xs font-medium text-slate-600">From
            <input name="from" type="date" required defaultValue={from} className="mt-1 block min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:w-40" />
          </label>
          <label className="min-w-0 text-xs font-medium text-slate-600">To
            <input name="to" type="date" required defaultValue={to} className="mt-1 block min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:w-40" />
          </label>
          <button type="submit" className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:col-span-1">Apply range</button>
        </form>
      </section>

      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
      <DispatchOverviewCards summary={summary} />
      <p className="-mt-3 text-xs leading-5 text-slate-500">Counts cover the selected dates. Awaiting assignment and assigned include open bookings; in-progress and completed are status counts. Exceptions can overlap any status.</p>
      {truncated ? <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Showing the first {bookings.length} appointments. Narrow the date range to review the rest; summary counts reflect the displayed appointments.</p> : null}

      <section className="min-w-0 space-y-3" aria-label="Dispatch queue and booking details">
        <div className="flex flex-wrap gap-2" aria-label="Filter appointments">
          {filters.map((item) => (
            <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`min-h-10 rounded-xl px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${filter === item.value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
          <DispatchBookingQueue bookings={filtered} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
          <DispatchBookingDetails booking={selected} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-5" aria-labelledby="undated-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="undated-title" className="text-base font-semibold text-slate-950">Undated inquiries</h2>
            <p className="mt-1 text-xs text-slate-500">These requests have no complete appointment date and time, so they are not included in the dispatch queue.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700">{undatedCount}</span>
        </div>
        {undatedInquiries.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No undated inquiries need review.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {undatedInquiries.map((item) => (
              <li key={item.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">Booking #{item.id}{item.service ? ` · ${item.service}` : ""}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Submitted {new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(item.submittedAt))}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-700">{item.status.replaceAll("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
        {undatedTruncated ? <p className="mt-3 text-xs text-slate-500">Showing the latest {undatedInquiries.length} of {undatedCount} undated inquiries.</p> : null}
      </section>
    </div>
  );
}
