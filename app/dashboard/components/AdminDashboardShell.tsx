import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import Navbar, { type UnseenBooking } from "./Navbar";

type AdminDashboardShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  unseenCount: number;
  unseenBookings: UnseenBooking[];
  pendingChangeRequestCount: number;
  opsNeedsAttentionCount: number;
  isOwner: boolean;
  allowMarkSeen?: boolean;
  showNotifications?: boolean;
  children: ReactNode;
};

export default function AdminDashboardShell({
  title,
  description,
  eyebrow = "Operations workspace",
  unseenCount,
  unseenBookings,
  pendingChangeRequestCount,
  opsNeedsAttentionCount,
  isOwner,
  allowMarkSeen = true,
  showNotifications = true,
  children,
}: AdminDashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="flex min-h-screen min-w-0 flex-col xl:flex-row">
        <AdminSidebar
          unseenCount={unseenCount}
          pendingChangeRequestCount={pendingChangeRequestCount}
          opsNeedsAttentionCount={opsNeedsAttentionCount}
          isOwner={isOwner}
        />
        <div className="min-w-0 w-full flex-1">
          <div className="mx-auto w-full max-w-[1680px] min-w-0 px-4 py-4 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
            <Navbar
              unseenCount={unseenCount}
              unseenBookings={unseenBookings}
              pendingChangeRequestCount={pendingChangeRequestCount}
              opsNeedsAttentionCount={opsNeedsAttentionCount}
              isOwner={isOwner}
              mode="utility"
              allowMarkSeen={allowMarkSeen}
              showNotifications={showNotifications}
            />
            <header className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">
                  {eyebrow}
                </p>
                <h1 className="text-3xl font-semibold leading-9 tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            </header>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
