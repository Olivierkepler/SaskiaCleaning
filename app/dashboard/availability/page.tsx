import { requireAdmin } from "@/app/lib/admin-auth";
import AdminDashboardShell from "../components/AdminDashboardShell";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";
import AvailabilityAdminClient from "./AvailabilityAdminClient";
import { SASKIA_TIME_ZONE } from "@/app/lib/scheduling-pure";

export default async function AvailabilityDashboardPage() {
  const admin = await requireAdmin();
  const [unseenRows, unseenCountRows, pendingChangeRequestCount, opsNeedsAttentionCount] = await Promise.all([
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
  const unseenBookings = (unseenRows as Array<{
    id: number;
    name: string;
    email: string;
    created_at: string;
    service: string | null;
    location: string | null;
  }>).map((booking) => ({ ...booking, created_at: String(booking.created_at) }));
  const unseenCount = Number((unseenCountRows[0] as { count: number } | undefined)?.count ?? 0);

  return (
    <AdminDashboardShell
      title="Availability"
      description={`Manage weekly booking hours, cleaner handoff buffer, blocked dates, and capacity previews. Timezone: ${SASKIA_TIME_ZONE}.`}
      eyebrow="Scheduling workspace"
      unseenCount={unseenCount}
      unseenBookings={unseenBookings}
      pendingChangeRequestCount={pendingChangeRequestCount}
      opsNeedsAttentionCount={opsNeedsAttentionCount}
      isOwner={admin.role === "OWNER"}
    >
      <AvailabilityAdminClient />
    </AdminDashboardShell>
  );
}
