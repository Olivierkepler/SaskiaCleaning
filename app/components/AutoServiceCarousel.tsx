"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const services = [
  {
    title: "Residential Cleaning",
    subtitle: "Premium home care for apartments, houses, and move-outs.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    details: [
      "Basic, standard, deep cleaning, and move-in/move-out cleaning.",
      "Ideal for apartments, family homes, condos, and rentals.",
      "Includes kitchens, bathrooms, bedrooms, floors, and common areas.",
    ],
    startingPrice: "$100+",
  },
  {
    title: "Commercial Cleaning",
    subtitle: "Precision cleaning for offices, retail spaces, and businesses.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    details: [
      "Designed for offices, stores, studios, and small businesses.",
      "Includes floors, desks, restrooms, trash removal, and shared spaces.",
      "Available for one-time, weekly, or recurring janitorial service.",
    ],
    startingPrice: "$180+",
  },
  {
    title: "Laundry Services",
    subtitle: "Wash, dry, fold, pressing, linens, and pickup solutions.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    details: [
      "Wash and fold, drying, ironing, bedding, linens, and same-day laundry.",
      "Pickup and delivery available for busy clients.",
      "Perfect for homes, rentals, Airbnb hosts, and professionals.",
    ],
    startingPrice: "$1.75/lb",
  },
  {
    title: "Airbnb Cleaning",
    subtitle: "Fast guest-ready turnovers for short-term rental properties.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    details: [
      "Quick turnover cleaning between guest stays.",
      "Linen replacement, restocking, bathroom refresh, and kitchen reset.",
      "Same-day turnover options available for urgent bookings.",
    ],
    startingPrice: "$120+",
  },
  {
    title: "Specialty Cleaning",
    subtitle: "Advanced care for carpets, windows, appliances, and build-outs.",
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80",
    details: [
      "Carpet cleaning, window cleaning, appliance cleaning, and post-construction.",
      "Great for seasonal refreshes or specific problem areas.",
      "Pricing depends on room count, surface type, and job size.",
    ],
    startingPrice: "$45+",
  },
  {
    title: "Add-On Services",
    subtitle: "Custom enhancements for deeper, cleaner, smarter service.",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
    details: [
      "Fridge cleaning, oven cleaning, pet hair removal, cabinet cleaning, and eco-friendly products.",
      "Can be added to any cleaning package.",
      "Best for clients who want a more detailed finish.",
    ],
    startingPrice: "$10+",
  },
];

type Service = (typeof services)[number];

const COUNT = services.length;
const CARD_WIDTH = 380;
const GAP = 28;
const STRIDE = CARD_WIDTH + GAP;
const AUTO_DELAY = 4000;
const RESUME_AFTER = 6000;

function IconArrowUpRight({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function IconClose({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

function ProgressDot({
  active,
  isPlaying,
  onClick,
  label,
}: {
  active: boolean;
  isPlaying: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      onClick={onClick}
      className="relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      style={{
        width: active ? 34 : 10,
        height: 16,
        transition: "width 300ms ease",
      }}
    >
      {active ? (
        <svg viewBox="0 0 34 16" width="34" height="16">
          <rect x="0" y="4" width="34" height="8" rx="4" fill="#e2e8f0" />
          <rect
            x="0"
            y="4"
            width="34"
            height="8"
            rx="4"
            fill="#0ea5e9"
            style={{
              clipPath: "inset(0 0 0 0 round 4px)",
              transformOrigin: "left center",
              animation: isPlaying
                ? `pill-fill ${AUTO_DELAY}ms linear forwards`
                : "none",
            }}
          />
        </svg>
      ) : (
        <svg viewBox="0 0 10 10" width="10" height="10">
          <circle cx="5" cy="5" r="4" fill="#e2e8f0" />
        </svg>
      )}
    </button>
  );
}

function NavButton({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Previous service" : "Next service"}
      className="
        grid h-11 w-11 shrink-0 place-items-center rounded-full
        bg-white text-slate-700 ring-1 ring-slate-200
        shadow-[0_8px_30px_rgba(15,23,42,0.08)]
        transition duration-300 hover:bg-slate-950 hover:text-white
        hover:ring-slate-950 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
        active:scale-95
      "
    >
      <IconChevron dir={dir} />
    </button>
  );
}

function ServiceCard({
  service,
  index,
  active,
  onClick,
}: {
  service: Service;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View details for ${service.title}`}
      className={`
        group relative w-[380px] shrink-0 overflow-hidden rounded-[2rem]
        bg-white text-left ring-1 transition duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-2 hover:ring-sky-200
        hover:shadow-[0_30px_90px_rgba(14,165,233,0.18)]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-sky-500 focus-visible:ring-offset-2
        focus-visible:ring-offset-white active:scale-[0.99]
        motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100
        ${
          active
            ? "ring-sky-300/70 shadow-[0_28px_80px_rgba(14,165,233,0.16)]"
            : "ring-slate-200/70 shadow-[0_18px_55px_rgba(15,23,42,0.07)]"
        }
      `}
    >
      <div className="relative overflow-hidden">
        <img
          src={service.image}
          alt=""
          loading={index < 3 ? "eager" : "lazy"}
          className="
            h-60 w-full object-cover grayscale-[5%]
            transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-[1.045] group-hover:grayscale-0
            motion-reduce:transition-none motion-reduce:group-hover:scale-100
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />

        <span className="absolute bottom-4 left-5 rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md ring-1 ring-white/20">
          From {service.startingPrice}
        </span>
      </div>

      <div className="p-6">
        <div
          className="mb-4 h-[2px] bg-sky-400 transition-all duration-300 group-hover:w-14"
          style={{ width: active ? 56 : 32 }}
        />

        <h3 className="font-[family-name:var(--font-cormorant)] text-[1.85rem] font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950">
          {service.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-slate-600">
          {service.subtitle}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Details
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition duration-300 group-hover:bg-sky-500">
            View
            <IconArrowUpRight />
          </span>
        </div>
      </div>
    </button>
  );
}

function ServiceModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="
        fixed inset-0 z-[90] flex min-h-dvh items-end justify-center
        bg-slate-950/60 p-0 backdrop-blur-md sm:items-center sm:p-6
      "
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      onClick={onClose}
    >
      <div
        className="
          relative flex max-h-[90dvh] w-full max-w-[580px]
          flex-col overflow-hidden rounded-t-[2rem] bg-white
          shadow-[0_-24px_90px_rgba(15,23,42,0.24)]
          ring-1 ring-white/70 sm:rounded-[2rem]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[235px] shrink-0 overflow-hidden sm:h-[285px]">
          <img
            src={service.image}
            alt=""
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

          <div className="absolute bottom-6 left-6 right-16 sm:bottom-8 sm:left-8">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-200">
              Starting at {service.startingPrice}
            </p>

            <h2
              id="service-modal-title"
              className="
                font-[family-name:var(--font-cormorant)]
                text-[clamp(2.25rem,6vw,3.35rem)]
                font-semibold leading-[0.9]
                tracking-[-0.055em] text-white
              "
            >
              {service.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              absolute right-4 top-4 grid h-10 w-10 place-items-center
              rounded-full bg-white/95 text-slate-950 shadow-lg
              ring-1 ring-white/60 backdrop-blur-sm transition
              hover:bg-slate-950 hover:text-white
            "
          >
            <IconClose />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8">
          <p className="text-[15px] leading-7 text-slate-600">
            {service.subtitle}
          </p>

          <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100 sm:p-6">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Service Includes
            </p>

            <ul className="flex flex-col gap-3">
              {service.details.map((detail) => (
                <li
                  key={detail}
                  className="flex gap-3 text-sm leading-7 text-slate-600"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="
                min-h-[48px] flex-1 rounded-full bg-sky-500
                px-5 text-[10px] font-semibold uppercase tracking-[0.16em]
                text-white shadow-[0_10px_30px_rgba(14,165,233,0.25)]
                transition hover:bg-slate-950
              "
            >
              Request This Service
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                min-h-[48px] flex-1 rounded-full border border-slate-200
                px-5 text-[10px] font-semibold uppercase tracking-[0.14em]
                text-slate-600 transition hover:border-slate-950 hover:text-slate-950
              "
            >
              Keep Browsing
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ServiceCarousel() {
  const [selected, setSelected] = useState<Service | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeRef = useRef(activeIndex);
  const playingRef = useRef(isPlaying);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotKey = useRef(0);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollTo({
      left: index * STRIDE,
      behavior: "smooth",
    });
  }, []);

  const goTo = useCallback(
    (raw: number, userInitiated = false) => {
      const index = ((raw % COUNT) + COUNT) % COUNT;

      setActiveIndex(index);
      activeRef.current = index;
      dotKey.current += 1;
      scrollTo(index);

      if (userInitiated) {
        setIsPlaying(false);
        playingRef.current = false;

        if (resumeTimer.current) clearTimeout(resumeTimer.current);

        resumeTimer.current = setTimeout(() => {
          setIsPlaying(true);
          playingRef.current = true;
        }, RESUME_AFTER);
      }
    },
    [scrollTo]
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (!playingRef.current) return;
      goTo(activeRef.current + 1);
    }, AUTO_DELAY);

    return () => clearInterval(id);
  }, [goTo]);

  useEffect(() => {
    setIsPlaying(!selected);
  }, [selected]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const idx = Math.round(track.scrollLeft / STRIDE);
      const clamped = Math.max(0, Math.min(COUNT - 1, idx));

      if (clamped !== activeRef.current) {
        setActiveIndex(clamped);
        activeRef.current = clamped;
        dotKey.current += 1;
      }
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  return (
    <section className="relative w-screen overflow-hidden bg-white py-24 sm:py-28 lg:py-32">
  
      <div className="relative w-full">
        <header className="mx-auto mb-16 max-w-4xl px-6 text-center">
          {/* <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-sky-400/60" />
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-sky-500">
              Saskia Cleaning Services
            </span>
            <span className="h-px w-6 bg-sky-400/60" />
          </div> */}

          <h2 className="font-['Poppins', sans-serif] text-[clamp(2.8rem,3.5vw,5rem)]  leading-[0.9] tracking-[-0.04em] text-slate-950">
            Elevated cleaning for{" "}
            <em className="font-light italic text-slate-400">
              modern living
            </em>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[15px] font-light leading-[1.75] text-slate-500 sm:text-base">
            Seamless cleaning, laundry, and property care — precise, reliable,
            and tailored to your space.
          </p>
        </header>

        <div className="relative w-full">
       
          <div
            ref={trackRef}
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => {
              if (!selected) setIsPlaying(true);
            }}
            className="
              flex w-full gap-7 overflow-x-auto overscroll-x-contain
              scroll-smooth py-8
              [scroll-snap-type:x_mandatory]
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
            style={{
              paddingLeft: `max(2rem, calc((100vw - (${CARD_WIDTH * 3 + GAP * 2}px)) / 2))`,
              paddingRight: `max(2rem, calc((100vw - (${CARD_WIDTH * 3 + GAP * 2}px)) / 2))`,
            }}
          >
            {services.map((service, i) => (
              <div key={service.title} className="[scroll-snap-align:center]">
                <ServiceCard
                  service={service}
                  index={i}
                  active={i === activeIndex}
                  onClick={() => setSelected(service)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 px-4">
          <NavButton dir="left" onClick={() => goTo(activeIndex - 1, true)} />

          <div
            className="flex items-center gap-2.5"
            role="tablist"
            aria-label="Carousel navigation"
          >
            {services.map((s, i) => (
              <ProgressDot
                key={`${i}-${dotKey.current}`}
                active={i === activeIndex}
                isPlaying={isPlaying && i === activeIndex}
                onClick={() => goTo(i, true)}
                label={`Go to ${s.title}`}
              />
            ))}
          </div>

          <NavButton dir="right" onClick={() => goTo(activeIndex + 1, true)} />
        </div>

        <p className="mt-5 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-slate-300">
          Auto-advancing · hover to pause
        </p>
      </div>

      {portalReady && selected && (
        <ServiceModal service={selected} onClose={() => setSelected(null)} />
      )}

      <style>{`
        @keyframes pill-fill {
          from { clip-path: inset(0 100% 0 0 round 4px); }
          to { clip-path: inset(0 0% 0 0 round 4px); }
        }
      `}</style>
    </section>
  );
}