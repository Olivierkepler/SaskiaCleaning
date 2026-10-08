import { requireOwner } from "@/app/lib/admin-auth";
import AdminDashboardShell from "../components/AdminDashboardShell";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";
import { listAdminUsers, serializeAdminUser } from "@/app/lib/admin-users";
import AdminsClient from "./AdminsClient";

export default async function AdminsDashboardPage() {
  const owner = await requireOwner();

  const [admins, pendingCount, opsCount, unseenRows] = await Promise.all([
    listAdminUsers(),
    countPendingAdminChangeRequests(),
    countOpsNeedsAttention(),
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
    <AdminDashboardShell
      title="Admins"
      description="Manage Google-authenticated administrator access. Only an OWNER can add or deactivate admins, and at least one active OWNER must remain."
      eyebrow="Access management"
      unseenCount={unseenBookings.length}
      unseenBookings={unseenBookings}
      pendingChangeRequestCount={pendingCount}
      opsNeedsAttentionCount={opsCount}
      isOwner
    >
      <AdminsClient
        initialAdmins={admins.map(serializeAdminUser)}
        currentAdminId={owner.id}
      />
    </AdminDashboardShell>
  );
}
