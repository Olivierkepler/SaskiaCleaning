import { requireAdmin } from "@/app/lib/admin-auth";
import { sql } from "@/app/lib/db";
import Navbar from "@/app/dashboard/components/Navbar";

type LeadInquiry = {
  id: number;
  source: "hero_quote" | "service_inquiry";
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  created_at: string | Date;
};

function formatSubmittedAt(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

export default async function DashboardLeadsPage() {
  const admin = await requireAdmin();
  const [leadRows, bookingRows] = await Promise.all([
    sql`
      SELECT
        id,
        source,
        full_name,
        email,
        phone,
        bedrooms,
        bathrooms,
        created_at
      FROM lead_inquiries
      ORDER BY created_at DESC, id DESC
    `,
    sql`
      SELECT id, name, email, created_at, seen, service, location
      FROM booking_requests
      ORDER BY created_at DESC
    `,
  ]);

  const leads = leadRows as LeadInquiry[];
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
          isOwner={admin.role === "OWNER"}
          unseenCount={unseenCount}
          unseenBookings={unseenBookings}
        />

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Service Inquiries
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {leads.length} {leads.length === 1 ? "inquiry" : "inquiries"}
          </p>
        </section>

        {leads.length === 0 ? (
          <section className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              No inquiries yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              New estimate and service inquiry requests will appear here.
            </p>
          </section>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Bedrooms</th>
                    <th className="px-5 py-4">Bathrooms</th>
                    <th className="px-5 py-4">Source</th>
                    <th className="px-5 py-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="text-slate-700 hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                        {lead.full_name || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {lead.email || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {lead.phone || "—"}
                      </td>
                      <td className="px-5 py-4">{lead.bedrooms ?? "—"}</td>
                      <td className="px-5 py-4">{lead.bathrooms ?? "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-100">
                          {lead.source === "hero_quote"
                            ? "Hero quote"
                            : "Service inquiry"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        <time dateTime={new Date(lead.created_at).toISOString()}>
                          {formatSubmittedAt(lead.created_at)}
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
