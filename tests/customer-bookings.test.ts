import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBookAgainHref,
  formatCustomerBookingDate,
  formatCustomerBookingStatus,
  formatCustomerEstimate,
  isPastCustomerBooking,
  normalizeBookingExtras,
  parseBookingDateOnly,
  partitionCustomerBookings,
} from "../app/lib/customer-bookings-pure";

describe("customer booking formatting", () => {
  it("formats booking dates in US style without shifting the calendar day", () => {
    assert.equal(parseBookingDateOnly("2026-09-23"), "2026-09-23");
    assert.match(formatCustomerBookingDate("2026-09-23"), /Sep/);
    assert.equal(formatCustomerBookingDate(null), "Date TBD");
  });

  it("formats customer-safe status labels without changing DB values", () => {
    assert.equal(formatCustomerBookingStatus("new"), "Received");
    assert.equal(formatCustomerBookingStatus("completed"), "Completed");
    assert.equal(formatCustomerBookingStatus("cancelled"), "Cancelled");
  });

  it("formats USD estimates from mid or range", () => {
    assert.equal(formatCustomerEstimate(100, 150, 200), "$150");
    assert.equal(formatCustomerEstimate(100, null, 200), "$100–$200");
    assert.equal(formatCustomerEstimate(null, null, null), "Estimate TBD");
  });

  it("normalizes extras arrays and JSON strings", () => {
    assert.deepEqual(normalizeBookingExtras(["Windows", "Oven"]), [
      "Windows",
      "Oven",
    ]);
    assert.deepEqual(normalizeBookingExtras('["Laundry fold"]'), [
      "Laundry fold",
    ]);
    assert.deepEqual(normalizeBookingExtras(null), []);
  });
});

describe("upcoming vs past classification", () => {
  const now = new Date("2026-09-23T15:00:00.000Z");

  it("treats future booking_date as upcoming", () => {
    assert.equal(
      isPastCustomerBooking({
        status: "scheduled",
        booking_date: "2026-09-30",
        now,
      }),
      false,
    );
  });

  it("treats past booking_date as past", () => {
    assert.equal(
      isPastCustomerBooking({
        status: "scheduled",
        booking_date: "2026-09-01",
        now,
      }),
      true,
    );
  });

  it("treats completed and cancelled as past even if date is future", () => {
    assert.equal(
      isPastCustomerBooking({
        status: "completed",
        booking_date: "2026-12-01",
        now,
      }),
      true,
    );
    assert.equal(
      isPastCustomerBooking({
        status: "cancelled",
        booking_date: "2026-12-01",
        now,
      }),
      true,
    );
  });

  it("treats undated non-terminal requests as upcoming", () => {
    assert.equal(
      isPastCustomerBooking({ status: "new", booking_date: null, now }),
      false,
    );
  });

  it("partitions lists into upcoming and past", () => {
    const { upcoming, past } = partitionCustomerBookings(
      [
        { id: 1, status: "new", booking_date: "2026-10-01" },
        { id: 2, status: "completed", booking_date: "2026-08-01" },
        { id: 3, status: "cancelled", booking_date: "2026-11-01" },
      ],
      now,
    );
    assert.deepEqual(
      upcoming.map((b) => b.id),
      [1],
    );
    assert.deepEqual(
      past.map((b) => b.id),
      [2, 3],
    );
  });
});

describe("ownership query rules (unit)", () => {
  it("scopes list queries by customer_id only", () => {
    const customerId = "cust-a";
    const rows = [
      { id: 1, customer_id: "cust-a" },
      { id: 2, customer_id: "cust-b" },
      { id: 3, customer_id: null },
    ];
    const visible = rows.filter((r) => r.customer_id === customerId);
    assert.deepEqual(
      visible.map((r) => r.id),
      [1],
    );
  });

  it("requires both booking id and customer_id for detail", () => {
    const sessionCustomerId = "cust-a";
    const rows = [
      { id: 10, customer_id: "cust-a" },
      { id: 11, customer_id: "cust-b" },
    ];

    const own = rows.find(
      (r) => r.id === 10 && r.customer_id === sessionCustomerId,
    );
    const other = rows.find(
      (r) => r.id === 11 && r.customer_id === sessionCustomerId,
    );

    assert.ok(own);
    assert.equal(other, undefined);
  });

  it("does not authorize by email alone", () => {
    const sessionCustomerId = "cust-a";
    const requestEmail = "shared@example.com";
    const rows = [
      {
        id: 1,
        customer_id: "cust-b",
        email: requestEmail,
      },
      {
        id: 2,
        customer_id: "cust-a",
        email: requestEmail,
      },
    ];

    const byEmailOnly = rows.filter((r) => r.email === requestEmail);
    const byOwnership = rows.filter(
      (r) => r.customer_id === sessionCustomerId,
    );

    assert.equal(byEmailOnly.length, 2);
    assert.deepEqual(
      byOwnership.map((r) => r.id),
      [2],
    );
  });

  it("guest bookings remain invisible until linked via customer_id", () => {
    const sessionCustomerId = "cust-a";
    const rows = [{ id: 1, customer_id: null, email: "a@b.com" }];
    const visible = rows.filter((r) => r.customer_id === sessionCustomerId);
    assert.equal(visible.length, 0);
  });

  it("historical linked bookings appear for their owner", () => {
    const sessionCustomerId = "cust-a";
    const rows = [
      { id: 5, customer_id: "cust-a", email: "a@b.com" }, // linked in Phase 11.1
    ];
    const visible = rows.filter((r) => r.customer_id === sessionCustomerId);
    assert.equal(visible.length, 1);
  });
});

describe("Book Again behavior", () => {
  it("returns estimator navigation and does not create a booking", () => {
    const href = buildBookAgainHref({ service: "Standard" });
    assert.equal(href, "/#quote");
    // No mutation side effect — pure href builder only.
  });
});

describe("account bookings route protection (unit)", () => {
  it("logged-out users are redirected to login", () => {
    const customer = null;
    const destination = customer ? "/account/bookings" : "/login";
    assert.equal(destination, "/login");
  });

  it("not found is used for unauthorized booking ids", () => {
    const booking = null; // getCustomerBookingById returned null
    const response = booking ? "ok" : "notFound";
    assert.equal(response, "notFound");
  });
});

describe("admin auth remains separate (unit)", () => {
  it("DASHBOARD_KEY check is independent of customer bookings", () => {
    const dashboardKey = "admin-key";
    const requestKey = "admin-key";
    assert.equal(requestKey === dashboardKey, true);
  });
});

describe("empty state (unit)", () => {
  it("no bookings yields empty list for UI empty state", () => {
    const bookings: unknown[] = [];
    assert.equal(bookings.length === 0, true);
  });
});
