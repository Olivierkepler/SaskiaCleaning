"use client";

import { useCallback, useEffect, useState } from "react";

type Rule = {
  id: number;
  serviceKey: string;
  durationMinutes: number;
};

const controlClassName =
  "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

async function fetchRules(): Promise<Rule[]> {
  const res = await fetch(
    `/api/dashboard/service-durations`,
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load");
  return data.rules ?? [];
}

export default function ServiceDurationsClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newMinutes, setNewMinutes] = useState("120");

  const load = useCallback(async () => {
    try {
      setRules(await fetchRules());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRules().then(
      (nextRules) => {
        if (!cancelled) setRules(nextRules);
      },
      (err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveRule(rule: Rule) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/service-durations`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: rule.id,
            serviceKey: rule.serviceKey,
            durationMinutes: rule.durationMinutes,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Saved. New bookings will use updated durations.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addRule() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/service-durations`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceKey: newKey,
            durationMinutes: Number(newMinutes),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setNewKey("");
      setNewMinutes("120");
      setMessage("Rule added.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      {error ? (
        <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Configured service rules</h2>
          <p className="mt-1 text-sm text-slate-500">Duration changes apply to new bookings; existing bookings keep their saved duration.</p>
        </div>
        <div className="hidden grid-cols-[minmax(12rem,1fr)_10rem_7rem] gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:grid">
          <span>Service key</span><span>Duration</span><span>Action</span>
        </div>
        <ul className="divide-y divide-slate-100">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className="grid min-w-0 gap-3 p-4 sm:grid-cols-[minmax(12rem,1fr)_10rem_7rem] sm:items-center sm:px-5"
          >
            <label className="min-w-0 text-xs font-semibold text-slate-600">
              <span className="mb-1 block sm:hidden">Service key</span>
            <input
              type="text"
              value={rule.serviceKey}
              onChange={(e) =>
                setRules((prev) =>
                  prev.map((r) =>
                    r.id === rule.id
                      ? { ...r, serviceKey: e.target.value }
                      : r,
                  ),
                )
              }
              className={controlClassName}
            />
            </label>
            <label className="min-w-0 text-xs font-semibold text-slate-600">
              <span className="mb-1 block sm:hidden">Duration (minutes)</span>
            <input
              type="number"
              min={15}
              max={720}
              step={15}
              value={rule.durationMinutes}
              onChange={(e) =>
                setRules((prev) =>
                  prev.map((r) =>
                    r.id === rule.id
                      ? { ...r, durationMinutes: Number(e.target.value) }
                      : r,
                  ),
                )
              }
              className={controlClassName}
            />
            </label>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveRule(rule)}
              className="min-h-11 rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              Save
            </button>
          </li>
        ))}
        {rules.length === 0 ? <li className="px-5 py-10 text-center text-sm text-slate-500">No duration rules configured.</li> : null}
        </ul>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-950">Add rule</h2>
        <p className="mt-1 text-sm text-slate-500">Use the exact service name stored on bookings.</p>
        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(12rem,1fr)_10rem_auto] sm:items-end">
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Service key
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Service name (must match booking)"
            className={`${controlClassName} mt-1.5`}
          />
          </label>
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Duration (minutes)
          <input
            type="number"
            min={15}
            max={720}
            step={15}
            value={newMinutes}
            onChange={(e) => setNewMinutes(e.target.value)}
            className={`${controlClassName} mt-1.5`}
          />
          </label>
          <button
            type="button"
            disabled={saving || !newKey.trim()}
            onClick={() => void addRule()}
            className="min-h-11 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </section>
    </div>
  );
}
