"use client";

import { useState } from "react";

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
};

type Day = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type TimeOff = {
  id: number;
  offDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};

export default function StaffDetailClient({
  staff: initialStaff,
  initialAvailability,
  initialTimeOff,
  upcomingJobs,
}: {
  staff: Staff;
  initialAvailability: Day[];
  initialTimeOff: TimeOff[];
  upcomingJobs: number;
}) {
  const [staff, setStaff] = useState(initialStaff);
  const [days, setDays] = useState(initialAvailability);
  const [timeOff, setTimeOff] = useState(initialTimeOff);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [offDate, setOffDate] = useState("");
  const [offStart, setOffStart] = useState("");
  const [offEnd, setOffEnd] = useState("");
  const [offReason, setOffReason] = useState("");

  async function saveProfile() {
    setError("");
    setMessage("");
    const response = await fetch(
      `/api/dashboard/staff/${staff.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staff),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setStaff(data.staff);
    setMessage(
      !data.staff.isActive && upcomingJobs > 0
        ? `Saved. Warning: this staff member still has ${upcomingJobs} upcoming assigned job(s). Reassign them explicitly.`
        : "Profile saved.",
    );
  }

  async function saveAvailability() {
    setError("");
    setMessage("");
    const response = await fetch(
      `/api/dashboard/staff/${staff.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: days }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not save availability");
      return;
    }
    setDays(data.availability);
    setMessage("Availability saved.");
  }

  async function addTimeOff() {
    setError("");
    setMessage("");
    const response = await fetch(
      `/api/dashboard/staff/${staff.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeOff: {
            offDate,
            startTime: offStart || null,
            endTime: offEnd || null,
            reason: offReason || null,
          },
        }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not add time off");
      return;
    }
    setTimeOff(data.timeOff);
    setOffDate("");
    setOffStart("");
    setOffEnd("");
    setOffReason("");
    setMessage("Time off added.");
  }

  async function removeTimeOff(id: number) {
    const response = await fetch(
      `/api/dashboard/staff/${staff.id}&timeOffId=${id}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setError("Could not remove time off");
      return;
    }
    setTimeOff((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{staff.name}</h1>
        <p className="text-sm text-slate-500">{staff.email}</p>
        <p className="mt-1 text-xs text-slate-400">
          Upcoming assigned jobs: {upcomingJobs}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={staff.name}
            onChange={(e) => setStaff({ ...staff, name: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={staff.phone ?? ""}
            onChange={(e) => setStaff({ ...staff, phone: e.target.value })}
            placeholder="Phone"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            value={staff.role}
            onChange={(e) => setStaff({ ...staff, role: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="cleaner">Cleaner</option>
            <option value="manager">Manager</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={staff.isActive}
              onChange={(e) =>
                setStaff({ ...staff, isActive: e.target.checked })
              }
            />
            Active
          </label>
        </div>
        <button
          type="button"
          onClick={() => void saveProfile()}
          className="mt-4 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white"
        >
          Save profile
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Weekly availability
          </h2>
          <button
            type="button"
            onClick={() => void saveAvailability()}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Save hours
          </button>
        </div>
        <div className="space-y-2">
          {days.map((day) => (
            <div
              key={day.dayOfWeek}
              className="grid gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-[8rem_1fr_1fr_auto] sm:items-center"
            >
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={day.isActive}
                  onChange={(e) =>
                    setDays((prev) =>
                      prev.map((row) =>
                        row.dayOfWeek === day.dayOfWeek
                          ? { ...row, isActive: e.target.checked }
                          : row,
                      ),
                    )
                  }
                />
                {DAY_LABELS[day.dayOfWeek]}
              </label>
              <input
                type="time"
                value={day.startTime}
                onChange={(e) =>
                  setDays((prev) =>
                    prev.map((row) =>
                      row.dayOfWeek === day.dayOfWeek
                        ? { ...row, startTime: e.target.value }
                        : row,
                    ),
                  )
                }
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <input
                type="time"
                value={day.endTime}
                onChange={(e) =>
                  setDays((prev) =>
                    prev.map((row) =>
                      row.dayOfWeek === day.dayOfWeek
                        ? { ...row, endTime: e.target.value }
                        : row,
                    ),
                  )
                }
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <span className="text-xs text-slate-500">
                {day.isActive ? "Open" : "Off"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
          Time off
        </h2>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="date"
            value={offDate}
            onChange={(e) => setOffDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <input
            type="time"
            value={offStart}
            onChange={(e) => setOffStart(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <input
            type="time"
            value={offEnd}
            onChange={(e) => setOffEnd(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <input
            value={offReason}
            onChange={(e) => setOffReason(e.target.value)}
            placeholder="Reason"
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={!offDate}
            onClick={() => void addTimeOff()}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <ul className="divide-y divide-slate-100">
          {timeOff.length === 0 ? (
            <li className="py-3 text-sm text-slate-500">No upcoming time off.</li>
          ) : (
            timeOff.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span>
                  {row.offDate}
                  {row.startTime && row.endTime
                    ? ` · ${row.startTime}–${row.endTime}`
                    : " · Full day"}
                  {row.reason ? ` — ${row.reason}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => void removeTimeOff(row.id)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
