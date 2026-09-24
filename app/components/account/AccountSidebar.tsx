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

  /** Exact pathname match only (e.g. Account Overview at /account). */
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
   * Keep the compact navigation simple.
   */
  if (compact) {
    const base =
      "inline-flex shrink-0 items-center gap-2 rounded-full " +
      "px-4 py-2.5 text-sm font-medium " +
      "transition-all duration-300 ease-out " +
      "focus-visible:outline-none focus-visible:ring-2 " +
      "focus-visible:ring-sky-300";

    if (active) {
      return `${base} bg-sky-50 text-sky-600`;
    }

    return (
      `${base} text-slate-600 ` +
      "hover:bg-slate-50 hover:text-slate-950"
    );
  }

  /*
   * Desktop navigation button.
   */
  const base =
    "flex min-h-[50px] items-center gap-3 " +
    "rounded-[16px] px-3.5 py-3 " +
    "text-[15px] font-medium " +
    "transition-[background-color,color,box-shadow,transform] " +
    "duration-300 ease-out " +
    "focus-visible:outline-none " +
    "focus-visible:ring-2 " +
    "focus-visible:ring-sky-300 " +
    "focus-visible:ring-offset-2";

  /*
   * Active item.
   *
   * Keep the selected destination visible without needing hover.
   */
  if (active) {
    return (
      `${base} ` +
      "bg-sky-50 " +
      "text-sky-600 " +
      "shadow-[inset_4px_4px_10px_rgba(209,217,230,0.55),inset_-4px_-4px_10px_rgba(255,255,255,0.95)]"
    );
  }

  /*
   * Inactive item.
   *
   * On hover, the button receives the inner-shadow treatment:
   * #D1D9E6 on the upper/left side
   * white highlight on the lower/right side.
   */
  return (
    `${base} ` +
    "bg-transparent " +
    "text-slate-600 " +
    "shadow-none " +
    "hover:bg-[#f4f7fa] " +
    "hover:text-sky-600 " +
    "hover:shadow-[inset_6px_6px_18px_rgba(209,217,230,0.85),inset_-6px_-6px_18px_rgba(255,255,255,1)]"
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
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
          rounded-[10px]
          bg-white
          p-4
          shadow-[0_18px_45px_rgba(71,85,105,0.14)]
          lg:block
        "
      >
        <ul className="flex flex-col gap-1.5">
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