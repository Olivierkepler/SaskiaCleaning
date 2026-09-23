"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

type NavbarAuthControlsProps = {
  isScrolled: boolean;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

export default function NavbarAuthControls({
  isScrolled,
  onNavigate,
  variant = "desktop",
}: NavbarAuthControlsProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className={
          variant === "mobile"
            ? "flex items-center justify-center rounded-full border border-slate-200 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400"
            : `rounded-full border px-5 py-3 text-[13px] font-medium uppercase tracking-[0.14em] ${
                isScrolled
                  ? "border-slate-200 text-slate-400"
                  : "border-white/30 text-white/60"
              }`
        }
        aria-hidden="true"
      >
        …
      </span>
    );
  }

  if (session?.user) {
    const label = session.user.name?.split(/\s+/)[0] || "Account";

    if (variant === "mobile") {
      return (
        <Link
          href="/account"
          onClick={onNavigate}
          className="flex items-center justify-center rounded-full border border-slate-200 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 transition duration-300 hover:border-slate-950 hover:text-slate-950"
        >
          Account
        </Link>
      );
    }

    return (
      <Link
        href="/account"
        className={`rounded-full border px-5 py-3 text-[13px] font-medium uppercase tracking-[0.14em] transition ${
          isScrolled
            ? "border-slate-200 text-slate-600 hover:border-slate-950 hover:text-slate-950"
            : "border-white/40 text-white hover:border-white hover:bg-white hover:text-slate-950"
        }`}
        aria-label={`Open account for ${label}`}
      >
        Account
      </Link>
    );
  }

  if (variant === "mobile") {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="flex items-center justify-center rounded-full border border-slate-200 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 transition duration-300 hover:border-slate-950 hover:text-slate-950"
      >
        Sign In
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={`rounded-full border px-5 py-3 text-[13px] font-medium uppercase tracking-[0.14em] transition ${
        isScrolled
          ? "border-slate-200 text-slate-600 hover:border-slate-950 hover:text-slate-950"
          : "border-white/40 text-white hover:border-white hover:bg-white hover:text-slate-950"
      }`}
    >
      Sign In
    </Link>
  );
}
