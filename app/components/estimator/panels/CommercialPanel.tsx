"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ADDON_DISPLAY_KEYS,
  COMMERCIAL_ADDONS,
  FREQ_DISPLAY_KEYS,
} from "../constants";
import type { CommercialAddonLabel, PriceRange } from "../types";
import { calculateCommercialEstimate, COMMERCIAL_SCHEDULES } from "@/app/lib/booking-pricing-pure";
import { toggleInSet } from "../utils";
import { AddonGrid } from "../ui/Addon";
import { DiscreteSlider } from "../ui/DiscreteSlider";

export type CommercialPanelProps = {
  onPrice: (price: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
  squareFootageIndex?: number;
  onSquareFootageIndexChange?: (index: number) => void;
  scheduleIndex?: number;
  onScheduleIndexChange?: (index: number) => void;
};

export function CommercialPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
  squareFootageIndex,
  onSquareFootageIndexChange,
  scheduleIndex,
  onScheduleIndexChange,
}: CommercialPanelProps) {
  const t = useTranslations("booking");

  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };

  const translateFreq = (label: string) => {
    const key = FREQ_DISPLAY_KEYS[label];
    return key ? t(key as "oneTime") : label;
  };

  const [typeIdx, setType] = useState(0);
  const [localSqftIdx, setLocalSqftIdx] = useState(0);
  const [localSchedIdx, setLocalSchedIdx] = useState(3);
  const sqftIdx = squareFootageIndex ?? localSqftIdx;
  const schedIdx = scheduleIndex ?? localSchedIdx;
  const setSqft = (index: number) => { setLocalSqftIdx(index); onSquareFootageIndexChange?.(index); };
  const setSched = (index: number) => { setLocalSchedIdx(index); onScheduleIndexChange?.(index); };
  const [timingIdx, setTiming] = useState(-1);
  const [contractIdx, setContract] = useState(0);

  const TYPES = [
    "Office",
    "Retail",
    "Restaurant",
    "Medical",
    "Gym",
  ];

  const SQFTS = [
    "Under 1k",
    "1k–2.5k",
    "2.5k–5k",
    "5k+",
  ];

  const TIMINGS = [
    "Before open",
    "After close",
    "Weekend",
  ];

  const CONTRACTS = [
    "No contract",
    "3 months",
    "6 months",
    "Annual",
  ];

  const toggle = useCallback(
    (label: CommercialAddonLabel) => {
      onSelectedAddonsChange(
        toggleInSet(selectedAddons, label),
      );
    },
    [selectedAddons, onSelectedAddonsChange],
  );

  useEffect(() => {
    onPrice(calculateCommercialEstimate({ squareFootageIndex: sqftIdx, scheduleIndex: schedIdx, extras: [...selectedAddons] }));
  }, [sqftIdx, schedIdx, selectedAddons, onPrice]);

  return (
    <div className="grid gap-5">
      {/* Main Commercial Configuration */}
      <div
        className="
          grid
          gap-5
          lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]
        "
      >
        {/* Left Card — Space / Size / Schedule */}
        <div
          className="
            rounded-[24px]
            border
            border-slate-200/70
            bg-white
            p-5
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            sm:p-6
            lg:p-7
          "
        >
          <div className="space-y-8">
            {/* Space Type */}
            <section>
              <h3
                className="
                  mb-5
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-slate-900
                "
              >
                Space type
              </h3>

              <DiscreteSlider
                value={typeIdx}
                options={TYPES.map((label, index) => ({
                  label,
                  value: index,
                }))}
                onChange={setType}
                ariaLabel="Space type"
              />
            </section>

            <div className="h-px bg-slate-100" />

            {/* Square Footage */}
            <section>
              <h3
                className="
                  mb-5
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-slate-900
                "
              >
                Square footage
              </h3>

              <DiscreteSlider
                value={sqftIdx}
                options={SQFTS.map((label, index) => ({
                  label,
                  value: index,
                }))}
                onChange={setSqft}
                ariaLabel="Square footage"
              />
            </section>

            <div className="h-px bg-slate-100" />

            {/* Schedule */}
            <section>
              <h3
                className="
                  mb-5
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-slate-900
                "
              >
                {t("schedule")}
              </h3>

              <DiscreteSlider
                value={schedIdx}
                options={COMMERCIAL_SCHEDULES.map((schedule, index) => ({
                  label: translateFreq(schedule.label),
                  value: index,
                }))}
                onChange={setSched}
                ariaLabel={t("schedule")}
              />
            </section>
          </div>
        </div>

        {/* Right Card — Add-ons */}
        <div
          className="
            rounded-[24px]
            border
            border-slate-200/70
            bg-white
            p-5
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            sm:p-6
            lg:p-7
          "
        >
          <h3
            className="
              mb-5
              text-[13px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-900
            "
          >
            {t("addOns")}
          </h3>

          <AddonGrid
            addons={COMMERCIAL_ADDONS}
            selectedAddons={selectedAddons}
            onToggle={toggle}
            getDisplayLabel={translateAddon}
          />
        </div>
      </div>

      {/* Timing + Contract */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Timing */}
        <div
          className="
            rounded-[24px]
            border
            border-slate-200/70
            bg-white
            p-5
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            sm:p-6
          "
        >
          <h3
            className="
              mb-5
              text-[13px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-900
            "
          >
            Timing
          </h3>

          <DiscreteSlider
            value={timingIdx}
            options={[
              {
                label: "Not selected",
                value: -1,
              },
              ...TIMINGS.map((label, index) => ({
                label,
                value: index,
              })),
            ]}
            onChange={setTiming}
            ariaLabel="Timing"
          />
        </div>

        {/* Contract */}
        <div
          className="
            rounded-[24px]
            border
            border-slate-200/70
            bg-white
            p-5
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            sm:p-6
          "
        >
          <h3
            className="
              mb-5
              text-[13px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-900
            "
          >
            Contract
          </h3>

          <DiscreteSlider
            value={contractIdx}
            options={CONTRACTS.map((label, index) => ({
              label,
              value: index,
            }))}
            onChange={setContract}
            ariaLabel="Contract"
          />
        </div>
      </div>
    </div>
  );
}

export default CommercialPanel;
