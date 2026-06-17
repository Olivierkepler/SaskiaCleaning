import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";
import {
  isDashboardAuthorized,
  mergePromoCardInput,
  parsePromoCardInput,
  serializePromoCard,
  type PromoCardInput,
  type PromoCardRow,
} from "../../../lib/promo-cards";

function parsePromoCardId(id: string) {
  if (!/^\d+$/.test(id)) return null;
  const parsed = Number.parseInt(id, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function buildPatch(
  body: Record<string, unknown>,
  parsed: PromoCardInput,
): Partial<PromoCardInput> {
  const patch: Partial<PromoCardInput> = {};

  if (body.tag !== undefined) patch.tag = parsed.tag;
  if (body.title !== undefined) patch.title = parsed.title;
  if (body.titleSmall !== undefined || body.title_small !== undefined) {
    patch.titleSmall =
      body.titleSmall === null || body.title_small === null
        ? null
        : parsed.titleSmall;
  }
  if (body.description !== undefined) patch.description = parsed.description;
  if (body.ctaLabel !== undefined || body.cta_label !== undefined) {
    patch.ctaLabel = parsed.ctaLabel;
  }
  if (body.ctaHref !== undefined || body.cta_href !== undefined) {
    patch.ctaHref = parsed.ctaHref;
  }
  if (body.imageUrl !== undefined || body.image_url !== undefined) {
    patch.imageUrl = parsed.imageUrl;
  }
  if (body.imageAlt !== undefined || body.image_alt !== undefined) {
    patch.imageAlt = parsed.imageAlt;
  }
  if (body.isRedTag !== undefined || body.is_red_tag !== undefined) {
    patch.isRedTag = parsed.isRedTag;
  }
  if (body.sortOrder !== undefined || body.sort_order !== undefined) {
    patch.sortOrder = parsed.sortOrder;
  }
  if (body.isActive !== undefined || body.is_active !== undefined) {
    patch.isActive = parsed.isActive;
  }

  return patch;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const cardId = parsePromoCardId(id);
    if (!cardId) {
      return NextResponse.json({ error: "Invalid promo card ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = parsePromoCardInput(body, { partial: true });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existingRows = await sql`
      SELECT *
      FROM promo_cards
      WHERE id = ${cardId}
    `;

    const existing = existingRows[0] as PromoCardRow | undefined;
    if (!existing) {
      return NextResponse.json({ error: "Promo card not found." }, { status: 404 });
    }

    const patch = buildPatch(body as Record<string, unknown>, parsed.data);
    const merged = mergePromoCardInput(existing, patch);

    const result = await sql`
      UPDATE promo_cards
      SET
        tag = ${merged.tag},
        title = ${merged.title},
        title_small = ${merged.titleSmall},
        description = ${merged.description},
        cta_label = ${merged.ctaLabel},
        cta_href = ${merged.ctaHref},
        image_url = ${merged.imageUrl},
        image_alt = ${merged.imageAlt},
        is_red_tag = ${merged.isRedTag},
        sort_order = ${merged.sortOrder},
        is_active = ${merged.isActive},
        updated_at = now()
      WHERE id = ${cardId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      card: serializePromoCard(result[0] as PromoCardRow),
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error && error.message.includes("promo_cards_sort_order_key")
        ? "sortOrder must be unique."
        : "Failed to update promo card.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const cardId = parsePromoCardId(id);
    if (!cardId) {
      return NextResponse.json({ error: "Invalid promo card ID." }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM promo_cards
      WHERE id = ${cardId}
      RETURNING id
    `;

    if (!result[0]) {
      return NextResponse.json({ error: "Promo card not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete promo card." },
      { status: 500 },
    );
  }
}
