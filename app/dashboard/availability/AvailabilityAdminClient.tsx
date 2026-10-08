"use client";

import { useCallback, useEffect, useState } from "react";

type DayRow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotIntervalMinutes: number;
  isActive: boolean;
};

type BlockRow = {
  id: number;
  blockDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};

type CapacitySlot = {
  time: string;
  label: string;
  capacity: number;
  booked: number;
  remaining: number;
  available: boolean;
};

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const controlClassName =
  "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

async function fetchAvailabilitySettings(): Promise<{
  days: DayRow[];
  jobBufferMinutes: number | null;
  blocks: BlockRow[];
}> {
  const [availRes, blocksRes] = await Promise.all([
    fetch(`/api/dashboard/availability`),
    fetch(
      `/api/dashboard/scheduling-blocks`,
    ),
  ]);
  const availData = await availRes.json();
  const blocksData = await blocksRes.json();
  if (!availRes.ok) throw new Error(availData.error || "Failed to load hours");
  if (!blocksRes.ok) throw new Error(blocksData.error || "Failed to load blocks");
  return {
    days: availData.days ?? [],
    jobBufferMinutes:
      typeof availData.jobBufferMinutes === "number"
        ? availData.jobBufferMinutes
        : null,
    blocks: blocksData.blocks ?? [],
  };
}

export default function AvailabilityAdminClient() {
  const [days, setDays] = useState<DayRow[]>([]);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [jobBufferMinutes, setJobBufferMinutes] = useState(30);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [capacityDate, setCapacityDate] = useState("");
  const [capacityService, setCapacityService] = useState("Standard");
  const [capacitySlots, setCapacitySlots] = useState<CapacitySlot[]>([]);
  const [capacityLoading, setCapacityLoading] = useState(false);

  const applySettings = useCallback(
    (settings: Awaited<ReturnType<typeof fetchAvailabilitySettings>>) => {
      setDays(settings.days);
      if (settings.jobBufferMinutes !== null) {
        setJobBufferMinutes(settings.jobBufferMinutes);
      }
      setBlocks(settings.blocks);
    },
    [],
  );

  const load = useCallback(async () => {
    try {
      applySettings(await fetchAvailabilitySettings());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [applySettings]);

  useEffect(() => {
    let cancelled = false;
    fetchAvailabilitySettings().then(
      (settings) => {
        if (!cancelled) applySettings(settings);
      },
      (err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [applySettings]);

  async function loadCapacity() {
    if (!capacityDate) return;
    setCapacityLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/availability?date=${encodeURIComponent(capacityDate)}&service=${encodeURIComponent(capacityService)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load capacity");
      setCapacitySlots(data.slots ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load capacity");
      setCapacitySlots([]);
    } finally {
      setCapacityLoading(false);
    }
  }

  async function saveBuffer() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard/availability`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobBufferMinutes }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      setJobBufferMinutes(Number(data.jobBufferMinutes ?? jobBufferMinutes));
      setMessage("Cleaner handoff buffer saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveDays() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard/availability`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      setDays(data.days ?? days);
      setMessage("Weekly hours saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addBlock() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard/scheduling-blocks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockDate,
            startTime: blockStart || null,
            endTime: blockEnd || null,
            reason: blockReason || null,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create block");
      setBlockDate("");
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
      setMessage("Block created.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create block");
    } finally {
      setSaving(false);
    }
  }

  async function removeBlock(id: number) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/dashboard/scheduling-blocks/${id}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      setMessage("Block removed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  function updateDay(dayOfWeek: number, patch: Partial<DayRow>) {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day,
      ),
    );
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {message ? (
        <p role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
              Cleaner handoff buffer
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Post-job minutes reserved after each cleaning before the same
              cleaner can take another job. Not shown to customers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void saveBuffer()}
            disabled={saving}
            className="min-h-11 w-full rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto"
          >
            Save buffer
          </button>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-800">
          <input
            type="number"
            min={0}
            max={180}
            step={1}
            value={jobBufferMinutes}
            onChange={(e) => setJobBufferMinutes(Number(e.target.value))}
            className={`${controlClassName} w-28`}
          />
          minutes (0–180)
        </label>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
            Weekly hours
          </h2>
          <p className="mt-1 text-sm text-slate-500">Set the standard customer booking windows and slot spacing.</p>
          </div>
          <button
            type="button"
            onClick={() => void saveDays()}
            disabled={saving}
            className="min-h-11 w-full rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto"
          >
            Save hours
          </button>
        </div>
        <div className="mb-2 hidden grid-cols-[minmax(8rem,0.85fr)_repeat(3,minmax(0,1fr))_6rem] gap-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:grid">
          <span>Day</span><span>Start time</span><span>End time</span><span>Slot interval</span><span>Status</span>
        </div>
        <div className="space-y-2.5">
          {days.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`grid min-w-0 gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(8rem,0.85fr)_repeat(3,minmax(0,1fr))_6rem] sm:items-center sm:p-3.5 ${day.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/80"}`}
            >
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={day.isActive}
                  onChange={(e) =>
                    updateDay(day.dayOfWeek, { isActive: e.target.checked })
                  }
                />
                {DAY_LABELS[day.dayOfWeek]}
              </label>
              <input
                type="time"
                value={day.startTime}
                onChange={(e) =>
                  updateDay(day.dayOfWeek, { startTime: e.target.value })
                }
                className={controlClassName}
                aria-label={`${DAY_LABELS[day.dayOfWeek]} start time`}
              />
              <input
                type="time"
                value={day.endTime}
                onChange={(e) =>
                  updateDay(day.dayOfWeek, { endTime: e.target.value })
                }
                className={controlClassName}
                aria-label={`${DAY_LABELS[day.dayOfWeek]} end time`}
              />
              <select
                value={day.slotIntervalMinutes}
                onChange={(e) =>
                  updateDay(day.dayOfWeek, {
                    slotIntervalMinutes: Number(e.target.value),
                  })
                }
                className={controlClassName}
                aria-label={`${DAY_LABELS[day.dayOfWeek]} slot interval`}
              >
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
              <span className="text-xs text-slate-500">
                {day.isActive ? "Open" : "Closed"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6">
        <h2 className="mb-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
          Blocked dates / times
        </h2>
        <p className="mb-4 text-sm text-slate-500">Keep selected dates or time ranges out of customer availability.</p>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            className={controlClassName}
            aria-label="Blocked date"
          />
          <input
            type="time"
            value={blockStart}
            onChange={(e) => setBlockStart(e.target.value)}
            className={controlClassName}
            aria-label="Block start time"
            placeholder="Start (optional)"
          />
          <input
            type="time"
            value={blockEnd}
            onChange={(e) => setBlockEnd(e.target.value)}
            className={controlClassName}
            aria-label="Block end time"
            placeholder="End (optional)"
          />
          <input
            type="text"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className={controlClassName}
            aria-label="Block reason"
            placeholder="Reason (optional)"
          />
          <button
            type="button"
            onClick={() => void addBlock()}
            disabled={saving || !blockDate}
            className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Add block
          </button>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Leave start/end empty to block the entire date. Partial ranges exclude
          overlapping slots.
        </p>
        <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
          {blocks.length === 0 ? (
            <li className="bg-slate-50/50 px-4 py-5 text-sm text-slate-500">No blocked dates or times.</li>
          ) : (
            blocks.map((block) => (
              <li
                key={block.id}
                className="flex min-w-0 flex-col gap-3 bg-white px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {block.blockDate}
                    {block.startTime && block.endTime
                      ? ` · ${block.startTime}–${block.endTime}`
                      : " · Full day"}
                  </p>
                  {block.reason ? (
                    <p className="text-slate-500">{block.reason}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void removeBlock(block.id)}
                  className="min-h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:w-auto"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6">
        <h2 className="mb-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
          Slot capacity
        </h2>
        <p className="mb-4 text-sm text-slate-500">Preview remaining cleaner capacity at each supported slot.</p>
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <input
            type="date"
            value={capacityDate}
            onChange={(e) => setCapacityDate(e.target.value)}
            className={`${controlClassName} sm:w-auto`}
            aria-label="Capacity preview date"
          />
          <select
            value={capacityService}
            onChange={(e) => setCapacityService(e.target.value)}
            className={`${controlClassName} sm:w-auto`}
            aria-label="Capacity preview service"
          >
            <option value="Standard">Standard</option>
            <option value="Deep clean">Deep clean</option>
            <option value="Move-out">Move-out</option>
            <option value="Commercial">Commercial</option>
          </select>
          <button
            type="button"
            onClick={() => void loadCapacity()}
            disabled={!capacityDate || capacityLoading}
            className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {capacityLoading ? "Loading…" : "Preview"}
          </button>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Capacity equals overlap-safe eligible cleaners for the selected
          service duration. Booked counts active assignments overlapping each
          candidate window.
        </p>
        {capacitySlots.length === 0 ? (
          <p className="text-sm text-slate-500">
            {capacityDate
              ? "No business slots for this date (or none after capacity filter)."
              : "Pick a date to preview capacity."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {capacitySlots.map((slot) => (
              <li
                key={slot.time}
                className="flex min-w-0 flex-col gap-1 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-semibold text-slate-900">
                  {slot.label}
                </span>
                <span className="text-slate-600">
                  Available capacity: {slot.capacity} · Booked: {slot.booked} ·
                  Remaining: {slot.remaining}
                  {!slot.available ? " · Full" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
