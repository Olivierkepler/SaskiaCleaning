import { google } from "googleapis";
import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { sendEmail } from "@/app/lib/email";

const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_TEXT_LENGTHS = {
  fullName: 200,
  email: 254,
  phone: 50,
  preferredContact: 40,
  serviceType: 100,
  squareFootage: 20,
  accessNotes: 2000,
  productPreference: 100,
  scentProfile: 100,
  priorityAreas: 1000,
  allergyConcerns: 1000,
  pets: 300,
  strictAvoidances: 1000,
} as const;

export type InquirySource = "hero_quote" | "service_inquiry";
export type ValidatedInquiry = {
  source: InquirySource;
  idempotencyKey: string;
  fullName: string;
  email: string;
  phone: string | null;
  preferredContact: string | null;
  serviceType: string | null;
  squareFootage: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  accessNotes: string | null;
  productPreference: string | null;
  scentProfile: string | null;
  priorityAreas: string | null;
  allergyConcerns: string | null;
  pets: string | null;
  strictAvoidances: string | null;
};

export type LeadRecord = {
  id: number;
  source: InquirySource;
  full_name: string;
  email: string;
  phone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  created_at: string | Date;
};

type InquiryValidation =
  | { ok: true; inquiry: ValidatedInquiry }
  | { ok: false; error: string };

const ALLOWED_FIELDS = new Set([
  "source",
  "idempotencyKey",
  ...Object.keys(MAX_TEXT_LENGTHS),
  "bedrooms",
  "bathrooms",
]);

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalText(
  value: unknown,
  field: keyof typeof MAX_TEXT_LENGTHS,
): { ok: true; value: string | null } | { ok: false } {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false };
  const trimmed = value.trim();
  if (trimmed.length > MAX_TEXT_LENGTHS[field]) return { ok: false };
  return { ok: true, value: trimmed || null };
}

function roomCount(value: unknown):
  | { ok: true; value: number | null }
  | { ok: false } {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value !== "number" && typeof value !== "string") {
    return { ok: false };
  }
  if (typeof value === "string" && !/^\d{1,3}$/.test(value.trim())) {
    return { ok: false };
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 100) {
    return { ok: false };
  }
  return { ok: true, value: parsed };
}

export function validateInquiryPayload(value: unknown): InquiryValidation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "A valid inquiry object is required." };
  }

  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))) {
    return { ok: false, error: "The inquiry contains unsupported fields." };
  }

  if (body.source !== "hero_quote" && body.source !== "service_inquiry") {
    return { ok: false, error: "A valid inquiry source is required." };
  }
  if (
    typeof body.idempotencyKey !== "string" ||
    body.idempotencyKey.length !== 36 ||
    !UUID_V4_PATTERN.test(body.idempotencyKey)
  ) {
    return { ok: false, error: "A valid inquiry request key is required." };
  }

  const fullName = optionalText(body.fullName, "fullName");
  const email = optionalText(body.email, "email");
  if (!fullName.ok || !fullName.value) {
    return { ok: false, error: "Name is required and must be 200 characters or fewer." };
  }
  if (
    !email.ok ||
    !email.value ||
    email.value.length > 254 ||
    !EMAIL_PATTERN.test(email.value)
  ) {
    return { ok: false, error: "A valid email address is required." };
  }

  const textFields = {} as Record<keyof typeof MAX_TEXT_LENGTHS, string | null>;
  for (const field of Object.keys(MAX_TEXT_LENGTHS) as Array<
    keyof typeof MAX_TEXT_LENGTHS
  >) {
    if (field === "fullName" || field === "email") continue;
    const parsed = optionalText(body[field], field);
    if (!parsed.ok) {
      return {
        ok: false,
        error: `${field} must be a string of ${MAX_TEXT_LENGTHS[field]} characters or fewer.`,
      };
    }
    textFields[field] = parsed.value;
  }

  const bedrooms = roomCount(body.bedrooms);
  const bathrooms = roomCount(body.bathrooms);
  if (!bedrooms.ok || !bathrooms.ok) {
    return {
      ok: false,
      error: "Bedrooms and bathrooms must be whole numbers from 0 to 100.",
    };
  }

  if (body.source === "service_inquiry" && !textFields.serviceType) {
    return { ok: false, error: "Service type is required for this inquiry." };
  }

  return {
    ok: true,
    inquiry: {
      source: body.source,
      idempotencyKey: body.idempotencyKey,
      fullName: fullName.value,
      email: email.value,
      phone: textFields.phone,
      preferredContact: textFields.preferredContact,
      serviceType: textFields.serviceType,
      squareFootage: textFields.squareFootage,
      bedrooms: bedrooms.value,
      bathrooms: bathrooms.value,
      accessNotes: textFields.accessNotes,
      productPreference: textFields.productPreference,
      scentProfile: textFields.scentProfile,
      priorityAreas: textFields.priorityAreas,
      allergyConcerns: textFields.allergyConcerns,
      pets: textFields.pets,
      strictAvoidances: textFields.strictAvoidances,
    },
  };
}

type InquiryPersistence = {
  insertOrGet: (inquiry: ValidatedInquiry) => Promise<{
    lead: LeadRecord;
    inserted: boolean;
  }>;
  appendToSheets: (inquiry: ValidatedInquiry) => Promise<void>;
  markSheetsSynced: (leadId: number) => Promise<void>;
  warn?: (message: string) => void;
};

export async function persistInquiry(
  inquiry: ValidatedInquiry,
  dependencies: InquiryPersistence,
): Promise<{ lead: LeadRecord; duplicate: boolean; sheetsSynced: boolean | null }> {
  const result = await dependencies.insertOrGet(inquiry);
  if (!result.inserted) {
    return { lead: result.lead, duplicate: true, sheetsSynced: null };
  }

  try {
    await dependencies.appendToSheets(inquiry);
  } catch {
    (dependencies.warn ?? console.warn)(
      "Google Sheets service inquiry append failed; lead remains saved.",
    );
    return { lead: result.lead, duplicate: false, sheetsSynced: false };
  }

  try {
    await dependencies.markSheetsSynced(result.lead.id);
    return { lead: result.lead, duplicate: false, sheetsSynced: true };
  } catch {
    (dependencies.warn ?? console.warn)(
      "Google Sheets append succeeded but sync status could not be recorded.",
    );
    return { lead: result.lead, duplicate: false, sheetsSynced: false };
  }
}

async function insertOrGetLead(inquiry: ValidatedInquiry) {
  const insertedRows = (await sql`
    INSERT INTO lead_inquiries (
      source, idempotency_key, full_name, email, phone, bedrooms, bathrooms
    )
    VALUES (
      ${inquiry.source},
      ${inquiry.idempotencyKey},
      ${inquiry.fullName},
      ${inquiry.email},
      ${inquiry.phone},
      ${inquiry.bedrooms},
      ${inquiry.bathrooms}
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id, source, full_name, email, phone, bedrooms, bathrooms, created_at
  `) as LeadRecord[];

  if (insertedRows[0]) return { lead: insertedRows[0], inserted: true };

  const existingRows = (await sql`
    SELECT id, source, full_name, email, phone, bedrooms, bathrooms, created_at
    FROM lead_inquiries
    WHERE idempotency_key = ${inquiry.idempotencyKey}
    LIMIT 1
  `) as LeadRecord[];
  if (!existingRows[0]) throw new Error("Idempotent lead record was not found.");
  return { lead: existingRows[0], inserted: false };
}

async function markLeadSheetsSynced(leadId: number): Promise<void> {
  const rows = await sql`
    UPDATE lead_inquiries
    SET sheets_synced_at = now()
    WHERE id = ${leadId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("Lead sync status was not updated.");
}

async function appendInquiryToSheets(inquiry: ValidatedInquiry) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:P",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        new Date().toLocaleString(),
        inquiry.fullName,
        inquiry.email,
        inquiry.phone,
        inquiry.preferredContact,
        inquiry.serviceType,
        inquiry.squareFootage,
        inquiry.bedrooms,
        inquiry.bathrooms,
        inquiry.accessNotes,
        inquiry.productPreference,
        inquiry.scentProfile,
        inquiry.priorityAreas,
        inquiry.allergyConcerns,
        inquiry.pets,
        inquiry.strictAvoidances,
      ]],
    },
  });
}

async function notifyAdminOfNewInquiry(): Promise<void> {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (!recipient) return;

  try {
    const result = await sendEmail({
      to: recipient,
      subject: "New service inquiry",
      text: "A new service inquiry has been received. View it in the admin dashboard: /dashboard/leads",
    });

    if (result.status === "failed") {
      console.warn("Admin service inquiry notification could not be sent.");
    }
  } catch {
    console.warn("Admin service inquiry notification could not be sent.");
  }
}

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "Inquiry request is too large." }, { status: 413 });
    }
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "Inquiry request is too large." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "A valid JSON inquiry is required." }, { status: 400 });
    }

    const validation = validateInquiryPayload(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await persistInquiry(validation.inquiry, {
      insertOrGet: insertOrGetLead,
      appendToSheets: appendInquiryToSheets,
      markSheetsSynced: markLeadSheetsSynced,
    });

    if (!result.duplicate) {
      await notifyAdminOfNewInquiry();
    }

    return NextResponse.json({
      success: true,
      leadId: result.lead.id,
      duplicate: result.duplicate,
      sheetsSynced: result.sheetsSynced,
    });
  } catch {
    console.error("Service inquiry could not be saved.");
    return NextResponse.json(
      { error: "We could not save your inquiry. Please try again." },
      { status: 503 },
    );
  }
}
