import Link from "next/link";
import { requireAdmin } from "@/app/lib/admin-auth";
import { sql } from "@/app/lib/db";
import {
  buildLeadQuery,
  LEAD_DATE_FILTERS,
  parseLeadFilters,
  type LeadFilters,
  type LeadSortKey,
} from "@/app/lib/lead-management";
import Navbar from "@/app/dashboard/components/Navbar";
import {
  LeadManagementToast,
  LeadRowActions,
  type LeadInquiryRow,
} from "./LeadManagementTable";

const PAGE_SIZE = 50;

type SearchParams = Record<string, string | string[] | undefined>;

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

function buildLeadsHref(filters: LeadFilters, updates: Record<string, string>) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.source) params.set("source", filters.source);
  if (filters.date !== "all") params.set("date", filters.date);
  if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
  if (filters.bathrooms) params.set("bathrooms", filters.bathrooms);
  params.set("sort", filters.sort);
  params.set("order", filters.order);
  for (const [key, value] of Object.entries(updates)) params.set(key, value);
  const query = params.toString();
  return query ? `/dashboard/leads?${query}` : "/dashboard/leads";
}

function buildLeadExportHref(filters: LeadFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.source) params.set("source", filters.source);
  if (filters.date !== "all") params.set("date", filters.date);
  if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
  if (filters.bathrooms) params.set("bathrooms", filters.bathrooms);
  params.set("sort", filters.sort);
  params.set("order", filters.order);
  return `/api/admin/leads/export?${params.toString()}`;
}

function SortHeader({
  label,
  sortKey,
  filters,
}: {
  label: string;
  sortKey: LeadSortKey;
  filters: LeadFilters;
}) {
  const isActive = filters.sort === sortKey;
  const nextOrder = isActive && filters.order === "asc" ? "desc" : "asc";
  const indicator = isActive ? (filters.order === "asc" ? "↑" : "↓") : "↕";

  return (
    <th scope="col" className="px-4 py-3">
      <Link
        href={buildLeadsHref(filters, { sort: sortKey, order: nextOrder, page: "1" })}
        aria-label={`Sort by ${label}${isActive ? `, currently ${filters.order === "asc" ? "ascending" : "descending"}` : ""}`}
        className="inline-flex items-center gap-2 rounded font-semibold transition hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        {label}
        <span aria-hidden="true" className="text-slate-400">{indicator}</span>
      </Link>
    </th>
  );
}

function FilterToolbar({ filters }: { filters: LeadFilters }) {
  return (
    <form
      action="/dashboard/leads"
      method="get"
      className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5"
    >
      <input type="hidden" name="sort" value={filters.sort} />
      <input type="hidden" name="order" value={filters.order} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search inquiries
          </span>
          <input
            type="search"
            name="q"
            maxLength={100}
            defaultValue={filters.q ?? ""}
            placeholder="Search name, email, or phone..."
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <details className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden">
            Filters
            <span aria-hidden="true" className="text-xs text-slate-400">⌄</span>
          </summary>
          <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:absolute lg:right-0 lg:z-20 lg:mt-2 lg:w-[min(90vw,34rem)] lg:grid-cols-2 lg:bg-white lg:p-4 lg:shadow-xl">
            <label className="text-xs font-semibold text-slate-600">
              Source
              <select name="source" defaultValue={filters.source ?? ""} className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800">
                <option value="">All sources</option>
                <option value="hero_quote">Hero quote</option>
                <option value="service_inquiry">Service inquiry</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Date
              <select name="date" defaultValue={filters.date} className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800">
                <option value="all">All time</option>
                {LEAD_DATE_FILTERS.filter((value) => value !== "all").map((value) => (
                  <option key={value} value={value}>
                    {value === "today" ? "Today" : value === "7d" ? "Last 7 days" : "Last 30 days"}
                  </option>
                ))}
              </select>
            </label>
            <RoomFilter label="Bedrooms" name="bedrooms" value={filters.bedrooms} />
            <RoomFilter label="Bathrooms" name="bathrooms" value={filters.bathrooms} />
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button type="submit" className="min-h-10 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
                Apply filters
              </button>
              <Link href="/dashboard/leads" className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-sky-700">
                Clear filters
              </Link>
            </div>
          </div>
        </details>

        <button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2">
          Search
        </button>
        <a
          href={buildLeadExportHref(filters)}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          Export Excel
        </a>
      </div>
    </form>
  );
}

function RoomFilter({
  label,
  name,
  value,
}: {
  label: string;
  name: "bedrooms" | "bathrooms";
  value: string | null;
}) {
  return (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <select name={name} defaultValue={value ?? ""} className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800">
        <option value="">All</option>
        {[1, 2, 3, 4].map((roomCount) => (
          <option key={roomCount} value={roomCount}>{roomCount}</option>
        ))}
        <option value="5+">5+</option>
      </select>
    </label>
  );
}

function TableHeader({ filters }: { filters: LeadFilters }) {
  return (
    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
      <tr>
        <SortHeader label="Name" sortKey="name" filters={filters} />
        <SortHeader label="Email" sortKey="email" filters={filters} />
        <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
        <SortHeader label="Bedrooms" sortKey="bedrooms" filters={filters} />
        <SortHeader label="Bathrooms" sortKey="bathrooms" filters={filters} />
        <th scope="col" className="px-4 py-3 font-semibold">Source</th>
        <SortHeader label="Submitted" sortKey="created_at" filters={filters} />
        <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
      </tr>
    </thead>
  );
}

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdmin();
  const filters = parseLeadFilters(await searchParams);
  const queryFilters = {
    q: filters.q,
    source: filters.source,
    date: filters.date,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    sort: filters.sort,
    order: filters.order,
  };
  const countQuery = buildLeadQuery(queryFilters, { count: true });
  const [countRows, bookingRows] = await Promise.all([
    sql.query(countQuery.text, countQuery.values),
    sql`SELECT id, name, email, created_at, seen, service, location FROM booking_requests ORDER BY created_at DESC`,
  ]);

  const filteredCount = Number((countRows[0] as { count: number } | undefined)?.count ?? 0);
  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const offset = (page - 1) * PAGE_SIZE;
  const listQuery = buildLeadQuery(queryFilters, {
    includeId: true,
    limit: PAGE_SIZE,
    offset,
  });
  const leadRows = await sql.query(listQuery.text, listQuery.values);

  const leads = (leadRows as LeadInquiryRow[]).map((lead) => ({
    ...lead,
    created_at: new Date(lead.created_at).toISOString(),
  }));
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
        <LeadManagementToast />

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Service Inquiries</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {filteredCount} {filteredCount === 1 ? "inquiry" : "inquiries"}
            {filters.q || filters.source || filters.date !== "all" || filters.bedrooms || filters.bathrooms ? " matching filters" : " total"}
          </p>
        </section>

        <FilterToolbar filters={filters} />

        {leads.length === 0 ? (
          <section className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {filteredCount === 0
                ? hasActiveFilters(filters)
                  ? "No inquiries match your search."
                  : "No service inquiries yet."
                : "No inquiries on this page."}
            </h2>
            {filteredCount === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                {hasActiveFilters(filters)
                  ? "Try adjusting or clearing your filters."
                  : "New estimate and service inquiry requests will appear here."}
              </p>
            )}
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] divide-y divide-slate-200 text-sm">
                <TableHeader filters={filters} />
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="text-slate-700 hover:bg-slate-50/70">
                      <td className="max-w-56 px-4 py-4 font-semibold text-slate-900">{lead.full_name || "—"}</td>
                      <td className="max-w-64 break-all px-4 py-4">{lead.email || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4">{lead.phone || "—"}</td>
                      <td className="px-4 py-4">{lead.bedrooms ?? "—"}</td>
                      <td className="px-4 py-4">{lead.bathrooms ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-100">
                          {lead.source === "hero_quote" ? "Hero quote" : "Service inquiry"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                        <time dateTime={lead.created_at}>{formatSubmittedAt(lead.created_at)}</time>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <LeadRowActions lead={lead} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-slate-500">
                Showing {offset + 1}–{Math.min(offset + leads.length, filteredCount)} of {filteredCount}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  aria-disabled={page <= 1}
                  href={buildLeadsHref(filters, { page: String(Math.max(1, page - 1)) })}
                  className={`rounded-lg border px-3 py-2 font-semibold ${page <= 1 ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                >
                  Previous
                </Link>
                <span className="px-2 text-slate-500">Page {page} of {pageCount}</span>
                <Link
                  aria-disabled={page >= pageCount}
                  href={buildLeadsHref(filters, { page: String(Math.min(pageCount, page + 1)) })}
                  className={`rounded-lg border px-3 py-2 font-semibold ${page >= pageCount ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                >
                  Next
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function hasActiveFilters(filters: LeadFilters): boolean {
  return Boolean(
    filters.q ||
      filters.source ||
      filters.date !== "all" ||
      filters.bedrooms ||
      filters.bathrooms,
  );
}
