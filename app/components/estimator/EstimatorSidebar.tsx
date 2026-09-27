"use client";

import { AnimatePresence, motion } from "framer-motion";

import BookingSummary from "../BookingSummary";
import {
  MOTION_EASE,
  SCROLL_VIEWPORT,
  slideRight,
} from "./constants";
import { DynamicServiceGallery } from "./gallery/DynamicServiceGallery";
import type { PriceRange, StandardPreviewImage } from "./types";
import { PricePill } from "./ui/PricePill";

export type EstimatorSidebarProps = {
  optionsOpen: boolean;
  serviceLabel: string;
  frequency: string;
  location: string;
  date: Date | null;
  extras: string[];
  prices: PriceRange;
  locale: string;
  estimateLabel: string;
  lowLabel: string;
  midLabel: string;
  highLabel: string;
  galleryKey: string;
  galleryImages: StandardPreviewImage[];
  isDefaultGalleryOnly: boolean;
};

export function EstimatorSidebar({
  optionsOpen,
  serviceLabel,
  frequency,
  location,
  date,
  extras,
  prices,
  locale,
  estimateLabel,
  lowLabel,
  midLabel,
  highLabel,
  galleryKey,
  galleryImages,
  isDefaultGalleryOnly,
}: EstimatorSidebarProps) {
  return (
    <div
      className="
        hidden
        min-w-0
        flex-col
        gap-6
        lg:flex
        lg:self-stretch

      "
    >
      {/* Booking Summary — hidden until Customize is opened */}
      <AnimatePresence initial={false}>
        {optionsOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -8,
            }}
            transition={{
              duration: 0.3,
              ease: MOTION_EASE,
            }}
            className="
              hidden
              overflow-hidden
              lg:block
            "
          >
            <BookingSummary
              service={serviceLabel}
              frequency={frequency}
              location={location}
              date={date}
              extras={extras}
              total={prices.mid}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main visual */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_VIEWPORT}
        variants={slideRight}
        className="
          relative
          hidden
          min-h-[540px]
          w-full
          flex-1
          flex-col
          overflow-hidden
          rounded-[28px]
          lg:flex
          xl:min-h-[610px]
        "
      >
        {/* Estimate Header */}
        <AnimatePresence initial={false}>
          {optionsOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
                ease: MOTION_EASE,
              }}
              className="
                relative
                z-10
                overflow-hidden
                border-b
                border-slate-200/70
                bg-white/95
                backdrop-blur-xl
              "
            >
              <div className="px-5 py-4 xl:px-6">
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    xl:flex-row
                    xl:items-center
                    xl:justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.22em]
                        text-slate-400
                      "
                    >
                      {estimateLabel}
                    </p>
                  </div>

                  <div
                    className="
                      grid
                      grid-cols-3
                      items-center
                      overflow-hidden
                      rounded-xl
                    "
                  >
                    <PricePill
                      label={lowLabel}
                      value={prices.low}
                      locale={locale}
                    />

                    <div className="px-2">
                      <PricePill
                        label={midLabel}
                        value={prices.mid}
                        accent
                        locale={locale}
                      />
                    </div>

                    <PricePill
                      label={highLabel}
                      value={prices.high}
                      locale={locale}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery */}
        <div
          className="
            relative
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          {/* Soft background glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-6
              rounded-[32px]
              bg-sky-100/35
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              min-h-0
              flex-1
              items-center
              justify-center
              overflow-visible
              px-3
              py-2
              xl:px-4
            "
          >
            <div
              className="
                relative
                flex
                h-full
                min-h-[500px]
                w-full
                items-center
                justify-center
                overflow-visible
                lg:translate-x-6
                xl:min-h-[570px]
                xl:translate-x-8
              "
            >
              <AnimatePresence mode="wait">
                <DynamicServiceGallery
                  galleryKey={galleryKey}
                  images={galleryImages}
                  isDefaultOnly={isDefaultGalleryOnly}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EstimatorSidebar;