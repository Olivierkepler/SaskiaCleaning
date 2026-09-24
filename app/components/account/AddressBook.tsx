"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MAX_CUSTOMER_ADDRESSES } from "@/app/lib/customer-profile-pure";

export type AddressCardData = {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type AddressBookProps = {
  initialAddresses: AddressCardData[];
};

type FormState = {
  label: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

const emptyForm: FormState = {
  label: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function AddressBook({ initialAddresses }: AddressBookProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [mode, setMode] = useState<"idle" | "add" | "edit">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function openAdd() {
    setMode("add");
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function openEdit(address: AddressCardData) {
    setMode("edit");
    setEditingId(address.id);
    setForm({
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    });
    setError("");
  }

  async function saveAddress(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const payload = {
        label: form.label,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || null,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: "US",
        customerId: "attacker-ignored",
      };

      const response =
        mode === "edit" && editingId
          ? await fetch(`/api/account/addresses/${editingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch("/api/account/addresses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = (await response.json()) as {
        error?: string;
        address?: AddressCardData;
      };

      if (!response.ok || !data.address) {
        setError(data.error || "Could not save address.");
        return;
      }

      setMode("idle");
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();

      // Optimistic local sync
      if (mode === "edit" && editingId) {
        setAddresses((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...data.address! } : item,
          ),
        );
      } else {
        setAddresses((prev) => [data.address!, ...prev]);
      }
    } catch {
      setError("Could not save address.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAddress(id: string) {
    if (busy) return;
    if (!window.confirm("Delete this saved address?")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not delete address.");
        return;
      }
      setAddresses((prev) => prev.filter((item) => item.id !== id));
      router.refresh();
    } catch {
      setError("Could not delete address.");
    } finally {
      setBusy(false);
    }
  }

  async function makeDefault(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/account/addresses/${id}/default`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not update default address.");
        return;
      }
      setAddresses((prev) =>
        prev.map((item) => ({
          ...item,
          isDefault: item.id === id,
        })),
      );
      router.refresh();
    } catch {
      setError("Could not update default address.");
    } finally {
      setBusy(false);
    }
  }

  const atLimit = addresses.length >= MAX_CUSTOMER_ADDRESSES;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Save locations to make future bookings faster.
        </p>
        {mode === "idle" && !atLimit ? (
          <button
            type="button"
            onClick={openAdd}
            className="rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-transparent hover:text-slate-900"
          >
            Add address
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {mode !== "idle" ? (
        <form
          onSubmit={saveAddress}
          className="mt-4 space-y-3 rounded-[22px] bg-[#ECF0F3] p-4 shadow-[inset_5px_5px_12px_rgba(163,177,198,0.30),inset_-5px_-5px_12px_rgba(255,255,255,0.95)] sm:p-5"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {mode === "edit" ? "Edit address" : "New address"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Label
              <input
                required
                value={form.label}
                maxLength={60}
                placeholder="Home, Office…"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, label: event.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Address line 1
              <input
                required
                value={form.addressLine1}
                maxLength={120}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    addressLine1: event.target.value,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Address line 2 (optional)
              <input
                value={form.addressLine2}
                maxLength={120}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    addressLine2: event.target.value,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              City
              <input
                required
                value={form.city}
                maxLength={80}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              State
              <input
                required
                value={form.state}
                maxLength={40}
                placeholder="MA"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, state: event.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              ZIP code
              <input
                required
                value={form.postalCode}
                maxLength={10}
                placeholder="02108"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    postalCode: event.target.value,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Country
              <input
                value="US"
                readOnly
                disabled
                className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
              />
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-sky-500 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-sky-600 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMode("idle");
                setEditingId(null);
              }}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {addresses.length === 0 && mode === "idle" ? (
        <div className="mt-6 rounded-[22px] bg-[#ECF0F3] px-6 py-10 text-center shadow-[inset_5px_5px_12px_rgba(163,177,198,0.30),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]">
          <h3 className="text-lg font-semibold text-slate-900">
            No saved addresses yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Save a location to make future bookings faster.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-5 rounded-full border border-slate-900 bg-slate-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Add address
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="rounded-[20px] bg-[#ECF0F3] p-4 shadow-[10px_10px_24px_rgba(163,177,198,0.40),-10px_-10px_24px_rgba(255,255,255,0.95)] sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {address.label}
                    </h3>
                    {address.isDefault ? (
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  </p>
                  <p className="text-sm text-slate-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void makeDefault(address.id)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 hover:border-sky-300 hover:text-sky-700"
                    >
                      Set default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openEdit(address)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeAddress(address.id)}
                    className="rounded-full border border-red-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {atLimit && mode === "idle" ? (
        <p className="mt-4 text-sm text-slate-500">
          You&apos;ve reached the maximum of {MAX_CUSTOMER_ADDRESSES} saved
          addresses.
        </p>
      ) : null}
    </div>
  );
}
