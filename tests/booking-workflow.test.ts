import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildBookingPayload,
  classifyBookingResponse,
  type BuildBookingPayloadInput,
} from "../app/components/estimator/booking/bookingWorkflow";

function bookingInput(
  overrides: Partial<BuildBookingPayloadInput> = {},
): BuildBookingPayloadInput {
  return {
    contactName: "Ada Lovelace",
    contactEmail: "ada@example.com",
    contactMobile: "6175550100",
    contactNotes: "Use the side entrance",
    serviceIndex: 0,
    serviceLabel: "Standard",
    frequency: "One-time",
    bookingLocationSummary: "1 Main St, Boston, MA 02108",
    date: new Date(2026, 9, 9),
    bookingTime: "09:00",
    standardBedIndex: 3,
    standardBathIndex: 3,
    standardSelectedAddons: new Set(["Inside oven", "Windows"]),
    deepCleanSelectedAddons: new Set(["Wall scrub"]),
    moveOutSelectedAddons: new Set(["Garage clean"]),
    commercialSelectedAddons: new Set(["Floor wax"]),
    prices: { low: 180, mid: 220, high: 260 },
    referralCode: "ADA10",
    locationMode: "saved",
    selectedAddressId: "addr-1",
    ...overrides,
  };
}

describe("booking payload construction", () => {
  it("builds the exact current Standard payload", () => {
    const payload = buildBookingPayload(
      bookingInput({
        contactName: "  Ada Lovelace  ",
        contactEmail: "  ada@example.com ",
        contactMobile: "  6175550100 ",
        contactNotes: "  Use the side entrance  ",
      }),
    );

    assert.deepEqual(payload, {
      name: "Ada Lovelace",
      email: "ada@example.com",
      mobile: "6175550100",
      bedrooms: 3,
      bathrooms: 3,
      service: "Standard",
      frequency: "One-time",
      location: "1 Main St, Boston, MA 02108",
      bookingDate: "2026-10-09",
      bookingTime: "09:00",
      extras: ["Inside oven", "Windows"],
      estimateLow: 180,
      estimateMid: 220,
      estimateHigh: 260,
      notes: "Use the side entrance",
      referralCode: "ADA10",
      selectedAddressId: "addr-1",
    });
  });

  it("omits empty optional values from the serialized request body", () => {
    const payload = buildBookingPayload(
      bookingInput({
        contactMobile: " ",
        contactNotes: "",
        referralCode: "  ",
        locationMode: "manual",
        selectedAddressId: "addr-1",
        date: null,
        bookingTime: null,
      }),
    );
    const serialized = JSON.parse(JSON.stringify(payload)) as Record<
      string,
      unknown
    >;

    for (const field of [
      "mobile",
      "notes",
      "referralCode",
      "selectedAddressId",
      "bookingDate",
      "bookingTime",
    ]) {
      assert.equal(field in serialized, false);
    }
  });

  it("uses zero room values for every non-Standard service", () => {
    const services = [
      { serviceIndex: 1 as const, serviceLabel: "Deep clean" },
      { serviceIndex: 2 as const, serviceLabel: "Move-out" },
      { serviceIndex: 3 as const, serviceLabel: "Commercial" },
    ];

    for (const service of services) {
      const payload = buildBookingPayload(bookingInput(service));
      assert.equal(payload.bedrooms, 0);
      assert.equal(payload.bathrooms, 0);
    }
  });

  it("uses the active service add-on set", () => {
    const cases = [
      { serviceIndex: 0 as const, expected: ["Inside oven", "Windows"] },
      { serviceIndex: 1 as const, expected: ["Wall scrub"] },
      { serviceIndex: 2 as const, expected: ["Garage clean"] },
      { serviceIndex: 3 as const, expected: ["Floor wax"] },
    ];

    for (const testCase of cases) {
      const payload = buildBookingPayload(
        bookingInput({ serviceIndex: testCase.serviceIndex }),
      );
      assert.deepEqual(payload.extras, testCase.expected);
    }
  });

  it("preserves the current service-specific payload omissions", () => {
    const payload = buildBookingPayload(
      bookingInput({
        serviceIndex: 3,
        serviceLabel: "Commercial",
      }),
    ) as Record<string, unknown>;

    for (const field of [
      "deepCleanHomeSize",
      "deepCleanCondition",
      "moveOutPropertyType",
      "moveOutSquareFootage",
      "commercialSpaceType",
      "commercialSquareFootage",
      "commercialTiming",
      "commercialContract",
      "commercialSchedule",
    ]) {
      assert.equal(field in payload, false);
    }
  });

  it("uses global frequency for Commercial bookings", () => {
    const payload = buildBookingPayload(
      bookingInput({
        serviceIndex: 3,
        serviceLabel: "Commercial",
        frequency: "Bi-weekly",
      }),
    );

    assert.equal(payload.frequency, "Bi-weekly");
    assert.equal("commercialSchedule" in payload, false);
  });

  it("normalizes referral codes using the current production rule", () => {
    const payload = buildBookingPayload(
      bookingInput({ referralCode: "  ada 10  " }),
    );

    assert.equal(payload.referralCode, "ADA10");
  });

  it("formats dates from local calendar fields as YYYY-MM-DD", () => {
    const payload = buildBookingPayload(
      bookingInput({ date: new Date(2026, 6, 4, 23, 30) }),
    );

    assert.equal(payload.bookingDate, "2026-07-04");
  });
});

describe("booking response classification", () => {
  it("classifies a successful response", () => {
    assert.deepEqual(
      classifyBookingResponse({ ok: true, status: 200, data: {} }),
      { type: "success" },
    );
  });

  it("classifies the exact invalid-referral response", () => {
    assert.deepEqual(
      classifyBookingResponse({
        ok: false,
        status: 400,
        data: { error: "Invalid referral code." },
      }),
      {
        type: "invalid-referral",
        message: "Invalid referral code.",
      },
    );
  });

  it("preserves a server-provided 409 conflict message", () => {
    assert.deepEqual(
      classifyBookingResponse({
        ok: false,
        status: 409,
        data: { error: "That slot is unavailable." },
      }),
      { type: "conflict", message: "That slot is unavailable." },
    );
  });

  it("uses the current 409 fallback message", () => {
    assert.deepEqual(
      classifyBookingResponse({ ok: false, status: 409, data: {} }),
      {
        type: "conflict",
        message:
          "That time was just booked. Please choose another available time.",
      },
    );
  });

  it("classifies a generic 400 with its server message", () => {
    assert.deepEqual(
      classifyBookingResponse({
        ok: false,
        status: 400,
        data: { error: "Name and email are required." },
      }),
      {
        type: "error",
        message: "Name and email are required.",
      },
    );
  });

  it("classifies a 500 with its server message", () => {
    assert.deepEqual(
      classifyBookingResponse({
        ok: false,
        status: 500,
        data: { error: "Failed to save booking." },
      }),
      {
        type: "error",
        message: "Failed to save booking.",
      },
    );
  });

  it("classifies a 503 with its server message", () => {
    assert.deepEqual(
      classifyBookingResponse({
        ok: false,
        status: 503,
        data: { error: "Unable to confirm that time right now." },
      }),
      {
        type: "error",
        message: "Unable to confirm that time right now.",
      },
    );
  });

  it("uses the current generic fallback when the server omits an error", () => {
    assert.deepEqual(
      classifyBookingResponse({ ok: false, status: 500, data: {} }),
      {
        type: "error",
        message: "Failed to submit booking request.",
      },
    );
  });
});
