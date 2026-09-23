"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

export default function SignOutButton({
  className = "",
  label = "Sign Out",
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label="Sign out of your Saskia account"
      className={
        className ||
        "rounded-full border border-slate-200 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-60"
      }
    >
      {loading ? "Signing out…" : label}
    </button>
  );
}
