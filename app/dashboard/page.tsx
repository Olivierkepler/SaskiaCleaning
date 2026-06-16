// app/dashboard/page.tsx

import { sql } from "../lib/db";
import { redirect } from "next/navigation";
import type { BookingStatus } from "../lib/booking-status";
import DashboardTable from "./DashboardTable";

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
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Booking Requests
          </h1>

          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Total bookings:{" "}
            <span className="font-semibold text-slate-900">
              {bookings.length}
            </span>
          </p>
        </div>

        <DashboardTable
          bookings={bookings as unknown as BookingRequest[]}
          dashboardKey={params.key!}
        />
      </div>
    </main>
  );
}