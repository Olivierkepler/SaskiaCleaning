"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  CalendarCheck,
  CalendarDays,
  Clock3,
  ContactRound,
  Gift,
  House,
  LayoutDashboard,
  Megaphone,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import AdminSignOutButton from "@/app/components/admin/AdminSignOutButton";

type AdminSidebarProps = {
  pendingChangeRequestCount: number;
  opsNeedsAttentionCount: number;
  unseenCount: number;
  isOwner: boolean;
};

const groups = [
  {
    label: "Primary",
    items: [
      { label: "Overview", href: "/dashboard#overview", icon: LayoutDashboard },
      { label: "Bookings", href: "/dashboard#booking-workspace", icon: CalendarDays },
      { label: "Leads", href: "/dashboard/leads", icon: ContactRound },
      { label: "Operations", href: "/dashboard/operations", icon: Activity, badge: "operations" as const },
      { label: "Dispatch", href: "/dashboard/dispatch", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Referrals", href: "/dashboard/referrals", icon: Gift },
      { label: "Promo Cards", href: "/dashboard/promos", icon: Megaphone },
      { label: "Change Requests", href: "/dashboard/change-requests", icon: CalendarCheck, badge: "changes" as const },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { label: "Availability", href: "/dashboard/availability", icon: CalendarCheck },
      { label: "Service Durations", href: "/dashboard/service-durations", icon: Clock3 },
      { label: "Staff", href: "/dashboard/staff", icon: Users },
    ],
  },
] as const;

export default function AdminSidebar({
  pendingChangeRequestCount,
  opsNeedsAttentionCount,
  unseenCount,
  isOwner,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const badgeFor = (badge?: "operations" | "changes") => {
    const count = badge === "operations"
      ? opsNeedsAttentionCount
      : badge === "changes"
        ? pendingChangeRequestCount
        : 0;
    if (!badge || count <= 0) return null;
    return (
      <span className={`ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${badge === "operations" ? "bg-rose-500" : "bg-amber-500"}`}>
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  const isActive = (href: string) => {
    if (href.startsWith("/dashboard#")) {
      const targetHash = href.slice("/dashboard".length);
      if (pathname !== "/dashboard") return false;
      if (hash) return hash === targetHash;
      return targetHash === "#booking-workspace";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderNavigation = () => (
    <>
      <div className="space-y-4">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {group.label}
            </h2>
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon, ...itemProps }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${active ? "bg-sky-50/90 font-semibold text-sky-800" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      <Icon aria-hidden="true" className={`size-[17px] shrink-0 ${active ? "text-sky-700" : "text-slate-400"}`} strokeWidth={1.8} />
                      <span>{label}</span>
                      {"badge" in itemProps ? badgeFor(itemProps.badge) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section aria-label="System" className="border-t border-slate-100 pt-3">
          <h2 className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            System
          </h2>
          {isOwner ? (
            <Link
              href="/dashboard/admins"
              onClick={() => setMobileOpen(false)}
              aria-current={isActive("/dashboard/admins") ? "page" : undefined}
              className={`flex min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${isActive("/dashboard/admins") ? "bg-sky-50/90 font-semibold text-sky-800" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <ShieldCheck aria-hidden="true" className={`size-[17px] ${isActive("/dashboard/admins") ? "text-sky-700" : "text-slate-400"}`} strokeWidth={1.8} />
              Admins
            </Link>
          ) : null}
        </section>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-3">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex min-h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <House aria-hidden="true" className="size-[17px] text-slate-400" strokeWidth={1.8} />
          Home
        </Link>
        <AdminSignOutButton
          label="Sign out"
          className="mt-0.5 flex min-h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur xl:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          <span className="flex size-8 items-center justify-center rounded-xl bg-sky-700 text-xs font-bold text-white">S</span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">Saskia <span className="font-normal text-slate-500">Operations</span></span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-navigation"
          className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {mobileOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav id="admin-mobile-navigation" aria-label="Admin navigation" className="absolute inset-x-0 top-[57px] z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-xl xl:hidden">
          {renderNavigation()}
        </nav>
      ) : null}

      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-3 py-4 xl:flex">
        <Link href="/dashboard" className="mb-5 flex items-center gap-2.5 rounded-xl px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sky-700 text-sm font-bold text-white shadow-sm">S</span>
          <span>
            <span className="block text-[15px] font-semibold tracking-tight text-slate-900">Saskia</span>
            <span className="block text-[11px] text-slate-500">Operations</span>
          </span>
        </Link>
        <nav aria-label="Admin navigation" className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
          {renderNavigation()}
        </nav>
        <div className="mt-auto pt-3 text-[10px] text-slate-400">Admin workspace</div>
      </aside>
      {unseenCount > 0 ? <span className="sr-only">{unseenCount} booking notifications</span> : null}
    </>
  );
}
