// app/dashboard/page.tsx

import { sql } from "../lib/db";
import { redirect } from "next/navigation";

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

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-sky-500 text-white">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Bedrooms</th>
                <th className="p-4">Bathrooms</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No booking requests yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-4 font-medium text-slate-900">
                      {booking.name}
                    </td>
                    <td className="p-4 text-slate-700">{booking.email}</td>
                    <td className="p-4 text-slate-700">
                      {booking.mobile || "—"}
                    </td>
                    <td className="p-4 text-slate-700">{booking.bedrooms}</td>
                    <td className="p-4 text-slate-700">{booking.bathrooms}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(booking.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}