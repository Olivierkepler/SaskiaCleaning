import { requireAdmin } from "@/app/lib/admin-auth";
import AdminDashboardShell from "../components/AdminDashboardShell";
import { sql } from "@/app/lib/db";
import {
  countPendingAdminChangeRequests,
  listPendingAdminChangeRequests,
} from "@/app/lib/booking-change-requests";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";
import ChangeRequestsTable from "./ChangeRequestsTable";

export default async function DashboardChangeRequestsPage() {
  const admin = await requireAdmin();

  const [requests, pendingCount, unseenRows, unseenCountRows, opsNeedsAttentionCount] = await Promise.all([
    listPendingAdminChangeRequests(),
    countPendingAdminChangeRequests(),
    sql`
      SELECT id, name, email, created_at, service, location
      FROM booking_requests
      WHERE seen = false
      ORDER BY created_at DESC
      LIMIT 10
    `,
    sql`SELECT COUNT(*)::int AS count FROM booking_requests WHERE seen = false`,
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
  const rescheduleCount = requests.filter((request) => request.request_type === "reschedule").length;
  const cancellationCount = requests.length - rescheduleCount;

  return (
    <AdminDashboardShell
      title="Change Requests"
      description="Review customer cancellation and reschedule requests. Approvals update the booking; rejections leave it unchanged."
      eyebrow="Customer requests"
      unseenCount={unseenCount}
      unseenBookings={unseenBookings}
      pendingChangeRequestCount={pendingCount}
      opsNeedsAttentionCount={opsNeedsAttentionCount}
      isOwner={admin.role === "OWNER"}
    >
      <section aria-label="Change request summary" className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Pending requests", value: pendingCount, tone: "text-amber-700" },
          { label: "Reschedule requests", value: rescheduleCount, tone: "text-sky-700" },
          { label: "Cancellation requests", value: cancellationCount, tone: "text-slate-800" },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-5">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${item.tone}`}>{item.value}</p>
          </article>
        ))}
      </section>
      <ChangeRequestsTable initialRequests={requests} />
    </AdminDashboardShell>
  );
}
