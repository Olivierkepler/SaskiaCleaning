import { sql } from "../../lib/db";
import { redirect } from "next/navigation";
import { serializePromoCard, type PromoCardRow } from "../../lib/promo-cards";
import Navbar from "../components/Navbar";
import PromoCardsTable from "./PromoCardsTable";

type DashboardPageProps = {
  searchParams: Promise<{
    key?: string;
  }>;
};

export default async function PromoCardsDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  if (params.key !== process.env.DASHBOARD_KEY) {
    redirect("/");
  }

  const [promoRows, bookingRows] = await Promise.all([
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
    <main className="min-h-screen bg-slate-100 py-6">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-20">
        <Navbar
          dashboardKey={params.key!}
          unseenCount={unseenCount}
          unseenBookings={unseenBookings}
        />

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Promo Cards
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Manage homepage promo cards shown in AdCardGrid.
          </p>
        </div>

        <PromoCardsTable cards={cards} dashboardKey={params.key!} />
      </div>
    </main>
  );
}
