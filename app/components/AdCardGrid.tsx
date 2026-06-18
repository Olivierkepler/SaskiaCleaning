"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  buildReferralLink,
  buildReferralShareMessage,
  type ReferralCode,
} from "@/app/lib/referrals";

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

const fallbackCards: AdCardItem[] = [
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
    description: "Refer a friend and they save $20 on their first cleaning.",
    ctaLabel: "Refer Now",
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
    description: "Know an Airbnb host? Refer them and earn referral rewards.",
    ctaLabel: "Refer Now",
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

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const PROMO_REFERRAL_CTA_LABEL = "Refer Now";

function AdCard({
  card,
  index,
  onReferralClick,
}: {
  card: AdCardItem;
  index: number;
  onReferralClick?: () => void;
}) {
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

  const ctaClassName =
    "mt-5 rounded-[10px] inline-flex w-full items-center justify-center border border-sky-500 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-500 transition-colors duration-200 hover:bg-sky-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2";

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

        {onReferralClick ? (
          <button
            type="button"
            onClick={onReferralClick}
            aria-label={`${PROMO_REFERRAL_CTA_LABEL}: ${card.title} ${card.titleSmall ?? ""}`}
            className={ctaClassName}
          >
            {PROMO_REFERRAL_CTA_LABEL}
          </button>
        ) : (
          <a
            href={card.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${card.ctaLabel}: ${card.title} ${card.titleSmall ?? ""}`}
            className={ctaClassName}
          >
            {card.ctaLabel}
          </a>
        )}
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

type PromoCardsResponse = {
  success?: boolean;
  cards?: AdCardItem[];
};

type PublicReferralResponse = {
  success?: boolean;
  error?: string;
  referralCode?: ReferralCode;
  referralLink?: string;
};

function ReferralModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [referrerName, setReferrerName] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<ReferralCode | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const canUsePortal = typeof document !== "undefined";

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function resetModal() {
    setReferrerName("");
    setReferrerEmail("");
    setErrorMessage("");
    setIsSubmitting(false);
    setGeneratedCode(null);
    setCopyFeedback(null);
  }

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose();
    resetModal();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/referral-codes/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: referrerName.trim(),
          referrerEmail: referrerEmail.trim() || undefined,
        }),
      });

      const data = (await response.json()) as PublicReferralResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to create your referral code.");
      }

      if (!data.referralCode) {
        throw new Error("Failed to create your referral code.");
      }

      setGeneratedCode(data.referralCode);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create your referral code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback(label);
      window.setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      setCopyFeedback("Copy failed");
      window.setTimeout(() => setCopyFeedback(null), 2000);
    }
  }

  function handleBookCleaning() {
    handleClose();
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
  }

  const shareMessage = generatedCode
    ? buildReferralShareMessage(generatedCode.code)
    : "";
  const referralLink = generatedCode
    ? buildReferralLink(generatedCode.code)
    : "";

  if (!open || !canUsePortal) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="referral-modal-title"
      onClick={handleClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-[2rem] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.20)] ring-1 ring-slate-200 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
            <div className="mb-5">
              <h3
                id="referral-modal-title"
                className="text-xl font-bold text-slate-900"
              >
                Refer a friend
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Share this code with a friend.
              </p>
            </div>

            {generatedCode ? (
              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
                  <p>
                    Your friend gets $20 off their first cleaning when they book
                    with your code.
                  </p>
                  <p>
                    You receive your $20 referral reward after your referred
                    friend completes a paid service.
                  </p>
                  <p>
                    Referral rewards are not applied immediately. They are
                    reviewed after the referred booking is completed.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Your referral code
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold tracking-[0.12em] text-slate-900">
                    {generatedCode.code}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Your referral link
                  </p>
                  <p className="mt-2 break-all text-sm font-medium leading-relaxed text-sky-700">
                    {referralLink}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText("Link", referralLink)}
                    className="mt-3 w-full rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
                  >
                    Copy link
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Message to send
                  </p>
                  <p className="mt-2 break-words text-sm leading-relaxed text-slate-700">
                    {shareMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText("Message", shareMessage)}
                    className="mt-3 w-full rounded-lg border border-sky-500 bg-white px-4 py-3 text-sm font-bold text-sky-600 transition hover:bg-sky-50"
                  >
                    Copy message
                  </button>
                </div>

                {copyFeedback && (
                  <p className="text-center text-sm font-medium text-emerald-700">
                    {copyFeedback === "Copy failed"
                      ? "Could not copy. Please copy manually."
                      : `${copyFeedback} copied.`}
                  </p>
                )}

                <div className="grid gap-2">
                  <Link
                    href="/referrals"
                    className="rounded-lg border border-sky-500 bg-white px-4 py-3 text-center text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
                  >
                    Check your referral rewards
                  </Link>
                  <button
                    type="button"
                    onClick={handleBookCleaning}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Book a cleaning
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
                  <p>
                    Your friend gets $20 off their first cleaning when they book
                    with your code.
                  </p>
                  <p>
                    You receive your $20 referral reward after your referred
                    friend completes a paid service.
                  </p>
                  <p>
                    Referral rewards are not applied immediately. They are
                    reviewed after the referred booking is completed.
                  </p>
                </div>

                <div>
                  <label htmlFor="referrer-name" className={labelClassName}>
                    Your name
                  </label>
                  <input
                    id="referrer-name"
                    type="text"
                    required
                    value={referrerName}
                    onChange={(event) => setReferrerName(event.target.value)}
                    className={inputClassName}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="referrer-email" className={labelClassName}>
                    Your email (optional)
                  </label>
                  <input
                    id="referrer-email"
                    type="email"
                    value={referrerEmail}
                    onChange={(event) => setReferrerEmail(event.target.value)}
                    className={inputClassName}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(56,189,248,.35)] transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Get my referral code"}
                  </button>
                </div>
              </form>
            )}
      </div>
    </div>,
    document.body,
  );
}

export default function AdCardGrid() {
  const [cards, setCards] = useState<AdCardItem[]>(fallbackCards);
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPromoCards() {
      try {
        const response = await fetch("/api/promo-cards");
        if (!response.ok) return;

        const data = (await response.json()) as PromoCardsResponse;
        if (cancelled || !data.success || !data.cards?.length) return;

        setCards(data.cards);
      } catch {
        // Keep fallbackCards on network or parse errors.
      }
    }

    loadPromoCards();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="relative z-20 w-full bg-white py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-6 md:hidden [&::-webkit-scrollbar]:hidden">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="w-[80%] flex-none snap-center sm:w-[65%]"
              >
                <AdCard
                  card={card}
                  index={index}
                  onReferralClick={() => setReferralModalOpen(true)}
                />
              </div>
            ))}
          </div>

          <div className="hidden grid-cols-3 gap-5 px-6 md:grid lg:px-10 xl:px-12">
            {cards.map((card, index) => (
              <AdCard
                key={card.id}
                card={card}
                index={index}
                onReferralClick={() => setReferralModalOpen(true)}
              />
            ))}
          </div>
        </div>
      </section>

      <ReferralModal
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
      />
    </>
  );
}
