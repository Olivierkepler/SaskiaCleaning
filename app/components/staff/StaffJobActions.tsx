"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StaffJobActions({
  bookingId,
  status,
}: {
  bookingId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: "in_progress" | "completed") {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/staff/jobs/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not update job.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update job.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "cancelled" || status === "completed") {
    return (
      <p className="mt-6 text-sm text-slate-500">
        This job is {status === "completed" ? "completed" : "cancelled"} and
        cannot be updated.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {error ? (
      <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      ) : null}
      {status === "scheduled" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus("in_progress")}
          aria-busy={loading}
          className="min-h-12 w-full rounded-xl bg-sky-700 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating…" : "Start job"}
        </button>
      ) : null}
      {status === "in_progress" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus("completed")}
          aria-busy={loading}
          className="min-h-12 w-full rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating…" : "Mark complete"}
        </button>
      ) : null}
      {status !== "scheduled" && status !== "in_progress" ? (
        <p className="text-sm text-slate-500">
          This job is not ready for cleaner status updates yet.
        </p>
      ) : null}
    </div>
  );
}
