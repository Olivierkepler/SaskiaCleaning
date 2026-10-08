"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildDispatchAssignmentRequest,
  classifyAssignmentMutationResponse,
  resolveSelectedCleanerId,
  shouldRefreshDispatchAfterAssignment,
} from "@/app/lib/dispatch-assignment-pure";

type Eligible = { id: string; name: string; email: string };
type Assignment = {
  id: string;
  staffId: string;
  staffName?: string;
  staffEmail?: string;
} | null;

export default function BookingAssignControl({
  bookingId,
  dispatchMode = false,
  allowUnassign = true,
  triggerLabel,
}: {
  bookingId: number;
  dispatchMode?: boolean;
  allowUnassign?: boolean;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState<Assignment>(null);
  const [assignmentRefreshRequired, setAssignmentRefreshRequired] = useState(false);
  const [opsWindow, setOpsWindow] = useState<{
    serviceRange: string;
    reservedUntil: string | null;
  } | null>(null);
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [staffId, setStaffId] = useState("");
  const mutationPending = useRef(false);

  // Enter the loading state when opened, or when the booking changes while open.
  function toggleOpen() {
    if (!open) {
      setLoading(true);
      setError("");
      setNotice("");
    }
    setOpen(!open);
  }
  const [loadedBookingId, setLoadedBookingId] = useState(bookingId);
  if (loadedBookingId !== bookingId) {
    setLoadedBookingId(bookingId);
    if (open) {
      setLoading(true);
      setError("");
    }
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(
      `/api/dashboard/bookings/${bookingId}/assignment`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setAssignment(data.assignment);
        setAssignmentRefreshRequired(false);
        setOpsWindow(
          data.opsWindow
            ? {
                serviceRange: String(data.opsWindow.serviceRange),
                reservedUntil: data.opsWindow.reservedUntil
                  ? String(data.opsWindow.reservedUntil)
                  : null,
              }
            : null,
        );
        setEligible(data.eligibleStaff ?? []);
        setStaffId(
          resolveSelectedCleanerId(
            data.eligibleStaff ?? [],
            data.assignment?.staffId,
          ),
        );
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, bookingId]);

  async function refreshAssignmentState() {
    const latestResponse = await fetch(
      `/api/dashboard/bookings/${bookingId}/assignment`,
    );
    const latest = await latestResponse.json();
    if (!latestResponse.ok) {
      throw new Error(latest.error || "Failed to refresh assignment state.");
    }
    setAssignment(latest.assignment);
    setAssignmentRefreshRequired(false);
    setStaffId(
      resolveSelectedCleanerId(
        latest.eligibleStaff ?? [],
        latest.assignment?.staffId,
      ),
    );
    setEligible(latest.eligibleStaff ?? []);
    setOpsWindow(
      latest.opsWindow
        ? {
            serviceRange: String(latest.opsWindow.serviceRange),
            reservedUntil: latest.opsWindow.reservedUntil
              ? String(latest.opsWindow.reservedUntil)
              : null,
          }
        : null,
    );
  }

  async function save(unassign = false) {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setLoading(true);
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/dashboard/bookings/${bookingId}/assignment`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            unassign
              ? { unassign: true, expectedAssignmentId: assignment?.id ?? null }
              : buildDispatchAssignmentRequest({
                  staffId,
                  expectedAssignmentId: assignment?.id ?? null,
                }),
          ),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const outcome = classifyAssignmentMutationResponse({
          ok: response.ok,
          status: response.status,
        });
        if (outcome === "conflict") {
          setAssignmentRefreshRequired(true);
          try {
            await refreshAssignmentState();
          } catch {
            // Keep the conflict message visible; the admin can reopen to retry.
          }
        }
        setError(data.error || "Assignment failed");
        if (
          shouldRefreshDispatchAfterAssignment({
            ok: response.ok,
            status: response.status,
          })
        ) {
          router.refresh();
        }
        return;
      }
      setAssignment(data.assignment);
      setNotice(
        data.assignment?.staffName
          ? `Assignment confirmed: ${data.assignment.staffName}.`
          : "Assignment updated.",
      );
      if (dispatchMode) {
        setAssignmentRefreshRequired(true);
        try {
          await refreshAssignmentState();
        } catch {
          // The saved state is confirmed; block further writes until refreshed.
        }
      } else {
        setOpen(false);
      }
      router.refresh();
    } catch {
      setError("Assignment failed");
    } finally {
      mutationPending.current = false;
      setLoading(false);
      setSaving(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggleOpen}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
      >
        {triggerLabel ?? (assignment?.staffName
          ? `Assigned: ${assignment.staffName}`
          : "Assign cleaner")}
      </button>
      {open ? (
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          {loading ? (
            <p role="status" className="text-slate-500">
              {saving ? "Saving assignment…" : "Loading assignment options…"}
            </p>
          ) : null}
          {error ? <p role="alert" className="text-red-600">{error}</p> : null}
          {notice ? (
            <p role="status" className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </p>
          ) : null}
          {dispatchMode ? (
            <p className="mb-2 text-xs leading-5 text-slate-600">
              Candidate availability is advisory. Saving rechecks cleaner eligibility and overlap; global business hours and scheduling blocks are not validated by this assignment API.
            </p>
          ) : null}
          {!loading ? (
            <>
              {opsWindow ? (
                <p className="mb-2 text-xs text-slate-600">
                  Service: {opsWindow.serviceRange}
                  {opsWindow.reservedUntil
                    ? ` · Reserved until ${opsWindow.reservedUntil}`
                    : ""}
                </p>
              ) : null}
              <label
                htmlFor={`booking-assignment-cleaner-${bookingId}`}
                className="mt-2 block text-xs font-medium text-slate-700"
              >
                Cleaner
              </label>
              <select
                id={`booking-assignment-cleaner-${bookingId}`}
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              >
                <option value="">Select cleaner…</option>
                {eligible.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {eligible.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  No eligible active cleaners for this date/time.
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!staffId || loading || assignmentRefreshRequired}
                  onClick={() => void save(false)}
                  className="rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Save
                </button>
                {assignment && allowUnassign ? (
                  <button
                    type="button"
                    disabled={loading || assignmentRefreshRequired}
                    onClick={() => void save(true)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Unassign
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
