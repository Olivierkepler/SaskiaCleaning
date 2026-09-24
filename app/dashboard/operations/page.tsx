import { requireAdmin } from "@/app/lib/admin-auth";
import Navbar from "../components/Navbar";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { listOpsExceptions } from "@/app/lib/ops-exceptions";
import OperationsClient from "./OperationsClient";

export default async function OperationsDashboardPage() {
  await requireAdmin();

  const [{ items, summary }, pendingCount, unseenRows] = await Promise.all([
    listOpsExceptions(),
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

  return (
    <main className="min-h-screen bg-slate-100 py-6">
      <Navbar
        unseenCount={unseenBookings.length}
        unseenBookings={unseenBookings}
        pendingChangeRequestCount={pendingCount}
        opsNeedsAttentionCount={summary.needsAttention}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Operations
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Scheduling exceptions that need admin attention. Capacity-held
            completed jobs before buffer expiry are informational. Manual
            release never deletes assignment history.
          </p>
        </div>

        <OperationsClient initialItems={items} summary={summary} />
      </div>
    </main>
  );
}
