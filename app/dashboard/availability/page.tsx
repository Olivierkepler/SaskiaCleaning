import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import { sql } from "@/app/lib/db";
import { countPendingAdminChangeRequests } from "@/app/lib/booking-change-requests";
import AvailabilityAdminClient from "./AvailabilityAdminClient";
import { SASKIA_TIME_ZONE } from "@/app/lib/scheduling-pure";

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AvailabilityDashboardPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  if (params.key !== process.env.DASHBOARD_KEY) {
    redirect("/");
  }

  const key = params.key!;

  const unseenRows = await sql`
    SELECT id, name, email, created_at, service, location
    FROM booking_requests
    WHERE seen = false
    ORDER BY created_at DESC
    LIMIT 20
  `;

  const pendingChangeRequestCount = await countPendingAdminChangeRequests();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Navbar
          dashboardKey={key}
          unseenCount={unseenRows.length}
          unseenBookings={unseenRows as Array<{
            id: number;
            name: string;
            email: string;
            created_at: string;
            service: string | null;
            location: string | null;
          }>}
          pendingChangeRequestCount={pendingChangeRequestCount}
        />

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Availability</h1>
          <p className="mt-1 text-sm text-slate-500">
            Weekly hours and blocked dates for customer booking slots. Timezone:{" "}
            {SASKIA_TIME_ZONE}. One booking per exact time slot.
          </p>
        </div>

        <AvailabilityAdminClient dashboardKey={key} />
      </div>
    </main>
  );
}
