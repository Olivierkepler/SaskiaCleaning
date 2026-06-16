"use client";

import { useEffect, useState } from "react";
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
    ctaLabel: "Refer Now",
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
    ctaLabel: "Book Now",
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
    ctaLabel: "Learn More",
    ctaHref: "https://saskiaservices.com/#services",
    imageUrl: "/images/towel-folder.jpg",
    imageAlt: "Airbnb turnover cleaning service",
  },
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 32,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

function AdCard({ card, index }: { card: AdCardItem; index: number }) {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    setHasMounted(true);
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const tagColor = card.isRedTag ? "bg-red-700" : "bg-sky-500";
  const className =
    "group flex h-full flex-col overflow-hidden rounded-xl border border-sky-500 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

  const cardContent = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={card.imageUrl}
          alt={card.imageAlt}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 768px) 65vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className={`absolute left-0 top-4 px-3 py-1 ${tagColor}`}>
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white">
            {card.tag}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between border-t border-sky-500 p-5">
        <div>
          <h3 className="font-serif text-[clamp(24px,2vw,30px)] font-bold leading-none tracking-[-0.02em] text-gray-950">
            {card.title}
            {card.titleSmall && (
              <span className="block leading-tight">{card.titleSmall}</span>
            )}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            {card.description}
          </p>
        </div>

        <a
          href={card.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${card.ctaLabel}: ${card.title} ${card.titleSmall ?? ""}`}
          className="mt-5 rounded-[10px] inline-flex w-full items-center justify-center border border-sky-500 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-500 transition-colors duration-200 hover:bg-sky-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          {card.ctaLabel}
        </a>
      </div>
    </>
  );

  if (!hasMounted || isMobile) {
    return <article className={className}>{cardContent}</article>;
  }

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {cardContent}
    </motion.article>
  );
}


 
export default function AdCardGrid() {
  return (
    <section className="relative z-20 w-full bg-white py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-6 md:hidden [&::-webkit-scrollbar]:hidden">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="w-[80%] flex-none snap-center sm:w-[65%]"
            >
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