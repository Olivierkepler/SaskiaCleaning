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
    <div className="hidden flex-col gap-6 lg:flex">
      {/* Booking Summary — hidden until "Customize" is opened */}
      <AnimatePresence initial={false}>
        {optionsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.3, ease: MOTION_EASE }}
            className="hidden overflow-hidden lg:block"
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

      {/* Right Image Card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_VIEWPORT}
        variants={slideRight}
        className="hidden min-h-[440px] flex-col overflow-hidden rounded-2xl lg:flex"
      >
        {/* Estimate Header — hidden until "Customize" is opened */}
        <AnimatePresence initial={false}>
          {optionsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: MOTION_EASE }}
              className="overflow-hidden border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50"
            >
              <div className="px-5 py-4 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      {estimateLabel}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 overflow-hidden rounded-xl  py-2 ">
                    <PricePill
                      label={lowLabel}
                      value={prices.low}
                      locale={locale}
                    />
                    <div className=" px-2">
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

        {/* Gallery Area */}
        <div className="relative overflow-hidden  flex min-h-0 flex-1 flex-col p-5 lg:p-6">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl ">
            <AnimatePresence mode="wait">
              <DynamicServiceGallery
                galleryKey={galleryKey}
                images={galleryImages}
                isDefaultOnly={isDefaultGalleryOnly}
              />
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EstimatorSidebar;
