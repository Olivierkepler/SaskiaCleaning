"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileFormProps = {
  initialName: string | null;
  initialPhone: string | null;
  email: string;
};

export default function ProfileForm({
  initialName,
  initialPhone,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email, // ignored server-side
          customerId: "attacker-ignored",
          image: "https://evil.example/x.png",
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not save your profile.");
        return;
      }
      setSuccess("Profile updated.");
      router.refresh();
    } catch {
      setError("Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Preferred name
        <input
          type="text"
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          value={email}
          readOnly
          disabled
          className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Managed by your Google account
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Phone
        <input
          type="tel"
          value={phone}
          maxLength={30}
          placeholder="(857) 555-0123"
          onChange={(event) => setPhone(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-sky-500 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-sky-600 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
