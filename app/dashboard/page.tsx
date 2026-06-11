// app/dashboard/page.tsx

import { sql } from "../lib/db";
import { redirect } from "next/navigation";
import DashboardTable from "./DashboardTable";

type BookingRequest = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
};

type DashboardPageProps = {
  searchParams: Promise<{
    key?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  if (params.key !== process.env.DASHBOARD_KEY) {
    redirect("/");
  }

  const bookings = await sql`
    SELECT *
    FROM booking_requests
    ORDER BY created_at DESC;
  `;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Booking Requests
        </h1>

        <p className="mb-6 text-slate-600">
          Total bookings: {bookings.length}
        </p>

                <DashboardTable bookings={bookings as unknown as BookingRequest[]} dashboardKey={params.key!} />
      </div>
    </main>
  );
}