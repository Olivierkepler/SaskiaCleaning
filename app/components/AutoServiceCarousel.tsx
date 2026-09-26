"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
} from "lucide-react";

const serviceDefs = [
  {
    id: "residential",
    titleKey: "carouselResidentialTitle",
    subtitleKey: "carouselResidentialSubtitle",
    detailKeys: [
      "carouselResidential1",
      "carouselResidential2",
      "carouselResidential3",
    ],
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    startingPrice: "$100+",
  },
  {
    id: "commercial",
    titleKey: "carouselCommercialTitle",
    subtitleKey: "carouselCommercialSubtitle",
    detailKeys: [
      "carouselCommercial1",
      "carouselCommercial2",
      "carouselCommercial3",
    ],
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    startingPrice: "$180+",
  },
  {
    id: "laundry",
    titleKey: "carouselLaundryTitle",
    subtitleKey: "carouselLaundrySubtitle",
    detailKeys: [
      "carouselLaundry1",
      "carouselLaundry2",
      "carouselLaundry3",
    ],
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    startingPrice: "$1.75/lb",
  },
  {
    id: "airbnb",
    titleKey: "carouselAirbnbTitle",
    subtitleKey: "carouselAirbnbSubtitle",
    detailKeys: [
      "carouselAirbnb1",
      "carouselAirbnb2",
      "carouselAirbnb3",
    ],
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    startingPrice: "$120+",
  },
  {
    id: "specialty",
    titleKey: "carouselSpecialtyTitle",
    subtitleKey: "carouselSpecialtySubtitle",
    detailKeys: [
      "carouselSpecialty1",
      "carouselSpecialty2",
      "carouselSpecialty3",
    ],
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80",
    startingPrice: "$45+",
  },
  {
    id: "addon",
    titleKey: "carouselAddonTitle",
    subtitleKey: "carouselAddonSubtitle",
    detailKeys: [
      "carouselAddon1",
      "carouselAddon2",
      "carouselAddon3",
    ],
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
    startingPrice: "$10+",
  },
];

type Service = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  details: string[];
  startingPrice: string;
};

const AUTO_DELAY = 5200;
const CARD_TRANSITION_MS = 900;
const CARD_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function getRelativeIndex(
  index: number,
  activeIndex: number,
  count: number,
) {
  let diff = index - activeIndex;

  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;

  return diff;
}

function scrollToQuote() {
  document.getElementById("quote")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function ServiceModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleRequestService = () => {
    onClose();

    requestAnimationFrame(() => {
      scrollToQuote();
    });
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      aria-describedby="service-modal-description"
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-end
        justify-center
        bg-slate-950/65
        backdrop-blur-lg
        sm:items-center
        sm:p-6
      "
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="
          relative
          max-h-[92dvh]
          w-full
          max-w-[640px]
          overflow-hidden
          rounded-t-[32px]
          bg-white
          shadow-[0_40px_120px_rgba(15,23,42,0.35)]
          ring-1
          ring-white/70
          sm:rounded-[32px]
        "
      >
        <div className="relative h-[250px] overflow-hidden sm:h-[310px]">
          <img
            src={service.image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

          <div className="absolute left-6 top-6">
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/20
                bg-slate-950/60
                px-4
                py-2
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white
                backdrop-blur-xl
              "
            >
              {service.id}
            </span>
          </div>

          <div
            className="
              absolute
              right-6
              top-6
              rounded-[14px]
              bg-black/20
              px-4
              py-3
              shadow-lg
              backdrop-blur-xl
            "
          >
            <span className="block text-[8px] font-semibold uppercase tracking-[0.15em] text-white">
              Starting at
            </span>

            <span className="mt-1 block text-lg font-bold leading-none tracking-[-0.035em] text-white">
              {service.startingPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close service details"
            className="
              absolute
              bottom-6
              right-6
              grid
              h-11
              w-11
              place-items-center
              rounded-full
              bg-white/95
              text-slate-950
              shadow-lg
              transition-all
              duration-300
              hover:bg-slate-950
              hover:text-white
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-sky-500
              focus-visible:ring-offset-2
            "
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute bottom-6 left-6 right-20">
            <h2
              id="service-modal-title"
              className="
                font-heading
                text-[clamp(2.2rem,6vw,3.4rem)]
                font-semibold
                leading-[0.92]
                tracking-[-0.055em]
                text-white
              "
            >
              {service.title}
            </h2>
          </div>
        </div>

        <div className="max-h-[55dvh] overflow-y-auto p-6 sm:p-8">
          <p
            id="service-modal-description"
            className="text-[15px] leading-7 text-slate-600"
          >
            {service.subtitle}
          </p>

          <div
            className="
              mt-7
              rounded-[24px]
              bg-slate-50
              p-5
              ring-1
              ring-slate-100
              sm:p-6
            "
          >
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Service includes
            </p>

            <ul className="space-y-4">
              {service.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                >
                  <span
                    className="
                      mt-0.5
                      grid
                      h-6
                      w-6
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-sky-50
                      text-sky-500
                    "
                  >
                    <Check
                      className="h-3.5 w-3.5"
                      strokeWidth={2}
                    />
                  </span>

                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleRequestService}
              className="
                inline-flex
                min-h-[52px]
                items-center
                justify-center
                gap-3
                rounded-[15px]
                bg-slate-950
                px-5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
                transition-all
                duration-300
                hover:bg-sky-500
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-500
                focus-visible:ring-offset-2
              "
            >
              Request this service

              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                min-h-[52px]
                rounded-[15px]
                border
                border-slate-200
                bg-white
                px-5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-slate-600
                transition-all
                duration-300
                hover:border-slate-950
                hover:text-slate-950
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-500
                focus-visible:ring-offset-2
              "
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DesktopCard({
  service,
  relativeIndex,
  active,
  onClick,
}: {
  service: Service;
  relativeIndex: number;
  active: boolean;
  onClick: () => void;
}) {
  const abs = Math.abs(relativeIndex);
  const hidden = abs >= 3;

  const width =
    abs === 0
      ? 500
      : abs === 1
        ? 350
        : abs === 2
          ? 270
          : 240;

  const height =
    abs === 0
      ? 540
      : abs === 1
        ? 470
        : abs === 2
          ? 400
          : 370;

  const translateX =
    relativeIndex === 0
      ? 0
      : relativeIndex === -1
        ? -400
        : relativeIndex === 1
          ? 400
          : relativeIndex === -2
            ? -675
            : relativeIndex === 2
              ? 675
              : relativeIndex < 0
                ? -820
                : 820;

  const scale =
    abs === 0
      ? 1
      : abs === 1
        ? 0.92
        : abs === 2
          ? 0.84
          : 0.76;

  const zIndex =
    abs === 0
      ? 30
      : abs === 1
        ? 20
        : abs === 2
          ? 10
          : 0;

  const opacity =
    abs === 0
      ? 1
      : abs === 1
        ? 0.92
        : abs === 2
          ? 0.72
          : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${service.title}`}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden ? "true" : undefined}
      className="
        group
        absolute
        left-1/2
        top-1/2
        overflow-visible
        text-left
        will-change-[transform,opacity,width,height]
        transform-gpu
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-sky-500
        focus-visible:ring-offset-4
        focus-visible:ring-offset-white
      "
      style={{
        width,
        height,
        zIndex,
        opacity,
        pointerEvents: hidden ? "none" : "auto",
        transform: `
          translate3d(-50%, -50%, 0)
          translate3d(${translateX}px, 0, 0)
          scale(${scale})
        `,
        transition: `
          transform ${CARD_TRANSITION_MS}ms ${CARD_EASING},
          opacity ${CARD_TRANSITION_MS - 100}ms ${CARD_EASING},
          width ${CARD_TRANSITION_MS}ms ${CARD_EASING},
          height ${CARD_TRANSITION_MS}ms ${CARD_EASING}
        `,
      }}
    >
      <article
        className={`
          relative
          h-full
          overflow-hidden
          rounded-[10px]
          bg-white
          ring-1
          transform-gpu
          transition-[transform,box-shadow]
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]
          group-hover:-translate-y-1.5

          ${active
            ? `
                  ring-sky-200
                  shadow-[0_32px_90px_rgba(14,165,233,0.14)]
                  group-hover:shadow-[0_40px_110px_rgba(14,165,233,0.18)]
                `
            : `
                  ring-slate-200/80
                  shadow-[0_18px_55px_rgba(15,23,42,0.08)]
                  group-hover:ring-sky-200
                `
          }
        `}
      >
        {/* Image */}
        <div
          className={`
            relative
            overflow-hidden
            transition-[height]
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${active ? "h-[61%]" : "h-[58%]"}
          `}
        >
          <img
            src={service.image}
            alt={`${service.title} service`}
            draggable={false}
            className="
              h-full
              w-full
              select-none
              object-cover
              will-change-transform
              transform-gpu
              transition-transform
              duration-[900ms]
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-[1.045]
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-slate-950/25
              via-transparent
              to-transparent
            "
          />

          {/* Category */}
          <div className="absolute left-5 top-5">
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-black/20
                px-3.5
                py-2
                text-[8px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white
                shadow-sm
                backdrop-blur-xl
              "
            >
              {service.id}
            </span>
          </div>

          {/* Price */}
          <div
            className="
              absolute
              right-5
              top-5
              rounded-[14px]
              bg-black/20
              px-4
              py-3
              backdrop-blur-xl
            "
          >
            <span className="block text-[7px] font-semibold uppercase tracking-[0.16em] text-white">
              Starting at
            </span>

            <span className="mt-1 block text-[18px] font-bold leading-none tracking-[-0.035em] text-white">
              {service.startingPrice}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className={`
            relative
            z-10
            flex
            flex-col
            bg-white
            transition-all
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${active
              ? "-mt-6 h-[225px] rounded-t-[28px] px-7 pb-5 pt-5"
              : "-mt-5 h-[195px] rounded-t-[25px] px-6 pb-5 pt-5"
            }
          `}
        >
          {/* Accent / brand */}
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <span
              className="
                h-[3px]
                w-8
                rounded-full
                bg-sky-500
                transition-[width]
                duration-500
                ease-out
                group-hover:w-12
              "
            />

            <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Saskia
            </span>
          </div>

          {/* Title */}
          <h3
            className={`
              shrink-0
              font-heading
              font-semibold
              tracking-[-0.05em]
              text-slate-950
              transition-[font-size,line-height]
              duration-500

              ${active
                ? "text-[1.9rem] leading-[0.98]"
                : "text-[1.4rem] leading-none"
              }
            `}
          >
            {service.title}
          </h3>

          {/* Description */}
          <p
            className={`
              mt-2
              shrink-0
              text-slate-500
              transition-all
              duration-500

              ${active
                ? "line-clamp-2 max-w-[94%] text-[12px] leading-[1.5]"
                : "line-clamp-2 text-[11px] leading-5"
              }
            `}
          >
            {service.subtitle}
          </p>

          {/* Active details */}
          <div
            className={`
              grid
              shrink-0
              overflow-hidden
              transition-all
              duration-500
              ease-[cubic-bezier(0.22,1,0.36,1)]

              ${active
                ? "mt-3 max-h-[70px] gap-1.5 opacity-100"
                : "mt-0 max-h-0 gap-0 opacity-0"
              }
            `}
          >
            {service.details
              .slice(0, 2)
              .map((detail) => (
                <div
                  key={detail}
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-2
                    rounded-full
                    bg-slate-50
                    px-3
                    py-1.5
                    text-[8px]
                    font-medium
                    leading-4
                    text-slate-600
                    ring-1
                    ring-slate-100
                  "
                >
                  <span
                    className="
                      grid
                      h-4
                      w-4
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-sky-500
                      text-white
                    "
                  >
                    <Check
                      className="h-2.5 w-2.5"
                      strokeWidth={2.5}
                    />
                  </span>

                  <span className="truncate">
                    {detail}
                  </span>
                </div>
              ))}
          </div>

          {/* Bottom action */}
          <div
            className="
              mt-auto
              flex
              shrink-0
              items-center
              justify-between
              border-t
              border-slate-100
              pt-3
            "
          >
            <div>
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                Explore service
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-600">
                View details
              </p>
            </div>

            <span
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-full
                bg-slate-950
                text-white
                shadow-[0_7px_18px_rgba(15,23,42,0.14)]
                transform-gpu
                transition-[transform,background-color,box-shadow]
                duration-300
                ease-out
                group-hover:-translate-y-0.5
                group-hover:rotate-6
                group-hover:bg-sky-500
                group-hover:shadow-[0_9px_22px_rgba(14,165,233,0.20)]
              "
            >
              <ArrowUpRight
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />
            </span>
          </div>
        </div>
      </article>
    </button>
  );
}

function MobileCard({
  service,
  active,
  onClick,
}: {
  service: Service;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${service.title}`}
      className="
        group
        w-[84vw]
        max-w-[370px]
        shrink-0
        snap-center
        text-left
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-sky-500
        focus-visible:ring-offset-4
      "
    >
      <article
        className={`
          overflow-hidden
          rounded-[28px]
          bg-white
          ring-1
          transform-gpu
          transition-[transform,box-shadow]
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]

          ${active
            ? `
                  scale-[1.015]
                  ring-sky-200
                  shadow-[0_28px_70px_rgba(14,165,233,0.14)]
                `
            : `
                  scale-100
                  ring-slate-200/80
                  shadow-[0_16px_46px_rgba(15,23,42,0.07)]
                `
          }
        `}
      >
        {/* Image */}
        <div className="relative h-[250px] overflow-hidden">
          <img
            src={service.image}
            alt={`${service.title} service`}
            draggable={false}
            className="
              h-full
              w-full
              select-none
              object-cover
              transform-gpu
              transition-transform
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-[1.05]
            "
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

          {/* Category */}
          <div className="absolute left-4 top-4">
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/20
                bg-slate-950/55
                px-3
                py-2
                text-[8px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
                backdrop-blur-xl
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />

              {service.id}
            </span>
          </div>

          {/* Price */}
          <div
            className="
              absolute
              right-4
              top-4
              rounded-[15px]
              bg-black/20
              px-3.5
              py-2.5
              backdrop-blur-xl
            "
          >
            <span className="block text-[7px] font-semibold uppercase tracking-[0.14em] text-white">
              Starting at
            </span>

            <span className="mt-0.5 block text-[16px] font-bold tracking-[-0.03em] text-white">
              {service.startingPrice}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className="
            relative
            -mt-6
            rounded-t-[26px]
            bg-white
            px-6
            pb-6
            pt-6
          "
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="h-[3px] w-8 rounded-full bg-sky-500" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-300">
              Saskia
            </span>
          </div>

          <h3 className="font-heading text-[1.85rem] font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950">
            {service.title}
          </h3>

          <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-slate-500">
            {service.subtitle}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.17em] text-slate-300">
                Explore
              </p>

              <p className="mt-1 text-[11px] font-medium text-slate-600">
                View service
              </p>
            </div>

            <span
              className="
                grid
                h-10
                w-10
                place-items-center
                rounded-full
                bg-slate-950
                text-white
                shadow-[0_8px_18px_rgba(15,23,42,0.14)]
                transition-all
                duration-300
                group-hover:bg-sky-500
              "
            >
              <ArrowUpRight
                className="h-4 w-4"
                strokeWidth={1.8}
              />
            </span>
          </div>
        </div>
      </article>
    </button>
  );
}

export default function ServiceCarousel() {
  const t = useTranslations("home");

  const services = useMemo<Service[]>(
    () =>
      serviceDefs.map((service) => ({
        id: service.id,
        title: t(service.titleKey),
        subtitle: t(service.subtitleKey),
        image: service.image,
        details: service.detailKeys.map((key) =>
          t(key),
        ),
        startingPrice: service.startingPrice,
      })),
    [t],
  );

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [selected, setSelected] =
    useState<Service | null>(null);

  const [portalReady, setPortalReady] =
    useState(false);

  const [isPlaying, setIsPlaying] =
    useState(true);

  const mobileTrackRef =
    useRef<HTMLDivElement>(null);

  const count = services.length;

  const centerMobileCard = useCallback(
    (index: number) => {
      const track = mobileTrackRef.current;

      if (!track) return;

      const target =
        track.children[index] as
        | HTMLElement
        | undefined;

      if (!target) return;

      const left =
        target.offsetLeft -
        (track.clientWidth - target.offsetWidth) / 2;

      track.scrollTo({
        left,
        behavior: "smooth",
      });
    },
    [],
  );

  const goTo = useCallback(
    (index: number) => {
      const next =
        ((index % count) + count) % count;

      setActiveIndex(next);
      centerMobileCard(next);
    },
    [centerMobileCard, count],
  );

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || selected || count <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex(
        (current) =>
          (current + 1) % count,
      );
    }, AUTO_DELAY);

    return () => {
      window.clearInterval(interval);
    };
  }, [count, isPlaying, selected]);

  return (
    <section
      id="services"
      className="
        relative
        overflow-hidden
        bg-white
        py-24
        sm:py-28
        lg:py-32
      "
    >
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[-12rem]
          h-[42rem]
          w-[85rem]
          -translate-x-1/2
          rounded-full
          bg-sky-100/50
          blur-[120px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[-12rem]
          left-1/2
          h-[32rem]
          w-[70rem]
          -translate-x-1/2
          rounded-full
          bg-slate-100/70
          blur-[120px]
        "
      />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6">
        {/* Header */}
        <header className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-[clamp(2.7rem,4vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-slate-950">
            Cleaning solutions for{" "}
            <span className="font-light italic text-sky-500">
              every space.
            </span>
          </h2>
        </header>

        {/* Desktop carousel */}
        <div
          className="
            relative
            mt-16
            hidden
            h-[650px]
            lg:block
          "
          onMouseEnter={() => {
            setIsPlaying(false);
          }}
          onMouseLeave={() => {
            if (!selected) {
              setIsPlaying(true);
            }
          }}
        >
          {/* Previous */}
          <div className="absolute left-4 top-1/2 z-40 -translate-y-1/2 xl:left-8">
            <button
              type="button"
              aria-label="Previous service"
              onClick={() =>
                goTo(activeIndex - 1)
              }
              className="
                grid
                h-14
                w-14
                place-items-center
                rounded-full
                bg-white/95
                text-slate-950
                shadow-[0_14px_40px_rgba(15,23,42,0.12)]
                ring-1
                ring-slate-200
                backdrop-blur-md
                transform-gpu
                transition-all
                duration-300
                hover:-translate-x-0.5
                hover:scale-105
                hover:bg-slate-950
                hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-500
                focus-visible:ring-offset-2
              "
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Next */}
          <div className="absolute right-4 top-1/2 z-40 -translate-y-1/2 xl:right-8">
            <button
              type="button"
              aria-label="Next service"
              onClick={() =>
                goTo(activeIndex + 1)
              }
              className="
                grid
                h-14
                w-14
                place-items-center
                rounded-full
                bg-white/95
                text-slate-950
                shadow-[0_14px_40px_rgba(15,23,42,0.12)]
                ring-1
                ring-slate-200
                backdrop-blur-md
                transform-gpu
                transition-all
                duration-300
                hover:translate-x-0.5
                hover:scale-105
                hover:bg-slate-950
                hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-500
                focus-visible:ring-offset-2
              "
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {services.map((service, index) => {
            const relative =
              getRelativeIndex(
                index,
                activeIndex,
                count,
              );

            return (
              <DesktopCard
                key={service.id}
                service={service}
                relativeIndex={relative}
                active={index === activeIndex}
                onClick={() => {
                  if (index !== activeIndex) {
                    goTo(index);
                  } else {
                    setSelected(service);
                  }
                }}
              />
            );
          })}
        </div>

        {/* Mobile / Tablet */}
        <div className="mt-14 lg:hidden">
          <div
            ref={mobileTrackRef}
            className="
              flex
              snap-x
              snap-mandatory
              gap-5
              overflow-x-auto
              overscroll-x-contain
              scroll-smooth
              px-[8vw]
              pb-8
              pt-4
              touch-pan-x
              [-webkit-overflow-scrolling:touch]
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {services.map((service, index) => (
              <MobileCard
                key={service.id}
                service={service}
                active={index === activeIndex}
                onClick={() => {
                  if (index !== activeIndex) {
                    setActiveIndex(index);
                    centerMobileCard(index);
                  } else {
                    setSelected(service);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-center gap-3 lg:mt-0">
          <div className="mr-4 hidden h-px w-20 bg-sky-100 sm:block" />

          {services.map((service, index) => (
            <button
              key={service.id}
              type="button"
              aria-label={`Go to ${service.title}`}
              aria-current={
                index === activeIndex
                  ? "true"
                  : undefined
              }
              onClick={() => goTo(index)}
              className={`
                h-2.5
                rounded-full
                transform-gpu
                transition-[width,background-color,transform]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-500
                focus-visible:ring-offset-2

                ${index === activeIndex
                  ? "w-8 scale-100 bg-sky-500"
                  : "w-2.5 scale-90 bg-sky-100 hover:scale-100 hover:bg-sky-300"
                }
              `}
            />
          ))}

          <div className="ml-4 hidden h-px w-20 bg-sky-100 sm:block" />
        </div>
      </div>

      {portalReady && selected && (
        <ServiceModal
          service={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}