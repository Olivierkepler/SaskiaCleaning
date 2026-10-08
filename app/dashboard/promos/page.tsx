import { requireAdmin } from "@/app/lib/admin-auth";
import { sql } from "../../lib/db";
import { serializePromoCard, type PromoCardRow } from "../../lib/promo-cards";
import AdminDashboardShell from "../components/AdminDashboardShell";
import PromoCardsTable from "./PromoCardsTable";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";

export default async function PromoCardsDashboardPage() {
  const admin = await requireAdmin();

  const [promoRows, bookingRows, pendingChangeRequestCount, opsNeedsAttentionCount] = await Promise.all([
    sql`
      SELECT *
      FROM promo_cards
      ORDER BY sort_order ASC, id ASC
    `,
    sql`
      SELECT id, name, email, created_at, seen, service, location
      FROM booking_requests
      ORDER BY created_at DESC
    `,
    countPendingAdminChangeRequests(),
    countOpsNeedsAttention(),
  ]);

  const cards = (promoRows as PromoCardRow[]).map(serializePromoCard);
  const unseenBookings = bookingRows
    .filter((booking) => !booking.seen)
    .slice(0, 10)
    .map(({ id, name, email, created_at, service, location }) => ({
      id,
      name,
      email,
      created_at,
      service,
      location,
    }));
  const unseenCount = bookingRows.filter((booking) => !booking.seen).length;

  return (
    <AdminDashboardShell
      title="Promo Cards"
      description="Manage the promotional cards displayed on the customer homepage."
      eyebrow="Customer experience"
      unseenCount={unseenCount}
      unseenBookings={unseenBookings}
      pendingChangeRequestCount={pendingChangeRequestCount}
      opsNeedsAttentionCount={opsNeedsAttentionCount}
      isOwner={admin.role === "OWNER"}
    >
      <PromoCardsTable cards={cards} />
    </AdminDashboardShell>
  );
}
