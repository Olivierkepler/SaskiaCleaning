import Link from "next/link";
import { signOut } from "@/auth";

type StaffPortalShellProps = {
  children: React.ReactNode;
  staff?: { name: string; email: string };
};

export default function StaffPortalShell({
  children,
  staff,
}: StaffPortalShellProps) {
  const initials = staff?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "S";

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:min-h-[72px] sm:px-6 lg:px-8">
          <Link
            href={staff ? "/staff" : "/"}
            aria-label="Saskia Cleaning Staff Portal home"
            className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-sm font-bold text-white shadow-sm">
              S
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-slate-950 sm:text-base">
                Saskia Cleaning
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Staff Portal
              </span>
            </span>
          </Link>

          {staff ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-44 truncate text-sm font-semibold text-slate-800">
                  {staff.name}
                </p>
                <p className="max-w-44 truncate text-xs text-slate-500">
                  {staff.email}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-800 sm:hidden"
              >
                {initials}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/staff/login" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 pb-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        Saskia Cleaning · Staff workspace
      </footer>
    </div>
  );
}
