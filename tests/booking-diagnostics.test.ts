import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BOOKING_CAPACITY_DIAGNOSTIC_STAGES,
  categorizeBookingFailure,
  createBookingDiagnostic,
  logBookingDiagnostic,
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
      {
        event: "BOOKING_CLAIM_FAILED",
        category: "DATABASE",
        sqlState: "UNKNOWN",
      },
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

  it("retains a valid SQLSTATE from a nested cause", () => {
    const wrappedError = new Error("outer wrapper details", {
      cause: Object.assign(new Error("private SQL detail"), {
        code: "42P01",
        name: "PostgresError",
      }),
    });

    assert.equal(categorizeBookingFailure(wrappedError), "DATABASE");
    assert.deepEqual(
      createBookingDiagnostic("BOOKING_CAPACITY_QUERY_FAILED", "DATABASE", {
        sqlState: "42P01",
      }),
      {
        event: "BOOKING_CAPACITY_QUERY_FAILED",
        category: "DATABASE",
        sqlState: "42P01",
      },
    );
  });

  it("logs the preflight and transaction recheck as distinct stages", () => {
    const originalError = console.error;
    const diagnosticLines: string[] = [];
    console.error = (...values: unknown[]) => {
      diagnosticLines.push(values.map(String).join(" "));
    };

    try {
      logBookingDiagnostic(
        "BOOKING_CAPACITY_QUERY_FAILED",
        Object.assign(new Error("private query text"), { code: "42P01" }),
        BOOKING_CAPACITY_DIAGNOSTIC_STAGES.PREFLIGHT,
      );
      logBookingDiagnostic(
        "BOOKING_CAPACITY_QUERY_FAILED",
        new Error("another private query detail", {
          cause: Object.assign(new Error("wrapped SQL detail"), {
            code: "57014",
          }),
        }),
        BOOKING_CAPACITY_DIAGNOSTIC_STAGES.TRANSACTION_RECHECK,
      );
    } finally {
      console.error = originalError;
    }

    assert.deepEqual(
      diagnosticLines.map((line) => JSON.parse(line)),
      [
        {
          event: "BOOKING_CAPACITY_QUERY_FAILED",
          category: "DATABASE",
          sqlState: "42P01",
          stage: "PREFLIGHT_CAPACITY_CHECK",
        },
        {
          event: "BOOKING_CAPACITY_QUERY_FAILED",
          category: "DATABASE",
          sqlState: "57014",
          stage: "TRANSACTION_CAPACITY_RECHECK",
        },
      ],
    );
    assert.equal(diagnosticLines.join(" ").includes("private"), false);
  });

  it("maps malformed or absent SQLSTATE values to UNKNOWN", () => {
    for (const value of ["1234", "42P0!", "secret database message", undefined]) {
      assert.equal(
        createBookingDiagnostic("BOOKING_CLAIM_FAILED", "UNKNOWN", {
          sqlState: value,
        }).sqlState,
        "UNKNOWN",
      );
    }
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
        sqlState: "UNKNOWN",
      }),
    ]);
    assert.equal(diagnosticLines.join(" ").includes("private staff"), false);
  });
});
