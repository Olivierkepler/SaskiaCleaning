import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import { sql } from "@/app/lib/db";
import {
  countPendingAdminChangeRequests,
  listPendingAdminChangeRequests,
} from "@/app/lib/booking-change-requests";
import ChangeRequestsTable from "./ChangeRequestsTable";

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function DashboardChangeRequestsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  if (params.key !== process.env.DASHBOARD_KEY) {
    redirect("/");
  }

  const [requests, pendingCount, unseenRows] = await Promise.all([
    listPendingAdminChangeRequests(),
    countPendingAdminChangeRequests(),
    sql`
      SELECT id, name, email, created_at, service, location
      FROM booking_requests
      WHERE seen = false
      ORDER BY created_at DESC
      LIMIT 10
    `,
  ]);

  const unseenBookings = (
    unseenRows as Array<{
      id: number;
      name: string;
      email: string;
      created_at: string;
      service: string | null;
      location: string | null;
    }>
  ).map((booking) => ({
    id: booking.id,
    name: booking.name,
    email: booking.email,
    created_at: String(booking.created_at),
    service: booking.service,
    location: booking.location,
  }));

  const unseenCount = unseenBookings.length;

  return (
    <main className="min-h-screen bg-slate-100 py-6">
      <Navbar
        dashboardKey={params.key!}
        unseenCount={unseenCount}
        unseenBookings={unseenBookings}
        pendingChangeRequestCount={pendingCount}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Booking change requests
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Pending customer cancellation and reschedule requests:{" "}
            <span className="font-semibold text-slate-900">{pendingCount}</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Approving a request updates the booking. Rejecting leaves the
            booking unchanged and lets the customer submit again.
          </p>
        </div>

        <ChangeRequestsTable
          dashboardKey={params.key!}
          initialRequests={requests}
        />
      </div>
    </main>
  );
}
