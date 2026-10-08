import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, Phone } from "lucide-react";
import { requireStaff } from "@/app/lib/staff-auth";
import { listStaffJobs, partitionStaffJobs } from "@/app/lib/staff-jobs";
import {
  formatBookingTime,
  formatCustomerBookingDate,
  formatCustomerBookingStatus,
} from "@/app/lib/customer-bookings-pure";
import { formatBookingTimeRange } from "@/app/lib/booking-duration-pure";
import { getZonedDateParts, SASKIA_TIME_ZONE } from "@/app/lib/scheduling-pure";
import StaffPortalShell from "@/app/components/staff/StaffPortalShell";

export default async function StaffHomePage() {
  const staff = await requireStaff();
  const jobs = await listStaffJobs(staff.id);
  const today = getZonedDateParts(new Date(), SASKIA_TIME_ZONE).dateOnly;
  const { today: todayJobs, upcoming, history } = partitionStaffJobs(
    jobs,
    today,
  );
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: SASKIA_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <StaffPortalShell staff={staff}>
      <div className="space-y-8 sm:space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.045)] sm:p-7 lg:p-8">
          <div className="absolute right-0 top-0 hidden h-full w-1/3 bg-gradient-to-bl from-sky-50 to-transparent sm:block" aria-hidden="true" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Your schedule</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Good day, {staff.name.trim().split(/\s+/)[0]}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-sky-700" />
                {todayLabel}
              </p>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 sm:min-w-36">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block text-xl font-semibold tabular-nums text-slate-950">{todayJobs.length}</span>
                <span className="block text-xs font-medium text-slate-600">{todayJobs.length === 1 ? "job today" : "jobs today"}</span>
              </span>
            </div>
          </div>
        </section>

        <JobSection title="Today" description="Your assigned jobs for today." jobs={todayJobs} empty="You’re all clear today. No jobs are scheduled." emphasis />
        <JobSection
          title="Upcoming"
          description="What’s next on your schedule."
          jobs={upcoming}
          empty="No upcoming jobs."
        />
        <JobSection
          title="Recent"
          description="Your latest completed or past jobs."
          jobs={history.slice(0, 8)}
          empty="No past jobs yet."
        />
      </div>
    </StaffPortalShell>
  );
}

function JobSection({
  title,
  description,
  jobs,
  empty,
  emphasis = false,
}: {
  title: string;
  description: string;
  jobs: Awaited<ReturnType<typeof listStaffJobs>>;
  empty: string;
  emphasis?: boolean;
}) {
  return (
    <section aria-labelledby={`jobs-${title.toLowerCase()}`}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 id={`jobs-${title.toLowerCase()}`} className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">{jobs.length}</span>
      </div>
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center sm:py-10">
          <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-700">{empty}</p>
        </div>
      ) : (
        <ul className={`grid min-w-0 gap-3 ${emphasis ? "lg:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-3"}`}>
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/staff/jobs/${job.id}`}
                className="group block h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:p-5"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold tracking-tight text-slate-950">{job.service?.trim() || "Cleaning"}</p>
                      <p className="mt-1 text-sm text-slate-600">{job.name}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className={`mt-4 rounded-xl px-3.5 py-3 ${emphasis ? "bg-sky-50" : "bg-slate-50"}`}>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Clock3 aria-hidden="true" className="size-4 shrink-0 text-sky-700" />
                      <span>{formatCustomerBookingDate(job.booking_date)} · {job.duration_minutes != null ? formatBookingTimeRange(job.booking_time, job.duration_minutes) : formatBookingTime(job.booking_time)}</span>
                    </p>
                  </div>
                  <div className="mt-3 flex min-w-0 items-start gap-2 text-sm text-slate-600">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <span className="line-clamp-2 min-w-0">{job.location || "Location TBD"}</span>
                  </div>
                  {job.mobile ? <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Phone aria-hidden="true" className="size-3.5 shrink-0" />{job.mobile}</p> : null}
                  <span className="mt-auto flex items-center justify-end gap-1 pt-4 text-sm font-semibold text-sky-800">
                    View job <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "completed"
    ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
    : status === "in_progress"
      ? "bg-sky-50 text-sky-800 ring-sky-200"
      : status === "cancelled"
        ? "bg-slate-100 text-slate-600 ring-slate-200"
        : "bg-amber-50 text-amber-800 ring-amber-200";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone}`}>{formatCustomerBookingStatus(status)}</span>;
}
