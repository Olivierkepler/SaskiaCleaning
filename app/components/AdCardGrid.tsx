"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface AdCardItem {
  id: number;
  tag: string;
  title: string;
  titleSmall?: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  isRedTag?: boolean;
}

const cards: AdCardItem[] = [
  {
    id: 1,
    tag: "REFERRAL",
    title: "Give $20,",
    titleSmall: "Get $20",
    description: "Refer a friend — you both save $20.",
    ctaLabel: "REFER NOW",
    ctaHref: "https://saskiaservices.com/#quote",
    imageUrl: "/images/friend_sharing.jpg",
    imageAlt: "Refer a friend to Saskia Cleaning",
  },
  {
    id: 2,
    tag: "LIMITED TIME",
    title: "$20 Off",
    titleSmall: "Deep Clean",
    description: "Save $20 this week. MA & RI.",
    ctaLabel: "BOOK NOW",
    ctaHref: "https://saskiaservices.com/#quote",
    imageUrl: "/images/limited_deal.jpg",
    imageAlt: "Professional deep cleaning service",
    isRedTag: true,
  },
  {
    id: 3,
    tag: "NEW",
    title: "Airbnb",
    titleSmall: "Turnover",
    description: "Guest-ready turnovers. From $120.",
    ctaLabel: "LEARN MORE",
    ctaHref: "https://saskiaservices.com/#services",
    imageUrl: "/images/towel-folder.jpg",
    imageAlt: "Airbnb turnover cleaning service",
  },
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

function AdCard({ card, index }: { card: AdCardItem; index: number }) {
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.25 }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-[10px] border border-sky-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:outline hover:outline-2 hover:outline-offset-[-1px] hover:outline-sky-500" >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={card.imageUrl}
          alt={card.imageAlt}
          fill
          sizes="(max-width: 768px) 80vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div
          className="absolute left-0 top-4 flex items-center px-3 py-1"
          style={{ backgroundColor: card.isRedTag ? "#CC0000" : "#0ea5e9" }}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white">
            {card.tag}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between border-t border-sky-500 px-5 py-5">
        <div>
          <p className="font-serif text-[clamp(24px,2vw,30px)] font-bold leading-none tracking-[-0.02em] text-gray-900">
            {card.title}
          </p>

          {card.titleSmall && (
            <p className="font-serif text-[clamp(24px,2vw,30px)] font-bold leading-tight tracking-[-0.02em] text-gray-900">
              {card.titleSmall}
            </p>
          )}

          <p className="mt-3 font-sans text-[12px] leading-[1.5] text-gray-500">
            {card.description}
          </p>
        </div>

        <a
          href={card.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={card.ctaLabel}
          className="mt-5 inline-flex w-full items-center justify-center border border-sky-500 py-3 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-sky-500 transition-all duration-200 hover:bg-sky-500 hover:text-white"
        >
          {card.ctaLabel}
        </a>
      </div>
    </motion.article>
  );
}

export default function AdCardGrid() {
  return (
    <section className="relative z-20 w-full bg-white">
      <div className="mx-auto max-w-7xl py-8">
        <div className="flex snap-x snap-mandatory gap-4  overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-6 md:hidden [&::-webkit-scrollbar]:hidden">
          {cards.map((card, index) => (
            <div key={card.id} className="w-[80%] flex-none snap-center sm:w-[65%]">
              <AdCard card={card} index={index} />
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-3 gap-5 px-6 md:grid lg:px-10 xl:px-12">
          {cards.map((card, index) => (
            <AdCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}