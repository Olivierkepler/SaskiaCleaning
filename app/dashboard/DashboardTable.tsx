"use client";

import { useRouter } from "next/navigation";

type BookingRequest = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
};

export default function DashboardTable({
  bookings,
  dashboardKey,
}: {
  bookings: BookingRequest[];
  dashboardKey: string;
}) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this booking?");

    if (!confirmed) return;

    const response = await fetch(`/api/booking/${id}?key=${dashboardKey}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed to delete booking.");
      return;
    }

    router.refresh();
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="w-full border-collapse text-left">
        <thead className="bg-sky-500 text-white">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Mobile</th>
            <th className="p-4">Bedrooms</th>
            <th className="p-4">Bathrooms</th>
            <th className="p-4">Date (Boston Time)</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-slate-500">
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
                  {new Intl.DateTimeFormat("en-US", {
                    timeZone: "America/New_York",
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZoneName: "short",
                  }).format(new Date(booking.created_at))}
                </td>

                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(booking.id)}
                    className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}