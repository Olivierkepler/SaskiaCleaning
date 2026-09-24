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
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
        No pending customer change requests.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {requests.map((request) => (
        <article
          key={request.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-500">
                {formatChangeRequestTypeLabel(request.request_type)} request
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Booking #{request.booking_id} ·{" "}
                {request.booking_service || "Cleaning"}
              </h2>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
              Pending
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
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
                <dt className="text-xs uppercase tracking-wide text-slate-400">
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
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busyId != null}
              onClick={() => void resolve(request.id, "approve")}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {busyId === request.id ? "Saving…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busyId != null}
              onClick={() => void resolve(request.id, "reject")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
