import ExcelJS from "exceljs";
import type { LeadExportRow } from "./lead-management";

export const LEAD_EXPORT_HEADERS = [
  "Name",
  "Email",
  "Phone",
  "Bedrooms",
  "Bathrooms",
  "Source",
  "Submitted",
] as const;

export async function createLeadWorkbook(rows: LeadExportRow[]): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Service Inquiries");

  sheet.columns = [
    { header: LEAD_EXPORT_HEADERS[0], key: "name", width: 28 },
    { header: LEAD_EXPORT_HEADERS[1], key: "email", width: 34 },
    { header: LEAD_EXPORT_HEADERS[2], key: "phone", width: 20 },
    { header: LEAD_EXPORT_HEADERS[3], key: "bedrooms", width: 13 },
    { header: LEAD_EXPORT_HEADERS[4], key: "bathrooms", width: 13 },
    { header: LEAD_EXPORT_HEADERS[5], key: "source", width: 22 },
    { header: LEAD_EXPORT_HEADERS[6], key: "submitted", width: 27, style: { numFmt: "mmm d, yyyy h:mm AM/PM" } },
  ];

  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.commit();
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: "G1" };

  for (const [name, email, phone, bedrooms, bathrooms, source, submitted] of rows) {
    sheet.addRow({
      name,
      email,
      phone,
      bedrooms,
      bathrooms,
      source,
      submitted,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const bytes = new Uint8Array(buffer);
  const output = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(output).set(bytes);
  return output;
}
