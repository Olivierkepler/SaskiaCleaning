import { requireAdminApi } from "@/app/lib/admin-auth";
import { sql } from "@/app/lib/db";
import {
  createLeadMutationHandlers,
  type LeadEditFields,
} from "@/app/lib/lead-management";

const handlers = createLeadMutationHandlers({
  authorize: async () => {
    const gate = await requireAdminApi();
    return gate.ok ? null : gate.response;
  },
  update: async (id: number, fields: LeadEditFields) => {
    const rows = await sql`
      UPDATE lead_inquiries
      SET
        full_name = ${fields.fullName},
        email = ${fields.email},
        phone = ${fields.phone},
        bedrooms = ${fields.bedrooms},
        bathrooms = ${fields.bathrooms}
      WHERE id = ${id}
      RETURNING id
    `;
    return rows.length > 0;
  },
  delete: async (id: number) => {
    const rows = await sql`
      DELETE FROM lead_inquiries
      WHERE id = ${id}
      RETURNING id
    `;
    return rows.length > 0;
  },
});

export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
