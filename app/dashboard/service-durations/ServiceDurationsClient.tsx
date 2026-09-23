"use client";

import { useCallback, useEffect, useState } from "react";

type Rule = {
  id: number;
  serviceKey: string;
  durationMinutes: number;
};

export default function ServiceDurationsClient({
  dashboardKey,
}: {
  dashboardKey: string;
}) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newMinutes, setNewMinutes] = useState("120");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/service-durations?key=${encodeURIComponent(dashboardKey)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRules(data.rules ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [dashboardKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveRule(rule: Rule) {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/service-durations?key=${encodeURIComponent(dashboardKey)}`,
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
        `/api/dashboard/service-durations?key=${encodeURIComponent(dashboardKey)}`,
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
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className="flex flex-wrap items-center gap-3 px-4 py-3"
          >
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
              className="min-w-[10rem] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
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
              className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
            <span className="text-xs text-slate-500">min</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveRule(rule)}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Save
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Add rule
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Service name (must match booking)"
            className="min-w-[12rem] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            min={15}
            max={720}
            step={15}
            value={newMinutes}
            onChange={(e) => setNewMinutes(e.target.value)}
            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={saving || !newKey.trim()}
            onClick={() => void addRule()}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
