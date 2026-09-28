"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export type LeadInquiryRow = {
  id: number;
  source: "hero_quote" | "service_inquiry";
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  created_at: string | Date;
};

export function LeadManagementToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timeout: number | undefined;
    const handleToast = (event: Event) => {
      const nextMessage = (event as CustomEvent<string>).detail;
      setMessage(nextMessage);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setMessage(null), 3500);
    };

    window.addEventListener("lead-management-toast", handleToast);
    return () => {
      window.removeEventListener("lead-management-toast", handleToast);
      window.clearTimeout(timeout);
    };
  }, []);

  return message ? (
    <p role="status" className="fixed right-4 top-4 z-[120] rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xl sm:right-6 sm:top-6">
      {message}
    </p>
  ) : null;
}

type EditValues = {
  fullName: string;
  email: string;
  phone: string;
  bedrooms: string;
  bathrooms: string;
};

export function LeadRowActions({ lead }: { lead: LeadInquiryRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [values, setValues] = useState<EditValues>({
    fullName: lead.full_name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    bedrooms: lead.bedrooms == null ? "" : String(lead.bedrooms),
    bathrooms: lead.bathrooms == null ? "" : String(lead.bathrooms),
  });

  function updateValue(field: keyof EditValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone || null,
          bedrooms: values.bedrooms === "" ? null : Number(values.bedrooms),
          bathrooms: values.bathrooms === "" ? null : Number(values.bathrooms),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update inquiry.");

      setEditing(false);
      announceLeadChange("Inquiry updated.");
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not update inquiry.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not delete inquiry.");

      setDeleting(false);
      announceLeadChange("Inquiry deleted.");
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not delete inquiry.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setEditing(true);
          }}
          className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setDeleting(true);
          }}
          className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          Delete
        </button>
      </div>

      {message?.type === "error" && !editing && !deleting && (
        <p
          role="alert"
          className="mt-2 max-w-64 text-left text-xs text-rose-700"
        >
          {message.text}
        </p>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setEditing(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-lead-title-${lead.id}`}
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id={`edit-lead-title-${lead.id}`} className="text-lg font-bold text-slate-900">Edit inquiry</h2>
                <p className="mt-1 text-sm text-slate-500">Update the contact and home details for this inquiry.</p>
              </div>
              <button type="button" disabled={busy} onClick={() => setEditing(false)} aria-label="Close edit dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">×</button>
            </div>

            {message?.type === "error" && (
              <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {message.text}
              </p>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              <TextField label="Name" value={values.fullName} onChange={(value) => updateValue("fullName", value)} required maxLength={200} autoComplete="name" />
              <TextField label="Email" type="email" value={values.email} onChange={(value) => updateValue("email", value)} required maxLength={254} autoComplete="email" />
              <TextField label="Phone" type="tel" value={values.phone} onChange={(value) => updateValue("phone", value)} maxLength={50} autoComplete="tel" />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Bedrooms" type="number" value={values.bedrooms} onChange={(value) => updateValue("bedrooms", value)} min={0} max={100} step={1} />
                <TextField label="Bathrooms" type="number" value={values.bathrooms} onChange={(value) => updateValue("bathrooms", value)} min={0} max={100} step={1} />
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button type="button" disabled={busy} onClick={() => setEditing(false)} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={busy} className="min-h-10 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleting && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setDeleting(false);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-lead-title-${lead.id}`}
            aria-describedby={`delete-lead-copy-${lead.id}`}
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <h2 id={`delete-lead-title-${lead.id}`} className="text-lg font-bold text-slate-900">Delete inquiry?</h2>
            <p id={`delete-lead-copy-${lead.id}`} className="mt-2 text-sm leading-6 text-slate-600">
              This will permanently remove this service inquiry from the Saskia Cleaning dashboard. This action cannot be undone.
            </p>
            {message?.type === "error" && <p role="alert" className="mt-3 text-sm text-rose-700">{message.text}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={busy} onClick={() => setDeleting(false)} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={busy} onClick={handleDelete} className="min-h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-50">{busy ? "Deleting…" : "Delete inquiry"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function announceLeadChange(message: string) {
  window.dispatchEvent(new CustomEvent("lead-management-toast", { detail: message }));
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  min,
  max,
  step,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}
