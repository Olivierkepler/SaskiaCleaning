import { requireAdmin } from "@/app/lib/admin-auth";
import { sql } from "../lib/db";
import type { BookingStatus } from "../lib/booking-status";
import DashboardTable from "./DashboardTable";
import Navbar from "./components/Navbar";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import { listAssignmentBookingIds } from "@/app/lib/staff";
import { listAdminCapacityHints } from "@/app/lib/capacity-release";
import { countOpsNeedsAttention } from "@/app/lib/ops-exceptions";
import AdminSidebar from "./components/AdminSidebar";

type BookingRequest = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  bedrooms: number;
  bathrooms: number;
  status: BookingStatus;
  seen: boolean;
  created_at: string;
  service: string | null;
  frequency: string | null;
  location: string | null;
  booking_date: string | Date | null;
  booking_time?: string | null;
  extras: string[] | string | null;
  estimate_low: number | null;
  estimate_mid: number | null;
  estimate_high: number | null;
  notes: string | null;
  referral_code: string | null;
  friend_discount_amount: number | null;
};

type BookingRow = Omit<BookingRequest, "friend_discount_amount"> & {
  referral_friend_discount_amount: number | null;
};

type DashboardPageProps = {
  searchParams: Promise<{
    booking?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const highlightBookingId = (() => {
    if (!params.booking) return null;
    const n = Number(params.booking);
    return Number.isInteger(n) && n > 0 ? n : null;
  })();

  const bookings = await sql`
    SELECT
      br.*,
      ref.friend_discount_amount AS referral_friend_discount_amount
    FROM booking_requests br
    LEFT JOIN referrals ref ON ref.booking_request_id = br.id
    ORDER BY br.created_at DESC;
  `;

  const typedBookings = (bookings as unknown as BookingRow[]).map(
    ({ referral_friend_discount_amount, ...booking }) => ({
      ...booking,
      friend_discount_amount: referral_friend_discount_amount,
    }),
  );
  const unseenBookings = typedBookings
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
  const unseenCount = typedBookings.filter((booking) => !booking.seen).length;
  const pendingChangeRequestCount = await countPendingAdminChangeRequests();
  const assignedBookingIds = Array.from(await listAssignmentBookingIds());
  const capacityHints: Record<number, "overdue" | "capacity_held"> = {};
  for (const h of await listAdminCapacityHints()) {
    if (h.label === "overdue" || h.label === "capacity_held") {
      capacityHints[h.bookingId] = h.label;
    }
  }
  const opsNeedsAttentionCount = await countOpsNeedsAttention();

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="flex min-h-screen min-w-0 flex-col xl:flex-row">
        <AdminSidebar
          unseenCount={unseenCount}
          pendingChangeRequestCount={pendingChangeRequestCount}
          opsNeedsAttentionCount={opsNeedsAttentionCount}
          isOwner={admin.role === "OWNER"}
        />
        <div className="min-w-0 w-full flex-1">
          <div className="mx-auto w-full max-w-[1680px] min-w-0 px-4 py-4 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
            <Navbar
              unseenCount={unseenCount}
              unseenBookings={unseenBookings}
              pendingChangeRequestCount={pendingChangeRequestCount}
              opsNeedsAttentionCount={opsNeedsAttentionCount}
              isOwner={admin.role === "OWNER"}
              mode="utility"
            />
            <header id="overview" className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">Booking workspace</p>
                <h1 className="text-3xl font-semibold leading-9 tracking-tight text-slate-950 sm:text-4xl">
                  Booking Requests
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Review, assign and manage incoming cleaning requests.
                </p>
              </div>
            </header>

            <DashboardTable
              bookings={typedBookings}
              assignedBookingIds={assignedBookingIds}
              capacityHints={capacityHints}
              highlightBookingId={highlightBookingId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
