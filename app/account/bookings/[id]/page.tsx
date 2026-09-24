import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerBookingById } from "@/app/lib/customer-bookings";
import {
  getLatestChangeRequestForBooking,
  getPendingChangeRequestForBooking,
} from "@/app/lib/booking-change-requests";
import { canRequestBookingChange } from "@/app/lib/booking-change-requests-pure";
import {
  buildBookAgainHref,
  formatBookingTime,
  formatCustomerBookingDate,
  formatCustomerBookingStatus,
  formatCustomerEstimate,
  getCustomerBookingStatusBadgeClass,
} from "@/app/lib/customer-bookings-pure";
import BookingChangeRequestPanel from "@/app/components/account/BookingChangeRequestPanel";
import AccountHero from "@/app/components/account/AccountHero";
import { formatCustomerDurationLabel } from "@/app/lib/booking-duration-pure";

type AccountBookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export default async function AccountBookingDetailPage({
  params,
}: AccountBookingDetailPageProps) {
  const customer = await requireCustomer("/login");
  const { id: idParam } = await params;
  const bookingId = Number(idParam);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    notFound();
  }

  let booking = null;
  try {
    booking = await getCustomerBookingById(customer.id, bookingId);
  } catch (error) {
    console.error("Failed to load customer booking detail");
    void error;
    notFound();
  }

  if (!booking) {
    notFound();
  }

  const [pendingRequest, latestRequest] = await Promise.all([
    getPendingChangeRequestForBooking(customer.id, bookingId),
    getLatestChangeRequestForBooking(customer.id, bookingId),
  ]);

  const canRequest =
    canRequestBookingChange({
      status: booking.status,
      requestType: "cancel",
    }) ||
    canRequestBookingChange({
      status: booking.status,
      requestType: "reschedule",
    });

  const latestResolvedRequest =
    latestRequest && latestRequest.status !== "pending"
      ? {
          request_type: latestRequest.request_type,
          requested_date: latestRequest.requested_date,
          requested_time: latestRequest.requested_time,
          status: latestRequest.status as
            | "approved"
            | "rejected"
            | "cancelled_by_customer",
          customer_message: latestRequest.customer_message,
        }
      : null;

  const statusLabel = formatCustomerBookingStatus(booking.status);
  const statusClass = getCustomerBookingStatusBadgeClass(booking.status);
  const estimate = formatCustomerEstimate(
    booking.estimate_low,
    booking.estimate_mid,
    booking.estimate_high,
  );
  const serviceLabel = booking.service?.trim() || "Cleaning service";

  return (
    <>
      <AccountHero
        eyebrow={`Booking #${booking.id}`}
        title={serviceLabel}
        description="Review booking details and request changes when available."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/account/bookings"
          className="text-sm font-medium text-slate-500 transition hover:text-sky-600"
        >
          ← My Bookings
        </Link>
        <Link
          href={buildBookAgainHref({ service: booking.service })}
          className="rounded-full border border-sky-500 bg-sky-500 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-sky-600"
        >
          Book Again
        </Link>
      </div>

      <section className="rounded-[28px] border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Booking summary
            </h2>
          </div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-6">
          <dl>
            <DetailRow label="Service date">
              {formatCustomerBookingDate(booking.booking_date)}
            </DetailRow>
            <DetailRow label="Appointment time">
              {formatBookingTime(booking.booking_time)}
            </DetailRow>
            <DetailRow label="Estimated duration">
              {formatCustomerDurationLabel(booking.duration_minutes) ??
                "Duration not specified"}
            </DetailRow>
            <DetailRow label="Status">{statusLabel}</DetailRow>
            <DetailRow label="Estimate">{estimate}</DetailRow>
            {booking.frequency ? (
              <DetailRow label="Frequency">{booking.frequency}</DetailRow>
            ) : null}
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
            Service location
          </h2>
          <dl className="mt-2">
            <DetailRow label="Location">
              {booking.location?.trim() || "—"}
            </DetailRow>
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
            Cleaning details
          </h2>
          <dl className="mt-2">
            <DetailRow label="Bedrooms">{booking.bedrooms}</DetailRow>
            <DetailRow label="Bathrooms">{booking.bathrooms}</DetailRow>
            <DetailRow label="Add-ons">
              {booking.extras.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4">
                  {booking.extras.map((extra) => (
                    <li key={extra}>{extra}</li>
                  ))}
                </ul>
              ) : (
                "None"
              )}
            </DetailRow>
          </dl>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
            Contact
          </h2>
          <dl className="mt-2">
            <DetailRow label="Name">{booking.name}</DetailRow>
            <DetailRow label="Email">{booking.email}</DetailRow>
            <DetailRow label="Mobile">
              {booking.mobile?.trim() || "—"}
            </DetailRow>
            {booking.notes?.trim() ? (
              <DetailRow label="Notes">{booking.notes}</DetailRow>
            ) : null}
          </dl>
        </div>

        {booking.referral_code ? (
          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Referral
            </h2>
            <dl className="mt-2">
              <DetailRow label="Code used">{booking.referral_code}</DetailRow>
            </dl>
          </div>
        ) : null}

        <BookingChangeRequestPanel
          bookingId={booking.id}
          service={booking.service}
          bookingDate={booking.booking_date}
          bookingTime={booking.booking_time}
          location={booking.location}
          status={booking.status}
          canRequest={canRequest}
          pendingRequest={
            pendingRequest
              ? {
                  request_type: pendingRequest.request_type,
                  requested_date: pendingRequest.requested_date,
                  requested_time: pendingRequest.requested_time,
                  reason: pendingRequest.reason,
                  status: pendingRequest.status,
                  customer_message: pendingRequest.customer_message,
                }
              : null
          }
          latestResolvedRequest={latestResolvedRequest}
        />
      </section>
    </>
  );
}
