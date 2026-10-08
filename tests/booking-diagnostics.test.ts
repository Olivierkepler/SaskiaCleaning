import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  categorizeBookingFailure,
  createBookingDiagnostic,
  runBookingNotificationSafely,
} from "../app/lib/booking-diagnostics";

describe("booking infrastructure diagnostics", () => {
  it("classifies database and network failures without retaining their details", () => {
    const databaseError = Object.assign(
      new Error("sensitive SQL and parameter details"),
      { code: "08006" },
    );
    const networkError = Object.assign(new Error("private host detail"), {
      code: "ECONNRESET",
    });

    assert.equal(categorizeBookingFailure(databaseError), "DATABASE");
    assert.equal(categorizeBookingFailure(networkError), "NETWORK");
    assert.deepEqual(
      createBookingDiagnostic(
        "BOOKING_CLAIM_FAILED",
        categorizeBookingFailure(databaseError),
      ),
      { event: "BOOKING_CLAIM_FAILED", category: "DATABASE" },
    );
    assert.equal(
      JSON.stringify(
        createBookingDiagnostic(
          "BOOKING_CLAIM_FAILED",
          categorizeBookingFailure(databaseError),
        ),
      ).includes("sensitive SQL"),
      false,
    );
  });

  it("does not let a post-commit notification failure fail booking success", async () => {
    const originalError = console.error;
    const diagnosticLines: string[] = [];
    const successfulClaim = { ok: true, bookingId: 42 };
    console.error = (...values: unknown[]) => {
      diagnosticLines.push(values.map(String).join(" "));
    };

    let result: typeof successfulClaim | undefined;
    try {
      await assert.doesNotReject(async () => {
        await runBookingNotificationSafely(async () => {
          throw new Error("private staff lookup details");
        });
        result = successfulClaim;
      });
    } finally {
      console.error = originalError;
    }

    assert.deepEqual(result, successfulClaim);
    assert.deepEqual(diagnosticLines, [
      JSON.stringify({
        event: "BOOKING_ASSIGNMENT_NOTIFICATION_FAILED",
        category: "UNKNOWN",
      }),
    ]);
    assert.equal(diagnosticLines.join(" ").includes("private staff"), false);
  });
});
