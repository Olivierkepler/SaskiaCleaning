import { requireAdmin } from "@/app/lib/admin-auth";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";
import { getDefaultDispatchRange, validateDispatchDateRange } from "@/app/lib/dispatch-pure";
import { getDispatchReadModel } from "@/app/lib/dispatch";
import AdminDashboardShell from "@/app/dashboard/components/AdminDashboardShell";
import DispatchClient from "./DispatchClient";

type SearchParams = Promise<{ from?: string | string[]; to?: string | string[] }>;

export default async function DispatchPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const hasRange = params.from !== undefined || params.to !== undefined;
  const fallback = getDefaultDispatchRange();
  const rangeResult = hasRange
    ? validateDispatchDateRange(params.from, params.to)
    : { ok: true as const, range: fallback };
  const range = rangeResult.ok ? rangeResult.range : fallback;

  const [{ bookings, summary, truncated, undatedInquiries, undatedCount, undatedTruncated }, pendingCount, opsNeedsAttentionCount] = await Promise.all([
    rangeResult.ok
      ? getDispatchReadModel(range)
      : Promise.resolve({ bookings: [], summary: { awaitingAssignment: 0, assigned: 0, inProgress: 0, completed: 0, exceptions: 0 }, truncated: false, undatedInquiries: [], undatedCount: 0, undatedTruncated: false }),
    countPendingAdminChangeRequests(),
    countOpsNeedsAttention(),
  ]);

  return (
    <AdminDashboardShell
      title="Dispatch Center"
      description="Review scheduled cleaning work, assignment coverage, and dispatch exceptions. Assignment changes are not available in this view."
      eyebrow="Scheduling workspace"
      unseenCount={0}
      unseenBookings={[]}
      pendingChangeRequestCount={pendingCount}
      opsNeedsAttentionCount={opsNeedsAttentionCount}
      isOwner={admin.role === "OWNER"}
      allowMarkSeen={false}
      showNotifications={false}
    >
      <DispatchClient
        from={range.from}
        to={range.to}
        bookings={bookings}
        summary={summary}
        truncated={truncated}
        undatedInquiries={undatedInquiries}
        undatedCount={undatedCount}
        undatedTruncated={undatedTruncated}
        error={rangeResult.ok ? null : rangeResult.error}
      />
    </AdminDashboardShell>
  );
}
