import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, House, MapPin, Phone, Sparkles, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { requireStaff } from "@/app/lib/staff-auth";
import { getStaffJobById } from "@/app/lib/staff-jobs";
import {
  formatBookingTime,
  formatCustomerBookingDate,
  formatCustomerBookingStatus,
} from "@/app/lib/customer-bookings-pure";
import { formatBookingTimeRange } from "@/app/lib/booking-duration-pure";
import StaffJobActions from "@/app/components/staff/StaffJobActions";
import StaffPortalShell from "@/app/components/staff/StaffPortalShell";

type StaffJobPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function StaffJobDetailPage({
  params,
}: StaffJobPageProps) {
  const staff = await requireStaff();
  const { bookingId: raw } = await params;
  const bookingId = Number(raw);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    notFound();
  }

  const job = await getStaffJobById(staff.id, bookingId);
  if (!job) {
    notFound();
  }

  const statusTone = job.status === "completed"
    ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
    : job.status === "in_progress"
      ? "bg-sky-50 text-sky-800 ring-sky-200"
      : job.status === "cancelled"
        ? "bg-slate-100 text-slate-600 ring-slate-200"
        : "bg-amber-50 text-amber-800 ring-amber-200";

  return (
    <StaffPortalShell staff={staff}>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/staff"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> All jobs
        </Link>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="min-w-0 space-y-4">
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">
              <div className="border-b border-slate-100 p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">Job #{job.id}</p>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusTone}`}>{formatCustomerBookingStatus(job.status)}</span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{job.service?.trim() || "Cleaning"}</h1>
                <div className="mt-5 grid gap-3 rounded-2xl bg-sky-50 p-4 sm:grid-cols-[auto_1fr] sm:items-center sm:p-5">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-white text-sky-800 shadow-sm">
                    <CalendarDays aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Appointment</p>
                    <p className="mt-1 text-base font-semibold text-slate-950 sm:text-lg">{formatCustomerBookingDate(job.booking_date)}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Clock3 aria-hidden="true" className="size-4 shrink-0" />
                      {job.duration_minutes != null ? formatBookingTimeRange(job.booking_time, job.duration_minutes) : formatBookingTime(job.booking_time)}
                    </p>
                  </div>
                </div>
              </div>

              <dl className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
                <InfoCard icon={<MapPin aria-hidden="true" className="size-4" />} label="Service address">
                  <span className="whitespace-pre-wrap">{job.location || "Address unavailable"}</span>
                </InfoCard>
                <InfoCard icon={<UserRound aria-hidden="true" className="size-4" />} label="Customer">
                  <span>{job.name}</span>
                  {job.mobile?.trim() ? <a className="mt-1 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-sky-800 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600" href={`tel:${job.mobile}`}><Phone aria-hidden="true" className="size-4" />{job.mobile}</a> : <span className="mt-1 text-sm text-slate-500">No phone provided</span>}
                </InfoCard>
                <InfoCard icon={<House aria-hidden="true" className="size-4" />} label="Home details">
                  <span>{job.bedrooms} {job.bedrooms === 1 ? "bedroom" : "bedrooms"}</span>
                  <span>{job.bathrooms} {job.bathrooms === 1 ? "bathroom" : "bathrooms"}</span>
                  {job.frequency ? <span className="mt-1 text-sm font-medium capitalize text-slate-600">{job.frequency}</span> : null}
                </InfoCard>
                <InfoCard icon={<Sparkles aria-hidden="true" className="size-4" />} label="Cleaning requirements">
                  {job.extras.length > 0 ? <ul className="space-y-1">{job.extras.map((extra) => <li key={extra} className="flex gap-2"><span aria-hidden="true" className="text-sky-700">•</span>{extra}</li>)}</ul> : <span>No add-ons</span>}
                </InfoCard>
              </dl>

              {job.notes?.trim() ? (
                <div className="border-t border-slate-100 px-5 py-5 sm:px-7">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Special instructions</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-800">{job.notes}</p>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <section aria-labelledby="job-actions-title" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-5">
              <h2 id="job-actions-title" className="text-base font-semibold text-slate-950">Job status</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">Update your progress when you arrive and finish.</p>
              <StaffJobActions bookingId={job.id} status={job.status} />
            </section>
          </aside>
        </div>
      </div>
    </StaffPortalShell>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="text-sky-700">{icon}</span>{label}
      </dt>
      <dd className="mt-2 flex min-w-0 flex-col break-words text-sm font-medium leading-6 text-slate-900">{children}</dd>
    </div>
  );
}
