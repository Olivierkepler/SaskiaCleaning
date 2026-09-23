import Image from "next/image";
import Link from "next/link";
import { requireCustomer } from "@/app/lib/customer-auth";
import SignOutButton from "@/app/components/auth/SignOutButton";

const accountSections = [
  {
    title: "My Bookings",
    description: "View and manage your cleaning requests.",
    href: null as string | null,
    soon: true,
  },
  {
    title: "Referrals",
    description: "Track referrals and share your rewards link.",
    href: "/referrals",
    soon: false,
  },
  {
    title: "Rewards",
    description: "See your referral wallet and milestones.",
    href: "/referrals",
    soon: false,
  },
  {
    title: "Profile",
    description: "Your Google-linked account details.",
    href: null as string | null,
    soon: true,
  },
];

export default async function AccountPage() {
  const customer = await requireCustomer("/login");
  const firstName = customer.name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-sky-600"
          >
            ← Home
          </Link>
          <SignOutButton />
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-sky-50">
              {customer.image ? (
                <Image
                  src={customer.image}
                  alt={customer.name ?? "Account avatar"}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl font-semibold text-sky-500">
                  {(customer.name ?? customer.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-500">
                Your account
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Hello, {firstName}
              </h1>
              <p className="mt-2 text-sm text-slate-600">{customer.email}</p>
            </div>
          </div>

          <nav
            aria-label="Account sections"
            className="mt-10 grid gap-4 sm:grid-cols-2"
          >
            {accountSections.map((section) => {
              const content = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">
                      {section.title}
                    </h2>
                    {section.soon ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Soon
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {section.description}
                  </p>
                </>
              );

              if (section.href) {
                return (
                  <Link
                    key={section.title}
                    href={section.href}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-sky-300 hover:bg-sky-50/60"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={section.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                >
                  {content}
                </div>
              );
            })}
          </nav>
        </section>
      </div>
    </main>
  );
}
