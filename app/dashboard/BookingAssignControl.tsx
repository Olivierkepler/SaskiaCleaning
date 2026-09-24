"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Eligible = { id: string; name: string; email: string };
type Assignment = {
  staffId: string;
  staffName?: string;
  staffEmail?: string;
} | null;

export default function BookingAssignControl({
  bookingId,
}: {
  bookingId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<Assignment>(null);
  const [opsWindow, setOpsWindow] = useState<{
    serviceRange: string;
    reservedUntil: string | null;
  } | null>(null);
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [error, setError] = useState("");
  const [staffId, setStaffId] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(
      `/api/dashboard/bookings/${bookingId}/assignment`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setAssignment(data.assignment);
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
        setStaffId(data.assignment?.staffId ?? "");
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

  async function save(unassign = false) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard/bookings/${bookingId}/assignment`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(unassign ? { unassign: true } : { staffId }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Assignment failed");
        return;
      }
      setAssignment(data.assignment);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Assignment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
      >
        {assignment?.staffName
          ? `Assigned: ${assignment.staffName}`
          : "Assign cleaner"}
      </button>
      {open ? (
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          {loading ? <p className="text-slate-500">Loading…</p> : null}
          {error ? <p className="text-red-600">{error}</p> : null}
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
              <select
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
                  disabled={!staffId || loading}
                  onClick={() => void save(false)}
                  className="rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Save
                </button>
                {assignment ? (
                  <button
                    type="button"
                    disabled={loading}
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
