export const LEAD_SORT_KEYS = [
  "name",
  "email",
  "bedrooms",
  "bathrooms",
  "created_at",
] as const;
export type LeadSortKey = (typeof LEAD_SORT_KEYS)[number];

export const LEAD_DATE_FILTERS = ["all", "today", "7d", "30d"] as const;
export type LeadDateFilter = (typeof LEAD_DATE_FILTERS)[number];

export type LeadFilters = {
  q: string | null;
  source: "hero_quote" | "service_inquiry" | null;
  date: LeadDateFilter;
  bedrooms: string | null;
  bathrooms: string | null;
  sort: LeadSortKey;
  order: "asc" | "desc";
  page: number;
};

export type LeadExportFilters = Omit<LeadFilters, "page">;

export type LeadExportRecord = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  source: "hero_quote" | "service_inquiry";
  created_at: string | Date;
};

export type LeadExportRow = [
  string,
  string,
  string,
  number | null,
  number | null,
  "Hero quote" | "Service inquiry",
  Date,
];

export type LeadEditFields = {
  fullName: string;
  email: string;
  phone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
};

export function leadSearchMatches(
  lead: { full_name: string | null; email: string | null; phone: string | null },
  query: string,
): boolean {
  const normalized = query.trim().toLocaleLowerCase("en-US");
  if (!normalized) return true;
  return [lead.full_name, lead.email, lead.phone].some((value) =>
    value?.toLocaleLowerCase("en-US").includes(normalized),
  );
}

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function roomFilter(value: string | undefined): string | null {
  if (!value) return null;
  return ["1", "2", "3", "4", "5+"].includes(value) ? value : null;
}

export function parseLeadFilters(params: SearchParams): LeadFilters {
  const rawQuery = firstString(params.q)?.trim().slice(0, 100) ?? "";
  const rawSource = firstString(params.source);
  const rawDate = firstString(params.date);
  const rawSort = firstString(params.sort);
  const rawOrder = firstString(params.order);
  const rawPage = Number(firstString(params.page));

  return {
    q: rawQuery || null,
    source:
      rawSource === "hero_quote" || rawSource === "service_inquiry"
        ? rawSource
        : null,
    date: LEAD_DATE_FILTERS.includes(rawDate as LeadDateFilter)
      ? (rawDate as LeadDateFilter)
      : "all",
    bedrooms: roomFilter(firstString(params.bedrooms)),
    bathrooms: roomFilter(firstString(params.bathrooms)),
    sort: LEAD_SORT_KEYS.includes(rawSort as LeadSortKey)
      ? (rawSort as LeadSortKey)
      : "created_at",
    order: rawOrder === "asc" ? "asc" : "desc",
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 100_000) : 1,
  };
}

export function parseLeadExportFilters(params: SearchParams): LeadExportFilters {
  const { page: _page, ...filters } = parseLeadFilters(params);
  return filters;
}

export function mapLeadExportRows(records: LeadExportRecord[]): LeadExportRow[] {
  return records.map((record) => [
    record.full_name ?? "",
    record.email ?? "",
    record.phone ?? "",
    record.bedrooms,
    record.bathrooms,
    record.source === "hero_quote" ? "Hero quote" : "Service inquiry",
    new Date(record.created_at),
  ]);
}

type LeadExportHandlerDependencies = {
  authorize: () => Promise<Response | null>;
  fetchLeads: (filters: LeadExportFilters) => Promise<LeadExportRecord[]>;
  createWorkbook: (rows: LeadExportRow[]) => Promise<ArrayBuffer>;
  now?: () => Date;
};

export function createLeadExportHandler(dependencies: LeadExportHandlerDependencies) {
  return async function GET(request: Request): Promise<Response> {
    const denied = await dependencies.authorize();
    if (denied) return denied;

    try {
      const params = Object.fromEntries(new URL(request.url).searchParams.entries());
      const filters = parseLeadExportFilters(params);
      const records = await dependencies.fetchLeads(filters);
      const bytes = await dependencies.createWorkbook(mapLeadExportRows(records));
      const date = (dependencies.now?.() ?? new Date()).toISOString().slice(0, 10);

      return new Response(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="saskia-service-inquiries-${date}.xlsx"`,
          "Cache-Control": "private, no-store",
        },
      });
    } catch {
      return Response.json({ error: "Failed to export service inquiries." }, { status: 500 });
    }
  };
}

export type LeadQueryFilters = Pick<
  LeadFilters,
  "q" | "source" | "date" | "bedrooms" | "bathrooms" | "sort" | "order"
>;

export function buildLeadQuery(
  filters: LeadQueryFilters,
  options: { count?: boolean; includeId?: boolean; limit?: number; offset?: number } = {},
): { text: string; values: unknown[] } {
  const values: unknown[] = [];
  const bind = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  const query = bind(filters.q);
  const source = bind(filters.source);
  const date = bind(filters.date);
  const bedroomExact = filters.bedrooms && filters.bedrooms !== "5+" ? Number(filters.bedrooms) : null;
  const bedroomFivePlus = filters.bedrooms === "5+";
  const bathroomExact = filters.bathrooms && filters.bathrooms !== "5+" ? Number(filters.bathrooms) : null;
  const bathroomFivePlus = filters.bathrooms === "5+";
  const bedrooms = bind(bedroomExact);
  const bedroomRange = bind(bedroomFivePlus);
  const bathrooms = bind(bathroomExact);
  const bathroomRange = bind(bathroomFivePlus);

  const where = `WHERE (
    ${query}::text IS NULL OR
    position(lower(${query}::text) in lower(coalesce(full_name, ''))) > 0 OR
    position(lower(${query}::text) in lower(coalesce(email, ''))) > 0 OR
    position(lower(${query}::text) in lower(coalesce(phone, ''))) > 0
  )
    AND (${source}::text IS NULL OR source = ${source}::text)
    AND (
      ${date}::text = 'all' OR
      (${date}::text = 'today' AND created_at >= (((now() AT TIME ZONE 'America/New_York')::date)::timestamp AT TIME ZONE 'America/New_York')) OR
      (${date}::text = '7d' AND created_at >= now() - interval '7 days') OR
      (${date}::text = '30d' AND created_at >= now() - interval '30 days')
    )
    AND (${bedrooms}::integer IS NULL OR bedrooms = ${bedrooms}::integer)
    AND (${bedroomRange}::boolean = false OR bedrooms >= 5)
    AND (${bathrooms}::integer IS NULL OR bathrooms = ${bathrooms}::integer)
    AND (${bathroomRange}::boolean = false OR bathrooms >= 5)`;

  if (options.count) {
    return {
      text: `SELECT count(*)::integer AS count FROM lead_inquiries ${where}`,
      values,
    };
  }

  const sort = bind(filters.sort);
  const order = bind(filters.order);
  const projection = options.includeId ? "id, " : "";
  let text = `SELECT ${projection}full_name, email, phone, bedrooms, bathrooms, source, created_at
    FROM lead_inquiries ${where}
    ORDER BY
      CASE WHEN ${sort}::text = 'name' AND ${order}::text = 'asc' THEN lower(coalesce(full_name, '')) END ASC,
      CASE WHEN ${sort}::text = 'name' AND ${order}::text = 'desc' THEN lower(coalesce(full_name, '')) END DESC,
      CASE WHEN ${sort}::text = 'email' AND ${order}::text = 'asc' THEN lower(coalesce(email, '')) END ASC,
      CASE WHEN ${sort}::text = 'email' AND ${order}::text = 'desc' THEN lower(coalesce(email, '')) END DESC,
      CASE WHEN ${sort}::text = 'bedrooms' AND ${order}::text = 'asc' THEN bedrooms END ASC,
      CASE WHEN ${sort}::text = 'bedrooms' AND ${order}::text = 'desc' THEN bedrooms END DESC,
      CASE WHEN ${sort}::text = 'bathrooms' AND ${order}::text = 'asc' THEN bathrooms END ASC,
      CASE WHEN ${sort}::text = 'bathrooms' AND ${order}::text = 'desc' THEN bathrooms END DESC,
      CASE WHEN ${sort}::text = 'created_at' AND ${order}::text = 'asc' THEN created_at END ASC,
      CASE WHEN ${sort}::text = 'created_at' AND ${order}::text = 'desc' THEN created_at END DESC,
      id DESC`;

  if (options.limit !== undefined) {
    text += ` LIMIT ${bind(options.limit)} OFFSET ${bind(options.offset ?? 0)}`;
  }

  return { text, values };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadEditPayload(
  value: unknown,
): { ok: true; fields: LeadEditFields } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "A valid inquiry object is required." };
  }

  const body = value as Record<string, unknown>;
  const allowed = new Set(["fullName", "email", "phone", "bedrooms", "bathrooms"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return { ok: false, error: "Only contact and room details can be edited." };
  }

  if (typeof body.fullName !== "string") {
    return { ok: false, error: "Name is required." };
  }
  const fullName = body.fullName.trim();
  if (!fullName || fullName.length > 200) {
    return { ok: false, error: "Name is required and must be 200 characters or fewer." };
  }

  if (typeof body.email !== "string") {
    return { ok: false, error: "A valid email address is required." };
  }
  const email = body.email.trim();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }

  let phone: string | null;
  if (body.phone == null) {
    phone = null;
  } else if (typeof body.phone === "string" && body.phone.trim().length <= 50) {
    phone = body.phone.trim() || null;
  } else {
    return { ok: false, error: "Phone must be 50 characters or fewer." };
  }

  const bedrooms = parseRoomCount(body.bedrooms, "Bedrooms");
  if (!bedrooms.ok) return bedrooms;
  const bathrooms = parseRoomCount(body.bathrooms, "Bathrooms");
  if (!bathrooms.ok) return bathrooms;

  return {
    ok: true,
    fields: { fullName, email, phone, bedrooms: bedrooms.value, bathrooms: bathrooms.value },
  };
}

function parseRoomCount(
  value: unknown,
  label: string,
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value == null || value === "") return { ok: true, value: null };
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > 100
  ) {
    return { ok: false, error: `${label} must be a whole number from 0 to 100.` };
  }
  return { ok: true, value };
}

function parseLeadId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

type LeadMutationDependencies = {
  authorize: () => Promise<Response | null>;
  update: (id: number, fields: LeadEditFields) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
};

type LeadRouteContext = { params: Promise<{ id: string }> };

export function createLeadMutationHandlers(dependencies: LeadMutationDependencies) {
  return {
    async PATCH(request: Request, context: LeadRouteContext): Promise<Response> {
      const denied = await dependencies.authorize();
      if (denied) return denied;

      const id = parseLeadId((await context.params).id);
      if (id === null) return Response.json({ error: "Invalid inquiry ID." }, { status: 400 });

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
      }
      const parsed = validateLeadEditPayload(body);
      if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

      try {
        if (!(await dependencies.update(id, parsed.fields))) {
          return Response.json({ error: "Inquiry not found." }, { status: 404 });
        }
        return Response.json({ success: true });
      } catch {
        return Response.json({ error: "Failed to update inquiry." }, { status: 500 });
      }
    },

    async DELETE(_request: Request, context: LeadRouteContext): Promise<Response> {
      const denied = await dependencies.authorize();
      if (denied) return denied;

      const id = parseLeadId((await context.params).id);
      if (id === null) return Response.json({ error: "Invalid inquiry ID." }, { status: 400 });

      try {
        if (!(await dependencies.delete(id))) {
          return Response.json({ error: "Inquiry not found." }, { status: 404 });
        }
        return Response.json({ success: true });
      } catch {
        return Response.json({ error: "Failed to delete inquiry." }, { status: 500 });
      }
    },
  };
}
