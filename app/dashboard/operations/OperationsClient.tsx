"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BookingAssignControl from "@/app/dashboard/BookingAssignControl";
import FollowupPanel from "@/app/dashboard/components/FollowupPanel";
import {
  canAdminMarkComplete,
  type OpsExceptionType,
  type OpsSeverity,
} from "@/app/lib/ops-exceptions-pure";

export type OpsExceptionClientItem = {
  bookingId: number;
  service: string | null;
  bookingDate: string | null;
  bookingTime: string | null;
  serviceRange: string | null;
  reservedUntil: string | null;
  status: string;
  assignmentActive: boolean;
  staffId: string | null;
  staffName: string | null;
  staffActive: boolean | null;
  exceptionType: OpsExceptionType;
  exceptionLabel: string;
  severity: OpsSeverity;
  windowEndIso: string | null;
  followupLatestAt: string | null;
  followupNextAt: string | null;
  followupUnresolvedCount: number;
  followupDue: boolean;
};

export type OpsSummaryClient = {
  needsAttention: number;
  overdue: number;
  capacityHeld: number;
  releasePending: number;
  unassigned: number;
  critical: number;
  followupDue: number;
  total: number;
};

type Filter =
  | "all"
  | "overdue"
  | "in_progress"
  | "capacity_held"
  | "unassigned"
  | "critical";

const SEVERITY_CLASS: Record<OpsSeverity, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  critical: "border-rose-200 bg-rose-50 text-rose-900",
};

export default function OperationsClient({
  initialItems,
  summary,
}: {
  initialItems: OpsExceptionClientItem[];
  summary: OpsSummaryClient;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [releaseTarget, setReleaseTarget] =
    useState<OpsExceptionClientItem | null>(null);
  const [releaseReason, setReleaseReason] = useState("");
  const [releaseAck, setReleaseAck] = useState(false);
  const [followupBookingId, setFollowupBookingId] = useState<number | null>(
    null,
  );

  function formatNy(iso: string | null): string {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  }

  const filtered = useMemo(() => {
    return initialItems.filter((item) => {
      switch (filter) {
        case "overdue":
          return (
            item.exceptionType === "OVERDUE_NOT_STARTED" ||
            item.exceptionType === "OVERDUE_IN_PROGRESS"
          );
        case "in_progress":
          return item.exceptionType === "OVERDUE_IN_PROGRESS";
        case "capacity_held":
          return (
            item.exceptionType === "CAPACITY_HELD_AFTER_COMPLETION" ||
            item.exceptionType === "RELEASE_PENDING"
          );
        case "unassigned":
          return item.exceptionType === "UNASSIGNED_FUTURE_BOOKING";
        case "critical":
          return item.severity === "critical";
        default:
          return true;
      }
    });
  }, [filter, initialItems]);

  async function markComplete(bookingId: number) {
    setBusyId(bookingId);
    setError("");
    setMessage("");
    try {
      const res = await fetch(
        `/api/booking/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not mark complete");
      setMessage(`Booking #${bookingId} marked completed.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mark complete failed");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmRelease() {
    if (!releaseTarget) return;
    const item = releaseTarget;
    const isOpen = [
      "new",
      "contacted",
      "scheduled",
      "in_progress",
    ].includes(item.status);

    if (isOpen && !releaseAck) {
      setError("Confirm that you understand this does not cancel the booking.");
      return;
    }

    setBusyId(item.bookingId);
    setError("");
    setMessage("");
    try {
      const res = await fetch(
        `/api/dashboard/bookings/${item.bookingId}/release-capacity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirm: true,
            reason: isOpen ? releaseReason.trim() : undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Release failed");
      setMessage(
        data.alreadyReleased
          ? `Booking #${item.bookingId} capacity was already released.`
          : `Capacity released for booking #${item.bookingId}.`,
      );
      setReleaseTarget(null);
      setReleaseReason("");
      setReleaseAck(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Release failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: "Needs attention", value: summary.needsAttention },
          { label: "Overdue", value: summary.overdue },
          { label: "Capacity held", value: summary.capacityHeld },
          { label: "Release pending", value: summary.releasePending },
          { label: "Unassigned", value: summary.unassigned },
          { label: "Follow-up due", value: summary.followupDue },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["overdue", "Overdue"],
            ["in_progress", "In Progress"],
            ["capacity_held", "Capacity Held"],
            ["unassigned", "Unassigned"],
            ["critical", "Critical"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              filter === id
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No operational exceptions for this filter.
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => (
            <li
              key={`${item.bookingId}-${item.exceptionType}`}
              className={`rounded-2xl border p-4 shadow-sm ${SEVERITY_CLASS[item.severity]}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {item.exceptionLabel} · {item.severity}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">
                    Booking #{item.bookingId}
                    {item.service ? ` · ${item.service}` : ""}
                  </h3>
                  <p className="mt-1 text-sm">
                    {item.bookingDate ?? "No date"}
                    {item.bookingTime ? ` · ${item.bookingTime}` : ""}
                    {item.serviceRange ? ` · Service ${item.serviceRange}` : ""}
                    {item.reservedUntil
                      ? ` · Reserved until ${item.reservedUntil}`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm">
                    Status: {item.status.replace(/_/g, " ")}
                    {item.assignmentActive
                      ? ` · Assigned${item.staffName ? `: ${item.staffName}` : ""}`
                      : " · No active assignment"}
                    {item.staffActive === false ? " · Staff inactive" : ""}
                  </p>
                  {(item.followupUnresolvedCount > 0 ||
                    item.followupLatestAt ||
                    item.followupDue) && (
                    <p className="mt-1 text-sm">
                      {item.followupDue
                        ? "Follow-up due"
                        : item.followupNextAt
                          ? `Follow-up scheduled ${formatNy(item.followupNextAt)}`
                          : "Follow-up on file"}
                      {item.followupLatestAt
                        ? ` · Last ${formatNy(item.followupLatestAt)}`
                        : ""}
                      {item.followupUnresolvedCount > 0
                        ? ` · ${item.followupUnresolvedCount} open`
                        : ""}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/dashboard?booking=${item.bookingId}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    View booking
                  </a>
                  <button
                    type="button"
                    onClick={() => setFollowupBookingId(item.bookingId)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    Add follow-up
                  </button>
                  {canAdminMarkComplete(item.status) ? (
                    <button
                      type="button"
                      disabled={busyId === item.bookingId}
                      onClick={() => void markComplete(item.bookingId)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Mark complete
                    </button>
                  ) : null}
                  {item.assignmentActive ? (
                    <button
                      type="button"
                      disabled={busyId === item.bookingId}
                      onClick={() => {
                        setReleaseTarget(item);
                        setReleaseReason("");
                        setReleaseAck(false);
                        setError("");
                      }}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Release capacity
                    </button>
                  ) : null}
                </div>
              </div>

              {(item.exceptionType === "UNASSIGNED_FUTURE_BOOKING" ||
                item.exceptionType === "STAFF_UNAVAILABLE_FOR_FUTURE_BOOKING" ||
                item.exceptionType === "OVERDUE_NOT_STARTED") && (
                <div className="mt-3 rounded-xl border border-white/60 bg-white/70 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    Assign / reassign cleaner
                  </p>
                  <BookingAssignControl
                    bookingId={item.bookingId}
                  />
                </div>
              )}

              {followupBookingId === item.bookingId ? (
                <div className="mt-3">
                  <FollowupPanel
                    bookingId={item.bookingId}
                    status={item.status}
                    exceptionLabel={item.exceptionLabel}
                    onSaved={() => router.refresh()}
                    onClose={() => setFollowupBookingId(null)}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {releaseTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              Release cleaner capacity?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Booking #{releaseTarget.bookingId}. This soft-releases the active
              assignment only. It does not cancel or complete the booking.
            </p>
            {["new", "contacted", "scheduled", "in_progress"].includes(
              releaseTarget.status,
            ) ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Releasing capacity does not cancel or complete this booking.
                  The booking will remain active and may require reassignment or
                  follow-up.
                </p>
                <label className="flex items-start gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={releaseAck}
                    onChange={(e) => setReleaseAck(e.target.checked)}
                    className="mt-1"
                  />
                  I understand the booking stays active.
                </label>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                    Reason (required)
                  </label>
                  <textarea
                    value={releaseReason}
                    onChange={(e) => setReleaseReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Why is capacity being released?"
                  />
                </div>
              </div>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReleaseTarget(null);
                  setReleaseReason("");
                  setReleaseAck(false);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === releaseTarget.bookingId}
                onClick={() => void confirmRelease()}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Confirm release
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
