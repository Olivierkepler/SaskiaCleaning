"use client";

import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  Clock3,
  Languages,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";

import { useTranslations } from "next-intl";

import NavbarAuthControls from "@/app/components/auth/NavbarAuthControls";
import LanguageSwitcher from "@/app/components/i18n/LanguageSwitcher";

export default function Navbar({
  hideNavbar = false,
}: {
  hideNavbar?: boolean;
}) {
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    {
      label: t("services"),
      href: "#services",
    },
    {
      label: t("plans"),
      href: "#plans",
    },
    {
      label: t("commercialCleaning"),
      href: "#commercial-cleaning",
    },
    {
      label: t("pricing"),
      href: "#pricing",
    },
  ];

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (hideNavbar) {
      setIsOpen(false);
    }
  }, [hideNavbar]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const utilityPrimaryClass = isScrolled
    ? "text-slate-900"
    : "text-white";

  const utilitySecondaryClass = isScrolled
    ? "text-slate-500"
    : "text-white/60";

  const utilityIconClass = isScrolled
    ? "text-sky-500"
    : "text-white/85";

  return (
    <>
      <header
        data-native-cursor
        className={`
          fixed inset-x-0 top-0 z-50
          px-3 pt-3
          transition-all duration-300
          sm:px-5
          lg:px-8
          ${
            hideNavbar
              ? "pointer-events-none invisible -translate-y-4 opacity-0"
              : "visible translate-y-0 opacity-100"
          }
        `}
      >
        <nav
          aria-label={t("mainNav")}
          className={`

            relative
            mx-auto
            max-w-[1440px]
            transition-all
            duration-500
            ${
              isScrolled
                ? `
                  rounded-md
                  border
                  border-slate-200
                  bg-[#ECF0F3]
                  px-5
                  py-2.5
                  shadow-[0_20px_70px_rgba(0,0,0,0.06)]
                  backdrop-blur-2xl
                  sm:px-6
                  lg:px-8
                `
                : `
                  bg-transparent
                  px-5
                  py-2.5
                  sm:px-6
                  lg:px-8
                  lg:py-8
                `
            }
          `}
        >
          {/* =========================================================
              BRAND
          ========================================================== */}
          <div
            className="
              flex
              items-center

              justify-between
              gap-4
              lg:absolute
              lg:left-8
              lg:top-2.5
              lg:z-10
              lg:py-4
            "
          >
            <a
              href="#"
              className="flex min-w-0 shrink-0 items-center  gap-4"
            >
              <div
                className="relative flex items-center py-2"
                style={{
                  height: "42px",
                  width: "92px",
                }}
              >
                <img
                  src={
                    isScrolled
                      ? "/images/logoSaskia.png"
                      : "/images/whitelogo.png"
                  }
                  alt="Saskia Cleaning"
                  className="object-contain transition-all duration-300"
                  style={{
                    height: "62px",
                    width: "auto",
                    maxHeight: "62px",
                    maxWidth: "none",
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />
              </div>

              <div className="leading-none">
                <p
                  className={`
                    text-[1.65rem]
                    font-semibold
                    tracking-[-0.04em]
                    transition-colors
                    duration-300
                    ${
                      isScrolled
                        ? "text-sky-500"
                        : "text-white"
                    }
                  `}
                >
                  Saskia
                </p>

                <p
                  className={`
                    mt-1
                    text-[0.62rem]
                    font-medium
                    uppercase
                    tracking-[0.38em]
                    transition-colors
                    duration-300
                    ${
                      isScrolled
                        ? "text-slate-500"
                        : "text-white/70"
                    }
                  `}
                >
                  {t("brandTagline")}
                </p>
              </div>
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label={t("openMenu")}
              aria-expanded={isOpen}
              aria-controls="mobile-sidenav"
              className={`
                grid
                h-11
                w-11
                shrink-0
                cursor-pointer
                place-items-center
                rounded-full
                border
                transition
                duration-300
                lg:hidden
                ${
                  isScrolled
                    ? `
                      border-sky-500
                      bg-sky-500
                      text-white
                      hover:bg-white
                      hover:text-sky-500
                    `
                    : `
                      border-white
                      bg-white
                      text-slate-950
                      hover:bg-transparent
                      hover:text-white
                    `
                }
              `}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* =========================================================
              DESKTOP BUSINESS UTILITY BAR
          ========================================================== */}
          <div
            className={`
              hidden
              items-center
              justify-end
              gap-6
              border-b
              pb-2.5
              lg:flex
              xl:gap-8
              2xl:gap-10
              ${
                isScrolled
                  ? "border-slate-100"
                  : "border-white/10"
              }
            `}
          >
            {/* Service area */}
            <div className="flex items-center gap-3">
              <MapPin
                size={24}
                strokeWidth={1.8}
                className={`shrink-0 ${utilityIconClass}`}
                aria-hidden="true"
              />

              <div className="leading-tight">
                <p
                  className={`
                    whitespace-nowrap
                    text-[17px]
                    font-semibold
                    ${utilityPrimaryClass}
                  `}
                >
                  {t("serviceArea")}
                </p>

                <p
                  className={`
                    mt-1
                    whitespace-nowrap
                    text-[14px]
                    font-medium
                    ${utilitySecondaryClass}
                  `}
                >
                  {t("serviceAreaDetail")}
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-center gap-3">
              <Clock3
                size={24}
                strokeWidth={1.8}
                className={`shrink-0 ${utilityIconClass}`}
                aria-hidden="true"
              />

              <div className="leading-tight">
                <p
                  className={`
                    whitespace-nowrap
                    text-[17px]
                    font-semibold
                    ${utilityPrimaryClass}
                  `}
                >
                  {t("businessHours")}
                </p>

                <p
                  className={`
                    mt-1
                    whitespace-nowrap
                    text-[14px]
                    font-medium
                    ${utilitySecondaryClass}
                  `}
                >
                  {t("businessDays")}
                </p>
              </div>
            </div>

            {/* Phone */}
            <a
              href="tel:+18573528554"
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                outline-none
                transition
                focus-visible:ring-2
                focus-visible:ring-sky-300
                focus-visible:ring-offset-2
              "
            >
              <Phone
                size={24}
                strokeWidth={1.8}
                className={`
                  shrink-0
                  transition
                  ${utilityIconClass}
                  group-hover:text-sky-400
                `}
                aria-hidden="true"
              />

              <div className="leading-tight">
                <p
                  className={`
                    whitespace-nowrap
                    text-[17px]
                    font-semibold
                    transition
                    ${utilityPrimaryClass}
                    group-hover:text-sky-400
                  `}
                >
                  857-352-8554
                </p>

                <p
                  className={`
                    mt-1
                    whitespace-nowrap
                    text-[14px]
                    font-medium
                    ${utilitySecondaryClass}
                  `}
                >
                  {t("speakWithSaskia")}
                </p>
              </div>
            </a>

            {/* Request Quote */}
            <a
              href="#quote"
              className={`
                group
                flex
                shrink-0
                cursor-pointer
                items-center
                gap-2
                rounded-full
                border
                px-6
                py-3
                text-[13px]
                font-semibold
                uppercase
                tracking-[0.14em]
                transition
                duration-300
                ${
                  isScrolled
                    ? `
                      border-slate-950
                      bg-slate-950
                      text-white
                      hover:bg-white
                      hover:text-sky-500
                    `
                    : `
                      border-white
                      bg-white
                      text-slate-950
                      hover:bg-transparent
                      hover:text-white
                    `
                }
              `}
            >
              {t("requestQuote")}

              <ArrowUpRight
                size={14}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
                aria-hidden="true"
              />
            </a>
          </div>

          {/* =========================================================
              MAIN NAVIGATION ROW
          ========================================================== */}
          <div
            className={`
              flex

              items-center
              justify-between
              gap-4
              overflow-hidden
              transition-all
              duration-300
              ease-in-out
              lg:gap-6
              ${
                isScrolled
                  ? `
                    pointer-events-none
                    max-h-0
                    -translate-y-2
                    pt-0
                    opacity-0
                  `
                  : `
                    max-h-16
                    translate-y-0
                    pt-0
                    opacity-100
                    lg:pt-4.5
                  `
              }
            `}
          >
            {/* Desktop navigation */}
            <div
              className="
                hidden

                min-w-0
                flex-1
                items-center
                justify-center
                gap-6
                lg:flex
                xl:gap-9
                2xl:gap-11
              "
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`
                    group
                    relative
                    cursor-pointer
                    whitespace-nowrap
                    text-[13px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    transition
                    duration-300
                    ${
                      isScrolled
                        ? "text-sky-500 hover:text-sky-600"
                        : "text-white hover:text-white/80"
                    }
                  `}
                >
                  {link.label}

                  <span
                    className={`
                      absolute
                      -bottom-2
                      left-0
                      h-px
                      w-full
                      origin-left
                      scale-x-0
                      transition-transform
                      duration-300
                      group-hover:scale-x-100
                      ${
                        isScrolled
                          ? "bg-sky-500"
                          : "bg-white"
                      }
                    `}
                  />
                </a>
              ))}
            </div>

            {/* Desktop language + auth */}
            <div
              className="
                hidden
                shrink-0
                items-center
                gap-3
                pl-3
                lg:flex
              "
            >
              {/* Language */}
              {/* <div
                className={`
                  group/language
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3.5
                  transition-all
                  duration-300
                  ${
                    isScrolled
                      ? `
                        border-slate-200/80
                        bg-white/70
                        text-slate-600
                        shadow-[0_4px_14px_rgba(15,23,42,0.04)]
                        hover:border-sky-200
                        hover:bg-white
                      `
                      : `
                        border-white/20
                        bg-white/[0.08]
                        text-white
                        backdrop-blur-md
                        hover:border-white/35
                        hover:bg-white/[0.14]
                      `
                  }
                `}
              >
                <Languages
                  size={16}
                  strokeWidth={1.8}
                  className={`
                    shrink-0
                    transition-colors
                    duration-300
                    ${
                      isScrolled
                        ? "text-sky-500"
                        : "text-white/80"
                    }
                  `}
                  aria-hidden="true"
                />

                <span
                  className={`
                    h-4
                    w-px
                    ${
                      isScrolled
                        ? "bg-slate-200"
                        : "bg-white/20"
                    }
                  `}
                  aria-hidden="true"
                />

                <LanguageSwitcher
                  className={[
                    "[&_select]:cursor-pointer",
                    "[&_select]:border-0",
                    "[&_select]:bg-transparent",
                    "[&_select]:px-0",
                    "[&_select]:py-0",
                    "[&_select]:text-[10px]",
                    "[&_select]:font-semibold",
                    "[&_select]:uppercase",
                    "[&_select]:tracking-[0.14em]",
                    "[&_select]:shadow-none",
                    "[&_select]:outline-none",
                    "[&_select]:ring-0",
                    "[&_select]:transition-colors",
                    "[&_select]:duration-300",
                    isScrolled
                      ? "[&_select]:text-slate-600"
                      : "[&_select]:text-white",
                  ].join(" ")}
                />
              </div> */}

              {/* Separator */}
              <span
                className={`
                  hidden
                  h-5
                  w-px
                  xl:block
                  ${
                    isScrolled
                      ? "bg-slate-200"
                      : "bg-white/20"
                  }
                `}
                aria-hidden="true"
              />

              {/* Authentication */}
              <div
                className={`
                  flex
                  h-10
                  items-center


                  [&_a]:flex
                  [&_a]:h-10
                  [&_a]:items-center
                  [&_a]:justify-center
                  [&_a]:rounded-full

                  [&_a]:border
                  [&_a]:px-4
                  [&_a]:text-[14px]
                  [&_a]:font-semibold
                  [&_a]:uppercase
                  [&_a]:tracking-[0.14em]
                  [&_a]:shadow-none
                  [&_a]:transition-all
                  [&_a]:duration-300

                  [&_span]:text-[14px]
                  [&_span]:font-semibold
                  [&_span]:uppercase
                  [&_span]:tracking-[0.14em]

                  ${
                    isScrolled
                      ? `
                        [&_a]:border-slate-200/80
                        [&_a]:bg-white/70
                        [&_a]:text-slate-600
                        [&_a]:hover:border-sky-200
                        [&_a]:hover:bg-white
                        [&_a]:hover:text-sky-500

                        [&_span]:text-slate-500
                      `
                      : `
                        [&_a]:border-white/20
                        [&_a]:bg-white/[0.08]
                        [&_a]:text-white
                        [&_a]:backdrop-blur-md
                        [&_a]:hover:border-white/35
                        [&_a]:hover:bg-white/[0.14]

                        [&_span]:text-white/80
                      `
                  }
                `}
              >
             <span className="bg-sky-600 rounded-full " >
             <NavbarAuthControls
                  isScrolled={isScrolled}
                  variant="desktop"
                />
             </span>
              </div>

            </div>
          </div>
        </nav>
      </header>

      {/* =========================================================
          MOBILE SIDENAV
      ========================================================== */}
      {!hideNavbar && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className={`
              fixed
              inset-0
              z-[60]
              bg-slate-950/50
              backdrop-blur-sm
              transition-all
              duration-500
              lg:hidden
              ${
                isOpen
                  ? "visible opacity-100"
                  : "invisible opacity-0"
              }
            `}
          />

          <aside
            id="mobile-sidenav"
            className={`
              fixed
              right-0
              top-0
              z-[70]
              h-dvh
              w-[88%]
              max-w-[440px]
              bg-white
              shadow-[-40px_0_100px_rgba(0,0,0,0.18)]
              transition-transform
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              lg:hidden
              ${
                isOpen
                  ? "translate-x-0"
                  : "translate-x-full"
              }
            `}
            aria-hidden={!isOpen}
          >
            <div className="flex h-full flex-col">
              {/* Mobile header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
                <div>
                  <p className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                    Saskia
                  </p>

                  <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.4em] text-slate-400">
                    {t("brandTagline")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={t("closeMenu")}
                  className="
                    grid
                    h-11
                    w-11
                    place-items-center
                    rounded-full
                    border
                    border-slate-200
                    text-slate-950
                    transition
                    duration-300
                    hover:border-slate-950
                    hover:bg-slate-950
                    hover:text-white
                  "
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between px-6 py-8">
                {/* Mobile nav links */}
                <nav
                  className="space-y-1"
                  aria-label={t("mobileNav")}
                >
                  {navLinks.map((link, index) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="
                        group
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        py-5
                        text-[13px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-slate-600
                        transition
                        duration-300
                        hover:border-slate-950
                        hover:text-slate-950
                      "
                    >
                      <span className="flex items-center">
                        <span className="mr-5 text-[10px] font-semibold text-slate-300">
                          0{index + 1}
                        </span>

                        {link.label}
                      </span>

                      <ArrowUpRight
                        size={16}
                        className="
                          translate-y-1
                          opacity-0
                          transition
                          duration-300
                          group-hover:translate-y-0
                          group-hover:opacity-100
                        "
                      />
                    </a>
                  ))}
                </nav>

                <div>
                  {/* Mobile language */}
                  <div className="mb-4">
                    <LanguageSwitcher />
                  </div>

                  {/* Mobile description */}
                  <div className="mb-6 border-l border-slate-950 pl-4">
                    <p className="text-sm leading-6 text-slate-500">
                      {t("mobileBlurb")}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <NavbarAuthControls
                      isScrolled={isScrolled}
                      variant="mobile"
                      onNavigate={() => setIsOpen(false)}
                    />

                    <a
                      href="#quote"
                      onClick={() => setIsOpen(false)}
                      className="
                        group
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        border
                        border-slate-950
                        bg-slate-950
                        px-6
                        py-4
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-white
                        transition
                        duration-300
                        hover:bg-transparent
                        hover:text-slate-950
                      "
                    >
                      {t("requestQuote")}

                      <ArrowUpRight
                        size={15}
                        className="
                          transition-transform
                          duration-300
                          group-hover:-translate-y-0.5
                          group-hover:translate-x-0.5
                        "
                      />
                    </a>

                    <a
                      href="tel:+18573528554"
                      onClick={() => setIsOpen(false)}
                      className="
                        flex
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-200
                        px-6
                        py-4
                        text-[11px]
                        font-medium
                        uppercase
                        tracking-[0.14em]
                        text-slate-600
                        transition
                        duration-300
                        hover:border-slate-950
                        hover:text-slate-950
                      "
                    >
                      {tCommon("callNow")}
                    </a>
                  </div>

                  <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.28em] text-slate-300">
                    {t("copyrightShort")}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
