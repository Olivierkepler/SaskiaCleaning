"use client";

import { useState, type FormEvent } from "react";

import type { BookingSubmitStatus } from "../types";
import {
  classifyBookingResponse,
  type BookingPayload,
  type BookingResponseData,
} from "../booking/bookingWorkflow";

export type BookingSuccessControls = {
  clearReferralCodeError: () => void;
};

export type UseBookingSubmissionInput = {
  createPayload: () => BookingPayload;
  onSuccess: (controls: BookingSuccessControls) => void;
  onConflict: () => void;
};

export type UseBookingSubmissionResult = {
  bookingStatus: BookingSubmitStatus;
  bookingErrorMessage: string;
  referralCodeError: string;
  submitBooking: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  resetSubmission: () => void;
  clearReferralCodeError: () => void;
};

export function useBookingSubmission({
  createPayload,
  onSuccess,
  onConflict,
}: UseBookingSubmissionInput): UseBookingSubmissionResult {
  const [bookingStatus, setBookingStatus] =
    useState<BookingSubmitStatus>("idle");
  const [bookingErrorMessage, setBookingErrorMessage] = useState("");
  const [referralCodeError, setReferralCodeError] = useState("");

  function clearReferralCodeError(): void {
    setReferralCodeError("");
  }

  function resetSubmission(): void {
    setBookingStatus("idle");
    setBookingErrorMessage("");
  }

  async function submitBooking(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setBookingStatus("loading");
    setBookingErrorMessage("");
    setReferralCodeError("");

    const payload = createPayload();

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as BookingResponseData;
      const outcome = classifyBookingResponse({
        ok: response.ok,
        status: response.status,
        data,
      });

      if (outcome.type === "invalid-referral") {
        setReferralCodeError(outcome.message);
        setBookingStatus("idle");
        return;
      }

      if (outcome.type === "conflict") {
        setBookingStatus("error");
        setBookingErrorMessage(outcome.message);
        onConflict();
        return;
      }

      if (outcome.type === "error") {
        throw new Error(outcome.message);
      }

      setBookingStatus("success");
      onSuccess({ clearReferralCodeError });
    } catch (error) {
      setBookingStatus("error");
      setBookingErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit booking request.",
      );
    }
  }

  return {
    bookingStatus,
    bookingErrorMessage,
    referralCodeError,
    submitBooking,
    resetSubmission,
    clearReferralCodeError,
  };
}
