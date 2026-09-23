import Link from "next/link";
import { requireStaff } from "@/app/lib/staff-auth";
import { listStaffJobs, partitionStaffJobs } from "@/app/lib/staff-jobs";
import {
  formatBookingTime,
  formatCustomerBookingDate,
  formatCustomerBookingStatus,
} from "@/app/lib/customer-bookings-pure";
import { formatBookingTimeRange } from "@/app/lib/booking-duration-pure";
import { getZonedDateParts, SASKIA_TIME_ZONE } from "@/app/lib/scheduling-pure";
import { signOut } from "@/auth";

export default async function StaffHomePage() {
  const staff = await requireStaff();
  const jobs = await listStaffJobs(staff.id);
  const today = getZonedDateParts(new Date(), SASKIA_TIME_ZONE).dateOnly;
  const { today: todayJobs, upcoming, history } = partitionStaffJobs(
    jobs,
    today,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-600">
              Staff
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              Hi, {staff.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{staff.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/staff/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Sign out
            </button>
          </form>
        </header>

        <JobSection title="Today" jobs={todayJobs} empty="No jobs today." />
        <JobSection
          title="Upcoming"
          jobs={upcoming}
          empty="No upcoming jobs."
        />
        <JobSection
          title="Recent"
          jobs={history.slice(0, 8)}
          empty="No past jobs yet."
        />
      </div>
    </main>
  );
}

function JobSection({
  title,
  jobs,
  empty,
}: {
  title: string;
  jobs: Awaited<ReturnType<typeof listStaffJobs>>;
  empty: string;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h2>
      {jobs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          {empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/staff/jobs/${job.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {job.service?.trim() || "Cleaning"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatCustomerBookingDate(job.booking_date)} ·{" "}
                      {job.duration_minutes != null
                        ? formatBookingTimeRange(
                            job.booking_time,
                            job.duration_minutes,
                          )
                        : formatBookingTime(job.booking_time)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {job.location || "Location TBD"}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    {formatCustomerBookingStatus(job.status)}
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
