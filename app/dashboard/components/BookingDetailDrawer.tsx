"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  BOOKING_STATUS_BADGE_CLASS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUSES,
  type BookingStatus,
} from "../../lib/booking-status";
import BookingAssignControl from "../BookingAssignControl";
import type { BookingRequest } from "../DashboardTable";

type BookingDetailDrawerProps = {
  booking: BookingRequest | null;
  isOpen: boolean;
  submittedLabel: string;
  appointmentLabel: string;
  extras: string[];
  capacityBadge: ReactNode;
  estimateContent: ReactNode;
  referralContent: ReactNode;
  assigned: boolean;
  onClose: () => void;
  onStatusChange: (bookingId: number, status: BookingStatus) => void | Promise<void>;
  onDelete: (bookingId: number) => void | Promise<void>;
};

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 py-4 last:border-b-0">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailValue({
  label,
  children,
  valueClassName = "",
}: {
  label: string;
  children: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <div
        className={`mt-1 min-w-0 break-words text-sm leading-5 text-slate-800 [overflow-wrap:anywhere] ${valueClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function BookingDetailDrawer({
  booking,
  isOpen,
  submittedLabel,
  appointmentLabel,
  extras,
  capacityBadge,
  estimateContent,
  referralContent,
  assigned,
  onClose,
  onStatusChange,
  onDelete,
}: BookingDetailDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [entered, setEntered] = useState(false);
  const router = useRouter();
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSaved, setCustomerSaved] = useState(false);
  const [profileOverride, setProfileOverride] = useState<{
    id: string;
    name: string | null;
    phone: string | null;
  } | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setEditingCustomer(false);
    setCustomerError(null);
    setCustomerSaved(false);
    setProfileOverride(null);
  }, [booking?.id]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeIsInDialog = dialogRef.current?.contains(document.activeElement);
      if (!activeIsInDialog) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  if (!booking || !isOpen) return null;

  const isNew = !booking.seen;
  const customerNameValue =
    profileOverride?.id === booking.profile_customer_id
      ? profileOverride.name ?? booking.name
      : booking.profile_name ?? booking.name;
  const customerPhoneValue =
    profileOverride?.id === booking.profile_customer_id
      ? profileOverride.phone
      : booking.profile_phone ?? booking.mobile;
  const customerEmailValue = booking.profile_email ?? booking.email;

  const beginCustomerEdit = () => {
    setCustomerName(customerNameValue);
    setCustomerPhone(customerPhoneValue ?? "");
    setCustomerError(null);
    setCustomerSaved(false);
    setEditingCustomer(true);
  };

  const saveCustomer = async () => {
    if (!booking.profile_customer_id || savingCustomer) return;
    setSavingCustomer(true);
    setCustomerError(null);
    try {
      const response = await fetch(
        `/api/dashboard/customers/${encodeURIComponent(booking.profile_customer_id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: customerName, phone: customerPhone }),
        },
      );
      const result = (await response.json().catch(() => null)) as
        | { profile?: { id: string; name: string | null; phone: string | null }; error?: string }
        | null;
      if (!response.ok || !result?.profile) {
        setCustomerError(result?.error || "Customer details could not be saved. Try again.");
        return;
      }
      setProfileOverride(result.profile);
      setCustomerName(result.profile.name ?? "");
      setCustomerPhone(result.profile.phone ?? "");
      setEditingCustomer(false);
      setCustomerSaved(true);
      router.refresh();
    } catch {
      setCustomerError("Customer details could not be saved. Check your connection and try again.");
    } finally {
      setSavingCustomer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close booking details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/15 transition-opacity focus-visible:outline-none"
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
        className={`absolute inset-y-0 right-0 flex h-dvh w-full max-w-full flex-col border-l border-slate-200 bg-white shadow-[-16px_0_40px_rgba(15,23,42,0.12)] transition-transform duration-200 ease-out motion-reduce:transition-none sm:w-[min(450px,92vw)] ${entered ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="sticky top-0 z-10 shrink-0 border-b border-slate-100 bg-white px-5 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))] sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id="booking-detail-title"
                className="text-xl font-semibold tracking-tight text-slate-950"
              >
                Booking details
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close booking details"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              <X aria-hidden="true" className="size-[18px]" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {isNew && (
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                Needs review
              </span>
            )}
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${BOOKING_STATUS_BADGE_CLASS[booking.status]}`}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
            {capacityBadge}
          </div>
          <p className="mt-2 break-words text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">
            Submitted {submittedLabel}
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6">
          <DetailSection title="Customer">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {booking.profile_customer_id ? "Customer profile" : "Booking contact"}
              </span>
              {booking.profile_customer_id && !editingCustomer && (
                <button
                  type="button"
                  onClick={beginCustomerEdit}
                  className="min-h-10 rounded-lg px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Edit customer
                </button>
              )}
            </div>
            {editingCustomer ? (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-600">
                  Name
                  <input
                    autoComplete="name"
                    maxLength={80}
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Phone
                  <input
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <DetailValue label="Email" valueClassName="text-slate-600">
                  {customerEmailValue}
                </DetailValue>
                <p className="text-xs leading-5 text-slate-500">
                  Email is managed separately because it is used for account authentication.
                </p>
                {customerError && (
                  <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {customerError}
                  </p>
                )}
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={savingCustomer}
                    onClick={() => { setEditingCustomer(false); setCustomerError(null); }}
                    className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingCustomer}
                    onClick={() => void saveCustomer()}
                    className="min-h-11 rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-wait disabled:opacity-60"
                  >
                    {savingCustomer ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <DetailValue label="Name" valueClassName="font-semibold text-slate-900">
                  {customerNameValue}
                </DetailValue>
                <DetailValue label="Email" valueClassName="text-slate-600">
                  {customerEmailValue}
                </DetailValue>
                <DetailValue label="Phone" valueClassName="text-slate-600">
                  {customerPhoneValue || "—"}
                </DetailValue>
                {customerSaved && (
                  <p role="status" className="text-sm font-medium text-emerald-700">
                    Customer profile updated.
                  </p>
                )}
                {!booking.profile_customer_id && (
                  <p className="text-xs leading-5 text-slate-500">
                    Customer profile editing is unavailable for this booking.
                  </p>
                )}
              </div>
            )}
          </DetailSection>

          <DetailSection title="Appointment">
            <DetailValue
              label="Requested date and time"
              valueClassName="font-semibold text-slate-900"
            >
              {appointmentLabel}
            </DetailValue>
          </DetailSection>

          <DetailSection title="Service">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailValue label="Service">{booking.service || "—"}</DetailValue>
              <DetailValue label="Frequency">{booking.frequency || "One-time"}</DetailValue>
              <DetailValue label="Bedrooms">{booking.bedrooms}</DetailValue>
              <DetailValue label="Bathrooms">{booking.bathrooms}</DetailValue>
            </div>
          </DetailSection>

          <DetailSection title="Property">
            <DetailValue label="Address / location" valueClassName="whitespace-normal">
              {booking.location || "—"}
            </DetailValue>
          </DetailSection>

          <DetailSection title="Extras">
            {extras.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {extras.map((extra, index) => (
                  <span
                    key={`${extra}-${index}`}
                    className="max-w-full break-words rounded-full bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-700 [overflow-wrap:anywhere]"
                  >
                    {extra}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No extras selected</p>
            )}
          </DetailSection>

          <DetailSection title="Notes">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
              {booking.notes?.trim() || "No additional notes."}
            </p>
          </DetailSection>

          <DetailSection title="Estimate">
            <div className="text-sm [&>span]:text-xl [&>span]:font-semibold [&>span]:text-slate-900 [&>div>p:last-child]:text-base [&>div>p:last-child]:font-semibold">
              {estimateContent}
            </div>
          </DetailSection>

          <DetailSection title="Assignment">
            {!assigned && (
              <span className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                Unassigned
              </span>
            )}
            <div className="min-w-0 [&_button]:max-w-full [&_button]:whitespace-normal [&_select]:min-w-0">
              <BookingAssignControl bookingId={booking.id} />
            </div>
          </DetailSection>

          <DetailSection title="Status">
            <label
              htmlFor={`drawer-status-${booking.id}`}
              className="mb-1.5 block text-xs text-slate-500"
            >
              Booking status
            </label>
            <select
              id={`drawer-status-${booking.id}`}
              aria-label={`Status for ${booking.name}`}
              value={booking.status}
              onChange={(event) =>
                onStatusChange(booking.id, event.target.value as BookingStatus)
              }
              className={`min-h-11 w-full rounded-xl border px-3 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-sky-200 ${BOOKING_STATUS_BADGE_CLASS[booking.status]}`}
            >
              {BOOKING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {BOOKING_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </DetailSection>

          <DetailSection title="Referral">
            {referralContent ?? (
              <p className="text-sm text-slate-500">No referral</p>
            )}
          </DetailSection>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void onDelete(booking.id)}
            className="min-h-10 rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            Delete booking
          </button>
        </footer>
      </aside>
    </div>
  );
}
