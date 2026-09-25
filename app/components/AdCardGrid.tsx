"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { ArrowUpRight, Copy, X } from "lucide-react";
import {
  buildReferralLink,
  buildReferralShareMessage,
  type ReferralCode,
} from "@/app/lib/referrals";
import { useTranslations } from "next-intl";

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
    description:
      "Refer a friend and they save $20 on their first cleaning.",
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
    description:
      "Know an Airbnb host? Refer them and earn referral rewards.",
    ctaLabel: "Refer Now",
    ctaHref: "https://saskiaservices.com/#services",
    imageUrl: "/images/towel-folder.jpg",
    imageAlt: "Airbnb turnover cleaning service",
  },
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.975,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

const inputClassName = `
  w-full
  rounded-[14px]
  border
  border-slate-200
  bg-slate-50/80
  px-4
  py-3.5
  text-sm
  text-slate-900
  outline-none
  transition-all
  duration-300
  placeholder:text-slate-400
  hover:border-slate-300
  focus:border-sky-400
  focus:bg-white
  focus:ring-4
  focus:ring-sky-100/70
`;

const labelClassName = `
  mb-2
  block
  text-[10px]
  font-bold
  uppercase
  tracking-[0.16em]
  text-slate-500
`;

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
    const mediaQuery = window.matchMedia(
      "(max-width: 767px)",
    );

    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    setHasMounted(true);

    mediaQuery.addEventListener(
      "change",
      updateIsMobile,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateIsMobile,
      );
    };
  }, []);

  const tagColor = card.isRedTag
    ? "bg-rose-600"
    : "bg-sky-500";

  const cardClassName = `
    group
    relative
    flex
    h-full
    flex-col
    overflow-hidden
    rounded-[24px]
    border
    border-slate-200/70
    bg-white
    shadow-[0_14px_40px_rgba(15,23,42,0.07)]
    ring-1
    ring-slate-950/[0.025]
    transition-[transform,box-shadow,border-color]
    duration-500
    hover:-translate-y-1.5
    hover:border-sky-200
    hover:shadow-[0_26px_65px_rgba(15,23,42,0.13)]
  `;

  const ctaClassName = `
    group/cta
    mt-7
    inline-flex
    min-h-[50px]
    w-full
    cursor-pointer
    items-center
    justify-between
    rounded-[14px]
    bg-slate-950
    px-5
    py-3.5
    text-[10px]
    font-bold
    uppercase
    tracking-[0.16em]
    text-white
    shadow-[0_10px_24px_rgba(15,23,42,0.14)]
    transition-all
    duration-300
    hover:bg-sky-500
    hover:shadow-[0_14px_30px_rgba(14,165,233,0.22)]
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-sky-500
    focus-visible:ring-offset-2
  `;

  const cardContent = (
    <>
      {/* Image */}
      <div
        className="
          relative
          aspect-[4/3]
          w-full
          overflow-hidden
          bg-slate-100
        "
      >
        <Image
          src={card.imageUrl}
          alt={card.imageAlt}
          fill
          sizes="
            (max-width: 640px) 84vw,
            (max-width: 768px) 65vw,
            33vw
          "
          className="
            object-cover
            transition-transform
            duration-700
            ease-[cubic-bezier(0.16,1,0.3,1)]
            group-hover:scale-[1.045]
          "
        />

        {/* subtle image treatment */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-slate-950/20
            via-transparent
            to-black/[0.02]
          "
        />

        {/* Badge */}
        <div
          className={`
            absolute
            left-5
            top-5
            z-10
            inline-flex
            items-center
            rounded-full
            px-3.5
            py-2
            shadow-[0_8px_20px_rgba(15,23,42,0.14)]
            ${tagColor}
          `}
        >
          <span
            className="
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-white
            "
          >
            {card.tag}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div
        className="
          relative
          flex
          flex-1
          flex-col
          px-6
          pb-6
          pt-7
          sm:px-7
          sm:pb-7
        "
      >
        {/* small accent */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-6
            top-0
            h-[2px]
            w-10
            -translate-y-px
            rounded-full
            bg-sky-500
            sm:left-7
          "
        />

        <div className="flex-1">
          <h3
            className="
              font-heading
              text-[clamp(1.75rem,2.2vw,2.2rem)]
              font-medium
              leading-[0.98]
              tracking-[-0.045em]
              text-slate-950
            "
          >
            {card.title}

            {card.titleSmall && (
              <span className="mt-1 block">
                {card.titleSmall}
              </span>
            )}
          </h3>

          <p
            className="
              mt-5
              max-w-sm
              text-[14px]
              leading-6
              text-slate-500
            "
          >
            {card.description}
          </p>
        </div>

        {onReferralClick ? (
          <button
            type="button"
            onClick={onReferralClick}
            aria-label={`${card.ctaLabel}: ${card.title} ${
              card.titleSmall ?? ""
            }`}
            className={ctaClassName}
          >
            <span>{card.ctaLabel}</span>

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-white/10
                transition
                group-hover/cta:bg-white/20
              "
            >
              <ArrowUpRight
                size={15}
                strokeWidth={1.9}
                className="
                  transition-transform
                  duration-300
                  group-hover/cta:-translate-y-0.5
                  group-hover/cta:translate-x-0.5
                "
              />
            </span>
          </button>
        ) : (
          <a
            href={card.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${card.ctaLabel}: ${card.title} ${
              card.titleSmall ?? ""
            }`}
            className={ctaClassName}
          >
            <span>{card.ctaLabel}</span>

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-white/10
                transition
                group-hover/cta:bg-white/20
              "
            >
              <ArrowUpRight
                size={15}
                strokeWidth={1.9}
                className="
                  transition-transform
                  duration-300
                  group-hover/cta:-translate-y-0.5
                  group-hover/cta:translate-x-0.5
                "
              />
            </span>
          </a>
        )}
      </div>
    </>
  );

  if (!hasMounted || isMobile) {
    return (
      <article className={cardClassName}>
        {cardContent}
      </article>
    );
  }

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cardClassName}
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
  const t = useTranslations("home");

  const [referrerName, setReferrerName] =
    useState("");
  const [referrerEmail, setReferrerEmail] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [generatedCode, setGeneratedCode] =
    useState<ReferralCode | null>(null);

  const [copyFeedback, setCopyFeedback] =
    useState<string | null>(null);

  const canUsePortal =
    typeof document !== "undefined";

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
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

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, handleClose]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/referral-codes/public",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            referrerName:
              referrerName.trim(),
            referrerEmail:
              referrerEmail.trim() ||
              undefined,
          }),
        },
      );

      const data =
        (await response.json()) as PublicReferralResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            t("referralCreateFailed"),
        );
      }

      if (!data.referralCode) {
        throw new Error(
          t("referralCreateFailed"),
        );
      }

      setGeneratedCode(data.referralCode);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("referralCreateFailed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyText(
    label: string,
    value: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopyFeedback(label);

      window.setTimeout(() => {
        setCopyFeedback(null);
      }, 2000);
    } catch {
      setCopyFeedback("__copy_failed__");

      window.setTimeout(() => {
        setCopyFeedback(null);
      }, 2000);
    }
  }

  function handleBookCleaning() {
    handleClose();

    document
      .getElementById("quote")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  const shareMessage = generatedCode
    ? buildReferralShareMessage(
        generatedCode.code,
      )
    : "";

  const referralLink = generatedCode
    ? buildReferralLink(
        generatedCode.code,
      )
    : "";

  if (!canUsePortal) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
          }}
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-slate-950/55
            p-4
            backdrop-blur-[10px]
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="referral-modal-title"
          onClick={handleClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              max-h-[90dvh]
              w-full
              max-w-xl
              overflow-y-auto
              overscroll-contain
              rounded-[26px]
              border
              border-white/80
              bg-white
              p-6
              shadow-[0_35px_100px_rgba(15,23,42,0.25)]
              ring-1
              ring-slate-950/[0.04]
              md:p-8
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Close */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close referral modal"
              className="
                absolute
                right-5
                top-5
                flex
                h-9
                w-9
                cursor-pointer
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <X size={16} />
            </button>

            {/* Heading */}
            <div className="mb-7 pr-12">
              <div
                aria-hidden="true"
                className="
                  mb-4
                  h-[3px]
                  w-9
                  rounded-full
                  bg-sky-500
                "
              />

              <p
                className="
                  mb-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-sky-500
                "
              >
                Saskia rewards
              </p>

              <h3
                id="referral-modal-title"
                className="
                  font-heading
                  text-[30px]
                  font-medium
                  leading-none
                  tracking-[-0.04em]
                  text-slate-950
                "
              >
                Refer a friend
              </h3>

              <p
                className="
                  mt-3
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Share your referral code and
                help a friend save on their
                first cleaning.
              </p>
            </div>

            {generatedCode ? (
              <div className="space-y-4">
                {/* Reward information */}
                <div
                  className="
                    space-y-3
                    rounded-[18px]
                    border
                    border-sky-100
                    bg-sky-50/70
                    p-5
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  <p>
                    Your friend gets{" "}
                    <span className="font-semibold text-slate-900">
                      $20 off
                    </span>{" "}
                    their first cleaning when
                    they book with your code.
                  </p>

                  <p>
                    You receive your{" "}
                    <span className="font-semibold text-slate-900">
                      $20 referral reward
                    </span>{" "}
                    after your referred friend
                    completes a paid service.
                  </p>

                  <p>
                    Referral rewards are
                    reviewed after the referred
                    booking is completed.
                  </p>
                </div>

                {/* Code */}
                <div
                  className="
                    rounded-[18px]
                    border
                    border-slate-200/80
                    bg-slate-50/80
                    px-5
                    py-6
                    text-center
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.17em]
                      text-slate-400
                    "
                  >
                    Your referral code
                  </p>

                  <p
                    className="
                      mt-3
                      font-mono
                      text-[28px]
                      font-bold
                      tracking-[0.14em]
                      text-slate-950
                    "
                  >
                    {generatedCode.code}
                  </p>
                </div>

                {/* Link */}
                <div
                  className="
                    rounded-[18px]
                    border
                    border-slate-200/80
                    bg-white
                    p-5
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-slate-400
                    "
                  >
                    Your referral link
                  </p>

                  <p
                    className="
                      mt-3
                      break-all
                      text-sm
                      font-medium
                      leading-6
                      text-sky-700
                    "
                  >
                    {referralLink}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "Link",
                        referralLink,
                      )
                    }
                    className="
                      mt-4
                      inline-flex
                      w-full
                      cursor-pointer
                      items-center
                      justify-center
                      gap-2
                      rounded-[13px]
                      bg-slate-950
                      px-4
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-sky-500
                    "
                  >
                    <Copy size={15} />
                    Copy link
                  </button>
                </div>

                {/* Message */}
                <div
                  className="
                    rounded-[18px]
                    border
                    border-slate-200/80
                    bg-white
                    p-5
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-slate-400
                    "
                  >
                    Message to send
                  </p>

                  <p
                    className="
                      mt-3
                      break-words
                      text-sm
                      leading-6
                      text-slate-600
                    "
                  >
                    {shareMessage}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "Message",
                        shareMessage,
                      )
                    }
                    className="
                      mt-4
                      inline-flex
                      w-full
                      cursor-pointer
                      items-center
                      justify-center
                      gap-2
                      rounded-[13px]
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3.5
                      text-sm
                      font-semibold
                      text-slate-700
                      transition
                      hover:border-sky-300
                      hover:bg-sky-50
                      hover:text-sky-700
                    "
                  >
                    <Copy size={15} />
                    Copy message
                  </button>
                </div>

                {copyFeedback && (
                  <p
                    className="
                      rounded-[12px]
                      bg-emerald-50
                      px-4
                      py-3
                      text-center
                      text-sm
                      font-medium
                      text-emerald-700
                    "
                  >
                    {copyFeedback ===
                    "__copy_failed__"
                      ? t(
                          "referralCopyFailed",
                        )
                      : `${copyFeedback} copied.`}
                  </p>
                )}

                <div className="grid gap-2.5 pt-2">
                  <Link
                    href="/referrals"
                    className="
                      rounded-[13px]
                      border
                      border-sky-500
                      bg-white
                      px-4
                      py-3.5
                      text-center
                      text-sm
                      font-semibold
                      text-sky-600
                      transition
                      hover:bg-sky-50
                    "
                  >
                    Check your referral rewards
                  </Link>

                  <button
                    type="button"
                    onClick={
                      handleBookCleaning
                    }
                    className="
                      cursor-pointer
                      rounded-[13px]
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3.5
                      text-sm
                      font-semibold
                      text-slate-700
                      transition
                      hover:bg-slate-50
                    "
                  >
                    Book a cleaning
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      cursor-pointer
                      rounded-[13px]
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-slate-400
                      transition
                      hover:bg-slate-50
                      hover:text-slate-700
                    "
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div
                  className="
                    space-y-3
                    rounded-[18px]
                    border
                    border-sky-100
                    bg-sky-50/70
                    p-5
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  <p>
                    Your friend gets{" "}
                    <span className="font-semibold text-slate-900">
                      $20 off
                    </span>{" "}
                    their first cleaning when
                    they book with your code.
                  </p>

                  <p>
                    You receive your{" "}
                    <span className="font-semibold text-slate-900">
                      $20 referral reward
                    </span>{" "}
                    after your referred friend
                    completes a paid service.
                  </p>

                  <p>
                    Referral rewards are
                    reviewed after the referred
                    booking is completed.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="referrer-name"
                    className={
                      labelClassName
                    }
                  >
                    {t(
                      "referralYourName",
                    )}
                  </label>

                  <input
                    id="referrer-name"
                    type="text"
                    required
                    value={referrerName}
                    onChange={(event) =>
                      setReferrerName(
                        event.target.value,
                      )
                    }
                    className={
                      inputClassName
                    }
                    placeholder={t(
                      "referralYourName",
                    )}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="referrer-email"
                    className={
                      labelClassName
                    }
                  >
                    Your email (optional)
                  </label>

                  <input
                    id="referrer-email"
                    type="email"
                    value={referrerEmail}
                    onChange={(event) =>
                      setReferrerEmail(
                        event.target.value,
                      )
                    }
                    className={
                      inputClassName
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="
                      rounded-[14px]
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-red-700
                    "
                  >
                    {errorMessage}
                  </div>
                )}

                <div
                  className="
                    flex
                    flex-col
                    gap-2.5
                    pt-1
                    sm:flex-row
                    sm:justify-end
                  "
                >
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="
                      cursor-pointer
                      rounded-[13px]
                      border
                      border-slate-200
                      bg-white
                      px-5
                      py-3.5
                      text-sm
                      font-semibold
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      cursor-pointer
                      rounded-[13px]
                      bg-sky-500
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      shadow-[0_10px_24px_rgba(14,165,233,0.20)]
                      transition
                      hover:bg-sky-600
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isSubmitting
                      ? t(
                          "referralCreating",
                        )
                      : t(
                          "referralGetCode",
                        )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default function AdCardGrid() {
  const t = useTranslations("home");

  const localizedFallback: AdCardItem[] = [
    {
      id: 1,
      tag: t("adReferralTag"),
      title: t("adGive20"),
      titleSmall: t("adGet20"),
      description: t("adGive20Desc"),
      ctaLabel: t("adReferNow"),
      ctaHref:
        "https://saskiaservices.com/#quote",
      imageUrl:
        "/images/friend_sharing.jpg",
      imageAlt: t("adAlt1"),
    },
    {
      id: 2,
      tag: t("adLimitedTag"),
      title: t("ad20Off"),
      titleSmall: t("adDeepClean"),
      description: t("ad20OffDesc"),
      ctaLabel: t("adReferNow"),
      ctaHref:
        "https://saskiaservices.com/#quote",
      imageUrl:
        "/images/limited_deal.jpg",
      imageAlt: t("adAlt2"),
      isRedTag: true,
    },
    {
      id: 3,
      tag: t("adNewTag"),
      title: t("adAirbnb"),
      titleSmall: t("adTurnover"),
      description: t("adAirbnbDesc"),
      ctaLabel: t("adReferNow"),
      ctaHref:
        "https://saskiaservices.com/#services",
      imageUrl:
        "/images/towel-folder.jpg",
      imageAlt: t("adAlt3"),
    },
  ];

  const [cards, setCards] =
    useState<AdCardItem[]>(
      localizedFallback,
    );

  const [
    referralModalOpen,
    setReferralModalOpen,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPromoCards() {
      try {
        const response = await fetch(
          "/api/promo-cards",
        );

        if (!response.ok) return;

        const data =
          (await response.json()) as PromoCardsResponse;

        if (
          cancelled ||
          !data.success ||
          !data.cards?.length
        ) {
          return;
        }

        // Backend behavior intentionally unchanged.
        setCards(data.cards);
      } catch {
        // Keep localized fallbacks on network/parse errors.
      }
    }

    loadPromoCards();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section
        className="
          relative
          z-20
          w-full
          overflow-hidden
          bg-white
          py-12
          sm:py-14
          lg:py-16
        "
      >
        {/* subtle background atmosphere */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-[280px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-sky-50/60
            blur-[100px]
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-7xl
          "
        >
          {/* Mobile carousel */}
          <div
            className="
              flex
              snap-x
              snap-mandatory
              gap-4
              overflow-x-auto
              px-4
              pb-6
              [scrollbar-width:none]
              sm:gap-5
              sm:px-6
              md:hidden
              [&::-webkit-scrollbar]:hidden
            "
          >
            {cards.map(
              (card, index) => (
                <div
                  key={card.id}
                  className="
                    w-[86%]
                    flex-none
                    snap-center
                    sm:w-[68%]
                  "
                >
                  <AdCard
                    card={card}
                    index={index}
                    onReferralClick={() =>
                      setReferralModalOpen(
                        true,
                      )
                    }
                  />
                </div>
              ),
            )}
          </div>

          {/* Desktop grid */}
          <div
            className="
              hidden
              grid-cols-3
              items-stretch
              gap-6
              px-6
              md:grid
              lg:gap-7
              lg:px-8
              xl:gap-8
              xl:px-10
            "
          >
            {cards.map(
              (card, index) => (
                <AdCard
                  key={card.id}
                  card={card}
                  index={index}
                  onReferralClick={() =>
                    setReferralModalOpen(
                      true,
                    )
                  }
                />
              ),
            )}
          </div>
        </div>
      </section>

      <ReferralModal
        open={referralModalOpen}
        onClose={() =>
          setReferralModalOpen(false)
        }
      />
    </>
  );
}