-- Promo/ad cards for AdCardGrid (managed via promo_cards table)

CREATE TABLE IF NOT EXISTS promo_cards (
  id SERIAL PRIMARY KEY,
  tag TEXT NOT NULL,
  title TEXT NOT NULL,
  title_small TEXT,
  description TEXT NOT NULL,
  cta_label TEXT NOT NULL,
  cta_href TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  is_red_tag BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS promo_cards_sort_order_key ON promo_cards (sort_order);

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
VALUES
  (
    'REFERRAL',
    'Give $20,',
    'Get $20',
    'Refer a friend — you both save $20.',
    'Refer Now',
    'https://saskiaservices.com/#quote',
    '/images/friend_sharing.jpg',
    'Refer a friend to Saskia Cleaning',
    false,
    1,
    true
  ),
  (
    'LIMITED TIME',
    '$20 Off',
    'Deep Clean',
    'Save $20 this week. MA & RI.',
    'Book Now',
    'https://saskiaservices.com/#quote',
    '/images/limited_deal.jpg',
    'Professional deep cleaning service',
    true,
    2,
    true
  ),
  (
    'NEW',
    'Airbnb',
    'Turnover',
    'Guest-ready turnovers. From $120.',
    'Learn More',
    'https://saskiaservices.com/#services',
    '/images/towel-folder.jpg',
    'Airbnb turnover cleaning service',
    false,
    3,
    true
  )
ON CONFLICT (sort_order) DO NOTHING;
