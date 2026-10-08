import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateCommercialEstimate,
  calculateEstimateRange,
  calculateDeepCleanEstimate,
  calculateMoveOutEstimate,
  calculateStandardEstimate,
  priceBookingRequest,
  priceBookingSelections,
} from "../app/lib/booking-pricing-pure";

describe("shared booking pricing authority", () => {
  it("preserves Standard bedroom, bath, and frequency behavior", () => {
    assert.deepEqual(calculateStandardEstimate({ bedrooms: 0, bathroomIndex: 0, frequency: "One-time", extras: [] }), { low: 77, mid: 90, high: 106 });
    assert.deepEqual(calculateStandardEstimate({ bedrooms: 4, bathroomIndex: 4, frequency: "One-time", extras: [] }), { low: 209, mid: 246, high: 290 });
    assert.deepEqual(calculateStandardEstimate({ bedrooms: 2, bathroomIndex: 0, frequency: "One-time", extras: [] }), { low: 128, mid: 150, high: 177 });
    assert.deepEqual(calculateStandardEstimate({ bedrooms: 2, bathroomIndex: 0, frequency: "Bi-weekly", extras: [] }), { low: 115, mid: 135, high: 159 });
    assert.deepEqual(calculateStandardEstimate({ bedrooms: 2, bathroomIndex: 0, frequency: "Weekly", extras: [] }), { low: 109, mid: 128, high: 151 });
    assert.deepEqual(calculateStandardEstimate({ bedrooms: 2, bathroomIndex: 0, frequency: "Monthly", extras: [] }), { low: 122, mid: 143, high: 169 });
  });

  it("prices every Standard addon and combined selections from the UI catalog", () => {
    const cases = [
      ["Inside fridge", 105],
      ["Inside oven", 110],
      ["Laundry fold", 115],
      ["Windows", 120],
      [["Inside fridge", "Inside oven", "Laundry fold", "Windows"], 180],
    ] as const;
    for (const [extras, mid] of cases) {
      const selected = typeof extras === "string" ? [extras] : extras;
      assert.equal(calculateStandardEstimate({ bedrooms: 0, bathroomIndex: 0, frequency: "One-time", extras: selected }).mid, mid);
    }
  });

  it("preserves Deep Clean sizes, conditions, and addon totals", () => {
    assert.deepEqual(calculateDeepCleanEstimate({ sizeIndex: 0, conditionIndex: 0, extras: [] }), { low: 136, mid: 160, high: 189 });
    assert.equal(calculateDeepCleanEstimate({ sizeIndex: 1, conditionIndex: 1, extras: [] }).mid, 260);
    assert.equal(calculateDeepCleanEstimate({ sizeIndex: 3, conditionIndex: 2, extras: ["Wall Trim", "Inside cabinets", "Wall scrub", "Carpet steam"] }).mid, 630);
  });

  it("preserves Move-out square-footage tiers and addons", () => {
    assert.deepEqual(calculateMoveOutEstimate({ squareFootageIndex: 0, extras: [] }), { low: 153, mid: 180, high: 212 });
    assert.equal(calculateMoveOutEstimate({ squareFootageIndex: 3, extras: ["Carpet steam", "Patch & paint", "Window wash", "Garage clean"] }).mid, 605);
  });

  it("preserves Commercial size, schedule multipliers, and addons", () => {
    assert.deepEqual(calculateCommercialEstimate({ squareFootageIndex: 0, scheduleIndex: 3, extras: [] }), { low: 85, mid: 100, high: 118 });
    assert.equal(calculateCommercialEstimate({ squareFootageIndex: 3, scheduleIndex: 0, extras: ["Floor wax", "Pressure wash", "Window ext.", "Sanitize"] }).mid, 1260);
  });

  it("retains the estimator's integer rounding at range thresholds", () => {
    assert.deepEqual(calculateEstimateRange(136), { low: 116, mid: 136, high: 160 });
    assert.deepEqual(calculateEstimateRange(137), { low: 116, mid: 137, high: 162 });
    assert.deepEqual(calculateDeepCleanEstimate({ sizeIndex: 0, conditionIndex: 0, extras: [] }), { low: 136, mid: 160, high: 189 });
  });

  it("validates canonical selections and rejects unknown extras or tampered snapshots", () => {
    const base = {
      service: "Standard",
      frequency: "One-time",
      bedrooms: 2,
      bathrooms: 2,
      extras: ["Inside fridge"],
      pricingInputs: { version: 1, kind: "standard", bathroomIndex: 1 },
    };
    assert.equal(priceBookingSelections({ ...base, extras: ["Unlisted addon"] }).ok, false);
    assert.equal(priceBookingSelections({ ...base, pricingInputs: { ...base.pricingInputs, bathroomIndex: 99 } }).ok, false);
    assert.equal(priceBookingSelections({ ...base, pricingInputs: { ...base.pricingInputs, estimateMid: 1 } }).ok, false);
  });

  it("ignores client estimate values and computes the submitted Standard selections", () => {
    const requestBody = {
      service: "Standard",
      frequency: "One-time",
      bedrooms: 3,
      bathrooms: 2,
      extras: [],
      pricingInputs: { version: 1, kind: "standard", bathroomIndex: 1 },
      estimateLow: 1,
      estimateMid: 1,
      estimateHigh: 1,
    };
    const result = priceBookingRequest(requestBody);
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.estimate, { low: 161, mid: 189, high: 223 });
  });
});
