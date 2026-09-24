"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">Add admin</h2>
        <p className="mt-1 text-sm text-slate-500">
          No password is created. The person signs in with Google using this
          email.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="name@example.com"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              Name (optional)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Display name"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Role</span>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value === "OWNER" ? "OWNER" : "ADMIN")
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="OWNER">OWNER</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {creating ? "Adding…" : "Add admin"}
        </button>
      </form>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Admins</h2>
          <p className="mt-1 text-sm text-slate-500">
            Active owners: {activeOwnerCount}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin) => {
                const busy = busyId === admin.id;
                const isOnlyOwner =
                  admin.role === "OWNER" &&
                  admin.isActive &&
                  activeOwnerCount <= 1;
                return (
                  <tr key={admin.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {admin.name || "—"}
                      {admin.id === currentAdminId ? (
                        <span className="ml-2 text-xs font-normal text-sky-600">
                          (you)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{admin.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={admin.role}
                        disabled={busy || isOnlyOwner}
                        onChange={(e) =>
                          void patchAdmin(admin.id, {
                            action: "change_role",
                            role: e.target.value,
                          })
                        }
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold"
                      >
                        <option value="OWNER">OWNER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          admin.isActive
                            ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                            : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
                        }
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNy(admin.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNy(admin.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {admin.isActive ? (
                          <button
                            type="button"
                            disabled={busy || isOnlyOwner}
                            onClick={() =>
                              void patchAdmin(admin.id, {
                                action: "deactivate",
                              })
                            }
                            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void patchAdmin(admin.id, { action: "activate" })
                            }
                            className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
