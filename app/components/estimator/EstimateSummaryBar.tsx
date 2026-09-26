"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IoChatbubblesOutline } from "react-icons/io5";

import {
  fadeUp,
  MOTION_EASE,
  SCROLL_VIEWPORT,
} from "./constants";
import type { PriceRange } from "./types";
import { PricePill } from "./ui/PricePill";

export type EstimateSummaryBarProps = {
  prices: PriceRange;
  locale: string;
  estimateRangeLabel: string;
  lowLabel: string;
  midLabel: string;
  highLabel: string;
  chatbotLabel: string;
  optionsOpen: boolean;
  bookLabel: string;
  onChatbotClick: () => void;
  onBookNow: () => void;
};

export function EstimateSummaryBar({
  prices,
  locale,
  estimateRangeLabel,
  lowLabel,
  midLabel,
  highLabel,
  chatbotLabel,
  optionsOpen,
  bookLabel,
  onChatbotClick,
  onBookNow,
}: EstimateSummaryBarProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={SCROLL_VIEWPORT}
      variants={fadeUp}
      className="flex flex-col gap-5 to-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8"
    >
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5 lg:hidden">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-black">
          {estimateRangeLabel}
        </span>

        <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
          <PricePill label={lowLabel} value={prices.low} locale={locale} />
          <div className="hidden h-7 w-px bg-gray-200 sm:block" />
          <PricePill
            label={midLabel}
            value={prices.mid}
            accent
            locale={locale}
          />
          <div className="hidden h-7 w-px bg-gray-200 sm:block" />
          <PricePill label={highLabel} value={prices.high} locale={locale} />
        </div>
      </div>

      <button
        type="button"
        className="flex hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer items-center gap-2 rounded-[10px] bg-sky-500/10 px-4 py-2"
        onClick={onChatbotClick}
      >
        <IoChatbubblesOutline size={20} className="text-sky-500" />
        {chatbotLabel}
      </button>

      <AnimatePresence initial={false}>
        {optionsOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
            className="flex w-full flex-col gap-3 overflow-hidden sm:w-auto sm:flex-row sm:items-center sm:gap-4"
          >
            {/* <div className="flex items-center justify-center gap-1.5 rounded-[] bg-emerald-50 px-3 py-1.5 sm:justify-start">
              <div className="h-1.5 w-1.5 rounded-[] bg-emerald-600" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Licensed & insured
              </span>
            </div> */}

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBookNow}
              className="w-full cursor-pointer  border-none bg-sky-400 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(56,189,248,.35)] transition-colors duration-200 hover:bg-sky-500 sm:w-auto"
            >
              {bookLabel}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default EstimateSummaryBar;
