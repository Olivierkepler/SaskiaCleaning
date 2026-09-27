"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

import {
  ADDON_DISPLAY_KEYS,
  BATH_VALS,
  BED_BASE,
  FREQ_DISPLAY_KEYS,
  STANDARD_ADDONS,
} from "../constants";
import type { PriceRange, StandardAddonLabel } from "../types";
import { calc, toggleInSet } from "../utils";
import { AddonGrid } from "../ui/Addon";
import { DiscreteSlider } from "../ui/DiscreteSlider";

export type StandardPanelProps = {
  onPrice: (price: PriceRange) => void;
  frequency: string;
  onFrequencyChange: (frequency: string) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
  bedIdx: number;
  bathIdx: number;
  onBedIdxChange: (index: number) => void;
  onBathIdxChange: (index: number) => void;
};

export function StandardPanel({
  onPrice,
  frequency,
  onFrequencyChange,
  selectedAddons,
  onSelectedAddonsChange,
  bedIdx,
  bathIdx,
  onBedIdxChange,
  onBathIdxChange,
}: StandardPanelProps) {
  const t = useTranslations("booking");

  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };

  const translateFreq = (label: string) => {
    const key = FREQ_DISPLAY_KEYS[label];
    return key ? t(key as "oneTime") : label;
  };

  const FREQS = [
    { label: "One-time", discount: 0 },
    { label: "Bi-weekly", discount: 10 },
    { label: "Weekly", discount: 15 },
    { label: "Monthly", discount: 5 },
  ];

  const freqIdx = FREQS.findIndex((item) => item.label === frequency);

  const BEDS = [
    t("studio"),
    t("oneRoom"),
    t("twoRooms"),
    t("threeRooms"),
    t("fourPlusRooms"),
  ];

  const toggle = useCallback(
    (label: StandardAddonLabel) => {
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
    },
    [selectedAddons, onSelectedAddonsChange],
  );

  const addonTotal = STANDARD_ADDONS.reduce(
    (sum, addon) =>
      sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(() => {
    const b =
      BED_BASE[bedIdx] +
      (BATH_VALS[bathIdx] - 1) * 18 +
      addonTotal;

    const discount = freqIdx >= 0 ? FREQS[freqIdx].discount : 0;

    onPrice(
      calc(
        Math.round(
          b * (1 - discount / 100),
        ),
      ),
    );
  }, [
    bedIdx,
    bathIdx,
    freqIdx,
    addonTotal,
    onPrice,
  ]);

  return (
    <div
      className="
        grid
        gap-5
        lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]
        xl:gap-6
      "
    >
      {/* Left Card — Core Cleaning Setup */}
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
          {/* Bedrooms */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h3
                className="
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-slate-900
                "
              >
                {t("bedrooms")}
              </h3>
            </div>

            <DiscreteSlider
              value={bedIdx}
              options={BEDS.map((label, index) => ({
                label,
                value: index,
              }))}
              onChange={onBedIdxChange}
              ariaLabel={t("bedrooms")}
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-100" />

          {/* Bathrooms */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h3
                className="
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-slate-900
                "
              >
                {t("bathrooms")}
              </h3>
            </div>

            <DiscreteSlider
              value={bathIdx}
              options={BATH_VALS.map((bath, index) => ({
                label: String(bath),
                value: index,
              }))}
              onChange={onBathIdxChange}
              ariaLabel={t("bathrooms")}
            />
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-100" />

          {/* Frequency */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h3
                className="
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-slate-900
                "
              >
                {t("frequency")}
              </h3>
            </div>

            <DiscreteSlider
              value={frequency}
              options={FREQS.map((frequencyOption) => ({
                label: translateFreq(frequencyOption.label),
                value: frequencyOption.label,
              }))}
              onChange={onFrequencyChange}
              ariaLabel={t("frequency")}
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
        <div className="mb-5">
          <h3
            className="
              text-[13px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-900
            "
          >
            {t("addOns")}
          </h3>
        </div>

        <AddonGrid
          addons={STANDARD_ADDONS}
          selectedAddons={selectedAddons}
          onToggle={toggle}
          getDisplayLabel={translateAddon}
        />
      </div>
    </div>
  );
}

export default StandardPanel;