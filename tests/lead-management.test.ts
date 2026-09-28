import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLeadQuery,
  createLeadExportHandler,
  createLeadMutationHandlers,
  leadSearchMatches,
  mapLeadExportRows,
  parseLeadExportFilters,
  parseLeadFilters,
  validateLeadEditPayload,
  type LeadEditFields,
} from "../app/lib/lead-management";
import { createLeadWorkbook, LEAD_EXPORT_HEADERS } from "../app/lib/lead-excel";
import ExcelJS from "exceljs";

const validLead = {
  fullName: "  Rose Cleaning  ",
  email: " rose@example.com ",
  phone: " 617-555-0100 ",
  bedrooms: 2,
  bathrooms: 1,
};

function routeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function jsonRequest(value: unknown) {
  return new Request("https://example.test/api/admin/leads/12", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
}

describe("lead management filters", () => {
  it("parses combinable source, date, room, search, and sort filters", () => {
    const filters = parseLeadFilters({
      q: " rose ",
      source: "hero_quote",
      date: "30d",
      bedrooms: "2",
      bathrooms: "5+",
      sort: "email",
      order: "asc",
      page: "3",
    });

    assert.deepEqual(filters, {
      q: "rose",
      source: "hero_quote",
      date: "30d",
      bedrooms: "2",
      bathrooms: "5+",
      sort: "email",
      order: "asc",
      page: 3,
    });
  });

  it("keeps search literal and case-insensitive across contact fields", () => {
    const lead = {
      full_name: "Rose Smith",
      email: "ROSE@example.com",
      phone: "617-555-0123",
    };
    assert.equal(leadSearchMatches(lead, "rose"), true);
    assert.equal(leadSearchMatches(lead, "555-0123"), true);
    assert.equal(leadSearchMatches(lead, "%_"), false);
  });

  it("rejects unknown sort columns and invalid filter values", () => {
    const filters = parseLeadFilters({
      sort: "created_at; DROP TABLE lead_inquiries",
      order: "sideways",
      source: "booking_requests",
      date: "forever",
      bedrooms: "2 OR 1=1",
    });
    assert.equal(filters.sort, "created_at");
    assert.equal(filters.order, "desc");
    assert.equal(filters.source, null);
    assert.equal(filters.date, "all");
    assert.equal(filters.bedrooms, null);
  });
});

describe("lead edit validation", () => {
  it("normalizes a valid edit", () => {
    const result = validateLeadEditPayload(validLead);
    assert.deepEqual(result, {
      ok: true,
      fields: {
        fullName: "Rose Cleaning",
        email: "rose@example.com",
        phone: "617-555-0100",
        bedrooms: 2,
        bathrooms: 1,
      },
    });
  });

  it("rejects invalid email and numeric values", () => {
    assert.equal(validateLeadEditPayload({ ...validLead, email: "bad-email" }).ok, false);
    assert.equal(validateLeadEditPayload({ ...validLead, bedrooms: 1.5 }).ok, false);
    assert.equal(validateLeadEditPayload({ ...validLead, bathrooms: -1 }).ok, false);
    assert.equal(validateLeadEditPayload({ ...validLead, bedrooms: 101 }).ok, false);
  });

  it("does not allow source, identifier, or synchronization fields to be edited", () => {
    assert.equal(
      validateLeadEditPayload({ ...validLead, source: "hero_quote" }).ok,
      false,
    );
    assert.equal(
      validateLeadEditPayload({ ...validLead, idempotencyKey: "changed" }).ok,
      false,
    );
  });
});

describe("admin lead mutations", () => {
  it("rejects unauthorized edit and delete without touching the database", async () => {
    let databaseCalls = 0;
    const handlers = createLeadMutationHandlers({
      authorize: async () => Response.json({ error: "Unauthorized" }, { status: 401 }),
      update: async () => { databaseCalls += 1; return true; },
      delete: async () => { databaseCalls += 1; return true; },
    });

    const patchResponse = await handlers.PATCH(jsonRequest(validLead), routeContext("12"));
    const deleteResponse = await handlers.DELETE(new Request("https://example.test"), routeContext("12"));

    assert.equal(patchResponse.status, 401);
    assert.equal(deleteResponse.status, 401);
    assert.equal(databaseCalls, 0);
  });

  it("persists a valid admin edit", async () => {
    let updated: { id: number; fields: LeadEditFields } | null = null;
    const handlers = createLeadMutationHandlers({
      authorize: async () => null,
      update: async (id, fields) => { updated = { id, fields }; return true; },
      delete: async () => false,
    });

    const response = await handlers.PATCH(jsonRequest(validLead), routeContext("12"));
    assert.equal(response.status, 200);
    assert.deepEqual(updated, {
      id: 12,
      fields: {
        fullName: "Rose Cleaning",
        email: "rose@example.com",
        phone: "617-555-0100",
        bedrooms: 2,
        bathrooms: 1,
      },
    });
  });

  it("deletes only the selected lead and reports a missing lead", async () => {
    const deletedIds: number[] = [];
    const handlers = createLeadMutationHandlers({
      authorize: async () => null,
      update: async () => false,
      delete: async (id) => { deletedIds.push(id); return id === 12; },
    });

    const deleted = await handlers.DELETE(new Request("https://example.test"), routeContext("12"));
    const missing = await handlers.DELETE(new Request("https://example.test"), routeContext("13"));
    const missingEdit = await handlers.PATCH(jsonRequest(validLead), routeContext("14"));

    assert.equal(deleted.status, 200);
    assert.equal(missing.status, 404);
    assert.equal(missingEdit.status, 404);
    assert.deepEqual(deletedIds, [12, 13]);
  });
});

describe("service inquiry Excel export", () => {
  const exportRecord = {
    full_name: "Rose Cleaning",
    email: "rose@example.com",
    phone: "617-555-0100",
    bedrooms: 2,
    bathrooms: 1,
    source: "hero_quote" as const,
    created_at: new Date("2026-09-28T14:30:00.000Z"),
    id: 123,
    idempotency_key: "must-not-export",
    sheets_synced_at: new Date("2026-09-28T14:31:00.000Z"),
  };

  it("rejects unauthorized export before querying or creating a workbook", async () => {
    let queryCalled = false;
    let workbookCalled = false;
    const handler = createLeadExportHandler({
      authorize: async () => Response.json({ error: "Unauthorized" }, { status: 401 }),
      fetchLeads: async () => { queryCalled = true; return []; },
      createWorkbook: async () => { workbookCalled = true; return new ArrayBuffer(0); },
    });

    const response = await handler(new Request("https://example.test/api/admin/leads/export"));
    assert.equal(response.status, 401);
    assert.equal(queryCalled, false);
    assert.equal(workbookCalled, false);
  });

  it("passes current filters and sort to the shared parameterized query without pagination", async () => {
    const url = "https://example.test/api/admin/leads/export?q=rose&source=hero_quote&date=30d&bedrooms=2&bathrooms=5%2B&sort=created_at&order=desc&page=9";
    const filters = parseLeadExportFilters(Object.fromEntries(new URL(url).searchParams));
    assert.deepEqual(filters, {
      q: "rose",
      source: "hero_quote",
      date: "30d",
      bedrooms: "2",
      bathrooms: "5+",
      sort: "created_at",
      order: "desc",
    });

    const query = buildLeadQuery(filters);
    assert.match(query.text, /position\(lower\(\$1::text\) in lower\(coalesce\(full_name/);
    assert.doesNotMatch(query.text, /\bLIMIT\b|\bOFFSET\b/i);
    assert.deepEqual(query.values, ["rose", "hero_quote", "30d", 2, false, null, true, "created_at", "desc"]);
  });

  it("does not allow an arbitrary sort key into SQL and keeps search parameterized", () => {
    const filters = parseLeadExportFilters({
      q: "rose'; DROP TABLE lead_inquiries;--",
      sort: "created_at; DROP TABLE lead_inquiries",
      order: "desc",
    });
    const query = buildLeadQuery(filters);
    assert.equal(filters.sort, "created_at");
    assert.equal(query.values[0], "rose'; DROP TABLE lead_inquiries;--");
    assert.doesNotMatch(query.text, /DROP TABLE/);
    assert.match(query.text, /CASE WHEN \$8::text = 'created_at'/);
  });

  it("exports only the requested columns and human-readable source", async () => {
    const rows = mapLeadExportRows([exportRecord]);
    assert.deepEqual(rows[0], [
      "Rose Cleaning",
      "rose@example.com",
      "617-555-0100",
      2,
      1,
      "Hero quote",
      new Date("2026-09-28T14:30:00.000Z"),
    ]);

    const bytes = await createLeadWorkbook(rows);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(bytes) as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const sheet = workbook.getWorksheet("Service Inquiries");
    assert.ok(sheet);
    assert.equal(sheet.rowCount, 2);
    assert.equal(sheet.columnCount, 7);
    assert.deepEqual((sheet.getRow(1).values as unknown[]).slice(1), [...LEAD_EXPORT_HEADERS]);
    assert.equal(sheet.getRow(2).getCell(6).value, "Hero quote");
    assert.equal(sheet.getRow(2).getCell(7).value instanceof Date, true);
    assert.equal(JSON.stringify(bytes).includes("must-not-export"), false);
    assert.equal(
      mapLeadExportRows([{ ...exportRecord, source: "service_inquiry" }])[0][5],
      "Service inquiry",
    );
  });

  it("returns a valid header-only workbook for zero matches and a dated filename", async () => {
    const handler = createLeadExportHandler({
      authorize: async () => null,
      fetchLeads: async () => [],
      createWorkbook: createLeadWorkbook,
      now: () => new Date("2026-09-28T23:59:00.000Z"),
    });
    const response = await handler(new Request("https://example.test/api/admin/leads/export?q=not-found"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Content-Type"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    assert.equal(response.headers.get("Content-Disposition"), 'attachment; filename="saskia-service-inquiries-2026-09-28.xlsx"');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()) as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    assert.equal(workbook.getWorksheet("Service Inquiries")?.rowCount, 1);
  });
});
