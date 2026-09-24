import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Gift,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { requireCustomer } from "@/app/lib/customer-auth";
import SignOutButton from "@/app/components/auth/SignOutButton";

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
    href: "/referrals",
    icon: Gift,
    iconWrap: "bg-emerald-50 text-emerald-600",
    accent: "from-emerald-100/80 to-transparent",
  },
  {
    title: "Rewards",
    description: "See your referral wallet and milestones.",
    href: "/referrals",
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

export default async function AccountPage() {
  const customer = await requireCustomer("/login");
  const firstName = customer.name?.trim().split(/\s+/)[0] ?? "there";
  const displayName = customer.name?.trim() || "Saskia customer";
  const initial = (customer.name ?? customer.email).charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f5f9fc] px-6 py-8 md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-sky-600"
          >
            ← Home
          </Link>
          <SignOutButton />
        </div>

        <section className="relative mb-8 min-h-[240px] overflow-hidden rounded-[28px] md:min-h-[300px]">
          <Image
            src="/account/headeraccount.png"
            alt="Freshly cleaned space with folded towels and greenery"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent md:from-white/85 md:via-white/55 md:to-transparent"
          />
          <div className="relative z-10 flex h-full min-h-[240px] max-w-xl flex-col justify-center px-6 py-10 md:min-h-[300px] md:px-10 md:py-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-600">
              Your account
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Hello, {firstName}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 md:text-base">
              Manage your profile, bookings, and preferences.
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
          <div className="flex flex-col gap-5 border-b border-slate-100 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-sky-50 md:h-20 md:w-20">
                {customer.image ? (
                  <Image
                    src={customer.image}
                    alt={displayName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl font-semibold text-sky-500">
                    {initial}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                  {displayName}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500 md:text-base">
                  {customer.email}
                </p>
              </div>
            </div>
            <div className="sm:shrink-0">
              <SignOutButton />
            </div>
          </div>

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
        </section>
      </div>
    </main>
  );
}
