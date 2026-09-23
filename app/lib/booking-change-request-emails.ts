import "server-only";

import { sendEmail } from "@/app/lib/email";
import {
  formatChangeRequestTypeLabel,
  type BookingChangeRequestType,
} from "@/app/lib/booking-change-requests-pure";
import { formatCustomerBookingDate, formatBookingTime } from "@/app/lib/customer-bookings-pure";

type ChangeRequestEmailPayload = {
  id: number;
  booking_id: number;
  request_type: BookingChangeRequestType;
  requested_date: string | Date | null;
  requested_time?: string | null;
  reason: string | null;
  customer_message: string | null;
};

function getAdminNotificationEmail(): string | null {
  return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || null;
}

export async function notifyAdminBookingChangeRequest(input: {
  request: ChangeRequestEmailPayload;
  booking: {
    id: number;
    name: string;
    email: string;
    service: string | null;
    booking_date: string | Date | null;
    booking_time?: string | null;
    location: string | null;
  };
}) {
  const to = getAdminNotificationEmail();
  if (!to) {
    return { status: "skipped" as const, reason: "ADMIN_NOTIFICATION_EMAIL not configured" };
  }

  const typeLabel = formatChangeRequestTypeLabel(input.request.request_type);
  const lines = [
    `A customer submitted a booking ${typeLabel.toLowerCase()} request.`,
    "",
    `Booking #: ${input.booking.id}`,
    `Customer: ${input.booking.name}`,
    `Booking email: ${input.booking.email}`,
    `Service: ${input.booking.service ?? "—"}`,
    `Location: ${input.booking.location ?? "—"}`,
    `Current date: ${formatCustomerBookingDate(input.booking.booking_date)}`,
    `Current time: ${formatBookingTime(input.booking.booking_time)}`,
    `Request type: ${typeLabel}`,
  ];

  if (input.request.request_type === "reschedule") {
    lines.push(
      `Requested date: ${formatCustomerBookingDate(input.request.requested_date)}`,
      `Requested time: ${formatBookingTime(input.request.requested_time)}`,
    );
  }

  if (input.request.reason) {
    lines.push(`Reason: ${input.request.reason}`);
  }

  lines.push("", `Request ID: ${input.request.id}`);

  return sendEmail({
    to,
    subject: `Booking change request — Saskia Cleaning (#${input.booking.id})`,
    text: lines.join("\n"),
  });
}

export async function notifyCustomerBookingChangeResolution(input: {
  request: ChangeRequestEmailPayload;
  bookingEmail: string;
  bookingName: string;
  service: string | null;
  outcome: "approved" | "rejected";
}) {
  const to = input.bookingEmail.trim();
  if (!to) {
    return { status: "skipped" as const, reason: "No booking email" };
  }

  const typeLabel = formatChangeRequestTypeLabel(
    input.request.request_type as BookingChangeRequestType,
  );

  let subject: string;
  let body: string[];

  if (input.outcome === "approved") {
    if (input.request.request_type === "cancel") {
      subject = "Cancellation confirmed — Saskia Cleaning";
      body = [
        `Hi ${input.bookingName},`,
        "",
        "Your cancellation request has been approved.",
        `Service: ${input.service ?? "Cleaning"}`,
        `Booking #: ${input.request.booking_id}`,
        "",
        "If you need a new cleaning later, you can book again anytime at saskiaservices.com.",
      ];
    } else {
      subject = "New service date confirmed — Saskia Cleaning";
      body = [
        `Hi ${input.bookingName},`,
        "",
        "Your reschedule request has been approved.",
        `Service: ${input.service ?? "Cleaning"}`,
        `Booking #: ${input.request.booking_id}`,
        `New date: ${formatCustomerBookingDate(input.request.requested_date)}`,
        `New time: ${formatBookingTime(input.request.requested_time)}`,
      ];
    }
  } else {
    subject = "Update on your booking change request — Saskia Cleaning";
    body = [
      `Hi ${input.bookingName},`,
      "",
      `We could not approve your ${typeLabel.toLowerCase()} request for booking #${input.request.booking_id}.`,
    ];
    if (input.request.customer_message) {
      body.push("", input.request.customer_message);
    }
    body.push(
      "",
      "You may submit a new request from your account if you still need a change.",
    );
  }

  body.push("", "— Saskia Cleaning");

  return sendEmail({
    to,
    subject,
    text: body.join("\n"),
  });
}
