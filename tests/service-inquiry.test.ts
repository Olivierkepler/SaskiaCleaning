import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

const HERO_KEY = "550e8400-e29b-41d4-a716-446655440000";
const SERVICE_KEY = "550e8400-e29b-41d4-a716-446655440001";

let validateInquiryPayload: typeof import("../app/api/service-inquiry/route")["validateInquiryPayload"];
let persistInquiry: typeof import("../app/api/service-inquiry/route")["persistInquiry"];

before(async () => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
  ({ validateInquiryPayload, persistInquiry } = await import(
    "../app/api/service-inquiry/route"
  ));
});

describe("service inquiry request validation", () => {
  it("accepts the HeroQuoteForm contract", () => {
    const result = validateInquiryPayload({
      source: "hero_quote",
      idempotencyKey: HERO_KEY,
      fullName: " Ada Lovelace ",
      email: " ada@example.com ",
      phone: "6175550100",
      bedrooms: 2,
      bathrooms: 1,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.inquiry.source, "hero_quote");
      assert.equal(result.inquiry.fullName, "Ada Lovelace");
      assert.equal(result.inquiry.email, "ada@example.com");
      assert.equal(result.inquiry.bedrooms, 2);
    }
  });

  it("accepts the ServiceInquiryForm contract", () => {
    const result = validateInquiryPayload({
      source: "service_inquiry",
      idempotencyKey: SERVICE_KEY,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      phone: "6175550100",
      preferredContact: "Email",
      serviceType: "Recurring Stewardship",
      squareFootage: "1800",
      bedrooms: "3",
      bathrooms: "2",
      accessNotes: "Side entrance",
      productPreference: "Eco-Friendly / Non-Toxic",
      scentProfile: "Neutral / No Scent",
      priorityAreas: "Kitchen",
      allergyConcerns: "No Known Sensitivities",
      pets: "No Pets",
      strictAvoidances: "",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.inquiry.source, "service_inquiry");
      assert.equal(result.inquiry.serviceType, "Recurring Stewardship");
      assert.equal(result.inquiry.bedrooms, 3);
      assert.equal(result.inquiry.strictAvoidances, null);
    }
  });

  it("rejects invalid or missing source and idempotency keys", () => {
    const valid = {
      source: "hero_quote",
      idempotencyKey: HERO_KEY,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    };

    assert.equal(validateInquiryPayload({ ...valid, source: "booking" }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, source: undefined }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, idempotencyKey: undefined }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, idempotencyKey: "not-a-uuid" }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, idempotencyKey: "x".repeat(37) }).ok, false);
  });

  it("rejects invalid names, emails, room counts, long strings, and malformed bodies", () => {
    const valid = {
      source: "hero_quote",
      idempotencyKey: HERO_KEY,
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    };

    assert.equal(validateInquiryPayload(null).ok, false);
    assert.equal(validateInquiryPayload([]).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, fullName: "   " }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, email: "not-an-email" }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, bedrooms: -1 }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, bathrooms: "1.5" }).ok, false);
    assert.equal(validateInquiryPayload({ ...valid, bedrooms: 101 }).ok, false);
    assert.equal(
      validateInquiryPayload({ ...valid, phone: "p".repeat(51) }).ok,
      false,
    );
    assert.equal(validateInquiryPayload({ ...valid, unexpected: "value" }).ok, false);
    assert.equal(
      validateInquiryPayload({ ...valid, source: "service_inquiry" }).ok,
      false,
    );
  });
});

describe("service inquiry persistence", () => {
  it("returns the existing lead for a duplicate key without appending again", async () => {
    const existingLead = {
      id: 42,
      source: "hero_quote" as const,
      full_name: "Ada Lovelace",
      email: "ada@example.com",
      phone: null,
      bedrooms: 2,
      bathrooms: 1,
      created_at: new Date("2026-01-01T00:00:00Z"),
    };
    let appendCalls = 0;
    let timestampCalls = 0;
    const result = await persistInquiry(
      {
        source: "hero_quote",
        idempotencyKey: HERO_KEY,
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: null,
        preferredContact: null,
        serviceType: null,
        squareFootage: null,
        bedrooms: 2,
        bathrooms: 1,
        accessNotes: null,
        productPreference: null,
        scentProfile: null,
        priorityAreas: null,
        allergyConcerns: null,
        pets: null,
        strictAvoidances: null,
      },
      {
        insertOrGet: async () => ({ lead: existingLead, inserted: false }),
        appendToSheets: async () => { appendCalls += 1; },
        markSheetsSynced: async () => { timestampCalls += 1; },
      },
    );

    assert.deepEqual(result, {
      lead: existingLead,
      duplicate: true,
      sheetsSynced: null,
    });
    assert.equal(appendCalls, 0);
    assert.equal(timestampCalls, 0);
  });

  it("records Sheets synchronization after the database insert and append", async () => {
    const savedLead = {
      id: 44,
      source: "hero_quote" as const,
      full_name: "Ada Lovelace",
      email: "ada@example.com",
      phone: null,
      bedrooms: 2,
      bathrooms: 1,
      created_at: new Date("2026-01-01T00:00:00Z"),
    };
    const order: string[] = [];
    const result = await persistInquiry(
      {
        source: "hero_quote",
        idempotencyKey: HERO_KEY,
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: null,
        preferredContact: null,
        serviceType: null,
        squareFootage: null,
        bedrooms: 2,
        bathrooms: 1,
        accessNotes: null,
        productPreference: null,
        scentProfile: null,
        priorityAreas: null,
        allergyConcerns: null,
        pets: null,
        strictAvoidances: null,
      },
      {
        insertOrGet: async () => {
          order.push("database");
          return { lead: savedLead, inserted: true };
        },
        appendToSheets: async () => { order.push("sheets"); },
        markSheetsSynced: async (leadId) => { order.push(`timestamp:${leadId}`); },
      },
    );

    assert.deepEqual(order, ["database", "sheets", "timestamp:44"]);
    assert.equal(result.sheetsSynced, true);
    assert.equal(result.duplicate, false);
  });

  it("keeps the database lead successful when the Sheets append fails", async () => {
    const savedLead = {
      id: 43,
      source: "service_inquiry" as const,
      full_name: "Ada Lovelace",
      email: "ada@example.com",
      phone: null,
      bedrooms: null,
      bathrooms: null,
      created_at: new Date("2026-01-01T00:00:00Z"),
    };
    let warning = "";
    let timestampCalls = 0;
    const result = await persistInquiry(
      {
        source: "service_inquiry",
        idempotencyKey: SERVICE_KEY,
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: null,
        preferredContact: null,
        serviceType: "Recurring Stewardship",
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        accessNotes: null,
        productPreference: null,
        scentProfile: null,
        priorityAreas: null,
        allergyConcerns: null,
        pets: null,
        strictAvoidances: null,
      },
      {
        insertOrGet: async () => ({ lead: savedLead, inserted: true }),
        appendToSheets: async () => { throw new Error("provider detail"); },
        markSheetsSynced: async () => { timestampCalls += 1; },
        warn: (message) => { warning = message; },
      },
    );

    assert.deepEqual(result, {
      lead: savedLead,
      duplicate: false,
      sheetsSynced: false,
    });
    assert.equal(warning, "Google Sheets service inquiry append failed; lead remains saved.");
    assert.equal(warning.includes("provider detail"), false);
    assert.equal(timestampCalls, 0);
  });

  it("does not retry the append when recording the sync timestamp fails", async () => {
    const savedLead = {
      id: 45,
      source: "service_inquiry" as const,
      full_name: "Ada Lovelace",
      email: "ada@example.com",
      phone: null,
      bedrooms: null,
      bathrooms: null,
      created_at: new Date("2026-01-01T00:00:00Z"),
    };
    let appendCalls = 0;
    let warning = "";
    const result = await persistInquiry(
      {
        source: "service_inquiry",
        idempotencyKey: SERVICE_KEY,
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        phone: null,
        preferredContact: null,
        serviceType: "Recurring Stewardship",
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        accessNotes: null,
        productPreference: null,
        scentProfile: null,
        priorityAreas: null,
        allergyConcerns: null,
        pets: null,
        strictAvoidances: null,
      },
      {
        insertOrGet: async () => ({ lead: savedLead, inserted: true }),
        appendToSheets: async () => { appendCalls += 1; },
        markSheetsSynced: async () => { throw new Error("database detail"); },
        warn: (message) => { warning = message; },
      },
    );

    assert.equal(appendCalls, 1);
    assert.equal(result.sheetsSynced, false);
    assert.equal(warning, "Google Sheets append succeeded but sync status could not be recorded.");
    assert.equal(warning.includes("database detail"), false);
  });

  it("propagates database failures without attempting Sheets", async () => {
    let appendCalls = 0;
    await assert.rejects(
      persistInquiry(
        {
          source: "hero_quote",
          idempotencyKey: HERO_KEY,
          fullName: "Ada Lovelace",
          email: "ada@example.com",
          phone: null,
          preferredContact: null,
          serviceType: null,
          squareFootage: null,
          bedrooms: null,
          bathrooms: null,
          accessNotes: null,
          productPreference: null,
          scentProfile: null,
          priorityAreas: null,
          allergyConcerns: null,
          pets: null,
          strictAvoidances: null,
        },
        {
          insertOrGet: async () => { throw new Error("database detail"); },
          appendToSheets: async () => { appendCalls += 1; },
          markSheetsSynced: async () => {},
        },
      ),
      /database detail/,
    );
    assert.equal(appendCalls, 0);
  });
});
