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
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      {status === "scheduled" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus("in_progress")}
          className="w-full rounded-2xl bg-sky-500 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Updating…" : "Start job"}
        </button>
      ) : null}
      {status === "in_progress" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void updateStatus("completed")}
          className="w-full rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
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
