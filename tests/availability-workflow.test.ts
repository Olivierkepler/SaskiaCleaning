import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAvailabilityQuery,
  getAvailabilityErrorMessage,
  getAvailabilityRequestStartState,
  getNullAvailabilityQueryState,
  isAvailabilityRequestCurrent,
  normalizeAvailabilityResponse,
  reconcileAvailabilityRefresh,
  type AvailabilitySlot,
} from "../app/components/estimator/availability/availabilityWorkflow";
import { getBookingRoomCounts } from "../app/components/estimator/utils";

const slots: AvailabilitySlot[] = [
  { time: "09:00", label: "9:00 AM" },
  { time: "11:00", label: "11:00 AM" },
];

describe("availability request construction", () => {
  it("uses mapped Standard bedroom and bathroom values", () => {
    const roomCounts = getBookingRoomCounts(0, 3, 3);
    const query = buildAvailabilityQuery({
      date: "2026-10-09",
      service: "Standard",
      ...roomCounts,
    });

    assert.deepEqual(Object.fromEntries(new URLSearchParams(query)), {
      date: "2026-10-09",
      service: "Standard",
      bedrooms: "3",
      bathrooms: "3",
    });
  });

  it("uses zero bedroom and bathroom values for non-Standard services", () => {
    const services = [
      { index: 1 as const, label: "Deep clean" },
      { index: 2 as const, label: "Move-out" },
      { index: 3 as const, label: "Commercial" },
    ];

    for (const service of services) {
      const query = buildAvailabilityQuery({
        date: "2026-10-09",
        service: service.label,
        ...getBookingRoomCounts(service.index, 4, 4),
      });
      const params = new URLSearchParams(query);

      assert.equal(params.get("service"), service.label);
      assert.equal(params.get("bedrooms"), "0");
      assert.equal(params.get("bathrooms"), "0");
    }
  });

  it("does not include location, frequency, add-ons, or unrelated values", () => {
    const query = buildAvailabilityQuery({
      date: "2026-10-09",
      service: "Standard",
      bedrooms: 1,
      bathrooms: 2,
    });
    const params = new URLSearchParams(query);

    assert.deepEqual([...params.keys()], [
      "date",
      "service",
      "bedrooms",
      "bathrooms",
    ]);
  });
});

describe("availability response normalization", () => {
  it("preserves returned slots and duration", () => {
    const normalized = normalizeAvailabilityResponse({
      slots,
      estimatedDurationMinutes: 120,
    });

    assert.strictEqual(normalized.slots, slots);
    assert.equal(normalized.estimatedDurationMinutes, 120);
  });

  it("accepts an empty slot list as a successful response", () => {
    assert.deepEqual(
      normalizeAvailabilityResponse({
        slots: [],
        estimatedDurationMinutes: 180,
      }),
      {
        slots: [],
        estimatedDurationMinutes: 180,
      },
    );
  });

  it("uses the current empty and null fallbacks for omitted values", () => {
    assert.deepEqual(normalizeAvailabilityResponse({}), {
      slots: [],
      estimatedDurationMinutes: null,
    });
  });
});

describe("manual availability refresh reconciliation", () => {
  it("preserves a selected time that remains available", () => {
    assert.deepEqual(reconcileAvailabilityRefresh("09:00", slots), {
      shouldClearSelectedTime: false,
      refreshMessage: null,
    });
  });

  it("clears a selected time that disappeared and returns the current warning", () => {
    assert.deepEqual(reconcileAvailabilityRefresh("10:00", slots), {
      shouldClearSelectedTime: true,
      refreshMessage: "Please choose a new time for the updated service.",
    });
  });

  it("does not introduce a warning when no time is selected", () => {
    assert.deepEqual(reconcileAvailabilityRefresh(null, slots), {
      shouldClearSelectedTime: false,
      refreshMessage: null,
    });
  });
});

describe("availability request identity", () => {
  it("accepts a response whose request ID is current", () => {
    assert.equal(isAvailabilityRequestCurrent(4, 4), true);
  });

  it("rejects an older response after the request ID advances", () => {
    assert.equal(isAvailabilityRequestCurrent(3, 4), false);
  });
});

describe("availability reset states", () => {
  it("preserves the current null-query reset values", () => {
    const state = getNullAvailabilityQueryState();

    assert.deepEqual(state, {
      slots: [],
      selectedTime: null,
      loading: false,
      error: "",
      estimatedDurationMinutes: null,
    });
    assert.equal("refreshMessage" in state, false);
  });

  it("preserves the current automatic-request start values", () => {
    const state = getAvailabilityRequestStartState();

    assert.deepEqual(state, {
      slots: [],
      selectedTime: null,
      loading: true,
      error: "",
      refreshMessage: "",
    });
    assert.equal("estimatedDurationMinutes" in state, false);
  });
});

describe("availability error normalization", () => {
  it("preserves an API-provided error message", () => {
    assert.equal(
      getAvailabilityErrorMessage({ error: "No availability configured." }),
      "No availability configured.",
    );
  });

  it("uses the current fallback for missing or empty API errors", () => {
    assert.equal(
      getAvailabilityErrorMessage(),
      "Could not load available times.",
    );
    assert.equal(
      getAvailabilityErrorMessage({ error: "" }),
      "Could not load available times.",
    );
  });
});
