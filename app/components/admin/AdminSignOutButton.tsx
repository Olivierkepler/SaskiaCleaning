"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type AdminSignOutButtonProps = {
  className?: string;
  label?: string;
};

export default function AdminSignOutButton({
  className = "",
  label = "Sign out",
}: AdminSignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        className ||
        "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      }
    >
      {loading ? "Signing out…" : label}
    </button>
  );
}
