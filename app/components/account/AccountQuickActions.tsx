import Link from "next/link";
import { CalendarDays, CalendarPlus, MapPin, UserRound } from "lucide-react";
import AccountOverviewCard from "@/app/components/account/AccountOverviewCard";

const actions = [
  { label: "Book a cleaning", href: "/account/book", icon: CalendarPlus },
  { label: "View my bookings", href: "/account/bookings", icon: CalendarDays },
  { label: "Manage addresses", href: "/account/profile", icon: MapPin },
  { label: "Edit profile", href: "/account/profile", icon: UserRound },
];

export default function AccountQuickActions() {
  return (
    <AccountOverviewCard title="Quick Actions" className="min-h-[245px]">
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {actions.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              <Icon className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AccountOverviewCard>
  );
}
