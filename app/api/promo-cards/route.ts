import { NextResponse } from "next/server";
import { sql } from "../../lib/db";

type PromoCardRow = {
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
};

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        id,
        tag,
        title,
        title_small,
        description,
        cta_label,
        cta_href,
        image_url,
        image_alt,
        is_red_tag,
        sort_order
      FROM promo_cards
      WHERE is_active = true
      ORDER BY sort_order ASC, id ASC
    `;

    const cards = (rows as PromoCardRow[]).map((row) => ({
      id: row.id,
      tag: row.tag,
      title: row.title,
      titleSmall: row.title_small ?? undefined,
      description: row.description,
      ctaLabel: row.cta_label,
      ctaHref: row.cta_href,
      imageUrl: row.image_url,
      imageAlt: row.image_alt,
      isRedTag: row.is_red_tag,
    }));

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load promo cards." },
      { status: 500 }
    );
  }
}
