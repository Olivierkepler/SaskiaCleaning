"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { formatBookingTime } from "@/app/lib/scheduling-pure";
import {
  buildAvailabilityQuery,
  getAvailabilityErrorMessage,
  getAvailabilityRequestStartState,
  getNullAvailabilityQueryState,
  isAvailabilityRequestCurrent,
  normalizeAvailabilityResponse,
  reconcileAvailabilityRefresh,
  type AvailabilityResponseData,
  type AvailabilitySlot,
} from "../availability/availabilityWorkflow";

export type UseEstimatorAvailabilityInput = {
  selectedDateOnly: string | null;
  serviceLabel: string;
  bedrooms: number;
  bathrooms: number;
};

export type UseEstimatorAvailabilityResult = {
  availableSlots: AvailabilitySlot[];
  slotsLoading: boolean;
  slotsError: string;
  estimatedDurationMinutes: number | null;
  slotRefreshMessage: string;
  bookingTime: string | null;
  bookingTimeLabel: string | null;
  selectTime: (time: string) => void;
  clearSelectedTime: () => void;
  refreshAvailability: () => Promise<void>;
};

export function useEstimatorAvailability({
  selectedDateOnly,
  serviceLabel,
  bedrooms,
  bathrooms,
}: UseEstimatorAvailabilityInput): UseEstimatorAvailabilityResult {
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<
    number | null
  >(null);
  const [slotRefreshMessage, setSlotRefreshMessage] = useState("");
  const slotsRequestIdRef = useRef(0);

  const availabilityQuery = useMemo(() => {
    if (!selectedDateOnly) return null;
    return buildAvailabilityQuery({
      date: selectedDateOnly,
      service: serviceLabel,
      bedrooms,
      bathrooms,
    });
  }, [selectedDateOnly, serviceLabel, bedrooms, bathrooms]);

  // When the query changes, reset (no date) or enter the loading state
  // during render; the effect below only performs the fetch.
  const [appliedQuery, setAppliedQuery] = useState<string | null | undefined>(
    undefined,
  );
  if (appliedQuery !== availabilityQuery) {
    setAppliedQuery(availabilityQuery);
    if (!availabilityQuery) {
      const resetState = getNullAvailabilityQueryState();
      setAvailableSlots(resetState.slots);
      setBookingTime(resetState.selectedTime);
      setSlotsLoading(resetState.loading);
      setSlotsError(resetState.error);
      setEstimatedDurationMinutes(resetState.estimatedDurationMinutes);
    } else {
      const startState = getAvailabilityRequestStartState();
      setSlotsLoading(startState.loading);
      setSlotsError(startState.error);
      setAvailableSlots(startState.slots);
      setBookingTime(startState.selectedTime);
      setSlotRefreshMessage(startState.refreshMessage);
    }
  }

  useEffect(() => {
    if (!availabilityQuery) return;

    const requestId = ++slotsRequestIdRef.current;

    fetch(`/api/availability?${availabilityQuery}`)
      .then(async (response) => {
        const data = (await response.json()) as AvailabilityResponseData;
        if (
          !isAvailabilityRequestCurrent(requestId, slotsRequestIdRef.current)
        ) return;
        if (!response.ok) {
          setSlotsError(getAvailabilityErrorMessage(data));
          setAvailableSlots([]);
          setEstimatedDurationMinutes(null);
          return;
        }
        const normalized = normalizeAvailabilityResponse(data);
        setAvailableSlots(normalized.slots);
        setEstimatedDurationMinutes(normalized.estimatedDurationMinutes);
      })
      .catch(() => {
        if (
          !isAvailabilityRequestCurrent(requestId, slotsRequestIdRef.current)
        ) return;
        setSlotsError(getAvailabilityErrorMessage());
        setAvailableSlots([]);
        setEstimatedDurationMinutes(null);
      })
      .finally(() => {
        if (
          !isAvailabilityRequestCurrent(requestId, slotsRequestIdRef.current)
        ) return;
        setSlotsLoading(false);
      });
  }, [availabilityQuery]);

  const bookingTimeLabel = bookingTime
    ? availableSlots.find((slot) => slot.time === bookingTime)?.label ??
      formatBookingTime(bookingTime)
    : null;

  async function refreshAvailability(): Promise<void> {
    if (!availabilityQuery) return;
    const requestId = ++slotsRequestIdRef.current;
    setSlotsLoading(true);
    setSlotsError("");
    try {
      const response = await fetch(`/api/availability?${availabilityQuery}`);
      const data = (await response.json()) as AvailabilityResponseData;
      if (
        !isAvailabilityRequestCurrent(requestId, slotsRequestIdRef.current)
      ) return;
      if (!response.ok) {
        setSlotsError(getAvailabilityErrorMessage(data));
        setAvailableSlots([]);
        setBookingTime(null);
        setEstimatedDurationMinutes(null);
        return;
      }
      const normalized = normalizeAvailabilityResponse(data);
      setAvailableSlots(normalized.slots);
      setEstimatedDurationMinutes(normalized.estimatedDurationMinutes);
      const reconciliation = reconcileAvailabilityRefresh(
        bookingTime,
        normalized.slots,
      );
      if (reconciliation.shouldClearSelectedTime) {
        setBookingTime(null);
        setSlotRefreshMessage(reconciliation.refreshMessage);
      }
    } catch {
      if (
        !isAvailabilityRequestCurrent(requestId, slotsRequestIdRef.current)
      ) return;
      setSlotsError(getAvailabilityErrorMessage());
      setAvailableSlots([]);
      setBookingTime(null);
      setEstimatedDurationMinutes(null);
    } finally {
      if (
        !isAvailabilityRequestCurrent(requestId, slotsRequestIdRef.current)
      ) return;
      setSlotsLoading(false);
    }
  }

  function selectTime(time: string): void {
    setBookingTime(time);
  }

  function clearSelectedTime(): void {
    setBookingTime(null);
  }

  return {
    availableSlots,
    slotsLoading,
    slotsError,
    estimatedDurationMinutes,
    slotRefreshMessage,
    bookingTime,
    bookingTimeLabel,
    selectTime,
    clearSelectedTime,
    refreshAvailability,
  };
}
