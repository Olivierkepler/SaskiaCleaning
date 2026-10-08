"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MOTION_EASE } from "./constants";
import { CommercialPanel } from "./panels/CommercialPanel";
import { DeepCleanPanel } from "./panels/DeepCleanPanel";
import { MoveOutPanel } from "./panels/MoveOutPanel";
import { StandardPanel } from "./panels/StandardPanel";
import type { PriceRange, ServiceIndex } from "./types";

export type CustomizationPanelProps = {
  selectedServiceIndex: ServiceIndex;
  optionsOpen: boolean;
  title: string;
  onPrice: (price: PriceRange) => void;
  frequency: string;
  onFrequencyChange: (frequency: string) => void;
  standardSelectedAddons: Set<string>;
  onStandardSelectedAddonsChange: (addons: Set<string>) => void;
  standardBedIndex: number;
  standardBathIndex: number;
  onStandardBedIndexChange: (index: number) => void;
  onStandardBathIndexChange: (index: number) => void;
  deepCleanSizeIndex: number;
  onDeepCleanSizeIndexChange: (index: number) => void;
  deepCleanConditionIndex: number;
  onDeepCleanConditionIndexChange: (index: number) => void;
  moveOutSquareFootageIndex: number;
  onMoveOutSquareFootageIndexChange: (index: number) => void;
  commercialSquareFootageIndex: number;
  onCommercialSquareFootageIndexChange: (index: number) => void;
  commercialScheduleIndex: number;
  onCommercialScheduleIndexChange: (index: number) => void;
  deepCleanSelectedAddons: Set<string>;
  onDeepCleanSelectedAddonsChange: (addons: Set<string>) => void;
  moveOutSelectedAddons: Set<string>;
  onMoveOutSelectedAddonsChange: (addons: Set<string>) => void;
  commercialSelectedAddons: Set<string>;
  onCommercialSelectedAddonsChange: (addons: Set<string>) => void;
};

export function CustomizationPanel({
  selectedServiceIndex,
  optionsOpen,
  title,
  onPrice,
  frequency,
  onFrequencyChange,
  standardSelectedAddons,
  onStandardSelectedAddonsChange,
  standardBedIndex,
  standardBathIndex,
  onStandardBedIndexChange,
  onStandardBathIndexChange,
  deepCleanSizeIndex,
  onDeepCleanSizeIndexChange,
  deepCleanConditionIndex,
  onDeepCleanConditionIndexChange,
  moveOutSquareFootageIndex,
  onMoveOutSquareFootageIndexChange,
  commercialSquareFootageIndex,
  onCommercialSquareFootageIndexChange,
  commercialScheduleIndex,
  onCommercialScheduleIndexChange,
  deepCleanSelectedAddons,
  onDeepCleanSelectedAddonsChange,
  moveOutSelectedAddons,
  onMoveOutSelectedAddonsChange,
  commercialSelectedAddons,
  onCommercialSelectedAddonsChange,
}: CustomizationPanelProps) {
  const panels = [
    <StandardPanel
      key="std"
      onPrice={onPrice}
      frequency={frequency}
      onFrequencyChange={onFrequencyChange}
      selectedAddons={standardSelectedAddons}
      onSelectedAddonsChange={onStandardSelectedAddonsChange}
      bedIdx={standardBedIndex}
      bathIdx={standardBathIndex}
      onBedIdxChange={onStandardBedIndexChange}
      onBathIdxChange={onStandardBathIndexChange}
    />,
    <DeepCleanPanel
      key="deep"
      onPrice={onPrice}
      selectedAddons={deepCleanSelectedAddons}
      onSelectedAddonsChange={onDeepCleanSelectedAddonsChange}
      sizeIndex={deepCleanSizeIndex}
      onSizeIndexChange={onDeepCleanSizeIndexChange}
      conditionIndex={deepCleanConditionIndex}
      onConditionIndexChange={onDeepCleanConditionIndexChange}
    />,
    <MoveOutPanel
      key="mo"
      onPrice={onPrice}
      selectedAddons={moveOutSelectedAddons}
      onSelectedAddonsChange={onMoveOutSelectedAddonsChange}
      squareFootageIndex={moveOutSquareFootageIndex}
      onSquareFootageIndexChange={onMoveOutSquareFootageIndexChange}
    />,
    <CommercialPanel
      key="com"
      onPrice={onPrice}
      selectedAddons={commercialSelectedAddons}
      onSelectedAddonsChange={onCommercialSelectedAddonsChange}
      squareFootageIndex={commercialSquareFootageIndex}
      onSquareFootageIndexChange={onCommercialSquareFootageIndexChange}
      scheduleIndex={commercialScheduleIndex}
      onScheduleIndexChange={onCommercialScheduleIndexChange}
    />,
  ];

  return (
    <AnimatePresence initial={false}>
      {optionsOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden bg-white shadow-[inset_0_1px_0_rgba(15,23,42,0.06)]"
        >
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {title}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedServiceIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: MOTION_EASE }}
              >
                {panels[selectedServiceIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CustomizationPanel;
