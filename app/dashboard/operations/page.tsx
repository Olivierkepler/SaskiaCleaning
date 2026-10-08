import { requireAdmin } from "@/app/lib/admin-auth";
import AdminDashboardShell from "../components/AdminDashboardShell";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { listOpsExceptions } from "@/app/lib/ops-exceptions";
import OperationsClient from "./OperationsClient";

export default async function OperationsDashboardPage() {
  const admin = await requireAdmin();

  const [{ items, summary }, pendingCount, unseenRows, unseenCountRows] = await Promise.all([
    listOpsExceptions(),
    countPendingAdminChangeRequests(),
    sql`
      SELECT id, name, email, created_at, service, location
      FROM booking_requests
      WHERE seen = false
      ORDER BY created_at DESC
      LIMIT 10
    `,
    sql`SELECT COUNT(*)::int AS count FROM booking_requests WHERE seen = false`,
  ]);
  const unseenCount = Number((unseenCountRows[0] as { count: number } | undefined)?.count ?? 0);

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
    <AdminDashboardShell
      title="Operations"
      description="Scheduling exceptions that need admin attention. Capacity-held completed jobs before buffer expiry are informational; manual release preserves assignment history."
      eyebrow="Scheduling workspace"
      unseenCount={unseenCount}
      unseenBookings={unseenBookings}
      pendingChangeRequestCount={pendingCount}
      opsNeedsAttentionCount={summary.needsAttention}
      isOwner={admin.role === "OWNER"}
    >
      <OperationsClient initialItems={items} summary={summary} />
    </AdminDashboardShell>
  );
}
