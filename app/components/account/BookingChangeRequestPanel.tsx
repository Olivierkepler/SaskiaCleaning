"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  formatBookingTime,
  formatCustomerBookingDate,
} from "@/app/lib/customer-bookings-pure";

type BookingChangeRequestPanelProps = {
  bookingId: number;
  service: string | null;
  bookingDate: string | Date | null;
  bookingTime?: string | null;
  location: string | null;
  status: string;
  canRequest: boolean;
  pendingRequest: {
    request_type: "cancel" | "reschedule";
    requested_date: string | Date | null;
    requested_time?: string | null;
    reason: string | null;
    status: string;
    customer_message: string | null;
  } | null;
  latestResolvedRequest: {
    request_type: "cancel" | "reschedule";
    requested_date: string | Date | null;
    requested_time?: string | null;
    status: "approved" | "rejected" | "cancelled_by_customer";
    customer_message: string | null;
  } | null;
};

type Mode = "idle" | "reschedule" | "cancel";

export default function BookingChangeRequestPanel({
  bookingId,
  bookingDate,
  bookingTime = null,
  canRequest,
  pendingRequest,
  latestResolvedRequest,
}: BookingChangeRequestPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    Array<{ time: string; label: string }>
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  useEffect(() => {
    if (!requestedDate) {
      setAvailableSlots([]);
      setRequestedTime(null);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setRequestedTime(null);
    setAvailableSlots([]);

    fetch(`/api/availability?date=${encodeURIComponent(requestedDate)}`)
      .then(async (response) => {
        const data = (await response.json()) as {
          slots?: Array<{ time: string; label: string }>;
        };
        if (cancelled) return;
        setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestedDate]);

  async function submit(requestType: "cancel" | "reschedule") {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/account/bookings/${bookingId}/change-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType,
            requestedDate:
              requestType === "reschedule" ? requestedDate : undefined,
            requestedTime:
              requestType === "reschedule" ? requestedTime : undefined,
            reason,
            customerId: "attacker-should-be-ignored",
          }),
        },
      );

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(
          data.error ||
            "We couldn't submit your request right now. Please try again.",
        );
        return;
      }

      setSuccess(
        requestType === "cancel"
          ? "Cancellation request submitted. Your booking will not change until Saskia confirms it."
          : "Reschedule request submitted. Your booking will not change until Saskia confirms the new date and time.",
      );
      setMode("idle");
      setReason("");
      setRequestedDate("");
      setRequestedTime(null);
      router.refresh();
    } catch {
      setError("We couldn't submit your request right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
        Manage booking
      </h2>

      {pendingRequest ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">
            {pendingRequest.request_type === "cancel"
              ? "Cancellation request pending"
              : "Change request pending"}
          </p>
          {pendingRequest.request_type === "reschedule" ? (
            <p className="mt-1">
              Requested:{" "}
              {formatCustomerBookingDate(pendingRequest.requested_date)}
              {pendingRequest.requested_time
                ? ` · ${formatBookingTime(pendingRequest.requested_time)}`
                : ""}
            </p>
          ) : null}
          {pendingRequest.reason ? (
            <p className="mt-1 text-amber-800">Reason: {pendingRequest.reason}</p>
          ) : null}
          <p className="mt-2 text-amber-800">
            Your booking will not change until Saskia confirms this request.
          </p>
        </div>
      ) : null}

      {!pendingRequest && latestResolvedRequest ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            latestResolvedRequest.status === "approved"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          <p className="font-semibold">
            {latestResolvedRequest.status === "approved"
              ? latestResolvedRequest.request_type === "cancel"
                ? "Cancellation approved"
                : "Reschedule approved"
              : "Previous request was not approved"}
          </p>
          {latestResolvedRequest.customer_message ? (
            <p className="mt-1">{latestResolvedRequest.customer_message}</p>
          ) : null}
        </div>
      ) : null}

      {canRequest && !pendingRequest ? (
        <>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Need a different day or to cancel? Submit a request and Saskia will
            review it before anything changes.
          </p>

          {mode === "idle" ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setMode("reschedule")}
                className="rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-transparent hover:text-slate-900"
              >
                Request a new date
              </button>
              <button
                type="button"
                onClick={() => setMode("cancel")}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-red-300 hover:text-red-700"
              >
                Request cancellation
              </button>
            </div>
          ) : null}

          {mode === "reschedule" ? (
            <form
              className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submit("reschedule");
              }}
            >
              <p className="text-sm text-slate-600">
                Current appointment:{" "}
                <span className="font-semibold text-slate-900">
                  {formatCustomerBookingDate(bookingDate)} ·{" "}
                  {formatBookingTime(bookingTime)}
                </span>
              </p>
              <p className="text-xs leading-5 text-slate-500">
                Your booking will not change until Saskia confirms the new date
                and time.
              </p>
              <label className="block text-sm font-medium text-slate-700">
                Requested new date
                <input
                  type="date"
                  required
                  min={minDate}
                  value={requestedDate}
                  onChange={(event) => setRequestedDate(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              {requestedDate ? (
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Available times
                  </p>
                  {slotsLoading ? (
                    <p className="mt-2 text-sm text-slate-500">Loading…</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-600">
                      No times available for this date. Choose another date.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setRequestedTime(slot.time)}
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                            requestedTime === slot.time
                              ? "border-sky-400 bg-sky-50 text-sky-800"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <label className="block text-sm font-medium text-slate-700">
                Optional reason
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="Optional"
                />
              </label>
              {error ? (
                <p className="text-sm font-medium text-red-600">{error}</p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode("idle");
                    setError("");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !requestedDate || !requestedTime}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit reschedule request"}
                </button>
              </div>
            </form>
          ) : null}

          {mode === "cancel" ? (
            <form
              className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submit("cancel");
              }}
            >
              <p className="text-sm text-slate-600">
                Submit a cancellation request. Your booking stays active until
                Saskia confirms.
              </p>
              <label className="block text-sm font-medium text-slate-700">
                Optional reason
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              {error ? (
                <p className="text-sm font-medium text-red-600">{error}</p>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode("idle");
                    setError("");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit cancellation request"}
                </button>
              </div>
            </form>
          ) : null}
        </>
      ) : null}

      {success ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">{success}</p>
      ) : null}
    </section>
  );
}
