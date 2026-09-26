export type AvailabilitySlot = {
  time: string;
  label: string;
};

export type AvailabilityResponseData = {
  slots?: AvailabilitySlot[];
  estimatedDurationMinutes?: number;
  error?: string;
};

export type NormalizedAvailabilityResponse = {
  slots: AvailabilitySlot[];
  estimatedDurationMinutes: number | null;
};

export type AvailabilityRequestStartState = {
  slots: AvailabilitySlot[];
  selectedTime: null;
  loading: true;
  error: "";
  refreshMessage: "";
};

export type NullAvailabilityQueryState = {
  slots: AvailabilitySlot[];
  selectedTime: null;
  loading: false;
  error: "";
  estimatedDurationMinutes: null;
};

export type AvailabilityRefreshReconciliation =
  | {
      shouldClearSelectedTime: true;
      refreshMessage: string;
    }
  | {
      shouldClearSelectedTime: false;
      refreshMessage: null;
    };

const AVAILABILITY_ERROR_FALLBACK = "Could not load available times.";
const SLOT_REFRESH_WARNING =
  "Please choose a new time for the updated service.";

export function buildAvailabilityQuery(input: {
  date: string;
  service: string;
  bedrooms: number;
  bathrooms: number;
}): string {
  return new URLSearchParams({
    date: input.date,
    service: input.service,
    bedrooms: String(input.bedrooms),
    bathrooms: String(input.bathrooms),
  }).toString();
}

export function normalizeAvailabilityResponse(
  data: AvailabilityResponseData,
): NormalizedAvailabilityResponse {
  return {
    slots: Array.isArray(data.slots) ? data.slots : [],
    estimatedDurationMinutes:
      typeof data.estimatedDurationMinutes === "number"
        ? data.estimatedDurationMinutes
        : null,
  };
}

export function getAvailabilityErrorMessage(
  data?: AvailabilityResponseData,
): string {
  return data?.error || AVAILABILITY_ERROR_FALLBACK;
}

export function isAvailabilityRequestCurrent(
  requestId: number,
  currentRequestId: number,
): boolean {
  return requestId === currentRequestId;
}

export function getAvailabilityRequestStartState(): AvailabilityRequestStartState {
  return {
    slots: [],
    selectedTime: null,
    loading: true,
    error: "",
    refreshMessage: "",
  };
}

export function getNullAvailabilityQueryState(): NullAvailabilityQueryState {
  return {
    slots: [],
    selectedTime: null,
    loading: false,
    error: "",
    estimatedDurationMinutes: null,
  };
}

export function reconcileAvailabilityRefresh(
  selectedTime: string | null,
  slots: AvailabilitySlot[],
): AvailabilityRefreshReconciliation {
  if (selectedTime && !slots.some((slot) => slot.time === selectedTime)) {
    return {
      shouldClearSelectedTime: true,
      refreshMessage: SLOT_REFRESH_WARNING,
    };
  }

  return {
    shouldClearSelectedTime: false,
    refreshMessage: null,
  };
}
