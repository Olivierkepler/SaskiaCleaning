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

  const load = useCallback(async () => {
    setError("");
    try {
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
      setDays(availData.days ?? []);
      if (typeof availData.jobBufferMinutes === "number") {
        setJobBufferMinutes(availData.jobBufferMinutes);
      }
      setBlocks(blocksData.blocks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function loadCapacity() {
    if (!capacityDate) return;
    setCapacityLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard/availability&date=${encodeURIComponent(capacityDate)}&service=${encodeURIComponent(capacityService)}`,
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
    <div className="space-y-6">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
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
            className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
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
            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          minutes (0–180)
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Weekly hours
          </h2>
          <button
            type="button"
            onClick={() => void saveDays()}
            disabled={saving}
            className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save hours
          </button>
        </div>
        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day.dayOfWeek}
              className="grid gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-[8rem_1fr_1fr_6rem_auto] sm:items-center"
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
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <input
                type="time"
                value={day.endTime}
                onChange={(e) =>
                  updateDay(day.dayOfWeek, { endTime: e.target.value })
                }
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <select
                value={day.slotIntervalMinutes}
                onChange={(e) =>
                  updateDay(day.dayOfWeek, {
                    slotIntervalMinutes: Number(e.target.value),
                  })
                }
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
          Blocked dates / times
        </h2>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <input
            type="time"
            value={blockStart}
            onChange={(e) => setBlockStart(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="Start (optional)"
          />
          <input
            type="time"
            value={blockEnd}
            onChange={(e) => setBlockEnd(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="End (optional)"
          />
          <input
            type="text"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            placeholder="Reason (optional)"
          />
          <button
            type="button"
            onClick={() => void addBlock()}
            disabled={saving || !blockDate}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add block
          </button>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Leave start/end empty to block the entire date. Partial ranges exclude
          overlapping slots.
        </p>
        <ul className="divide-y divide-slate-100">
          {blocks.length === 0 ? (
            <li className="py-3 text-sm text-slate-500">No blocks yet.</li>
          ) : (
            blocks.map((block) => (
              <li
                key={block.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
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
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
          Slot capacity
        </h2>
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <input
            type="date"
            value={capacityDate}
            onChange={(e) => setCapacityDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <select
            value={capacityService}
            onChange={(e) => setCapacityService(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
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
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
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
          <ul className="divide-y divide-slate-100">
            {capacitySlots.map((slot) => (
              <li
                key={slot.time}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
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
