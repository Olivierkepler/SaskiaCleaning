import { requireAdminApi } from "@/app/lib/admin-auth";
import { sql } from "@/app/lib/db";
import { createLeadWorkbook } from "@/app/lib/lead-excel";
import {
  buildLeadQuery,
  createLeadExportHandler,
  type LeadExportFilters,
  type LeadExportRecord,
} from "@/app/lib/lead-management";

const exportHandler = createLeadExportHandler({
  authorize: async () => {
    const gate = await requireAdminApi();
    return gate.ok ? null : gate.response;
  },
  fetchLeads: async (filters: LeadExportFilters) => {
    const query = buildLeadQuery(filters);
    return (await sql.query(query.text, query.values)) as LeadExportRecord[];
  },
  createWorkbook: createLeadWorkbook,
});

export const GET = exportHandler;
