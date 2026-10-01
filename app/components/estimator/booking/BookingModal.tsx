"use client";

import { useEffect, type FormEvent } from "react";
import { useIsClient } from "@/app/lib/use-is-client";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import {
  formatSavedAddressLabel,
  type BookingPrefill,
} from "@/app/lib/booking-prefill";
import { bookingInputClassName, MOTION_EASE } from "../constants";
import type {
  BookingSubmitStatus,
  PriceRange,
  ReferralValidationState,
} from "../types";

type BookingModalService = {
  label: string;
  bookLabel: string;
};

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
  emailReadOnly,
  bookingTime,
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
}: BookingModalProps) {
  const tBooking = useTranslations("booking");
  const tEstimate = useTranslations("estimate");
  const locale = useLocale();
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: MOTION_EASE }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 sm:p-7"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-form-title"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="mb-5 pr-8">
              <h3
                id="booking-form-title"
                className="text-xl font-bold text-slate-900"
              >
                {svc.bookLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Share your contact details and we&apos;ll confirm your{" "}
                {svc.label.toLowerCase()} request.
              </p>
            </div>

            {bookingStatus === "success" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  Thanks! Your booking request was submitted successfully.
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full cursor-pointer rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {bookingPrefill && (
                  <p className="text-sm text-slate-500">
                    Using your Saskia profile ·{" "}
                    <Link
                      href="/account/profile"
                      className="font-medium text-sky-600 underline-offset-2 hover:underline"
                    >
                      Manage profile
                    </Link>
                  </p>
                )}

                <div>
                  <label
                    htmlFor="booking-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("fullName")}
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(event) => onNameChange(event.target.value)}
                    className={bookingInputClassName}
                    placeholder={tBooking("yourName")}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("email")}
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(event) => onEmailChange(event.target.value)}
                    className={`${bookingInputClassName}${
                      emailReadOnly ? " bg-slate-50 text-slate-700" : ""
                    }`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    readOnly={emailReadOnly}
                    aria-readonly={emailReadOnly || undefined}
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-mobile"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tBooking("mobile")}
                  </label>
                  <input
                    id="booking-mobile"
                    type="tel"
                    value={contactMobile}
                    onChange={(event) => onMobileChange(event.target.value)}
                    className={bookingInputClassName}
                    placeholder="Phone number"
                    autoComplete="tel"
                  />
                  {bookingPrefill && !bookingPrefill.phone && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Save this in your profile for faster booking next time.
                    </p>
                  )}
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

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location on this booking
                  </span>
                  <p className="mt-1 font-medium text-slate-800">
                    {locationSummary}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Appointment time
                  </span>
                  <p className="mt-1 font-medium text-slate-800">
                    {bookingTimeLabel ?? tBooking("selectTimeAbove")}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="booking-referral-code"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Referral code
                  </label>
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
                  {referralValidation.status === "invalid" &&
                    !referralCodeError && (
                      <p
                        id="booking-referral-code-validation"
                        className="mt-1.5 text-sm font-medium text-red-600"
                      >
                        Invalid referral code.
                      </p>
                    )}
                  {referralCodeError && (
                    <p
                      id="booking-referral-code-error"
                      className="mt-1.5 text-sm font-medium text-red-600"
                    >
                      {referralCodeError}
                    </p>
                  )}
                  {referralValidation.status === "valid" && (
                    <div
                      id="booking-referral-code-success"
                      className="mt-3 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm"
                    >
                      <p className="font-medium text-emerald-800">
                        Referral applied: ${referralDiscountAmount} off your
                        first cleaning.
                      </p>
                      <div className="space-y-1 text-slate-700">
                        <div className="flex items-center justify-between gap-4">
                          <span>Original estimate</span>
                          <span className="font-semibold text-slate-900">
                            ${prices.mid}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-700">
                          <span>Referral discount</span>
                          <span className="font-semibold">
                            -${referralDiscountAmount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-emerald-200 pt-2 font-bold text-slate-900">
                          <span>Estimated total after discount</span>
                          <span>${estimatedTotalAfterDiscount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-notes"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="booking-notes"
                    rows={3}
                    value={contactNotes}
                    onChange={(event) => onNotesChange(event.target.value)}
                    className={`${bookingInputClassName} resize-none`}
                    placeholder="Access instructions, pets, special requests..."
                  />
                </div>

                {bookingStatus === "error" && bookingErrorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {bookingErrorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={bookingStatus === "loading"}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tBooking("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={bookingStatus === "loading"}
                    className="cursor-pointer rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(56,189,248,.35)] transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bookingStatus === "loading"
                      ? tBooking("submitting")
                      : tBooking("submitRequest")}
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
