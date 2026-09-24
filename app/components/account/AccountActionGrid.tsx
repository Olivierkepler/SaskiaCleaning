import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Gift,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const accountSections: Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconWrap: string;
  accent: string;
}> = [
  {
    title: "My Bookings",
    description: "View and manage your cleaning requests.",
    href: "/account/bookings",
    icon: CalendarDays,
    iconWrap: "bg-sky-50 text-sky-600",
    accent: "from-sky-100/80 to-transparent",
  },
  {
    title: "Referrals",
    description: "Track referrals and share your rewards link.",
    href: "/account/referrals",
    icon: Gift,
    iconWrap: "bg-emerald-50 text-emerald-600",
    accent: "from-emerald-100/80 to-transparent",
  },
  {
    title: "Rewards",
    description: "See your referral wallet and milestones.",
    href: "/account/rewards",
    icon: Star,
    iconWrap: "bg-amber-50 text-amber-600",
    accent: "from-amber-100/80 to-transparent",
  },
  {
    title: "Profile",
    description: "Manage your personal information and saved addresses.",
    href: "/account/profile",
    icon: UserRound,
    iconWrap: "bg-violet-50 text-violet-600",
    accent: "from-violet-100/80 to-transparent",
  },
];

export default function AccountActionGrid() {
  return (
    <nav
      aria-label="Account sections"
      className="mt-8 grid gap-5 sm:grid-cols-2"
    >
      {accountSections.map((section) => {
        const Icon = section.icon;
        return (
          <Link
            key={section.title}
            href={section.href}
            className="group relative flex min-h-[150px] items-center gap-4 overflow-hidden rounded-[22px] border border-slate-200/70 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-gradient-to-tl ${section.accent}`}
            />
            <div
              className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${section.iconWrap}`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="relative min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-slate-900">
                {section.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {section.description}
              </p>
            </div>
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-hover:border-sky-200 group-hover:text-sky-600">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Open {section.title}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
