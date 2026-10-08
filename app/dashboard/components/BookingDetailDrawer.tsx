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
import { BATH_VALS, STANDARD_BEDROOM_VALUES } from "@/app/components/estimator/constants";
import {
  BOOKING_SERVICE_LABELS,
  COMMERCIAL_SCHEDULES,
  COMMERCIAL_SQUARE_FOOTAGE_LABELS,
  DEEP_CLEAN_CONDITION_LABELS,
  DEEP_CLEAN_SIZE_LABELS,
  MOVE_OUT_SQUARE_FOOTAGE_LABELS,
  STANDARD_FREQUENCIES,
  priceBookingSelections,
  pricingExtrasForService,
  resolveBookingPricingInputs,
  type PricingInputSnapshot,
} from "@/app/lib/booking-pricing-pure";

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

type PricingFormSelections = {
  bathroomIndex: number | null;
  deepCleanSizeIndex: number | null;
  deepCleanConditionIndex: number | null;
  moveOutSquareFootageIndex: number | null;
  commercialSquareFootageIndex: number | null;
  commercialScheduleIndex: number | null;
};

function bookingDateInputValue(date: string | Date | null): string {
  if (!date) return "";
  const value = date instanceof Date ? date.toISOString().slice(0, 10) : String(date).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function appointmentTimeInputValue(time: string | null | undefined): string {
  const match = typeof time === "string" ? time.match(/^(\d{1,2}:\d{2})/) : null;
  return match ? match[1].padStart(5, "0") : "";
}

function formatAppointmentValue(date: string | Date | null, time: string | null | undefined): string {
  const dateOnly = bookingDateInputValue(date);
  if (!dateOnly) return "—";
  const [year, month, day] = dateOnly.split("-").map(Number);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
  const parsedTime = appointmentTimeInputValue(time);
  if (!parsedTime) return `${dateLabel} · Time not specified`;
  const [hour, minute] = parsedTime.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  return `${dateLabel} · ${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`;
}

function pricingFormFromSnapshot(snapshot: PricingInputSnapshot | null): PricingFormSelections {
  return {
    bathroomIndex: snapshot?.kind === "standard" ? snapshot.bathroomIndex : null,
    deepCleanSizeIndex: snapshot?.kind === "deep-clean" ? snapshot.sizeIndex : null,
    deepCleanConditionIndex: snapshot?.kind === "deep-clean" ? snapshot.conditionIndex : null,
    moveOutSquareFootageIndex: snapshot?.kind === "move-out" ? snapshot.squareFootageIndex : null,
    commercialSquareFootageIndex: snapshot?.kind === "commercial" ? snapshot.squareFootageIndex : null,
    commercialScheduleIndex: snapshot?.kind === "commercial" ? snapshot.scheduleIndex : null,
  };
}

function snapshotForService(service: string, selection: PricingFormSelections): PricingInputSnapshot | null {
  if (service === "Standard" && selection.bathroomIndex != null) {
    return { version: 1, kind: "standard", bathroomIndex: selection.bathroomIndex };
  }
  if (service === "Deep clean" && selection.deepCleanSizeIndex != null && selection.deepCleanConditionIndex != null) {
    return { version: 1, kind: "deep-clean", sizeIndex: selection.deepCleanSizeIndex, conditionIndex: selection.deepCleanConditionIndex };
  }
  if (service === "Move-out" && selection.moveOutSquareFootageIndex != null) {
    return { version: 1, kind: "move-out", squareFootageIndex: selection.moveOutSquareFootageIndex };
  }
  if (service === "Commercial" && selection.commercialSquareFootageIndex != null && selection.commercialScheduleIndex != null) {
    return { version: 1, kind: "commercial", squareFootageIndex: selection.commercialSquareFootageIndex, scheduleIndex: selection.commercialScheduleIndex };
  }
  return null;
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
  const [editingBooking, setEditingBooking] = useState(false);
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingService, setBookingService] = useState("");
  const [bookingFrequency, setBookingFrequency] = useState("");
  const [bookingBedrooms, setBookingBedrooms] = useState("");
  const [bookingBathrooms, setBookingBathrooms] = useState("");
  const [bookingExtras, setBookingExtras] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [appointmentTimes, setAppointmentTimes] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingAppointmentTimes, setLoadingAppointmentTimes] = useState(false);
  const [appointmentTimesError, setAppointmentTimesError] = useState<string | null>(null);
  const [pricingForm, setPricingForm] = useState<PricingFormSelections>(pricingFormFromSnapshot(null));
  const [canEditPricing, setCanEditPricing] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSaved, setBookingSaved] = useState(false);
  const [bookingOverride, setBookingOverride] = useState<{
    id: number;
    location: string | null;
    notes: string | null;
    booking_date?: string | Date | null;
    booking_time?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !editingBooking || !booking || !bookingDate) return;
    const controller = new AbortController();
    setLoadingAppointmentTimes(true);
    setAppointmentTimesError(null);
    fetch(`/api/dashboard/bookings/${booking.id}/details?date=${encodeURIComponent(bookingDate)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null) as
          | { times?: Array<{ value: string; label: string }>; error?: string }
          | null;
        if (!response.ok || !result?.times) throw new Error(result?.error || "Appointment times could not be loaded.");
        setAppointmentTimes(result.times);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setAppointmentTimes([]);
        setAppointmentTimesError(error instanceof Error ? error.message : "Appointment times could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingAppointmentTimes(false);
      });
    return () => controller.abort();
  }, [isOpen, editingBooking, booking?.id, bookingDate]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setEditingCustomer(false);
    setCustomerError(null);
    setCustomerSaved(false);
    setProfileOverride(null);
    setEditingBooking(false);
    setBookingError(null);
    setBookingSaved(false);
    setBookingOverride(null);
    setCanEditPricing(false);
    setAppointmentTimes([]);
    setAppointmentTimesError(null);
    setBookingDate("");
    setBookingTime("");
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
  const bookingLocationValue =
    bookingOverride?.id === booking.id
      ? bookingOverride.location
      : booking.location;
  const bookingNotesValue =
    bookingOverride?.id === booking.id ? bookingOverride.notes : booking.notes;
  const currentBookingDate = bookingDateInputValue(
    bookingOverride?.id === booking.id && bookingOverride.booking_date !== undefined
      ? bookingOverride.booking_date
      : booking.booking_date,
  );
  const currentBookingTime = appointmentTimeInputValue(
    bookingOverride?.id === booking.id && bookingOverride.booking_time !== undefined
      ? bookingOverride.booking_time
      : booking.booking_time,
  );
  const bookingAppointmentValue = bookingOverride?.id === booking.id && bookingOverride.booking_date !== undefined
    ? formatAppointmentValue(bookingOverride.booking_date, bookingOverride.booking_time)
    : appointmentLabel;
  const currentPricingSnapshot = resolveBookingPricingInputs({
    service: booking.service,
    frequency: booking.frequency,
    bedrooms: booking.bedrooms,
    bathrooms: booking.bathrooms,
    extras: booking.extras,
    pricingInputs: booking.pricing_inputs,
  });
  const editorSnapshot = snapshotForService(bookingService, pricingForm);
  const editorPricingPreview = canEditPricing && editorSnapshot
    ? priceBookingSelections({
        service: bookingService,
        frequency: bookingFrequency,
        bedrooms: bookingBedrooms === "" ? Number.NaN : Number(bookingBedrooms),
        bathrooms: bookingBathrooms === "" ? Number.NaN : Number(bookingBathrooms),
        extras: bookingExtras,
        pricingInputs: editorSnapshot,
      })
    : null;
  const editorExtraCatalog = pricingExtrasForService(bookingService) ?? [];
  const editorSelectClassName = "mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

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

  const beginBookingEdit = () => {
    setBookingLocation(bookingLocationValue ?? "");
    setBookingNotes(bookingNotesValue ?? "");
    const resolvedSnapshot = currentPricingSnapshot;
    setCanEditPricing(resolvedSnapshot !== null);
    setBookingService(booking.service ?? "");
    setBookingFrequency(booking.frequency ?? "");
    setBookingBedrooms(booking.bedrooms == null ? "" : String(booking.bedrooms));
    setBookingBathrooms(booking.bathrooms == null ? "" : String(booking.bathrooms));
    setBookingExtras(extras);
    setBookingDate(currentBookingDate);
    setBookingTime(currentBookingTime);
    setPricingForm(pricingFormFromSnapshot(resolvedSnapshot));
    setBookingError(null);
    setBookingSaved(false);
    setEditingBooking(true);
  };

  const handleBookingServiceChange = (service: string) => {
    if (service === bookingService) return;
    setBookingService(service);
    setBookingExtras([]);
    setPricingForm(pricingFormFromSnapshot(null));
    if (service === "Standard") {
      setBookingBedrooms("");
      setBookingBathrooms("");
    } else {
      setBookingBedrooms("0");
      setBookingBathrooms("0");
    }
  };

  const cancelBookingEdit = () => {
    setEditingBooking(false);
    setBookingError(null);
  };

  const saveBookingDetails = async () => {
    if (savingBooking) return;
    const originalLocation = (bookingLocationValue ?? "").trim();
    const originalNotes = (bookingNotesValue ?? "").trim();
    const patch: Record<string, unknown> = {};
    const appointmentChanged = bookingDate !== currentBookingDate || bookingTime !== currentBookingTime;
    let pricingChanged = false;
    if (appointmentChanged && (!bookingDate || !bookingTime)) {
      setBookingError("Choose both an appointment date and time.");
      return;
    }
    if (bookingLocation.trim() !== originalLocation) {
      patch.location = bookingLocation;
    }
    if (bookingNotes.trim() !== originalNotes) {
      patch.notes = bookingNotes;
    }
    if (canEditPricing) {
      const originalSnapshot = resolveBookingPricingInputs({
        service: booking.service,
        frequency: booking.frequency,
        bedrooms: booking.bedrooms,
        bathrooms: booking.bathrooms,
        extras: booking.extras,
        pricingInputs: booking.pricing_inputs,
      });
      const newSnapshot = snapshotForService(bookingService, pricingForm);
      const bedrooms = bookingBedrooms === "" ? Number.NaN : Number(bookingBedrooms);
      const bathrooms = bookingBathrooms === "" ? Number.NaN : Number(bookingBathrooms);
      pricingChanged =
        bookingService !== (booking.service ?? "") ||
        (bookingService === "Standard" && (
          bookingFrequency !== (booking.frequency ?? "") ||
          bedrooms !== booking.bedrooms ||
          bathrooms !== booking.bathrooms
        )) ||
        JSON.stringify(bookingExtras) !== JSON.stringify(extras) ||
        JSON.stringify(newSnapshot) !== JSON.stringify(originalSnapshot);

      if (pricingChanged) {
        if (!newSnapshot || !Number.isInteger(bedrooms) || !Number.isInteger(bathrooms)) {
          setBookingError("Choose all pricing details for the selected service before saving.");
          return;
        }
        const preview = priceBookingSelections({
          service: bookingService,
          frequency: bookingFrequency,
          bedrooms,
          bathrooms,
          extras: bookingExtras,
          pricingInputs: newSnapshot,
        });
        if (!preview.ok) {
          setBookingError(preview.error);
          return;
        }
        patch.service = bookingService;
        patch.extras = bookingExtras;
        patch.pricingInputs = newSnapshot;
        if (bookingService === "Standard") {
          patch.frequency = bookingFrequency;
          patch.bedrooms = bedrooms;
          patch.bathrooms = bathrooms;
        } else if (booking.service === "Standard") {
          patch.bedrooms = 0;
          patch.bathrooms = 0;
        }
      }
    }
    if (appointmentChanged && pricingChanged) {
      setBookingError("Save the service change first, then edit the appointment.");
      return;
    }
    if (appointmentChanged) {
      patch.bookingDate = bookingDate;
      patch.bookingTime = bookingTime;
    }
    if (Object.keys(patch).length === 0) {
      setEditingBooking(false);
      return;
    }
    setSavingBooking(true);
    setBookingError(null);
    try {
      const response = await fetch(
        `/api/dashboard/bookings/${booking.id}/details`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
      );
      const result = (await response.json().catch(() => null)) as
        | { booking?: { id: number; location?: string | null; notes?: string | null; booking_date?: string | Date | null; booking_time?: string | null }; error?: string }
        | null;
      if (!response.ok || !result?.booking) {
        setBookingError(result?.error || "Booking details could not be saved. Try again.");
        return;
      }
      setBookingOverride({
        id: result.booking.id,
        location: Object.hasOwn(result.booking, "location") ? result.booking.location ?? null : bookingLocationValue,
        notes: Object.hasOwn(result.booking, "notes") ? result.booking.notes ?? null : bookingNotesValue,
        booking_date: result.booking.booking_date ?? booking.booking_date,
        booking_time: result.booking.booking_time ?? booking.booking_time ?? null,
      });
      setEditingBooking(false);
      setBookingSaved(true);
      router.refresh();
    } catch {
      setBookingError("Booking details could not be saved. Check your connection and try again.");
    } finally {
      setSavingBooking(false);
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="booking-detail-title"
                className="text-xl font-semibold tracking-tight text-slate-950"
              >
                Booking details
              </h2>
              {editingBooking && (
                <p className="mt-1 text-xs font-medium text-sky-700">Editing booking details</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!editingBooking && !editingCustomer && (
                <button
                  type="button"
                  onClick={beginBookingEdit}
                  className="min-h-10 rounded-lg px-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:px-3"
                >
                  Edit booking
                </button>
              )}
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
              {booking.profile_customer_id && !editingCustomer && !editingBooking && (
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
              {bookingAppointmentValue}
            </DetailValue>
            {editingBooking && (
              <div className="mt-3 space-y-3">
                <label htmlFor={`drawer-appointment-date-${booking.id}`} className="block text-xs font-medium text-slate-600">
                  Date
                  <input
                    id={`drawer-appointment-date-${booking.id}`}
                    type="date"
                    value={bookingDate}
                    onChange={(event) => { setBookingDate(event.target.value); setBookingTime(""); }}
                    disabled={savingBooking}
                    className="mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  />
                </label>
                <label htmlFor={`drawer-appointment-time-${booking.id}`} className="block text-xs font-medium text-slate-600">
                  Time
                  <select
                    id={`drawer-appointment-time-${booking.id}`}
                    value={bookingTime}
                    onChange={(event) => setBookingTime(event.target.value)}
                    disabled={savingBooking || loadingAppointmentTimes || !bookingDate}
                    className={`${editorSelectClassName} disabled:bg-slate-50`}
                  >
                    <option value="">Choose a time</option>
                    {bookingTime && !appointmentTimes.some((time) => time.value === bookingTime) && bookingDate === currentBookingDate && (
                      <option value={bookingTime}>{formatAppointmentValue(bookingDate, bookingTime).split(" · ")[1]}</option>
                    )}
                    {appointmentTimes.map((time) => <option key={time.value} value={time.value}>{time.label}</option>)}
                  </select>
                </label>
                <p aria-live="polite" className="text-xs leading-5 text-slate-500">
                  {loadingAppointmentTimes
                    ? "Loading schedule times…"
                    : appointmentTimesError
                      ? appointmentTimesError
                      : "Times follow the configured schedule. Cleaner availability and capacity are confirmed when saved."}
                </p>
              </div>
            )}
            {bookingError && editingBooking && (
              <p role="alert" aria-live="assertive" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm leading-5 text-rose-700">
                {bookingError}
              </p>
            )}
          </DetailSection>

          <DetailSection title="Service">
            {editingBooking && canEditPricing ? (
              <div className="space-y-4">
                <label className="block text-xs font-medium text-slate-600">
                  Service
                  <select className={editorSelectClassName} value={bookingService} onChange={(event) => handleBookingServiceChange(event.target.value)}>
                    <option value="">Choose a service</option>
                    {BOOKING_SERVICE_LABELS.map((service) => <option key={service} value={service}>{service}</option>)}
                  </select>
                </label>
                {bookingService === "Standard" && (
                  <>
                    <label className="block text-xs font-medium text-slate-600">
                      Frequency
                      <select className={editorSelectClassName} value={bookingFrequency} onChange={(event) => setBookingFrequency(event.target.value)}>
                        <option value="">Choose a frequency</option>
                        {STANDARD_FREQUENCIES.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                      </select>
                    </label>
                    <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                      <label className="block text-xs font-medium text-slate-600">
                        Bedrooms
                        <select className={editorSelectClassName} value={bookingBedrooms} onChange={(event) => setBookingBedrooms(event.target.value)}>
                          <option value="">Choose</option>
                          {STANDARD_BEDROOM_VALUES.map((value) => <option key={value} value={value}>{value === 0 ? "Studio" : value === 4 ? "4+ rooms" : `${value} ${value === 1 ? "room" : "rooms"}`}</option>)}
                        </select>
                      </label>
                      <label className="block text-xs font-medium text-slate-600">
                        Bathrooms
                        <select className={editorSelectClassName} value={pricingForm.bathroomIndex == null ? "" : String(pricingForm.bathroomIndex)} onChange={(event) => {
                          const index = event.target.value === "" ? null : Number(event.target.value);
                          setPricingForm((current) => ({ ...current, bathroomIndex: index }));
                          setBookingBathrooms(index == null ? "" : String(Math.ceil(BATH_VALS[index])));
                        }}>
                          <option value="">Choose</option>
                          {BATH_VALS.map((value, index) => <option key={index} value={index}>{value} {value === 1 ? "bath" : "baths"}</option>)}
                        </select>
                      </label>
                    </div>
                  </>
                )}
                {bookingService === "Deep clean" && (
                  <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Home size
                      <select className={editorSelectClassName} value={pricingForm.deepCleanSizeIndex == null ? "" : String(pricingForm.deepCleanSizeIndex)} onChange={(event) => setPricingForm((current) => ({ ...current, deepCleanSizeIndex: event.target.value === "" ? null : Number(event.target.value) }))}>
                        <option value="">Choose</option>
                        {DEEP_CLEAN_SIZE_LABELS.map((value, index) => <option key={value} value={index}>{value}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-slate-600">
                      Condition
                      <select className={editorSelectClassName} value={pricingForm.deepCleanConditionIndex == null ? "" : String(pricingForm.deepCleanConditionIndex)} onChange={(event) => setPricingForm((current) => ({ ...current, deepCleanConditionIndex: event.target.value === "" ? null : Number(event.target.value) }))}>
                        <option value="">Choose</option>
                        {DEEP_CLEAN_CONDITION_LABELS.map((value, index) => <option key={value} value={index}>{value}</option>)}
                      </select>
                    </label>
                  </div>
                )}
                {bookingService === "Move-out" && (
                  <label className="block text-xs font-medium text-slate-600">
                    Square footage
                    <select className={editorSelectClassName} value={pricingForm.moveOutSquareFootageIndex == null ? "" : String(pricingForm.moveOutSquareFootageIndex)} onChange={(event) => setPricingForm((current) => ({ ...current, moveOutSquareFootageIndex: event.target.value === "" ? null : Number(event.target.value) }))}>
                      <option value="">Choose</option>
                      {MOVE_OUT_SQUARE_FOOTAGE_LABELS.map((value, index) => <option key={value} value={index}>{value}</option>)}
                    </select>
                  </label>
                )}
                {bookingService === "Commercial" && (
                  <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Square footage
                      <select className={editorSelectClassName} value={pricingForm.commercialSquareFootageIndex == null ? "" : String(pricingForm.commercialSquareFootageIndex)} onChange={(event) => setPricingForm((current) => ({ ...current, commercialSquareFootageIndex: event.target.value === "" ? null : Number(event.target.value) }))}>
                        <option value="">Choose</option>
                        {COMMERCIAL_SQUARE_FOOTAGE_LABELS.map((value, index) => <option key={value} value={index}>{value}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-slate-600">
                      Schedule
                      <select className={editorSelectClassName} value={pricingForm.commercialScheduleIndex == null ? "" : String(pricingForm.commercialScheduleIndex)} onChange={(event) => setPricingForm((current) => ({ ...current, commercialScheduleIndex: event.target.value === "" ? null : Number(event.target.value) }))}>
                        <option value="">Choose</option>
                        {COMMERCIAL_SCHEDULES.map((schedule, index) => <option key={schedule.label} value={index}>{schedule.label}</option>)}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailValue label="Service">{booking.service || "—"}</DetailValue>
                <DetailValue label="Frequency">{booking.frequency || "One-time"}</DetailValue>
                <DetailValue label="Bedrooms">{booking.bedrooms}</DetailValue>
                <DetailValue label="Bathrooms">
                  {currentPricingSnapshot?.kind === "standard"
                    ? BATH_VALS[currentPricingSnapshot.bathroomIndex]
                    : booking.bathrooms}
                </DetailValue>
                {currentPricingSnapshot?.kind === "deep-clean" && (
                  <>
                    <DetailValue label="Home size">{DEEP_CLEAN_SIZE_LABELS[currentPricingSnapshot.sizeIndex]}</DetailValue>
                    <DetailValue label="Condition">{DEEP_CLEAN_CONDITION_LABELS[currentPricingSnapshot.conditionIndex]}</DetailValue>
                  </>
                )}
                {currentPricingSnapshot?.kind === "move-out" && (
                  <DetailValue label="Square footage">{MOVE_OUT_SQUARE_FOOTAGE_LABELS[currentPricingSnapshot.squareFootageIndex]}</DetailValue>
                )}
                {currentPricingSnapshot?.kind === "commercial" && (
                  <>
                    <DetailValue label="Square footage">{COMMERCIAL_SQUARE_FOOTAGE_LABELS[currentPricingSnapshot.squareFootageIndex]}</DetailValue>
                    <DetailValue label="Schedule">{COMMERCIAL_SCHEDULES[currentPricingSnapshot.scheduleIndex]?.label ?? "—"}</DetailValue>
                  </>
                )}
              </div>
            )}
            {editingBooking && !canEditPricing && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                Pricing details for this older booking cannot be safely edited. Location and notes are still available.
              </p>
            )}
          </DetailSection>

          <DetailSection title="Property">
            {editingBooking ? (
              <label className="block text-xs font-medium text-slate-600">
                Booking address / location
                <input
                  autoComplete="street-address"
                  maxLength={500}
                  value={bookingLocation}
                  onChange={(event) => setBookingLocation(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </label>
            ) : (
              <DetailValue label="Address / location" valueClassName="whitespace-normal">
                {bookingLocationValue || "—"}
              </DetailValue>
            )}
          </DetailSection>

          <DetailSection title="Extras">
            {editingBooking && canEditPricing ? (
              <div className="flex flex-wrap gap-2">
                {editorExtraCatalog.map((extra) => {
                  const checked = bookingExtras.includes(extra.label);
                  return (
                    <label key={extra.label} className={`flex min-h-11 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm ${checked ? "border-sky-300 bg-sky-50 text-sky-900" : "border-slate-200 bg-white text-slate-700"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setBookingExtras((current) => checked ? current.filter((value) => value !== extra.label) : [...current, extra.label])}
                        className="size-4 accent-sky-700"
                      />
                      <span className="break-words [overflow-wrap:anywhere]">{extra.label}</span>
                    </label>
                  );
                })}
              </div>
            ) : extras.length > 0 ? (
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
            {editingBooking ? (
              <label className="block text-xs font-medium text-slate-600">
                Booking notes
                <textarea
                  rows={4}
                  maxLength={4_000}
                  value={bookingNotes}
                  onChange={(event) => setBookingNotes(event.target.value)}
                  className="mt-1.5 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base leading-6 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="Access instructions, pets, special requests..."
                />
                <span className="mt-1 block text-right text-[11px] text-slate-400">
                  {bookingNotes.length}/4,000
                </span>
              </label>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                {bookingNotesValue?.trim() || "No additional notes."}
              </p>
            )}
            {bookingSaved && !editingBooking && (
              <p role="status" className="mt-3 text-sm font-medium text-emerald-700">
                Booking details updated.
              </p>
            )}
          </DetailSection>

          <DetailSection title="Estimate">
            <div className="text-sm [&>span]:text-xl [&>span]:font-semibold [&>span]:text-slate-900 [&>div>p:last-child]:text-base [&>div>p:last-child]:font-semibold">
              {estimateContent}
            </div>
            {editingBooking && canEditPricing && (
              <div className="mt-3 rounded-xl bg-sky-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Updated estimate preview</p>
                {editorPricingPreview?.ok ? (
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    ${editorPricingPreview.estimate.low.toLocaleString("en-US")}–${editorPricingPreview.estimate.high.toLocaleString("en-US")}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">Choose the required pricing details to preview.</p>
                )}
                <p className="mt-1 text-xs text-slate-500">The server recalculates the saved estimate.</p>
              </div>
            )}
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
          {editingBooking ? (
            <>
              <button
                type="button"
                disabled={savingBooking}
                onClick={cancelBookingEdit}
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingBooking}
                onClick={() => void saveBookingDetails()}
                className="min-h-11 rounded-xl bg-sky-700 px-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-wait disabled:opacity-60"
              >
                {savingBooking ? "Saving..." : "Save changes"}
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}
