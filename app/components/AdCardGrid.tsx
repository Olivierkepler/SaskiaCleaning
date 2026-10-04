"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { useIsClient, useMediaQuery } from "@/app/lib/use-is-client";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Copy,
  Gift,
  LogIn,
  Mail,
  UserRound,
  X,
} from "lucide-react";
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

function ReferralAccountPrompt({
  variant,
}: {
  variant: "form" | "success";
}) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  const isSignedIn = Boolean(session?.user);
  const promptTitle = isSignedIn
    ? "Your referral rewards are tracked in your account."
    : variant === "success"
      ? "Want to track this reward?"
      : "Want to track your rewards?";
  const promptDescription = isSignedIn
    ? null
    : "Sign in to your Saskia account to view your referral activity and reward status.";

  return (
    <aside className={`flex flex-col gap-3 rounded-[17px] bg-[#ECF0F3] p-4 shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_#FFFFFF] sm:flex-row sm:items-center sm:justify-between ${variant === "form" ? "mb-5" : "mb-0"}`}>
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ECF0F3] text-sky-700 shadow-[3px_3px_7px_#D1D9E6,-3px_-3px_7px_#FFFFFF] sm:mt-0">
          {isSignedIn ? (
            <Gift size={17} aria-hidden="true" />
          ) : (
            <LogIn size={17} aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-5 text-slate-900">
            {promptTitle}
          </p>
          {promptDescription ? (
            <p className="mt-0.5 text-xs leading-5 text-slate-600">
              {promptDescription}
            </p>
          ) : null}
        </div>
      </div>
      <Link
        href={isSignedIn ? "/account/rewards" : "/login"}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-[13px] bg-[#ECF0F3] px-4 py-2 text-sm font-semibold text-sky-700 shadow-[3px_3px_7px_#D1D9E6,-3px_-3px_7px_#FFFFFF] transition hover:-translate-y-0.5 hover:text-sky-800 active:translate-y-0 active:shadow-[inset_3px_3px_6px_#D1D9E6,inset_-3px_-3px_6px_#FFFFFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:min-h-12"
      >
        {isSignedIn ? "View rewards" : "Sign in"}
        {isSignedIn ? <ArrowRight size={16} aria-hidden="true" /> : null}
      </Link>
    </aside>
  );
}

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

function AdCard({
  card,
  index,
  onReferralClick,
}: {
  card: AdCardItem;
  index: number;
  onReferralClick?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const hasMounted = useIsClient();

  const tagColor = card.isRedTag
    ? "bg-rose-700"
    : "bg-sky-700";

  const cardClassName = `
    group
    relative
    flex
    h-full
    flex-col
    overflow-hidden
    rounded-[28px]
    bg-white
    shadow-[0_4px_12px_rgba(15,23,42,0.03),0_18px_44px_rgba(15,23,42,0.06)]
    ring-1
    ring-slate-200/70
    transition-all
    duration-500
    ease-[cubic-bezier(0.22,1,0.36,1)]

    hover:-translate-y-1.5
    hover:shadow-[0_8px_20px_rgba(15,23,42,0.04),0_26px_60px_rgba(15,23,42,0.10)]
    hover:ring-sky-200/80
    focus-within:ring-sky-300
  `;

  const ctaClassName = `
    group/cta
    mt-8
    flex
    min-h-[58px]
    w-full
    cursor-pointer
    items-center
    justify-between
    gap-4
    rounded-[17px]
    bg-[#020617]
    px-5
    py-4
    text-[11px]
    font-bold
    uppercase
    tracking-[0.14em]
    text-white
    shadow-[0_12px_28px_rgba(2,6,23,0.16)]
    transition-all
    duration-300

    hover:-translate-y-0.5
    hover:bg-sky-700
    hover:shadow-[0_16px_34px_rgba(3,105,161,0.20)]

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
          aspect-[1.34/1]
          w-full
          shrink-0
          overflow-hidden
          bg-slate-100
        "
      >
        <Image
          src={card.imageUrl}
          alt={card.imageAlt}
          fill
          sizes="
            (max-width: 640px) 86vw,
            (max-width: 768px) 68vw,
            33vw
          "
          className="
            object-cover
            transition-transform
            duration-700
            ease-[cubic-bezier(0.16,1,0.3,1)]
            group-hover:scale-[1.035]
          "
        />

        {/* Subtle image depth */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-slate-950/20
            via-transparent
            to-white/[0.03]
          "
        />

        {/* Badge */}
        <div
          className={`
            absolute
            left-6
            top-6
            z-10
            inline-flex
            items-center
            justify-center
            rounded-full
            px-4
            py-2.5
            ring-1
            ring-inset
            ring-white/20
            shadow-[0_4px_16px_rgba(15,23,42,0.16)]
            ${tagColor}
          `}
        >
          <span
            className="
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-white
            "
          >
            {card.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="
          relative
          flex
          flex-1
          flex-col
          px-7
          pb-7
          pt-8
          sm:px-8
          sm:pb-8
        "
      >
        {/* Small blue accent */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-7
            top-0
            h-[2px]
            w-11
            -translate-y-px
            rounded-full
            bg-sky-500
            sm:left-8
          "
        />

        <div className="flex flex-1 flex-col">
          {/* Editorial title */}
          <h3
            className="
              font-heading
              text-[clamp(2rem,2.5vw,2.65rem)]
              font-medium
              leading-[1.08]
              tracking-[-0.035em]
              text-[#020617]
            "
          >
            {card.title}

            {card.titleSmall && (
              <span className="mt-1.5 block">
                {card.titleSmall}
              </span>
            )}
          </h3>

          {/* Description */}
          <p
            className="
              mt-5
              max-w-sm
              text-[15px]
              font-normal
              leading-7
              text-slate-600
            "
          >
            {card.description}
          </p>
        </div>

        {/* CTA */}
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
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/10
                ring-1
                ring-inset
                ring-white/15
                transition-all
                duration-300
                group-hover/cta:bg-white/20
              "
            >
              <ArrowUpRight
                size={16}
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
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/10
                ring-1
                ring-inset
                ring-white/15
                transition-all
                duration-300
                group-hover/cta:bg-white/20
              "
            >
              <ArrowUpRight
                size={16}
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
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const successTitleRef = useRef<HTMLHeadingElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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
  const [showSuccess, setShowSuccess] =
    useState(false);

  const [copyFeedback, setCopyFeedback] =
    useState<string | null>(null);

  const canUsePortal =
    typeof document !== "undefined";

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow =
        previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open && generatedCode && showSuccess) {
      successTitleRef.current?.focus();
    } else if (open && generatedCode && !showSuccess) {
      nameInputRef.current?.focus();
    }
  }, [generatedCode, open, showSuccess]);

  function resetModal() {
    setReferrerName("");
    setReferrerEmail("");
    setErrorMessage("");
    setIsSubmitting(false);
    setGeneratedCode(null);
    setShowSuccess(false);
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
        return;
      }

      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
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

    if (generatedCode) {
      setShowSuccess(true);
      return;
    }

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
      setShowSuccess(true);
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
            overflow-y-auto
            bg-slate-950/45
            px-3
            py-3
            backdrop-blur-[7px]
            sm:px-6
            sm:py-5
          "
          style={{
            paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 10 }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="referral-modal-title"
            className="
              relative grid max-h-[min(94dvh,900px)] w-full max-w-[1024px]
              grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden
              rounded-[24px] border border-white/70 bg-[#ECF0F3]
              shadow-[8px_8px_22px_rgba(15,23,42,0.18),-8px_-8px_22px_rgba(255,255,255,0.12)]
              sm:rounded-[30px] sm:shadow-[14px_14px_34px_rgba(15,23,42,0.2),-14px_-14px_34px_rgba(255,255,255,0.12)]
              lg:grid-cols-[46fr_54fr] lg:grid-rows-1
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <section
              className="
                relative isolate flex min-h-0 flex-col overflow-hidden
                bg-[linear-gradient(145deg,#F9FBFD_0%,#F2F8FC_54%,#F6FAFC_100%)]

                px-6 pb-5 pt-7 sm:px-8 sm:pb-7 sm:pt-8
                lg:min-h-[690px] lg:px-10 lg:pb-9 lg:pt-10
              "
              aria-label="Saskia referral rewards"
            >


              <h2 id="referral-modal-title" className="mt-3 max-w-full font-heading text-[clamp(1.4rem,3vw,2.25rem)] font-medium leading-[0.98] tracking-[-0.045em] text-sky-500">
                Refer a friend<br />and save together
              </h2>


              <p className="mt-4 max-w-[390px] text-[14px] leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
                Share your unique referral code and help a friend save on their first cleaning. You’ll both get rewarded!
              </p>
              <div className="relative mt-6 min-h-[148px] flex-1 overflow-hidden rounded-[22px] sm:min-h-[175px] lg:mt-8 lg:min-h-[280px]">
                <Image
                  src="/images/friend_sharing.jpg"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 470px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/5 to-transparent" />

              </div>
            </section>
            <section className="relative min-h-0 overflow-y-auto overscroll-contain bg-[#ECF0F3] px-6 pb-6 pt-7 [scrollbar-color:#0EA5E9_#ECF0F3] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#ECF0F3] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#0EA5E9] [&::-webkit-scrollbar-thumb:hover]:bg-sky-600 sm:px-9 sm:pb-8 sm:pt-9 lg:px-11 lg:pb-10 lg:pt-10">
            {/* Close */}
            <button
              ref={closeButtonRef}
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
                border border-white/70
                bg-[#ECF0F3]
                text-slate-500
                shadow-[4px_4px_9px_#D1D9E6,-4px_-4px_9px_#FFFFFF]
                transition-all
                hover:shadow-[2px_2px_5px_#D1D9E6,-2px_-2px_5px_#FFFFFF]
                active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]
                hover:text-slate-900
                disabled:cursor-not-allowed
                disabled:opacity-50
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-sky-200
              "
            >
              <X size={16} />
            </button>

            {/* <div className="space-y-4 pr-1 pt-9 sm:space-y-5 sm:pt-7">
              <div className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECF0F3] text-[13px] font-bold text-sky-700 shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF]">1</span>
                <p className="pt-0.5 text-[12px] leading-[1.55] text-slate-500 sm:text-[13px]">
                  <span className="block font-semibold text-slate-900">Your friend gets $20 off</span>
                  their first cleaning when they book with your code.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECF0F3] text-[13px] font-bold text-sky-700 shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF]">2</span>
                <p className="pt-0.5 text-[12px] leading-[1.55] text-slate-500 sm:text-[13px]">
                  <span className="block font-semibold text-slate-900">You receive your $20 referral reward</span>
                  after your referred friend completes a paid service.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ECF0F3] text-[13px] font-bold text-sky-700 shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF]">3</span>
                <p className="pt-0.5 text-[12px] leading-[1.55] text-slate-500 sm:text-[13px]">
                  <span className="block font-semibold text-slate-900">Rewards are reviewed</span>
                  after the referred booking is completed.
                </p>
              </div>
            </div> */}

            {/* <div className="my-6 border-t border-slate-300/50 sm:my-7" /> */}

            {/* Heading */}
            <div className="my-6 pr-12">




              <h3
                ref={successTitleRef}
                tabIndex={-1}
                className="
                  font-heading
                  text-[30px]
                  font-medium
                  leading-none
                  tracking-[-0.04em]
                  text-black
                "
              >
                {showSuccess ? "Your referral code is ready" : "Get your referral code"}
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
                {showSuccess
                  ? "Share your code or referral link with a friend."
                  : "Enter your details to create a unique code to share."}
              </p>
            </div>

            {generatedCode && showSuccess ? (
              <div className="space-y-4">
                <div
                  className="rounded-[18px] bg-[#ECF0F3] p-4 text-sm leading-6 text-slate-600 shadow-[inset_4px_4px_8px_rgba(209,217,230,0.75),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]"
                >
                  Your referral code is ready to share. Your friend saves $20 on
                  their first cleaning, and you receive a $20 reward after their
                  paid service is completed.
                </div>

                {/* Code */}
                <div
                  className="
                    rounded-[18px]
                    border border-slate-300/40
                    bg-[#ECF0F3]
                    px-5
                    py-6
                    text-center
                    shadow-[inset_6px_6px_12px_rgba(209,217,230,0.85),inset_-6px_-6px_12px_rgba(255,255,255,0.95)]
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
                    bg-[#ECF0F3]
                    p-5
                    shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]
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
                      bg-sky-700
                      px-4
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]
                      transition-all hover:-translate-y-0.5
                      hover:bg-sky-600 active:translate-y-0
                      active:shadow-[inset_4px_4px_8px_rgba(3,105,161,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.16)]
                      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
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
                    bg-[#ECF0F3]
                    p-5
                    shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]
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
                      bg-[#ECF0F3]
                      px-4
                      py-3.5
                      text-sm
                      font-semibold
                      text-slate-700
                      shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]
                      transition-all hover:text-sky-700
                      active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]
                      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
                    "
                  >
                    <Copy size={15} />
                    Copy message
                  </button>
                </div>

                <ReferralAccountPrompt variant="success" />

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
                      border border-sky-700/20
                      bg-[#ECF0F3]
                      px-4
                      py-3.5
                      text-center
                      text-sm
                      font-semibold
                      text-sky-600
                      shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]
                      transition-all hover:-translate-y-0.5
                      active:translate-y-0
                      active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]
                      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
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
                      border border-white/70
                      bg-[#ECF0F3]
                      px-4
                      py-3.5
                      text-sm
                      font-semibold
                      text-slate-700
                      shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF]
                      transition-all hover:-translate-y-0.5
                      active:translate-y-0
                      active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF]
                      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300
                    "
                  >
                    Book a cleaning
                  </button>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSuccess(false)}
                      aria-label="Previous: return to referral details"
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[15px] bg-[#ECF0F3] px-4 py-3 text-sm font-semibold text-slate-700 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                    >
                      <ArrowLeft size={17} aria-hidden="true" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="min-h-[52px] rounded-[15px] bg-[#ECF0F3] px-4 py-3 text-sm font-semibold text-slate-700 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
              <ReferralAccountPrompt variant="form" />
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="referrer-name"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600"
                  >
                    {t(
                      "referralYourName",
                    )}
                  </label>

                  <div className="relative">
                  <UserRound size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={nameInputRef}
                    id="referrer-name"
                    type="text"
                    required
                    value={referrerName}
                    onChange={(event) =>
                      setReferrerName(
                        event.target.value,
                      )
                    }
                    className="h-[58px] w-full rounded-[16px] border border-slate-400/25 bg-[#ECF0F3] pl-12 pr-4 text-sm text-slate-900 shadow-[inset_5px_5px_10px_rgba(209,217,230,0.9),inset_-5px_-5px_10px_rgba(255,255,255,0.95)] outline-none transition placeholder:text-slate-500 focus:border-sky-600/40 focus:ring-4 focus:ring-sky-500/25"
                    placeholder={t(
                      "referralYourName",
                    )}
                    autoComplete="name"
                    aria-invalid={Boolean(errorMessage)}
                    aria-describedby={errorMessage ? "referral-error" : undefined}
                  />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="referrer-email"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600"
                  >
                    Your email (optional)
                  </label>

                  <div className="relative">
                  <Mail size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="referrer-email"
                    type="email"
                    value={referrerEmail}
                    onChange={(event) =>
                      setReferrerEmail(
                        event.target.value,
                      )
                    }
                    className="h-[58px] w-full rounded-[16px] border border-slate-400/25 bg-[#ECF0F3] pl-12 pr-4 text-sm text-slate-900 shadow-[inset_5px_5px_10px_rgba(209,217,230,0.9),inset_-5px_-5px_10px_rgba(255,255,255,0.95)] outline-none transition placeholder:text-slate-500 focus:border-sky-600/40 focus:ring-4 focus:ring-sky-500/25"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errorMessage)}
                    aria-describedby={errorMessage ? "referral-error" : undefined}
                  />
                  </div>
                </div>

                {errorMessage && (
                  <div
                    id="referral-error"
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

                <div className="grid gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      group inline-flex min-h-[60px] w-full cursor-pointer
                      items-center justify-between gap-3 rounded-[16px]
                      bg-sky-600 px-5 py-4 text-[15px] font-semibold text-white
                      shadow-[7px_7px_15px_rgba(209,217,230,0.9),-7px_-7px_15px_rgba(255,255,255,0.95)] transition-all
                      hover:-translate-y-0.5 hover:bg-sky-500
                      hover:shadow-[8px_8px_17px_rgba(209,217,230,0.9),-8px_-8px_17px_rgba(255,255,255,0.95)]
                      active:translate-y-0 active:shadow-[inset_4px_4px_8px_rgba(3,105,161,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.16)] focus-visible:outline-none
                      focus-visible:ring-4 focus-visible:ring-sky-200
                      disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none
                    "
                  >
                    <span className="inline-flex min-w-0 items-center gap-3">
                      <Gift size={19} aria-hidden="true" />
                      <span>
                        {isSubmitting
                          ? t(
                              "referralCreating",
                            )
                          : t(
                              "referralGetCode",
                            )}
                      </span>
                    </span>
                    {!isSubmitting && (
                      <span className="inline-flex shrink-0 items-center gap-1.5">
                        <span className="text-sm">Next</span>
                        <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="min-h-[54px] w-full cursor-pointer rounded-[16px] border border-white/70 bg-[#ECF0F3] px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_#FFFFFF] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-5 text-slate-400">
                By continuing, you agree to our{" "}
                <Link
                  href="/referral-terms"
                  className="rounded-sm font-medium text-sky-600 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-700 hover:decoration-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                >
                  Referral Program Terms
                </Link>
                . Rewards are reviewed after the referred booking is completed.
              </p>
              </>
            )}
            </section>
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
