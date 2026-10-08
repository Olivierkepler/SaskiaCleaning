"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  formatChangeRequestTypeLabel,
  type BookingChangeRequestType,
} from "@/app/lib/booking-change-requests-pure";
import { formatBookingTime, formatCustomerBookingDate } from "@/app/lib/customer-bookings-pure";

export type AdminChangeRequestRow = {
  id: number;
  booking_id: number;
  request_type: BookingChangeRequestType;
  requested_date: string | Date | null;
  requested_time?: string | null;
  reason: string | null;
  created_at: string | Date;
  booking_service: string | null;
  booking_date: string | Date | null;
  booking_time?: string | null;
  booking_status: string;
  booking_location: string | null;
  booking_name: string;
  booking_email: string;
  customer_email: string;
  customer_name: string | null;
};

type ChangeRequestsTableProps = {
  initialRequests: AdminChangeRequestRow[];
};

export default function ChangeRequestsTable({
  initialRequests,
}: ChangeRequestsTableProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [customerMessages, setCustomerMessages] = useState<
    Record<number, string>
  >({});

  async function resolve(requestId: number, action: "approve" | "reject") {
    if (busyId != null) return;
    setBusyId(requestId);
    setError("");

    try {
      const response = await fetch(
        `/api/dashboard/change-requests`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId,
            action,
            customerMessage: customerMessages[requestId] || null,
          }),
        },
      );

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Failed to update request.");
        return;
      }

      setRequests((prev) => prev.filter((request) => request.id !== requestId));
      router.refresh();
    } catch {
      setError("Failed to update request.");
    } finally {
      setBusyId(null);
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
        No pending customer change requests.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      {error ? (
        <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {requests.map((request) => (
        <article
          key={request.id}
          className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                {formatChangeRequestTypeLabel(request.request_type)} request
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                Booking #{request.booking_id} ·{" "}
                {request.booking_service || "Cleaning"}
              </h2>
            </div>
            <span className="inline-flex min-h-7 items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              Pending
            </span>
          </div>

          <dl className="mt-4 grid min-w-0 gap-3 rounded-xl bg-slate-50/70 p-3 text-sm text-slate-600 sm:grid-cols-2 sm:p-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Customer
              </dt>
              <dd className="font-medium text-slate-900">
                {request.customer_name || request.booking_name}
              </dd>
              <dd>{request.booking_email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Current date
              </dt>
              <dd>
                {formatCustomerBookingDate(request.booking_date)} ·{" "}
                {formatBookingTime(request.booking_time)}
              </dd>
            </div>
            {request.request_type === "reschedule" ? (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Requested date
                </dt>
                <dd className="font-semibold text-slate-900">
                  {formatCustomerBookingDate(request.requested_date)} ·{" "}
                  {formatBookingTime(request.requested_time)}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Location
              </dt>
              <dd>{request.booking_location || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Reason
              </dt>
              <dd>{request.reason || "—"}</dd>
            </div>
          </dl>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Customer-facing message (optional)
            <textarea
              rows={2}
              maxLength={500}
              value={customerMessages[request.id] ?? ""}
              onChange={(event) =>
                setCustomerMessages((prev) => ({
                  ...prev,
                  [request.id]: event.target.value,
                }))
              }
              placeholder={
                request.request_type === "reschedule"
                  ? "Requested date is unavailable. Please submit another date."
                  : "Optional note for the customer"
              }
              className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busyId != null}
              onClick={() => void resolve(request.id, "approve")}
              className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {busyId === request.id ? "Saving…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busyId != null}
              onClick={() => void resolve(request.id, "reject")}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
