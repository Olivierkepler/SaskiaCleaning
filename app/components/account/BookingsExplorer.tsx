"use client";

import { useState } from "react";
import type { CustomerBooking } from "@/app/lib/customer-bookings";
import CustomerBookingCard from "@/app/components/account/CustomerBookingCard";

type BookingFilter = "all" | "upcoming" | "completed" | "cancelled";

type BookingsExplorerProps = {
  upcoming: CustomerBooking[];
  past: CustomerBooking[];
  pendingBookingIds: number[];
};

const filters: { value: BookingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const initialHistoryCount = 5;
const historyIncrement = 5;

export default function BookingsExplorer({
  upcoming,
  past,
  pendingBookingIds,
}: BookingsExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [pastVisibleCount, setPastVisibleCount] =
    useState(initialHistoryCount);

  const completed = past.filter((booking) => booking.status === "completed");
  const cancelled = past.filter((booking) => booking.status === "cancelled");
  const pendingIds = new Set(pendingBookingIds);

  function selectFilter(filter: BookingFilter) {
    setActiveFilter(filter);
    setUpcomingExpanded(false);
    setPastVisibleCount(initialHistoryCount);
  }

  function renderCards(bookings: CustomerBooking[]) {
    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <CustomerBookingCard
            key={booking.id}
            booking={booking}
            hasPendingChangeRequest={pendingIds.has(booking.id)}
          />
        ))}
      </div>
    );
  }

  function renderEmpty(message: string) {
    return (
      <p className="rounded-[20px] bg-[#ECF0F3] px-4 py-5 text-sm text-slate-500 shadow-[inset_5px_5px_12px_rgba(163,177,198,0.30),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]">
        {message}
      </p>
    );
  }

  function renderHistorySection({
    heading,
    bookings,
    emptyMessage,
  }: {
    heading: string;
    bookings: CustomerBooking[];
    emptyMessage: string;
  }) {
    const visible = bookings.slice(0, pastVisibleCount);
    const hasMore = pastVisibleCount < bookings.length;
    const isExpanded = pastVisibleCount > initialHistoryCount;
    const showFewer = !hasMore && isExpanded;

    return (
      <section aria-label={`${heading} bookings`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
            {heading}
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {bookings.length}
          </span>
        </div>
        {bookings.length === 0 ? (
          renderEmpty(emptyMessage)
        ) : (
          <>
            {renderCards(visible)}
            {hasMore || showFewer ? (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    showFewer
                      ? setPastVisibleCount(initialHistoryCount)
                      : setPastVisibleCount((count) =>
                          Math.min(count + historyIncrement, bookings.length),
                        )
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                >
                  {showFewer
                    ? `Show fewer ${heading.toLowerCase()} bookings`
                    : `See more ${heading.toLowerCase()} bookings`}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    );
  }

  const summary = `${upcoming.length} Upcoming · ${completed.length} Completed · ${cancelled.length} Cancelled`;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filter bookings"
          className="flex max-w-full flex-wrap gap-2"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectFilter(filter.value)}
                className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm leading-6 text-slate-500 sm:text-right">
          {summary}
        </p>
      </div>

      <div className="space-y-8">
        {activeFilter === "all" || activeFilter === "upcoming" ? (
          <section aria-labelledby="upcoming-bookings-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="upcoming-bookings-heading"
                className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500"
              >
                Upcoming
              </h2>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                {upcoming.length}
              </span>
            </div>
            {upcoming.length === 0 ? (
              renderEmpty("No upcoming bookings.")
            ) : (
              <>
                {renderCards(
                  upcomingExpanded ? upcoming : upcoming.slice(0, 3),
                )}
                {upcoming.length > 3 ? (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      aria-expanded={upcomingExpanded}
                      onClick={() => setUpcomingExpanded((expanded) => !expanded)}
                      className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                    >
                      {upcomingExpanded
                        ? "Show fewer upcoming"
                        : `See all upcoming (${upcoming.length})`}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        ) : null}

        {activeFilter === "all"
          ? renderHistorySection({
              heading: "Past",
              bookings: past,
              emptyMessage: "No past bookings yet.",
            })
          : null}

        {activeFilter === "completed"
          ? renderHistorySection({
              heading: "Completed",
              bookings: completed,
              emptyMessage: "No completed bookings yet.",
            })
          : null}

        {activeFilter === "cancelled"
          ? renderHistorySection({
              heading: "Cancelled",
              bookings: cancelled,
              emptyMessage: "No cancelled bookings.",
            })
          : null}
      </div>
    </div>
  );
}
