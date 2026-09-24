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
}> = [
  {
    title: "My Bookings",
    description: "View and manage your cleaning requests.",
    href: "/account/bookings",
    icon: CalendarDays,
    iconWrap: "bg-sky-50 text-sky-600",
  },
  {
    title: "Referrals",
    description: "Track referrals and share your rewards link.",
    href: "/account/referrals",
    icon: Gift,
    iconWrap: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Rewards",
    description: "See your referral wallet and milestones.",
    href: "/account/rewards",
    icon: Star,
    iconWrap: "bg-amber-50 text-amber-600",
  },
  {
    title: "Profile",
    description: "Manage your personal information and saved addresses.",
    href: "/account/profile",
    icon: UserRound,
    iconWrap: "bg-violet-50 text-violet-600",
  },
];

export default function AccountActionGrid() {
  return (
    <nav
      aria-label="Account sections"
      className="mt-8 grid gap-6 sm:grid-cols-2"
    >
      {accountSections.map((section) => {
        const Icon = section.icon;

        return (
          <Link
            key={section.title}
            href={section.href}
            className="
              group
              relative
              flex
              min-h-[150px]
              items-center
              gap-4
              overflow-hidden
              rounded-[10px]
              bg-[#ECF0F3]
              p-6
              shadow-[10px_10px_24px_rgba(163,177,198,0.45),-10px_-10px_24px_rgba(255,255,255,0.95)]
              transition-all
              duration-300
              ease-out
              hover:-translate-y-0.5
              hover:shadow-[14px_14px_30px_rgba(163,177,198,0.52),-14px_-14px_30px_rgba(255,255,255,1)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-sky-300
              focus-visible:ring-offset-4
              focus-visible:ring-offset-[#ECF0F3]
            "
          >
            {/* Soft decorative glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -bottom-12
                -right-12
                h-32
                w-32
                rounded-full
                bg-white/40
                blur-2xl
              "
            />

            {/* Icon */}
            <div
              className={`
                relative
                grid
                h-14
                w-14
                shrink-0
                place-items-center
                rounded-[18px]
                ${section.iconWrap}
                shadow-[5px_5px_12px_rgba(163,177,198,0.25),-5px_-5px_12px_rgba(255,255,255,0.95)]
              `}
            >
              <Icon
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            {/* Text */}
            <div className="relative min-w-0 flex-1">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                {section.title}
              </h3>

              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {section.description}
              </p>
            </div>

            {/* Arrow */}
            <span
              className="
                relative
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-full
                bg-[#ECF0F3]
                text-slate-500
                shadow-[5px_5px_12px_rgba(163,177,198,0.35),-5px_-5px_12px_rgba(255,255,255,0.95)]
                transition-all
                duration-300
                group-hover:text-sky-600
                group-hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.28),inset_-4px_-4px_8px_rgba(255,255,255,0.95)]
              "
            >
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span className="sr-only">
                Open {section.title}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}