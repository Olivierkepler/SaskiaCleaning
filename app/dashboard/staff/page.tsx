import { requireAdmin } from "@/app/lib/admin-auth";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import {
  listStaffMembers,
  countUpcomingAssignmentsForStaff,
} from "@/app/lib/staff";
import { formatStaffRole } from "@/app/lib/staff-pure";
import StaffAdminClient from "./StaffAdminClient";

export default async function StaffDashboardPage() {
  const admin = await requireAdmin();

  const unseenRows = await sql`
    SELECT id, name, email, created_at, service, location
    FROM booking_requests
    WHERE seen = false
    ORDER BY created_at DESC
    LIMIT 20
  `;
  const pendingChangeRequestCount = await countPendingAdminChangeRequests();
  const staff = await listStaffMembers();
  const initialStaff = await Promise.all(
    staff.map(async (member) => ({
      ...member,
      upcomingJobs: await countUpcomingAssignmentsForStaff(member.id),
      roleLabel: formatStaffRole(member.role),
    })),
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Navbar
          isOwner={admin.role === "OWNER"}
          unseenCount={unseenRows.length}
          unseenBookings={
            unseenRows as Array<{
              id: number;
              name: string;
              email: string;
              created_at: string;
              service: string | null;
              location: string | null;
            }>
          }
          pendingChangeRequestCount={pendingChangeRequestCount}
        />

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Staff</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage cleaners, availability, and job assignments. Staff sign
                in at{" "}
                <Link href="/staff/login" className="text-sky-600 underline">
                  /staff/login
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <StaffAdminClient initialStaff={initialStaff} />
      </div>
    </main>
  );
}
