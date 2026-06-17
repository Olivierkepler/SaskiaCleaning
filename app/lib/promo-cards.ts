export type PromoCardRow = {
  id: number;
  tag: string;
  title: string;
  title_small: string | null;
  description: string;
  cta_label: string;
  cta_href: string;
  image_url: string;
  image_alt: string;
  is_red_tag: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PromoCard = {
  id: number;
  tag: string;
  title: string;
  titleSmall: string | null;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  isRedTag: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromoCardInput = {
  tag: string;
  title: string;
  titleSmall: string | null;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  isRedTag: boolean;
  sortOrder: number;
  isActive: boolean;
};

export function isDashboardAuthorized(key: string | null): boolean {
  return key === process.env.DASHBOARD_KEY;
}

export function serializePromoCard(row: PromoCardRow): PromoCard {
  return {
    id: row.id,
    tag: row.tag,
    title: row.title,
    titleSmall: row.title_small,
    description: row.description,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    isRedTag: row.is_red_tag,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializePublicPromoCard(row: PromoCardRow) {
  const card = serializePromoCard(row);
  return {
    id: card.id,
    tag: card.tag,
    title: card.title,
    titleSmall: card.titleSmall ?? undefined,
    description: card.description,
    ctaLabel: card.ctaLabel,
    ctaHref: card.ctaHref,
    imageUrl: card.imageUrl,
    imageAlt: card.imageAlt,
    isRedTag: card.isRedTag,
  };
}

function readNullableString(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): string | null | undefined {
  const value = body[camelKey] ?? body[snakeKey];
  if (value === null) return null;
  return typeof value === "string" ? value.trim() : undefined;
}

function readString(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): string | undefined {
  const value = readNullableString(body, camelKey, snakeKey);
  if (value === undefined || value === null) return undefined;
  return value;
}

function readBoolean(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): boolean | undefined {
  const value = body[camelKey] ?? body[snakeKey];
  if (typeof value === "boolean") return value;
  return undefined;
}

function readInteger(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): number | undefined {
  const value = body[camelKey] ?? body[snakeKey];
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return undefined;
}

export function parsePromoCardInput(
  body: unknown,
  { partial = false }: { partial?: boolean } = {},
):
  | { data: PromoCardInput }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  const tag = readString(record, "tag", "tag");
  const title = readString(record, "title", "title");
  const titleSmallRaw = readNullableString(record, "titleSmall", "title_small");
  const description = readString(record, "description", "description");
  const ctaLabel = readString(record, "ctaLabel", "cta_label");
  const ctaHref = readString(record, "ctaHref", "cta_href");
  const imageUrl = readString(record, "imageUrl", "image_url");
  const imageAlt = readString(record, "imageAlt", "image_alt");
  const isRedTag = readBoolean(record, "isRedTag", "is_red_tag");
  const sortOrder = readInteger(record, "sortOrder", "sort_order");
  const isActive = readBoolean(record, "isActive", "is_active");

  const requiredFields = [
    ["tag", tag],
    ["title", title],
    ["description", description],
    ["ctaLabel", ctaLabel],
    ["ctaHref", ctaHref],
    ["imageUrl", imageUrl],
    ["imageAlt", imageAlt],
  ] as const;

  if (!partial) {
    for (const [name, value] of requiredFields) {
      if (!value) {
        return { error: `Missing or invalid ${name}.` };
      }
    }
  }

  if (partial) {
    const hasAnyField =
      tag !== undefined ||
      title !== undefined ||
      titleSmallRaw !== undefined ||
      description !== undefined ||
      ctaLabel !== undefined ||
      ctaHref !== undefined ||
      imageUrl !== undefined ||
      imageAlt !== undefined ||
      isRedTag !== undefined ||
      sortOrder !== undefined ||
      isActive !== undefined;

    if (!hasAnyField) {
      return { error: "No valid fields to update." };
    }
  }

  if (sortOrder !== undefined && sortOrder < 0) {
    return { error: "sortOrder must be a non-negative integer." };
  }

  return {
    data: {
      tag: tag ?? "",
      title: title ?? "",
      titleSmall: titleSmallRaw === undefined ? null : titleSmallRaw,
      description: description ?? "",
      ctaLabel: ctaLabel ?? "",
      ctaHref: ctaHref ?? "",
      imageUrl: imageUrl ?? "",
      imageAlt: imageAlt ?? "",
      isRedTag: isRedTag ?? false,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    },
  };
}

export function mergePromoCardInput(
  existing: PromoCardRow,
  patch: Partial<PromoCardInput>,
): PromoCardInput {
  return {
    tag: patch.tag ?? existing.tag,
    title: patch.title ?? existing.title,
    titleSmall:
      patch.titleSmall !== undefined ? patch.titleSmall : existing.title_small,
    description: patch.description ?? existing.description,
    ctaLabel: patch.ctaLabel ?? existing.cta_label,
    ctaHref: patch.ctaHref ?? existing.cta_href,
    imageUrl: patch.imageUrl ?? existing.image_url,
    imageAlt: patch.imageAlt ?? existing.image_alt,
    isRedTag: patch.isRedTag ?? existing.is_red_tag,
    sortOrder: patch.sortOrder ?? existing.sort_order,
    isActive: patch.isActive ?? existing.is_active,
  };
}

export const EMPTY_PROMO_CARD_FORM: PromoCardInput = {
  tag: "",
  title: "",
  titleSmall: null,
  description: "",
  ctaLabel: "",
  ctaHref: "",
  imageUrl: "",
  imageAlt: "",
  isRedTag: false,
  sortOrder: 0,
  isActive: true,
};
