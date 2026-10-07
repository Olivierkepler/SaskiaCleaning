"use client";

import { useEffect, type FormEvent } from "react";
import { useIsClient } from "@/app/lib/use-is-client";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Clock3,
  FileText,
  Gift,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  formatSavedAddressLabel,
  type BookingPrefill,
} from "@/app/lib/booking-prefill";
import { MOTION_EASE } from "../constants";
import type {
  BookingSubmitStatus,
  PriceRange,
  ReferralValidationState,
} from "../types";

type BookingModalService = {
  label: string;
  bookLabel: string;
};

export type ManualBookingAddress = {
  streetAddress: string;
  apartmentUnit: string;
  city: string | null;
  state: string | null;
  postalCode: string;
};

type ManualAddressDefaults = {
  city: string;
  state: string;
};

const bookingInputClassName =
  "w-full rounded-[13px] border border-slate-300/80 bg-[#ECF0F3] py-3 pl-10 pr-3 text-[13px] font-medium text-slate-800 shadow-[inset_4px_4px_8px_rgba(209,217,230,0.82),inset_-4px_-4px_8px_rgba(255,255,255,0.96)] outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40 read-only:text-slate-600 sm:rounded-[17px] sm:py-3.5 sm:pl-12 sm:pr-4 sm:text-sm";

const addressInputClassName =
  "w-full min-w-0 rounded-[13px] border border-slate-300/80 bg-white px-3 py-3 text-[13px] font-medium text-slate-800 shadow-[inset_3px_3px_7px_rgba(209,217,230,0.55),inset_-3px_-3px_7px_rgba(255,255,255,0.95)] outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40 sm:rounded-[15px] sm:px-4 sm:text-sm";

const raisedButtonClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#ECF0F3] px-5 py-3 text-sm font-semibold text-slate-700 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF] transition hover:text-slate-900 active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECF0F3] disabled:cursor-not-allowed disabled:opacity-55";

export type BookingModalProps = {
  open: boolean;
  svc: BookingModalService;
  bookingStatus: BookingSubmitStatus;
  bookingErrorMessage: string;
  contactName: string;
  contactEmail: string;
  contactMobile: string;
  contactNotes: string;
  referralCode: string;
  referralCodeError: string;
  referralValidation: ReferralValidationState;
  referralDiscountAmount: number;
  estimatedTotalAfterDiscount: number;
  prices: PriceRange;
  locationSummary: string;
  bookingPrefill: BookingPrefill | null;
  locationMode: "saved" | "manual";
  selectedAddressId: string | null;
  manualAddress: ManualBookingAddress;
  manualAddressDefaults: ManualAddressDefaults;
  emailReadOnly: boolean;
  bookingTime: string | null;
  bookingTimeLabel: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onReferralCodeChange: (value: string) => void;
  onSelectSavedAddress: (addressId: string) => void;
  onSelectManualLocation: () => void;
  onManualAddressFieldChange: (
    field: keyof ManualBookingAddress,
    value: string,
  ) => void;
};

export function BookingModal({
  open,
  svc,
  bookingStatus,
  bookingErrorMessage,
  contactName,
  contactEmail,
  contactMobile,
  contactNotes,
  referralCode,
  referralCodeError,
  referralValidation,
  referralDiscountAmount,
  estimatedTotalAfterDiscount,
  prices,
  locationSummary,
  bookingPrefill,
  locationMode,
  selectedAddressId,
  manualAddress,
  manualAddressDefaults,
  emailReadOnly,
  bookingTimeLabel,
  onClose,
  onSubmit,
  onNameChange,
  onEmailChange,
  onMobileChange,
  onNotesChange,
  onReferralCodeChange,
  onSelectSavedAddress,
  onSelectManualLocation,
  onManualAddressFieldChange,
}: BookingModalProps) {
  const tBooking = useTranslations("booking");
  const mounted = useIsClient();

  // Lock body scroll while the modal is open so the fixed backdrop never
  // appears to "scroll away" on mobile browsers.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: MOTION_EASE }}
            className="relative flex h-[100dvh] max-h-none w-full flex-col overflow-hidden rounded-t-[24px] bg-[#ECF0F3] shadow-[18px_18px_40px_rgba(15,23,42,0.22),-18px_-18px_40px_rgba(255,255,255,0.32)] ring-1 ring-white/35 sm:h-[calc(100dvh-2rem)] sm:max-h-[820px] sm:max-w-[720px] sm:rounded-[30px] lg:max-w-[900px] xl:max-w-[960px]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-form-title"
          >
            <header className="flex shrink-0 items-start gap-3 px-4 pb-3 pt-4 sm:gap-4 sm:px-6 sm:pb-5 sm:pt-6 lg:px-8 lg:pt-7">
              {/* <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ECF0F3] text-sky-600 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF] sm:h-14 sm:w-14">
                <CalendarDays size={23} aria-hidden="true" />
              </div> */}
              <div className="min-w-0 flex-1 pr-9 sm:pr-10">

                <h3
                  id="booking-form-title"
                  className="font-serif text-xl font-semibold leading-tight text-sky-600 sm:text-2xl lg:text-3xl"
                >
                  Complete your booking
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:mt-1.5 sm:text-sm lg:text-base">
                  Share your details and we&apos;ll confirm your booking request.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close booking dialog"
                className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#ECF0F3] text-slate-600 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF] transition hover:text-slate-900 active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECF0F3] sm:right-4 sm:top-4 sm:h-10 sm:w-10"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            {bookingStatus === "success" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8">
                  <div className="rounded-[22px] bg-[#ECF0F3] px-5 py-5 text-sm font-semibold leading-relaxed text-emerald-800 shadow-[inset_4px_4px_8px_rgba(209,217,230,0.7),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] sm:px-6 sm:py-6">
                  Thanks! Your booking request was submitted successfully.
                  </div>
                </div>
                <div className="shrink-0 border-t border-slate-300/50 bg-[#ECF0F3]/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:px-8">
                  <button type="button" onClick={onClose} className="w-full cursor-pointer rounded-2xl bg-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-[7px_7px_15px_rgba(209,217,230,0.9),-7px_-7px_15px_rgba(255,255,255,0.95)] transition hover:bg-sky-600 active:translate-y-0.5 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECF0F3]">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-4 pb-4 pt-4 sm:space-y-5 sm:px-6 sm:pb-6 lg:space-y-6 lg:px-8 lg:pb-7 [scrollbar-color:#0EA5E9_#ECF0F3] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#ECF0F3] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#0EA5E9] [&::-webkit-scrollbar-thumb:hover]:bg-[#0284C7]">
                  <section aria-label="Booking summary" className="min-w-0 rounded-[10px] bg-[#ECF0F3] p-3.5 shadow-[7px_7px_16px_rgba(209,217,230,0.85),-7px_-7px_16px_rgba(255,255,255,0.95)] sm:p-5">
                    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                        <img
                          src="/check.png"
                          alt="Checkmark"
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                          {tBooking("serviceType")}
                        </p>
                        <p className="text-base font-bold text-slate-900 sm:text-lg">
                          {svc.label}
                        </p>
                      </div>
<div className="col-span-3 w-full min-w-0">
                {bookingPrefill && bookingPrefill.savedAddresses.length > 0 ? (
                  <fieldset className="mb-4 min-w-0 space-y-2">
                    <legend className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                      Service location
                    </legend>
                    <div className="space-y-2">
                      {bookingPrefill.savedAddresses.map((address) => {
                        const checked =
                          locationMode === "saved" &&
                          selectedAddressId === address.id;
                        return (
                          <label
                            key={address.id}
                            className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border px-2.5 py-2.5 text-xs transition sm:px-3 sm:text-sm ${
                              checked
                                ? "border-sky-300 bg-sky-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="booking-location-mode"
                              className="mt-1 shrink-0"
                              checked={checked}
                              onChange={() => onSelectSavedAddress(address.id)}
                            />
                            <span className="min-w-0 flex-1 break-words text-slate-700 [overflow-wrap:anywhere]">
                              {formatSavedAddressLabel(address)}
                            </span>
                          </label>
                        );
                      })}
                      <label
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border px-2.5 py-2.5 text-xs transition sm:px-3 sm:text-sm ${
                          locationMode === "manual"
                            ? "border-sky-300 bg-sky-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="booking-location-mode"
                          className="mt-1 shrink-0"
                          checked={locationMode === "manual"}
                          onChange={onSelectManualLocation}
                        />
                        <span className="min-w-0 flex-1 break-words text-slate-700 [overflow-wrap:anywhere]">
                          Enter another location
                        </span>
                      </label>
                    </div>
                  </fieldset>
                ) : null}

                {locationMode === "manual" ? (
                  <fieldset
                    aria-labelledby="manual-service-address-heading"
                    className="min-w-0 rounded-xl border border-sky-100 bg-white/80 p-3 shadow-[0_3px_12px_rgba(15,65,100,0.04)] sm:rounded-2xl sm:p-4"
                  >
                    <legend className="sr-only">Service address</legend>
                    <div className="mb-3">
                      <h4
                        id="manual-service-address-heading"
                        className="text-sm font-bold text-slate-900 sm:text-base"
                      >
                        Enter service address
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                        City and state start with your selected service area.
                      </p>
                    </div>
                    <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="min-w-0 md:col-span-2">
                        <label
                          htmlFor="booking-street-address"
                          className="mb-1.5 block text-xs font-semibold text-slate-700"
                        >
                          Street address <span className="text-sky-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="booking-street-address"
                          type="text"
                          required
                          autoComplete="address-line1"
                          value={manualAddress.streetAddress}
                          onChange={(event) =>
                            onManualAddressFieldChange(
                              "streetAddress",
                              event.target.value,
                            )
                          }
                          className={addressInputClassName}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="min-w-0">
                        <label
                          htmlFor="booking-apartment-unit"
                          className="mb-1.5 block text-xs font-semibold text-slate-700"
                        >
                          Apartment / Unit <span className="font-normal text-slate-500">(optional)</span>
                        </label>
                        <input
                          id="booking-apartment-unit"
                          type="text"
                          autoComplete="address-line2"
                          value={manualAddress.apartmentUnit}
                          onChange={(event) =>
                            onManualAddressFieldChange(
                              "apartmentUnit",
                              event.target.value,
                            )
                          }
                          className={addressInputClassName}
                          placeholder="Apartment or unit"
                        />
                      </div>
                      <div className="min-w-0">
                        <label
                          htmlFor="booking-address-city"
                          className="mb-1.5 block text-xs font-semibold text-slate-700"
                        >
                          City <span className="text-sky-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="booking-address-city"
                          type="text"
                          required
                          autoComplete="address-level2"
                          value={manualAddress.city ?? manualAddressDefaults.city}
                          onChange={(event) =>
                            onManualAddressFieldChange("city", event.target.value)
                          }
                          className={addressInputClassName}
                          placeholder="City"
                        />
                      </div>
                      <div className="min-w-0">
                        <label
                          htmlFor="booking-address-state"
                          className="mb-1.5 block text-xs font-semibold text-slate-700"
                        >
                          State <span className="text-sky-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="booking-address-state"
                          type="text"
                          required
                          autoComplete="address-level1"
                          value={manualAddress.state ?? manualAddressDefaults.state}
                          onChange={(event) =>
                            onManualAddressFieldChange("state", event.target.value)
                          }
                          className={addressInputClassName}
                          placeholder="State"
                        />
                      </div>
                      <div className="min-w-0">
                        <label
                          htmlFor="booking-address-postal-code"
                          className="mb-1.5 block text-xs font-semibold text-slate-700"
                        >
                          ZIP code <span className="text-sky-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="booking-address-postal-code"
                          type="text"
                          required
                          autoComplete="postal-code"
                          value={manualAddress.postalCode}
                          onChange={(event) =>
                            onManualAddressFieldChange(
                              "postalCode",
                              event.target.value,
                            )
                          }
                          className={addressInputClassName}
                          placeholder="ZIP code"
                        />
                      </div>
                    </div>
                  </fieldset>
                ) : null}

                    <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2">
                      <div className="flex  items-start gap-3 ">
                        <MapPin size={19} aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{tBooking("location")}</p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">{locationSummary}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 ">
                        <Clock3 size={19} aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Appointment time</p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">{bookingTimeLabel ?? tBooking("selectTimeAbove")}</p>
                        </div>
                      </div>
                    </div>
</div>


                      <div className="col-start-3 row-start-1 shrink-0 self-start pt-1 text-right sm:self-center sm:pt-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">
                          {tBooking("mid")}
                        </p>
                        <p className="text-lg font-bold tabular-nums text-slate-900 sm:text-xl">
                          ${referralValidation.status === "valid" ? estimatedTotalAfterDiscount : prices.mid}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end border-t border-slate-300/50 pt-3">
                      <button type="button" onClick={onClose} className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                        Edit selection
                      </button>
                    </div>
                  </section>

                <section aria-labelledby="booking-contact-heading" className="space-y-3 sm:space-y-4">
                    <div>
                      <h4 id="booking-contact-heading" className="text-lg font-bold text-slate-900 sm:text-xl">Your contact details</h4>
                      <p className="mt-1 text-sm text-slate-600">We&apos;ll use this information to confirm your booking.</p>
                    </div>
                    {bookingPrefill && (
                      <p className="text-sm text-slate-600">
                        Using your Saskia profile ·{" "}
                        <Link href="/account/profile" className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                          Manage profile
                        </Link>
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("fullName")} <span className="text-sky-700" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <UserRound size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:left-4" />
                    <input id="booking-name" type="text" required value={contactName} onChange={(event) => onNameChange(event.target.value)} className={bookingInputClassName} placeholder={tBooking("yourName")} autoComplete="name" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("email")} <span className="text-sky-700" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:left-4" />
                    <input id="booking-email" type="email" required value={contactEmail} onChange={(event) => onEmailChange(event.target.value)} className={`${bookingInputClassName}${emailReadOnly ? " cursor-default" : ""}`} placeholder="you@example.com" autoComplete="email" readOnly={emailReadOnly} aria-readonly={emailReadOnly || undefined} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-mobile"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("mobile")}
                  </label>
                  <div className="relative">
                    <Phone size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:left-4" />
                    <input id="booking-mobile" type="tel" value={contactMobile} onChange={(event) => onMobileChange(event.target.value)} className={bookingInputClassName} placeholder="Phone number" autoComplete="tel" />
                  </div>
                  {bookingPrefill && !bookingPrefill.phone && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Save this in your profile for faster booking next time.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-referral-code"
                    className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    <Gift size={15} aria-hidden="true" className="text-sky-700" />
                    Referral code (optional)
                  </label>
                  <div className="relative">
                    <Gift size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 sm:left-4" />
                    <input
                      id="booking-referral-code"
                      type="text"
                      value={referralCode}
                      onChange={(event) =>
                        onReferralCodeChange(event.target.value)
                      }
                      className={`${bookingInputClassName}${
                        referralCodeError ||
                        referralValidation.status === "invalid"
                          ? " border-red-300 focus:border-red-400 focus:ring-red-100"
                          : referralValidation.status === "valid"
                            ? " border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                            : ""
                      }`}
                      placeholder="Have a referral code?"
                      autoComplete="off"
                      aria-invalid={
                        referralCodeError ||
                        referralValidation.status === "invalid"
                          ? true
                          : undefined
                      }
                      aria-describedby={
                        referralCodeError
                          ? "booking-referral-code-error"
                          : referralValidation.status === "invalid"
                            ? "booking-referral-code-validation"
                            : referralValidation.status === "valid"
                              ? "booking-referral-code-success"
                              : undefined
                      }
                    />
                  </div>
                  {referralValidation.status === "checking" && (
                    <p role="status" className="mt-2 rounded-lg bg-sky-50/80 px-3 py-2 text-xs font-medium text-sky-800 sm:rounded-xl sm:text-sm">Checking referral code…</p>
                  )}
                  {referralValidation.status === "invalid" &&
                    !referralCodeError && (
                      <p
                        id="booking-referral-code-validation"
                        className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800 sm:rounded-xl sm:text-sm"
                      >
                        Invalid referral code.
                      </p>
                    )}
                  {referralCodeError && (
                    <p
                      id="booking-referral-code-error"
                      className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800 sm:rounded-xl sm:text-sm"
                    >
                      {referralCodeError}
                    </p>
                  )}
                  {referralValidation.status === "valid" && (
                    <div
                      id="booking-referral-code-success"
                      className="mt-3 space-y-2 rounded-lg bg-emerald-50 px-3 py-3 text-xs shadow-[inset_3px_3px_6px_rgba(16,185,129,0.12),inset_-3px_-3px_6px_rgba(255,255,255,0.85)] sm:space-y-3 sm:rounded-xl sm:px-4 sm:text-sm"
                    >
                      <p className="font-medium text-emerald-800">
                        Referral applied: ${referralDiscountAmount} off your
                        first cleaning.
                      </p>
                      <div className="space-y-1 text-slate-700">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <span className="min-w-0 break-words">Original estimate</span>
                          <span className="shrink-0 whitespace-nowrap font-semibold text-slate-900">
                            ${prices.mid}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-2 text-emerald-700 sm:gap-4">
                          <span className="min-w-0 break-words">Referral discount</span>
                          <span className="shrink-0 whitespace-nowrap font-semibold">
                            -${referralDiscountAmount}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-2 border-t border-emerald-200 pt-2 font-bold text-slate-900 sm:gap-4">
                          <span className="min-w-0 break-words">Estimated total after discount</span>
                          <span className="shrink-0 whitespace-nowrap">${estimatedTotalAfterDiscount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                    </div>
                  </section>

                  {/* <section aria-labelledby="booking-details-heading" className="space-y-4">
                    <div>
                      <h4 id="booking-details-heading" className="text-lg font-bold text-slate-900 sm:text-xl">Booking details</h4>
                      <p className="mt-1 text-sm text-slate-600">Review your selected location and time...</p>
                    </div>
                {bookingPrefill && bookingPrefill.savedAddresses.length > 0 && (
                  <fieldset className="space-y-2">
                    <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service location
                    </legend>
                    <div className="space-y-2">
                      {bookingPrefill.savedAddresses.map((address) => {
                        const checked =
                          locationMode === "saved" &&
                          selectedAddressId === address.id;
                        return (
                          <label
                            key={address.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                              checked
                                ? "border-sky-300 bg-sky-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="booking-location-mode"
                              className="mt-1"
                              checked={checked}
                              onChange={() => onSelectSavedAddress(address.id)}
                            />
                            <span className="text-slate-700">
                              {formatSavedAddressLabel(address)}
                            </span>
                          </label>
                        );
                      })}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                          locationMode === "manual"
                            ? "border-sky-300 bg-sky-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="booking-location-mode"
                          className="mt-1"
                          checked={locationMode === "manual"}
                          onChange={onSelectManualLocation}
                        />
                        <span className="text-slate-700">
                          Enter another location
                          {locationMode === "manual" ? (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              Uses the city/state selected in the estimator
                              above.
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </div>
                    {!bookingPrefill.defaultAddress &&
                      locationMode === "manual" &&
                      !selectedAddressId && (
                        <p className="text-xs text-slate-500">
                          Choose a saved address or continue with the estimator
                          location.
                        </p>
                      )}
                  </fieldset>
                )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex min-h-[88px] items-start gap-3 rounded-[18px] bg-[#ECF0F3] p-4 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]">
                        <MapPin size={19} aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{tBooking("location")}</p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">{locationSummary}</p>
                        </div>
                      </div>
                      <div className="flex min-h-[88px] items-start gap-3 rounded-[18px] bg-[#ECF0F3] p-4 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]">
                        <Clock3 size={19} aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Appointment time</p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">{bookingTimeLabel ?? tBooking("selectTimeAbove")}</p>
                        </div>
                      </div>
                    </div>
                  </section> */}

                <section aria-labelledby="booking-notes-heading" className="space-y-3">
                  <label
                    htmlFor="booking-notes"
                    className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    <FileText size={15} aria-hidden="true" />
                    <span id="booking-notes-heading">Additional notes (optional)</span>
                  </label>
                  <textarea
                    id="booking-notes"
                    rows={3}
                    value={contactNotes}
                    onChange={(event) => onNotesChange(event.target.value)}
                    className="w-full resize-none rounded-[13px] border border-slate-300/80 bg-[#ECF0F3] px-3 py-3 text-[13px] font-medium text-slate-800 shadow-[inset_4px_4px_8px_rgba(209,217,230,0.82),inset_-4px_-4px_8px_rgba(255,255,255,0.96)] outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40 sm:rounded-[17px] sm:px-4 sm:py-3.5 sm:text-sm"
                    placeholder="Access instructions, pets, special requests..."
                  />
                </section>

                {bookingStatus === "error" && bookingErrorMessage && (
                  <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-[inset_3px_3px_6px_rgba(220,38,38,0.08),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
                    {bookingErrorMessage}
                  </div>
                )}

                </div>
                <div className="grid shrink-0 grid-cols-1 gap-2 border-t border-slate-300/50 bg-[#ECF0F3]/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur sm:grid-cols-2 sm:gap-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={bookingStatus === "loading"}
                    className={`${raisedButtonClassName} w-full`}
                  >
                    {tBooking("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={bookingStatus === "loading"}
                    className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-[7px_7px_15px_rgba(209,217,230,0.9),-7px_-7px_15px_rgba(255,255,255,0.95)] transition hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0.5 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECF0F3] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {bookingStatus === "loading"
                      ? tBooking("submitting")
                      : tBooking("submitRequest")}
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default BookingModal;
