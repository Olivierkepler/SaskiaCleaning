"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
  Gift,
  House,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type AccountNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;

  /** Exact pathname match only. */
  exact?: boolean;

  /** When true, never auto-highlight. */
  neverActive?: boolean;
};

const NAV_ITEMS: AccountNavItem[] = [
  {
    label: "Account Overview",
    href: "/account",
    icon: House,
    exact: true,
  },
  {
    label: "My Bookings",
    href: "/account/bookings",
    icon: CalendarDays,
  },
  {
    label: "Referrals",
    href: "/account/referrals",
    icon: Gift,
    exact: true,
  },
  {
    label: "Rewards",
    href: "/account/rewards",
    icon: Star,
    exact: true,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: UserRound,
    exact: true,
  },
];

function isItemActive(
  pathname: string,
  item: AccountNavItem
): boolean {
  if (item.neverActive) {
    return false;
  }

  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

function linkClassName(
  active: boolean,
  compact = false
): string {
  /*
   * Mobile / tablet
   */
  if (compact) {
    const base =
      "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 " +
      "text-sm font-medium transition-all duration-300 ease-out " +
      "focus-visible:outline-none focus-visible:ring-2 " +
      "focus-visible:ring-sky-300";

    if (active) {
      return (
        `${base} ` +
        "bg-[#ECF0F3] text-sky-600 " +
        "shadow-[inset_4px_4px_9px_rgba(163,177,198,0.28),inset_-4px_-4px_9px_rgba(255,255,255,0.95)]"
      );
    }

    return (
      `${base} ` +
      "bg-[#ECF0F3] text-slate-600 " +
      "shadow-[4px_4px_10px_rgba(163,177,198,0.28),-4px_-4px_10px_rgba(255,255,255,0.95)] " +
      "hover:text-sky-600"
    );
  }

  /*
   * Desktop navigation item
   *
   * Matches the raised #ECF0F3 styling used by AccountActionGrid.
   */
  const base =
    "flex min-h-[52px] items-center gap-3 rounded-[16px] px-4 py-3 " +
    "text-[15px] font-medium " +
    "transition-[background-color,color,box-shadow,transform] " +
    "duration-300 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-sky-300 focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-[#ECF0F3]";

  /*
   * Active item:
   * pressed / inset state
   */
  if (active) {
    return (
      `${base} ` +
      "bg-[#ECF0F3] " +
      "text-sky-600 " +
      "shadow-[inset_5px_5px_12px_rgba(163,177,198,0.32),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]"
    );
  }

  /*
   * Inactive item:
   * raised card state similar to AccountActionGrid.
   */
  return (
    `${base} ` +
    "bg-[#ECF0F3] " +
    "text-slate-600 " +
    "shadow-[6px_6px_14px_rgba(163,177,198,0.30),-6px_-6px_14px_rgba(255,255,255,0.95)] " +
    "hover:-translate-y-[1px] " +
    "hover:text-sky-600 " +
    "hover:shadow-[8px_8px_18px_rgba(163,177,198,0.38),-8px_-8px_18px_rgba(255,255,255,1)]"
  );
}

export default function AccountSidebar() {
  const pathname = usePathname() || "";

  return (
    <>
      {/* Mobile / tablet navigation */}
      <nav
        aria-label="Account navigation"
        className="mb-6 lg:hidden"
      >
        <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3 pt-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClassName(active, true)}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop sidebar */}
      <nav
        aria-label="Account navigation"
        className="
          sticky
          top-6
          hidden
          h-fit
          w-[250px]
          shrink-0
          rounded-[22px]
          bg-[#ECF0F3]
          p-4
          shadow-[10px_10px_24px_rgba(163,177,198,0.38),-10px_-10px_24px_rgba(255,255,255,0.95)]
          lg:block
        "
      >
        <ul className="flex flex-col gap-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClassName(active)}
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}