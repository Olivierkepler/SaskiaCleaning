import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import {
  countUpcomingAssignmentsForStaff,
  findStaffById,
  listStaffAvailability,
  listStaffTimeOff,
} from "@/app/lib/staff";
import StaffDetailClient from "./StaffDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
};

export default async function StaffDetailPage({
  params,
  searchParams,
}: PageProps) {
  const query = await searchParams;
  if (query.key !== process.env.DASHBOARD_KEY) {
    redirect("/");
  }
  const key = query.key!;
  const { id } = await params;

  const staff = await findStaffById(id);
  if (!staff) notFound();

  const [availability, timeOff, upcomingJobs, unseenRows] = await Promise.all([
    listStaffAvailability(id),
    listStaffTimeOff(id),
    countUpcomingAssignmentsForStaff(id),
    sql`
      SELECT id, name, email, created_at, service, location
      FROM booking_requests
      WHERE seen = false
      ORDER BY created_at DESC
      LIMIT 20
    `,
  ]);
  const pendingChangeRequestCount = await countPendingAdminChangeRequests();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Navbar
          dashboardKey={key}
          unseenCount={unseenRows.length}
          unseenBookings={unseenRows as Array<{
            id: number;
            name: string;
            email: string;
            created_at: string;
            service: string | null;
            location: string | null;
          }>}
          pendingChangeRequestCount={pendingChangeRequestCount}
        />

        <Link
          href={`/dashboard/staff?key=${encodeURIComponent(key)}`}
          className="mb-4 inline-block text-sm font-medium text-slate-500 hover:text-sky-600"
        >
          ← All staff
        </Link>

        <StaffDetailClient
          dashboardKey={key}
          staff={staff}
          initialAvailability={availability}
          initialTimeOff={timeOff}
          upcomingJobs={upcomingJobs}
        />
      </div>
    </main>
  );
}
