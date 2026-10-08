"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, KeyRound, ShieldCheck, UserRound, UsersRound } from "lucide-react";

export type AdminRow = {
  id: string;
  email: string;
  name: string | null;
  role: "OWNER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

const inputClassName =
  "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";

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

export default function AdminsClient({
  initialAdmins,
  currentAdminId,
}: {
  initialAdmins: AdminRow[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initialAdmins);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "OWNER">("ADMIN");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const activeOwnerCount = useMemo(
    () => admins.filter((a) => a.role === "OWNER" && a.isActive).length,
    [admins],
  );
  const activeAdminCount = admins.filter((admin) => admin.isActive).length;
  const ownerCount = admins.filter((admin) => admin.role === "OWNER").length;

  async function refreshFromServer() {
    const res = await fetch("/api/dashboard/admins");
    if (!res.ok) return;
    const data = (await res.json()) as { admins?: AdminRow[] };
    if (data.admins) setAdmins(data.admins);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/dashboard/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null, role }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        admin?: AdminRow;
      };
      if (!res.ok) throw new Error(data.error || "Failed to add admin.");
      setMessage(
        data.message ||
          "Admin added. They can now sign in with Google using this email.",
      );
      setEmail("");
      setName("");
      setRole("ADMIN");
      if (data.admin) {
        setAdmins((prev) => [...prev, data.admin!]);
      }
      await refreshFromServer();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin.");
    } finally {
      setCreating(false);
    }
  }

  async function patchAdmin(
    id: string,
    body: Record<string, unknown>,
  ): Promise<void> {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/dashboard/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; admin?: AdminRow };
      if (!res.ok) throw new Error(data.error || "Update failed.");
      if (data.admin) {
        setAdmins((prev) =>
          prev.map((row) => (row.id === id ? data.admin! : row)),
        );
      }
      await refreshFromServer();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  const summary = [
    { label: "Administrators", value: admins.length, Icon: UsersRound, tone: "bg-slate-100 text-slate-700" },
    { label: "Active access", value: activeAdminCount, Icon: Check, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Owners", value: ownerCount, Icon: ShieldCheck, tone: "bg-violet-50 text-violet-700" },
    { label: "Active owners", value: activeOwnerCount, Icon: UserRound, tone: "bg-sky-50 text-sky-700" },
  ];

  const renderActions = (admin: AdminRow) => {
    const busy = busyId === admin.id;
    const isOnlyOwner = admin.role === "OWNER" && admin.isActive && activeOwnerCount <= 1;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`role-${admin.id}`}>Role for {admin.name || admin.email}</label>
        <select
          id={`role-${admin.id}`}
          value={admin.role}
          disabled={busy || isOnlyOwner}
          onChange={(event) => void patchAdmin(admin.id, { action: "change_role", role: event.target.value })}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
        >
          <option value="OWNER">OWNER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        {admin.isActive ? (
          <button
            type="button"
            disabled={busy || isOnlyOwner}
            onClick={() => void patchAdmin(admin.id, { action: "deactivate" })}
            className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            title={isOnlyOwner ? "At least one active OWNER must remain" : undefined}
          >
            {busy ? "Updating…" : "Deactivate"}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void patchAdmin(admin.id, { action: "activate" })}
            className="min-h-10 rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Updating…" : "Reactivate"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <section aria-label="Administrator summary" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map(({ label, value, Icon, tone }) => (
          <article key={label} className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-5">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-950">{value}</p>
              </div>
              <span aria-hidden="true" className={`hidden size-10 shrink-0 items-center justify-center rounded-xl sm:flex ${tone}`}>
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
            </div>
          </article>
        ))}
      </section>

      {error ? <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</p> : null}
      {message ? <p role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</p> : null}

      <form onSubmit={handleCreate} className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <KeyRound className="size-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">Access management</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Add administrator</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">No password is created. The administrator signs in with Google using this email.</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(10rem,0.7fr)_auto] xl:items-end">
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Google email
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClassName} mt-1.5 font-normal`} placeholder="name@example.com" />
          </label>
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Display name <span className="font-normal text-slate-400">(optional)</span>
            <input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={`${inputClassName} mt-1.5 font-normal`} placeholder="Administrator name" />
          </label>
          <label className="min-w-0 text-xs font-semibold text-slate-600">
            Access role
            <select value={role} onChange={(event) => setRole(event.target.value === "OWNER" ? "OWNER" : "ADMIN")} className={`${inputClassName} mt-1.5`}>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
          </label>
          <button type="submit" disabled={creating} className="min-h-11 w-full rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 xl:w-auto">
            {creating ? "Adding…" : "Add administrator"}
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">Administrator access</h2>
            <p className="mt-1 text-sm text-slate-500">Review roles, sign-in activity, and account status.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-100">
            <ShieldCheck aria-hidden="true" className="size-3.5" /> {activeOwnerCount} active {activeOwnerCount === 1 ? "OWNER" : "OWNERS"}
          </span>
        </div>

        {admins.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><UsersRound aria-hidden="true" className="size-6" /></span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No administrator records</h3>
            <p className="mt-1 text-sm text-slate-500">Add an administrator above to grant Google sign-in access.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {admins.map((admin) => (
                <article key={admin.id} className="min-w-0 space-y-4 p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-800 ring-1 ring-inset ring-sky-100">
                      {(admin.name || admin.email).trim().slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-sm font-semibold text-slate-950">{admin.name || "Unnamed administrator"}</h3>
                        {admin.id === currentAdminId ? <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">You</span> : null}
                      </div>
                      <p className="mt-0.5 break-all text-xs text-slate-500">{admin.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-slate-400">Status</p><p className={`mt-1 font-semibold ${admin.isActive ? "text-emerald-700" : "text-slate-500"}`}>{admin.isActive ? "Active" : "Inactive"}</p></div>
                    <div><p className="text-slate-400">Role</p><p className={`mt-1 font-semibold ${admin.role === "OWNER" ? "text-violet-700" : "text-sky-700"}`}>{admin.role}</p></div>
                    <div><p className="text-slate-400">Last sign-in</p><p className="mt-1 text-slate-700">{formatNy(admin.lastLoginAt)}</p></div>
                    <div><p className="text-slate-400">Added</p><p className="mt-1 text-slate-700">{formatNy(admin.createdAt)}</p></div>
                  </div>
                  <div className="border-t border-slate-100 pt-3">{renderActions(admin)}</div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr><th className="px-5 py-3">Administrator</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last sign-in</th><th className="px-4 py-3">Added</th><th className="px-4 py-3">Manage access</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="align-middle">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-800 ring-1 ring-inset ring-sky-100">{(admin.name || admin.email).trim().slice(0, 1).toUpperCase()}</span>
                          <div className="min-w-0"><p className="font-semibold text-slate-900">{admin.name || "Unnamed administrator"}{admin.id === currentAdminId ? <span className="ml-2 text-xs font-medium text-sky-700">You</span> : null}</p><p className="mt-0.5 break-all text-xs text-slate-500">{admin.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${admin.role === "OWNER" ? "bg-violet-50 text-violet-700 ring-violet-100" : "bg-sky-50 text-sky-700 ring-sky-100"}`}>{admin.role}</span></td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${admin.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{admin.isActive ? "Active" : "Inactive"}</span></td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">{formatNy(admin.lastLoginAt)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">{formatNy(admin.createdAt)}</td>
                      <td className="px-4 py-4">{renderActions(admin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs leading-5 text-slate-500 sm:px-6">
          At least one active OWNER is required. The final active OWNER cannot be deactivated or changed to ADMIN.
        </div>
      </section>
    </div>
  );
}
