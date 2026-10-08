"use client";

import { useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CalendarOff,
  Check,
  Clock3,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

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

const inputClassName =
  "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [addingTimeOff, setAddingTimeOff] = useState(false);
  const [removingTimeOffId, setRemovingTimeOffId] = useState<number | null>(
    null,
  );

  async function saveProfile() {
    setError("");
    setMessage("");
    setSavingProfile(true);

    try {
      const response = await fetch(`/api/dashboard/staff/${staff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staff),
      });
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
    } catch {
      setError("Save failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveAvailability() {
    setError("");
    setMessage("");
    setSavingAvailability(true);

    try {
      const response = await fetch(`/api/dashboard/staff/${staff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: days }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not save availability");
        return;
      }
      setDays(data.availability);
      setMessage("Availability saved.");
    } catch {
      setError("Could not save availability");
    } finally {
      setSavingAvailability(false);
    }
  }

  async function addTimeOff() {
    setError("");
    setMessage("");
    setAddingTimeOff(true);

    try {
      const response = await fetch(`/api/dashboard/staff/${staff.id}`, {
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
      });
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
    } catch {
      setError("Could not add time off");
    } finally {
      setAddingTimeOff(false);
    }
  }

  async function removeTimeOff(id: number) {
    setError("");
    setMessage("");
    setRemovingTimeOffId(id);

    try {
      const response = await fetch(
        `/api/dashboard/staff/${staff.id}?timeOffId=${id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        setError("Could not remove time off");
        return;
      }
      setTimeOff((prev) => prev.filter((row) => row.id !== id));
      setMessage("Time off removed.");
    } catch {
      setError("Could not remove time off");
    } finally {
      setRemovingTimeOffId(null);
    }
  }

  const roleLabel = staff.role === "manager" ? "Manager" : "Cleaner";
  const roleClassName =
    staff.role === "manager"
      ? "bg-violet-50 text-violet-700 ring-violet-100"
      : "bg-sky-50 text-sky-700 ring-sky-100";

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {message ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
        >
          {error}
        </p>
      ) : null}

      <section
        aria-labelledby="staff-profile-heading"
        className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6"
      >
        <div className="flex min-w-0 flex-col gap-5 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-sm font-bold tracking-wide text-sky-800 ring-1 ring-inset ring-sky-200/70 sm:size-16 sm:text-base"
            >
              {getInitials(staff.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  id="staff-profile-heading"
                  className="max-w-full truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl"
                >
                  {staff.name}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${roleClassName}`}
                >
                  {roleLabel}
                </span>
              </div>
              <p className="mt-1 break-all text-sm text-slate-500">
                {staff.email}
              </p>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium ${staff.isActive ? "text-emerald-700" : "text-slate-500"}`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${staff.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                />
                {staff.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 sm:min-w-48">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm ring-1 ring-slate-200/70">
              <BriefcaseBusiness aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-xl font-semibold leading-6 tabular-nums text-slate-950">
                {upcomingJobs}
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                Upcoming assigned jobs
              </p>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound
              aria-hidden="true"
              className="size-4 text-sky-700"
              strokeWidth={1.8}
            />
            <h2 className="text-sm font-semibold text-slate-900">
              Profile details
            </h2>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1.2fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto] xl:items-end">
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              Full name
              <input
                value={staff.name}
                onChange={(event) =>
                  setStaff({ ...staff, name: event.target.value })
                }
                autoComplete="name"
                className={`${inputClassName} mt-1.5`}
              />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              Phone
              <input
                value={staff.phone ?? ""}
                onChange={(event) =>
                  setStaff({ ...staff, phone: event.target.value })
                }
                placeholder="Optional"
                autoComplete="tel"
                className={`${inputClassName} mt-1.5`}
              />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              Role
              <select
                value={staff.role}
                onChange={(event) =>
                  setStaff({ ...staff, role: event.target.value })
                }
                className={`${inputClassName} mt-1.5`}
              >
                <option value="cleaner">Cleaner</option>
                <option value="manager">Manager</option>
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus-within:ring-4 focus-within:ring-sky-100">
              <input
                type="checkbox"
                checked={staff.isActive}
                onChange={(event) =>
                  setStaff({ ...staff, isActive: event.target.checked })
                }
                className="size-4 shrink-0 accent-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              />
              Active
            </label>
          </div>
          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={savingProfile}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              <Save aria-hidden="true" className="size-4" />
              {savingProfile ? "Saving profile…" : "Save profile"}
            </button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="staff-availability-heading"
        className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock3
                aria-hidden="true"
                className="size-4 text-sky-700"
                strokeWidth={1.8}
              />
              <h2
                id="staff-availability-heading"
                className="text-base font-semibold text-slate-950 sm:text-lg"
              >
                Weekly availability
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Set the regular hours this team member is available for jobs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void saveAvailability()}
            disabled={savingAvailability}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            <Save aria-hidden="true" className="size-4" />
            {savingAvailability ? "Saving hours…" : "Save hours"}
          </button>
        </div>

        <div className="hidden grid-cols-[minmax(8rem,0.85fr)_minmax(0,1fr)_minmax(0,1fr)_5rem] gap-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:grid">
          <span>Day</span>
          <span>Start time</span>
          <span>End time</span>
          <span className="text-center">Status</span>
        </div>
        <div className="space-y-2.5">
          {days.map((day) => {
            const dayName = DAY_LABELS[day.dayOfWeek] ?? "Day";
            const startId = `availability-${day.dayOfWeek}-start`;
            const endId = `availability-${day.dayOfWeek}-end`;

            return (
              <div
                key={day.dayOfWeek}
                className={`grid min-w-0 grid-cols-2 gap-3 rounded-xl border p-3 transition-colors sm:grid-cols-[minmax(8rem,0.85fr)_minmax(0,1fr)_minmax(0,1fr)_5rem] sm:items-center sm:p-3.5 ${day.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/80"}`}
              >
                <label className="col-span-2 flex min-h-8 min-w-0 items-center justify-between gap-3 text-sm font-semibold text-slate-800 sm:col-span-1">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={day.isActive}
                      onChange={(event) =>
                        setDays((previous) =>
                          previous.map((row) =>
                            row.dayOfWeek === day.dayOfWeek
                              ? { ...row, isActive: event.target.checked }
                              : row,
                          ),
                        )
                      }
                      className="size-4 shrink-0 accent-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                    />
                    <span className="truncate">{dayName}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:hidden ${day.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200/70 text-slate-500"}`}
                  >
                    {day.isActive ? "Open" : "Off"}
                  </span>
                </label>
                <label
                  htmlFor={startId}
                  className="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:contents"
                >
                  <span className="mb-1 block sm:hidden">Start time</span>
                  <input
                    id={startId}
                    type="time"
                    aria-label={`${dayName} start time`}
                    value={day.startTime}
                    onChange={(event) =>
                      setDays((previous) =>
                        previous.map((row) =>
                          row.dayOfWeek === day.dayOfWeek
                            ? { ...row, startTime: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className={`${inputClassName} mt-0 px-2.5 text-sm sm:px-3`}
                  />
                </label>
                <label
                  htmlFor={endId}
                  className="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:contents"
                >
                  <span className="mb-1 block sm:hidden">End time</span>
                  <input
                    id={endId}
                    type="time"
                    aria-label={`${dayName} end time`}
                    value={day.endTime}
                    onChange={(event) =>
                      setDays((previous) =>
                        previous.map((row) =>
                          row.dayOfWeek === day.dayOfWeek
                            ? { ...row, endTime: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className={`${inputClassName} mt-0 px-2.5 text-sm sm:px-3`}
                  />
                </label>
                <span
                  className={`col-span-2 hidden justify-center text-xs font-medium sm:flex ${day.isActive ? "text-emerald-700" : "text-slate-400"}`}
                >
                  {day.isActive ? "Open" : "Off"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="staff-time-off-heading"
        className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6"
      >
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <CalendarOff
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.8}
            />
          </span>
          <div>
            <h2
              id="staff-time-off-heading"
              className="text-base font-semibold text-slate-950 sm:text-lg"
            >
              Time off
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Record days or hours when this team member is unavailable.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,1fr)_minmax(8rem,0.85fr)_minmax(8rem,0.85fr)_minmax(11rem,1.35fr)_auto] xl:items-end">
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              Date
              <input
                type="date"
                value={offDate}
                onChange={(event) => setOffDate(event.target.value)}
                className={`${inputClassName} mt-1.5`}
              />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              Start time
              <input
                type="time"
                value={offStart}
                onChange={(event) => setOffStart(event.target.value)}
                className={`${inputClassName} mt-1.5`}
              />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              End time
              <input
                type="time"
                value={offEnd}
                onChange={(event) => setOffEnd(event.target.value)}
                className={`${inputClassName} mt-1.5`}
              />
            </label>
            <label className="block min-w-0 text-xs font-semibold text-slate-600">
              Reason <span className="font-normal text-slate-400">(optional)</span>
              <input
                value={offReason}
                onChange={(event) => setOffReason(event.target.value)}
                placeholder="Add a note"
                className={`${inputClassName} mt-1.5`}
              />
            </label>
            <button
              type="button"
              disabled={!offDate || addingTimeOff}
              onClick={() => void addTimeOff()}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
            >
              <Plus aria-hidden="true" className="size-4" />
              {addingTimeOff ? "Adding…" : "Add time off"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Leave both time fields blank to mark the full day.
          </p>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays
              aria-hidden="true"
              className="size-4 text-slate-400"
              strokeWidth={1.8}
            />
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Upcoming time off
            </h3>
          </div>
          {timeOff.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 text-center">
              <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/70">
                <Check aria-hidden="true" className="size-4" />
              </span>
              <p className="mt-2 text-sm font-medium text-slate-700">
                No upcoming time off
              </p>
              <p className="mt-1 text-xs text-slate-500">
                New time off entries will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
              {timeOff.map((row) => (
                <li
                  key={row.id}
                  className="flex min-w-0 flex-col gap-3 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {row.offDate}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {row.startTime && row.endTime
                        ? `${row.startTime}–${row.endTime}`
                        : "Full day"}
                      {row.reason ? ` · ${row.reason}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeTimeOff(row.id)}
                    disabled={removingTimeOffId !== null}
                    className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-55 sm:w-auto"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" />
                    {removingTimeOffId === row.id ? "Removing…" : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
