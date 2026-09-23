import Link from "next/link";
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/staff"
          className="text-sm font-medium text-slate-500 hover:text-sky-600"
        >
          ← All jobs
        </Link>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-600">
            Job #{job.id}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            {job.service?.trim() || "Cleaning"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {formatCustomerBookingStatus(job.status)}
          </p>

          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                When
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {formatCustomerBookingDate(job.booking_date)} ·{" "}
                {job.duration_minutes != null
                  ? formatBookingTimeRange(
                      job.booking_time,
                      job.duration_minutes,
                    )
                  : formatBookingTime(job.booking_time)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Location
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {job.location || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Customer
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">{job.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Phone
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {job.mobile?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Rooms
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {job.bedrooms} bed · {job.bathrooms} bath
              </dd>
            </div>
            {job.frequency ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Frequency
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {job.frequency}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Add-ons
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {job.extras.length > 0 ? job.extras.join(", ") : "None"}
              </dd>
            </div>
            {job.notes?.trim() ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Notes
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap font-medium text-slate-900">
                  {job.notes}
                </dd>
              </div>
            ) : null}
          </dl>

          <StaffJobActions bookingId={job.id} status={job.status} />
        </section>
      </div>
    </main>
  );
}
