import { requireAdmin } from "@/app/lib/admin-auth";
import Link from "next/link";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";
import {
  listStaffMembers,
  countUpcomingAssignmentsForStaff,
} from "@/app/lib/staff";
import { formatStaffRole } from "@/app/lib/staff-pure";
import StaffAdminClient from "./StaffAdminClient";

export default async function StaffDashboardPage() {
  const admin = await requireAdmin();

  const [unseenRows, unseenCountRows, pendingChangeRequestCount, opsNeedsAttentionCount, staff] = await Promise.all([
    sql`
      SELECT id, name, email, created_at, service, location
      FROM booking_requests
      WHERE seen = false
      ORDER BY created_at DESC
      LIMIT 10
    `,
    sql`SELECT COUNT(*)::int AS count FROM booking_requests WHERE seen = false`,
    countPendingAdminChangeRequests(),
    countOpsNeedsAttention(),
    listStaffMembers(),
  ]);
  const unseenCount = Number((unseenCountRows[0] as { count: number } | undefined)?.count ?? 0);
  const initialStaff = await Promise.all(
    staff.map(async (member) => ({
      ...member,
      upcomingJobs: await countUpcomingAssignmentsForStaff(member.id),
      roleLabel: formatStaffRole(member.role),
    })),
  );

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="flex min-h-screen min-w-0 flex-col xl:flex-row">
        <AdminSidebar
          unseenCount={unseenCount}
          pendingChangeRequestCount={pendingChangeRequestCount}
          opsNeedsAttentionCount={opsNeedsAttentionCount}
          isOwner={admin.role === "OWNER"}
        />
        <div className="min-w-0 w-full flex-1">
          <div className="mx-auto w-full max-w-[1680px] min-w-0 px-4 py-4 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
            <Navbar
              unseenCount={unseenCount}
              unseenBookings={unseenRows as Array<{
                id: number;
                name: string;
                email: string;
                created_at: string;
                service: string | null;
                location: string | null;
              }>}
              pendingChangeRequestCount={pendingChangeRequestCount}
              opsNeedsAttentionCount={opsNeedsAttentionCount}
              isOwner={admin.role === "OWNER"}
              mode="utility"
            />
            <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">Scheduling workspace</p>
                <h1 className="text-3xl font-semibold leading-9 tracking-tight text-slate-950 sm:text-4xl">Staff</h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Manage cleaners, availability, and job assignments. Staff sign in at{" "}
                  <Link href="/staff/login" className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900">
                    /staff/login
                  </Link>.
                </p>
              </div>
            </header>
            <StaffAdminClient initialStaff={initialStaff} />
          </div>
        </div>
      </div>
    </main>
  );
}
