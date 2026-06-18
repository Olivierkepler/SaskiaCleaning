"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BOOKING_STATUS_BADGE_CLASS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUSES,
  type BookingStatus,
  isBookingStatus,
} from "../lib/booking-status";

type SortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "bedrooms-desc"
  | "bathrooms-desc";

type BedroomFilter = "all" | "1" | "2" | "3" | "4" | "5+";
type BathroomFilter = "all" | "1" | "2" | "3" | "4" | "5+";
type StatusFilter = "all" | BookingStatus;
type ReferralFilter = "all" | "referral";
type ItemsPerPage = 5 | 10 | 25 | 50;

const ITEMS_PER_PAGE_OPTIONS: ItemsPerPage[] = [5, 10, 25, 50];

const selectClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

type BookingRequest = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  bedrooms: number;
  bathrooms: number;
  status: BookingStatus;
  seen: boolean;
  created_at: string;
  service: string | null;
  frequency: string | null;
  location: string | null;
  booking_date: string | Date | null;
  extras: string[] | string | null;
  estimate_low: number | null;
  estimate_mid: number | null;
  estimate_high: number | null;
  notes: string | null;
  referral_code: string | null;
  friend_discount_amount: number | null;
};

function normalizeExtras(extras: BookingRequest["extras"]): string[] {
  if (!extras) return [];
  if (Array.isArray(extras)) return extras.map(String);
  if (typeof extras === "string") {
    try {
      const parsed = JSON.parse(extras) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return extras ? [extras] : [];
    }
  }
  return [];
}

function formatRequestedDate(date: string | Date | null): string {
  if (!date) return "—";

  const dateOnly =
    date instanceof Date
      ? date.toISOString().slice(0, 10)
      : String(date).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return "—";

  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatEstimate(
  low: number | null,
  mid: number | null,
  high: number | null,
): string {
  if (low != null && high != null) {
    return `$${low.toLocaleString("en-US")}–$${high.toLocaleString("en-US")}`;
  }
  if (mid != null) return `$${mid.toLocaleString("en-US")}`;
  return "—";
}

function formatExtrasList(extras: BookingRequest["extras"]): string {
  const items = normalizeExtras(extras);
  return items.length > 0 ? items.join(", ") : "—";
}

function hasReferralCode(booking: BookingRequest): boolean {
  return Boolean(booking.referral_code?.trim());
}

function ReferralBadge({
  code,
  friendDiscountAmount,
}: {
  code: string | null;
  friendDiscountAmount: number | null;
}) {
  const trimmed = code?.trim();
  if (!trimmed) return null;

  return (
    <div className="mt-1">
      <p className="text-xs font-medium text-emerald-700">
        🏷️ Referral: {trimmed}
      </p>
      {friendDiscountAmount != null && friendDiscountAmount > 0 && (
        <p className="text-xs text-emerald-600">
          -${friendDiscountAmount} friend discount
        </p>
      )}
    </div>
  );
}

function BookingDetails({
  extras,
  notes,
  compact = false,
}: {
  extras: BookingRequest["extras"];
  notes: string | null;
  compact?: boolean;
}) {
  const items = normalizeExtras(extras);
  const hasExtras = items.length > 0;
  const hasNotes = Boolean(notes?.trim());

  if (!hasExtras && !hasNotes) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      {hasExtras && (
        <div className="flex flex-wrap gap-1">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      )}
      {hasNotes && (
        <p
          className={`text-slate-600 ${compact ? "line-clamp-2 text-xs" : "text-sm"}`}
          title={notes ?? undefined}
        >
          {notes}
        </p>
      )}
    </div>
  );
}

export default function DashboardTable({
  bookings,
  dashboardKey,
}: {
  bookings: BookingRequest[];
  dashboardKey: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [bedroomFilter, setBedroomFilter] = useState<BedroomFilter>("all");
  const [bathroomFilter, setBathroomFilter] = useState<BathroomFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [referralFilter, setReferralFilter] = useState<ReferralFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(10);

  const getBookingStatus = (status: string): BookingStatus =>
    isBookingStatus(status) ? status : "new";

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = bookings.filter((booking) => {
      if (query) {
        const bookingStatus = getBookingStatus(booking.status);
        const statusLabel = BOOKING_STATUS_LABELS[bookingStatus].toLowerCase();
        const statusValue = bookingStatus.replace(/_/g, " ");

        const matchesSearch =
          booking.name.toLowerCase().includes(query) ||
          booking.email.toLowerCase().includes(query) ||
          (booking.mobile?.toLowerCase().includes(query) ?? false) ||
          (booking.service?.toLowerCase().includes(query) ?? false) ||
          (booking.frequency?.toLowerCase().includes(query) ?? false) ||
          (booking.location?.toLowerCase().includes(query) ?? false) ||
          (booking.notes?.toLowerCase().includes(query) ?? false) ||
          (booking.referral_code?.toLowerCase().includes(query) ?? false) ||
          normalizeExtras(booking.extras).some((extra) =>
            extra.toLowerCase().includes(query),
          ) ||
          statusLabel.includes(query) ||
          statusValue.includes(query);
        if (!matchesSearch) return false;
      }

      if (bedroomFilter !== "all") {
        const bedrooms =
          bedroomFilter === "5+" ? 5 : Number.parseInt(bedroomFilter, 10);
        if (bedroomFilter === "5+") {
          if (booking.bedrooms < bedrooms) return false;
        } else if (booking.bedrooms !== bedrooms) {
          return false;
        }
      }

      if (bathroomFilter !== "all") {
        const bathrooms =
          bathroomFilter === "5+" ? 5 : Number.parseInt(bathroomFilter, 10);
        if (bathroomFilter === "5+") {
          if (booking.bathrooms < bathrooms) return false;
        } else if (booking.bathrooms !== bathrooms) {
          return false;
        }
      }

      if (
        statusFilter !== "all" &&
        getBookingStatus(booking.status) !== statusFilter
      ) {
        return false;
      }

      if (referralFilter === "referral" && !hasReferralCode(booking)) {
        return false;
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "bedrooms-desc":
          return b.bedrooms - a.bedrooms || b.bathrooms - a.bathrooms;
        case "bathrooms-desc":
          return b.bathrooms - a.bathrooms || b.bedrooms - a.bedrooms;
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [bookings, search, sort, bedroomFilter, bathroomFilter, statusFilter, referralFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort, bedroomFilter, bathroomFilter, statusFilter, referralFilter, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage)),
    [filteredBookings.length, itemsPerPage]
  );

  const paginatedBookings = useMemo(() => {
    const page = Math.min(currentPage, totalPages);
    const start = (page - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage, totalPages]);

  const startResult = useMemo(() => {
    if (filteredBookings.length === 0) return 0;
    const page = Math.min(currentPage, totalPages);
    return (page - 1) * itemsPerPage + 1;
  }, [filteredBookings.length, currentPage, itemsPerPage, totalPages]);

  const endResult = useMemo(() => {
    if (filteredBookings.length === 0) return 0;
    const page = Math.min(currentPage, totalPages);
    return Math.min(page * itemsPerPage, filteredBookings.length);
  }, [filteredBookings.length, currentPage, itemsPerPage, totalPages]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const metrics = useMemo(() => {
    const total = bookings.length;

    const nyDateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayKey = nyDateFormatter.format(new Date());

    const todayCount = bookings.filter(
      (booking) =>
        nyDateFormatter.format(new Date(booking.created_at)) === todayKey
    ).length;

    const avgBedrooms =
      total > 0
        ? (
            bookings.reduce((sum, booking) => sum + booking.bedrooms, 0) / total
          ).toFixed(1)
        : "0.0";

    const avgBathrooms =
      total > 0
        ? (
            bookings.reduce((sum, booking) => sum + booking.bathrooms, 0) /
            total
          ).toFixed(1)
        : "0.0";

    return { total, todayCount, avgBedrooms, avgBathrooms };
  }, [bookings]);

  const unseenCount = useMemo(
    () => bookings.filter((booking) => !booking.seen).length,
    [bookings]
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    sort !== "newest" ||
    bedroomFilter !== "all" ||
    bathroomFilter !== "all" ||
    statusFilter !== "all" ||
    referralFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setSort("newest");
    setBedroomFilter("all");
    setBathroomFilter("all");
    setStatusFilter("all");
    setReferralFilter("all");
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this booking?");
    if (!confirmed) return;

    const response = await fetch(`/api/booking/${id}?key=${dashboardKey}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed to delete booking.");
      return;
    }

    router.refresh();
  };

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    const response = await fetch(
      `/api/booking/${id}/status?key=${dashboardKey}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      alert("Failed to update booking status.");
      return;
    }

    router.refresh();
  };

  const handleMarkAllSeen = async () => {
    const response = await fetch(
      `/api/booking/mark-seen?key=${dashboardKey}`,
      { method: "PATCH" }
    );

    if (!response.ok) {
      alert("Failed to mark bookings as seen.");
      return;
    }

    router.refresh();
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

  const handleExportCsv = () => {
    const headers = [
      "Name",
      "Email",
      "Mobile",
      "Service",
      "Frequency",
      "Location",
      "Requested Date",
      "Bedrooms",
      "Bathrooms",
      "Estimate Low",
      "Estimate Mid",
      "Estimate High",
      "Extras",
      "Notes",
      "Referral Code",
      "Friend Discount Amount",
      "Status",
      "Submitted",
    ];
    const rows = filteredBookings.map((booking) =>
      [
        escapeCsvValue(booking.name),
        escapeCsvValue(booking.email),
        escapeCsvValue(booking.mobile ?? ""),
        escapeCsvValue(booking.service ?? ""),
        escapeCsvValue(booking.frequency ?? ""),
        escapeCsvValue(booking.location ?? ""),
        escapeCsvValue(formatRequestedDate(booking.booking_date)),
        escapeCsvValue(String(booking.bedrooms)),
        escapeCsvValue(String(booking.bathrooms)),
        escapeCsvValue(
          booking.estimate_low != null ? String(booking.estimate_low) : "",
        ),
        escapeCsvValue(
          booking.estimate_mid != null ? String(booking.estimate_mid) : "",
        ),
        escapeCsvValue(
          booking.estimate_high != null ? String(booking.estimate_high) : "",
        ),
        escapeCsvValue(formatExtrasList(booking.extras)),
        escapeCsvValue(booking.notes ?? ""),
        escapeCsvValue(booking.referral_code ?? ""),
        escapeCsvValue(
          booking.friend_discount_amount != null
            ? String(booking.friend_discount_amount)
            : "",
        ),
        escapeCsvValue(
          BOOKING_STATUS_LABELS[getBookingStatus(booking.status)]
        ),
        escapeCsvValue(formatDate(booking.created_at)),
      ].join(",")
    );

    const csv = [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "booking-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {bookings.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No booking requests yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 border-b border-slate-200 p-4 sm:gap-4 sm:p-5 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total bookings
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {metrics.total}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Today&apos;s bookings
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {metrics.todayCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg bedrooms
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {metrics.avgBedrooms}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg bathrooms
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {metrics.avgBathrooms}
              </p>
            </div>
          </div>

          {unseenCount > 0 && (
            <div className="flex flex-col gap-3 border-b border-sky-200 bg-sky-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm font-medium text-sky-900">
                You have{" "}
                <span className="font-bold">{unseenCount}</span> new booking
                request{unseenCount === 1 ? "" : "s"}.
              </p>
              <button
                type="button"
                onClick={handleMarkAllSeen}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                Mark all as seen
              </button>
            </div>
          )}

          <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="w-full lg:max-w-md">
                <label
                  htmlFor="booking-search"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Search
                </label>
                <input
                  id="booking-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, service, location, referral code..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredBookings.length === 0}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear filters
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <label
                  htmlFor="booking-sort"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Sort
                </label>
                <select
                  id="booking-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className={selectClassName}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="bedrooms-desc">Bedrooms high-low</option>
                  <option value="bathrooms-desc">Bathrooms high-low</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bedroom-filter"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Bedrooms
                </label>
                <select
                  id="bedroom-filter"
                  value={bedroomFilter}
                  onChange={(e) =>
                    setBedroomFilter(e.target.value as BedroomFilter)
                  }
                  className={selectClassName}
                >
                  <option value="all">All</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bathroom-filter"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Bathrooms
                </label>
                <select
                  id="bathroom-filter"
                  value={bathroomFilter}
                  onChange={(e) =>
                    setBathroomFilter(e.target.value as BathroomFilter)
                  }
                  className={selectClassName}
                >
                  <option value="all">All</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  className={selectClassName}
                >
                  <option value="all">All</option>
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {BOOKING_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="referral-filter"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Referral
                </label>
                <select
                  id="referral-filter"
                  value={referralFilter}
                  onChange={(e) =>
                    setReferralFilter(e.target.value as ReferralFilter)
                  }
                  className={selectClassName}
                >
                  <option value="all">All bookings</option>
                  <option value="referral">Referral bookings only</option>
                </select>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No bookings match your filters.
            </div>
          ) : (
            <>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
              <thead className="bg-sky-500 text-sm text-white">
                <tr>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Contact</th>
                  <th className="p-3 font-semibold">Service</th>
                  <th className="p-3 font-semibold">Location</th>
                  <th className="p-3 font-semibold">Requested</th>
                  <th className="p-3 font-semibold">Rooms</th>
                  <th className="p-3 font-semibold">Estimate</th>
                  <th className="min-w-[180px] p-3 font-semibold">Extras / Notes</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Submitted</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {paginatedBookings.map((booking) => {
                  const bookingStatus = getBookingStatus(booking.status);
                  const isUnseen = !booking.seen;
                  const estimateLabel = formatEstimate(
                    booking.estimate_low,
                    booking.estimate_mid,
                    booking.estimate_high,
                  );

                  return (
                  <tr
                    key={booking.id}
                    className={`align-top transition ${
                      isUnseen
                        ? "bg-sky-50 hover:bg-sky-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{booking.name}</span>
                        {isUnseen && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            New
                          </span>
                        )}
                      </div>
                      {booking.frequency && (
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.frequency}
                        </p>
                      )}
                      <ReferralBadge
                        code={booking.referral_code}
                        friendDiscountAmount={booking.friend_discount_amount}
                      />
                    </td>
                    <td className="p-3 text-slate-700">
                      <p className="break-all">{booking.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.mobile || "—"}
                      </p>
                    </td>
                    <td className="p-3 text-slate-700">
                      {booking.service || "—"}
                    </td>
                    <td className="max-w-[140px] p-3 text-slate-700">
                      <span className="line-clamp-2" title={booking.location ?? undefined}>
                        {booking.location || "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3 text-slate-700">
                      {formatRequestedDate(booking.booking_date)}
                    </td>
                    <td className="whitespace-nowrap p-3 text-slate-700">
                      {booking.bedrooms} bed / {booking.bathrooms} bath
                    </td>
                    <td
                      className="whitespace-nowrap p-3 font-medium text-slate-800"
                      title={
                        booking.estimate_mid != null
                          ? `Mid estimate: $${booking.estimate_mid.toLocaleString("en-US")}`
                          : undefined
                      }
                    >
                      {estimateLabel}
                    </td>
                    <td className="max-w-[220px] p-3">
                      <BookingDetails
                        extras={booking.extras}
                        notes={booking.notes}
                        compact
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={bookingStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            booking.id,
                            e.target.value as BookingStatus
                          )
                        }
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm outline-none transition focus:ring-2 focus:ring-sky-100 ${BOOKING_STATUS_BADGE_CLASS[bookingStatus]}`}
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {BOOKING_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap p-3 text-xs text-slate-500">
                      {formatDate(booking.created_at)}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(booking.id)}
                        className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-95"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-4 p-4 md:hidden">
            {paginatedBookings.map((booking) => {
              const bookingStatus = getBookingStatus(booking.status);
              const isUnseen = !booking.seen;
              const estimateLabel = formatEstimate(
                booking.estimate_low,
                booking.estimate_mid,
                booking.estimate_high,
              );

              return (
              <div
                key={booking.id}
                className={`rounded-xl border p-4 shadow-sm ${
                  isUnseen
                    ? "border-sky-300 bg-sky-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {booking.name}
                      </h2>
                      {isUnseen && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                          New
                        </span>
                      )}
                    </div>
                    <p className="break-all text-sm text-slate-500">
                      {booking.email}
                    </p>
                    {(booking.service || booking.frequency) && (
                      <p className="mt-1 text-sm font-medium text-sky-700">
                        {[booking.service, booking.frequency]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    <ReferralBadge
                      code={booking.referral_code}
                      friendDiscountAmount={booking.friend_discount_amount}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(booking.id)}
                    className="shrink-0 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-95"
                  >
                    Delete
                  </button>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor={`status-${booking.id}`}
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${booking.id}`}
                    value={bookingStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        booking.id,
                        e.target.value as BookingStatus
                      )
                    }
                    className={`w-full rounded-lg border px-2.5 py-2 text-sm font-semibold shadow-sm outline-none transition focus:ring-2 focus:ring-sky-100 ${BOOKING_STATUS_BADGE_CLASS[bookingStatus]}`}
                  >
                    {BOOKING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {BOOKING_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Mobile</span>
                    <span className="font-medium text-slate-800">
                      {booking.mobile || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Location</span>
                    <span className="text-right font-medium text-slate-800">
                      {booking.location || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Requested date</span>
                    <span className="font-medium text-slate-800">
                      {formatRequestedDate(booking.booking_date)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Rooms</span>
                    <span className="font-medium text-slate-800">
                      {booking.bedrooms} bed / {booking.bathrooms} bath
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Estimate</span>
                    <span className="font-medium text-slate-800">
                      {estimateLabel}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="mb-2 block text-slate-500">
                      Extras / Notes
                    </span>
                    <BookingDetails
                      extras={booking.extras}
                      notes={booking.notes}
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="block text-slate-500">Submitted</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(booking.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 p-4 sm:p-5">
            <p className="text-sm text-slate-500">
              {filteredBookings.length === 1
                ? "Showing 1 of 1 filtered booking"
                : `Showing ${startResult}–${endResult} of ${filteredBookings.length} filtered bookings`}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "border-sky-500 bg-sky-500 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="items-per-page"
                  className="text-sm font-medium text-slate-600"
                >
                  Items per page
                </label>
                <select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={(e) =>
                    setItemsPerPage(Number(e.target.value) as ItemsPerPage)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
            </>
          )}
        </>
      )}
    </div>
  );
}