import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import {
  isDashboardAuthorized,
  parsePromoCardInput,
  serializePromoCard,
  serializePublicPromoCard,
  type PromoCardRow,
} from "../../lib/promo-cards";

export async function GET() {
  try {
    const rows = await sql`
      SELECT *
      FROM promo_cards
      WHERE is_active = true
      ORDER BY sort_order ASC, id ASC
    `;

    const cards = (rows as PromoCardRow[]).map(serializePublicPromoCard);

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load promo cards." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!isDashboardAuthorized(key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = parsePromoCardInput(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const card = parsed.data;

    const result = await sql`
      INSERT INTO promo_cards (
        tag,
        title,
        title_small,
        description,
        cta_label,
        cta_href,
        image_url,
        image_alt,
        is_red_tag,
        sort_order,
        is_active
      )
      VALUES (
        ${card.tag},
        ${card.title},
        ${card.titleSmall},
        ${card.description},
        ${card.ctaLabel},
        ${card.ctaHref},
        ${card.imageUrl},
        ${card.imageAlt},
        ${card.isRedTag},
        ${card.sortOrder},
        ${card.isActive}
      )
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
        : "Failed to create promo card.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
