"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type UnseenBooking = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  service: string | null;
  location: string | null;
};

type NavbarProps = {
  dashboardKey: string;
  unseenCount: number;
  unseenBookings: UnseenBooking[];
};

const formatDate = (date: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(new Date(date));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("month")} ${get("day")}, ${get(
    "year"
  )}, ${get("hour")}:${get("minute")} ${get(
    "dayPeriod"
  )} ${get("timeZoneName")}`;
};

export default function Navbar({
  dashboardKey,
  unseenCount,
  unseenBookings,
}: NavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingSeen, setIsMarkingSeen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleMarkAllSeen = async () => {
    setIsMarkingSeen(true);

    try {
      const response = await fetch(
        `/api/booking/mark-seen?key=${dashboardKey}`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        alert("Failed to mark bookings as seen.");
        return;
      }

      setIsOpen(false);
      router.refresh();
    } finally {
      setIsMarkingSeen(false);
    }
  };

  return (
    <nav className="relative z-30 mb-6 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Manage booking requests</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/?key=${dashboardKey}`}
            className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Home
          </a>
     

          {/* <a
            href={`/dashboard?key=${dashboardKey}`}
            className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Bookings
          </a> */}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-label={
                unseenCount > 0
                  ? `${unseenCount} new booking notification${unseenCount === 1 ? "" : "s"}`
                  : "Booking notifications"
              }
              className="relative cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
              </svg>

              {unseenCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {unseenCount > 99 ? "99+" : unseenCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Notifications
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {unseenCount > 0
                      ? `${unseenCount} new booking request${unseenCount === 1 ? "" : "s"}`
                      : "You're all caught up"}
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {unseenBookings.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      No new bookings to review.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {unseenBookings.map((booking) => (
                        <li
                          key={booking.id}
                          className="px-4 py-3 transition hover:bg-sky-50/60"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {booking.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {booking.email}
                          </p>
                          {(booking.service || booking.location) && (
                            <p className="mt-1 truncate text-xs font-medium text-sky-700">
                              {[booking.service, booking.location]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(booking.created_at)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-slate-200 bg-white p-3">
                  <button
                    type="button"
                    onClick={handleMarkAllSeen}
                    disabled={unseenCount === 0 || isMarkingSeen}
                    className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isMarkingSeen ? "Marking..." : "Mark all as seen"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
