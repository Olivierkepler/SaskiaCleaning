"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FOLLOWUP_CONTACT_METHODS,
  FOLLOWUP_METHOD_LABELS,
  FOLLOWUP_OUTCOME_LABELS,
  FOLLOWUP_OUTCOMES,
  FOLLOWUP_TYPE_LABELS,
  FOLLOWUP_TYPES,
} from "@/app/lib/booking-followups-pure";

type FollowupRow = {
  id: number;
  followupType: string;
  contactMethod: string;
  outcome: string;
  note: string;
  nextFollowupAt: string | null;
  resolvedAt: string | null;
  createdByLabel: string | null;
  createdAt: string;
  isDue: boolean;
};

function formatNy(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export default function FollowupPanel({
  bookingId,
  status,
  exceptionLabel,
  onSaved,
  onClose,
}: {
  bookingId: number;
  status: string;
  exceptionLabel?: string | null;
  onSaved?: () => void;
  onClose?: () => void;
}) {
  const [followups, setFollowups] = useState<FollowupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [followupType, setFollowupType] =
    useState<(typeof FOLLOWUP_TYPES)[number]>("customer_contact");
  const [contactMethod, setContactMethod] =
    useState<(typeof FOLLOWUP_CONTACT_METHODS)[number]>("phone");
  const [outcome, setOutcome] =
    useState<(typeof FOLLOWUP_OUTCOMES)[number]>("no_answer");
  const [note, setNote] = useState("");
  const [nextLocal, setNextLocal] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/bookings/${bookingId}/followups`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load follow-ups");
      setFollowups(data.followups ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const nextFollowupAt = nextLocal
        ? new Date(nextLocal).toISOString()
        : null;
      const res = await fetch(
        `/api/dashboard/bookings/${bookingId}/followups`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followupType,
            contactMethod,
            outcome,
            note,
            nextFollowupAt,
            createdByLabel: "dashboard",
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setNote("");
      setNextLocal("");
      setMessage("Follow-up saved.");
      await load();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function resolve(id: number) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/followups/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolved: true }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resolve failed");
      setMessage(
        data.alreadyResolved ? "Already resolved." : "Follow-up resolved.",
      );
      await load();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolve failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Follow-up · Booking #{bookingId}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Status: {status.replace(/_/g, " ")}
            {exceptionLabel ? ` · ${exceptionLabel}` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Internal only — does not email customers or change booking state.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
          >
            Close
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">
          Type
          <select
            value={followupType}
            onChange={(e) =>
              setFollowupType(e.target.value as (typeof FOLLOWUP_TYPES)[number])
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            {FOLLOWUP_TYPES.map((t) => (
              <option key={t} value={t}>
                {FOLLOWUP_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Contact method
          <select
            value={contactMethod}
            onChange={(e) =>
              setContactMethod(
                e.target.value as (typeof FOLLOWUP_CONTACT_METHODS)[number],
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            {FOLLOWUP_CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {FOLLOWUP_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Outcome
          <select
            value={outcome}
            onChange={(e) =>
              setOutcome(e.target.value as (typeof FOLLOWUP_OUTCOMES)[number])
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            {FOLLOWUP_OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {FOLLOWUP_OUTCOME_LABELS[o]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Next follow-up (optional)
          <input
            type="datetime-local"
            value={nextLocal}
            onChange={(e) => setNextLocal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="mb-3 block text-xs font-semibold text-slate-600">
        Note
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={2000}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          placeholder="Internal operational note…"
        />
      </label>
      <button
        type="button"
        disabled={saving || !note.trim()}
        onClick={() => void save()}
        className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Save follow-up
      </button>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          History
        </h4>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : followups.length === 0 ? (
          <p className="text-sm text-slate-500">No follow-ups yet.</p>
        ) : (
          <ul className="space-y-3">
            {followups.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">
                    {FOLLOWUP_TYPE_LABELS[
                      f.followupType as keyof typeof FOLLOWUP_TYPE_LABELS
                    ] ?? f.followupType}
                    {" · "}
                    {FOLLOWUP_METHOD_LABELS[
                      f.contactMethod as keyof typeof FOLLOWUP_METHOD_LABELS
                    ] ?? f.contactMethod}
                    {" · "}
                    {FOLLOWUP_OUTCOME_LABELS[
                      f.outcome as keyof typeof FOLLOWUP_OUTCOME_LABELS
                    ] ?? f.outcome}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatNy(f.createdAt)}
                  </p>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">
                  {f.note}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Next: {formatNy(f.nextFollowupAt)}
                  {f.isDue ? " · Due" : ""}
                  {f.resolvedAt
                    ? ` · Resolved ${formatNy(f.resolvedAt)}`
                    : ""}
                </p>
                {!f.resolvedAt ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void resolve(f.id)}
                    className="mt-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Mark resolved
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
