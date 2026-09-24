"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type StaffRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  roleLabel: string;
  isActive: boolean;
  upcomingJobs: number;
};

export default function StaffAdminClient({
  initialStaff,
}: {
  initialStaff: StaffRow[];
}) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("cleaner");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function createStaff(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/dashboard/staff`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, role, isActive: true }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not create staff.");
        return;
      }
      setName("");
      setEmail("");
      setPhone("");
      setMessage("Staff member created.");
      router.refresh();
      setStaff((prev) => [
        {
          ...data.staff,
          roleLabel: data.staff.role === "manager" ? "Manager" : "Cleaner",
          upcomingJobs: 0,
        },
        ...prev,
      ]);
    } catch {
      setError("Could not create staff.");
    } finally {
      setSaving(false);
    }
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

      <form
        onSubmit={createStaff}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
          Add staff
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Google email"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="cleaner">Cleaner</option>
            <option value="manager">Manager</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add staff"}
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {staff.length === 0 ? (
            <li className="px-5 py-8 text-sm text-slate-500">No staff yet.</li>
          ) : (
            staff.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {member.name}{" "}
                    <span className="text-xs font-medium text-slate-500">
                      · {member.roleLabel}
                    </span>
                    {!member.isActive ? (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        Inactive
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                  <p className="text-xs text-slate-400">
                    Upcoming jobs: {member.upcomingJobs}
                  </p>
                </div>
                <Link
                  href={`/dashboard/staff/${member.id}`}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Manage
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
