import { requireAdmin } from "@/app/lib/admin-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";
import {
  countUpcomingAssignmentsForStaff,
  findStaffById,
  listStaffAvailability,
  listStaffTimeOff,
} from "@/app/lib/staff";
import StaffDetailClient from "./StaffDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StaffDetailPage({ params }: PageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const staff = await findStaffById(id);
  if (!staff) notFound();

  const [availability, timeOff, upcomingJobs, unseenRows, unseenCountRows, pendingChangeRequestCount, opsNeedsAttentionCount] = await Promise.all([
    listStaffAvailability(id),
    listStaffTimeOff(id),
    countUpcomingAssignmentsForStaff(id),
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
  ]);
  const unseenCount = Number((unseenCountRows[0] as { count: number } | undefined)?.count ?? 0);

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
            <div className="mb-5">
              <Link
                href="/dashboard/staff"
                className="inline-flex min-h-9 items-center rounded-lg px-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                ← All staff
              </Link>
            </div>
            <StaffDetailClient
              staff={staff}
              initialAvailability={availability}
              initialTimeOff={timeOff}
              upcomingJobs={upcomingJobs}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
