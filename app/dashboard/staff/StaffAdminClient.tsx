"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  BrushCleaning,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

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

type RoleFilter = "all" | "cleaner" | "manager";
type StatusFilter = "all" | "active" | "inactive";

const inputClassName = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function roleBadge(role: string) {
  return role === "manager"
    ? "bg-violet-50 text-violet-700 ring-violet-100"
    : "bg-sky-50 text-sky-700 ring-sky-100";
}

function StaffAvatar({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-xs font-bold tracking-wide text-sky-800 ring-1 ring-inset ring-sky-200/70">
      {getInitials(name)}
    </span>
  );
}

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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    return staff.filter((member) => {
      const matchesSearch = !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" ? member.isActive : !member.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, staff, statusFilter]);

  const cleanerCount = staff.filter((member) => member.role === "cleaner").length;
  const managerCount = staff.filter((member) => member.role === "manager").length;
  const upcomingAssignments = staff.reduce(
    (total, member) => total + (Number(member.upcomingJobs) || 0),
    0,
  );

  async function createStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/dashboard/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role, isActive: true }),
      });
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
      setStaff((previous) => [
        {
          ...data.staff,
          roleLabel: data.staff.role === "manager" ? "Manager" : "Cleaner",
          upcomingJobs: 0,
        },
        ...previous,
      ]);
    } catch {
      setError("Could not create staff.");
    } finally {
      setSaving(false);
    }
  }

  const summary = [
    { label: "Total Staff", value: staff.length, Icon: UsersRound, tone: "bg-slate-100 text-slate-700" },
    { label: "Cleaners", value: cleanerCount, Icon: BrushCleaning, tone: "bg-sky-50 text-sky-700" },
    { label: "Managers", value: managerCount, Icon: UserRound, tone: "bg-violet-50 text-violet-700" },
    { label: "Upcoming Assignments", value: upcomingAssignments, Icon: BriefcaseBusiness, tone: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="space-y-6">
      <section aria-label="Staff summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
              </div>
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </span>
            </div>
          </article>
        ))}
      </section>

      {message ? (
        <p role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={createStaff}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">Team access</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Add Staff Member</h2>
            <p className="mt-1 text-sm text-slate-500">Add an approved team member to the staff workspace.</p>
          </div>
          <span aria-hidden="true" className="hidden size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:flex">
            <UsersRound className="size-5" strokeWidth={1.8} />
          </span>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Full name
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className={`${inputClassName} mt-1.5 font-normal`}
            />
          </label>
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Google email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className={`${inputClassName} mt-1.5 font-normal`}
            />
          </label>
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Phone <span className="font-normal text-slate-400">(optional)</span>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone number"
              className={`${inputClassName} mt-1.5 font-normal`}
            />
          </label>
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={`${inputClassName} mt-1.5 font-normal`}
            >
              <option value="cleaner">Cleaner</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 w-full rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add Staff"}
            </button>
          </div>
        </div>
      </form>

      <section aria-labelledby="staff-members-heading" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="staff-members-heading" className="text-lg font-semibold tracking-tight text-slate-950">Staff Members</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredStaff.length} {filteredStaff.length === 1 ? "team member" : "team members"}
                {filteredStaff.length !== staff.length ? " matching filters" : ""}
              </p>
            </div>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(14rem,1fr)_12rem_12rem]">
            <label className="relative min-w-0">
              <span className="sr-only">Search staff by name or email</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                className={`${inputClassName} pl-9`}
              />
            </label>
            <label className="min-w-0 text-xs font-semibold text-slate-600">
              <span className="sr-only">Filter by role</span>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)} className={inputClassName}>
                <option value="all">All roles</option>
                <option value="cleaner">Cleaners</option>
                <option value="manager">Managers</option>
              </select>
            </label>
            <label className="min-w-0 text-xs font-semibold text-slate-600">
              <span className="sr-only">Filter by status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className={inputClassName}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-800">{staff.length ? "No staff match these filters." : "No staff members yet."}</p>
            <p className="mt-1 text-sm text-slate-500">{staff.length ? "Try another name, email, role, or status." : "Add a staff member above to get started."}</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredStaff.map((member) => (
                <article key={member.id} className="space-y-4 p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <StaffAvatar name={member.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950">{member.name}</p>
                      <p className="break-all text-xs text-slate-500">{member.email}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${roleBadge(member.role)}`}>
                      {member.roleLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Contact</p>
                      <p className="mt-1 break-words font-medium text-slate-700">{member.phone || "No phone provided"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Upcoming assignments</p>
                      <p className="mt-1 font-medium text-slate-700">{member.upcomingJobs}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <StatusBadge active={member.isActive} />
                    </div>
                    <div className="flex items-end justify-end">
                      <ManageLink staffId={member.id} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Name and email</th>
                    <th scope="col" className="px-4 py-3.5">Role</th>
                    <th scope="col" className="px-4 py-3.5">Contact</th>
                    <th scope="col" className="px-4 py-3.5">Upcoming assignments</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="text-slate-700 transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <StaffAvatar name={member.name} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{member.name}</p>
                            <p className="max-w-[17rem] truncate text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleBadge(member.role)}`}>{member.roleLabel}</span>
                      </td>
                      <td className="max-w-40 break-words px-4 py-4 text-sm">{member.phone || <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-4 font-medium tabular-nums">{member.upcomingJobs}</td>
                      <td className="px-4 py-4"><StatusBadge active={member.isActive} /></td>
                      <td className="px-5 py-4 text-right"><ManageLink staffId={member.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-medium ${active ? "text-emerald-700" : "text-slate-500"}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ManageLink({ staffId }: { staffId: string }) {
  return (
    <Link
      href={`/dashboard/staff/${staffId}`}
      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
    >
      Manage
    </Link>
  );
}
