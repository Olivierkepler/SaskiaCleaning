import { redirect } from "next/navigation";
import Navbar from "@/app/dashboard/components/Navbar";
import ServiceDurationsClient from "./ServiceDurationsClient";

export default async function ServiceDurationsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!key || key !== process.env.DASHBOARD_KEY) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        dashboardKey={key}
        unseenCount={0}
        unseenBookings={[]}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-950">
          Service durations
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          These values control scheduling capacity for new bookings only.
          Existing bookings keep their stored duration snapshot. Initial seeds
          are architecture defaults — edit to match Saskia&apos;s business
          timing.
        </p>
        <ServiceDurationsClient dashboardKey={key} />
      </main>
    </div>
  );
}
