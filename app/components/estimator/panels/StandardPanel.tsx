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

  const freqIdx = FREQS.findIndex(
    (item) => item.label === frequency,
  );

  const BEDS = [
    t("studio"),
    t("oneRoom"),
    t("twoRooms"),
    t("threeRooms"),
    t("fourPlusRooms"),
  ];

  const toggle = useCallback(
    (label: StandardAddonLabel) => {
      onSelectedAddonsChange(
        toggleInSet(selectedAddons, label),
      );
    },
    [selectedAddons, onSelectedAddonsChange],
  );

  const addonTotal = STANDARD_ADDONS.reduce(
    (sum, addon) =>
      sum +
      (selectedAddons.has(addon.label)
        ? addon.price
        : 0),
    0,
  );

  useEffect(() => {
    const base =
      BED_BASE[bedIdx] +
      (BATH_VALS[bathIdx] - 1) * 18 +
      addonTotal;

    const discount =
      freqIdx >= 0
        ? FREQS[freqIdx].discount
        : 0;

    onPrice(
      calc(
        Math.round(
          base * (1 - discount / 100),
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
        gap-6
        lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]
      "
    >
      {/* Core cleaning setup */}
      <div
        className="
          rounded-[26px]
          bg-[#F5F7FA]
          p-5
          shadow-[8px_8px_20px_#D1D9E6,-8px_-8px_20px_rgba(255,255,255,0.95)]
          sm:p-6
          lg:p-7
        "
      >
        <div className="space-y-8">
          {/* Bedrooms */}
          <section>
            <h3
              className="
                mb-5
                text-[13px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-900
              "
            >
              {t("bedrooms")}
            </h3>

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

          <div
            className="
              h-px
              bg-[#D1D9E6]/60
              shadow-[0_1px_0_rgba(255,255,255,0.9)]
            "
          />

          {/* Bathrooms */}
          <section>
            <h3
              className="
                mb-5
                text-[13px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-900
              "
            >
              {t("bathrooms")}
            </h3>

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

          <div
            className="
              h-px
              bg-[#D1D9E6]/60
              shadow-[0_1px_0_rgba(255,255,255,0.9)]
            "
          />

          {/* Frequency */}
          <section>
            <h3
              className="
                mb-5
                text-[13px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-900
              "
            >
              {t("frequency")}
            </h3>

            <DiscreteSlider
              value={frequency}
              options={FREQS.map((frequencyOption) => ({
                label: translateFreq(
                  frequencyOption.label,
                ),
                value: frequencyOption.label,
              }))}
              onChange={onFrequencyChange}
              ariaLabel={t("frequency")}
            />
          </section>
        </div>
      </div>

      {/* Add-ons */}
      <div
        className="
          rounded-[26px]
          bg-[#F5F7FA]
          p-5
          shadow-[8px_8px_20px_#D1D9E6,-8px_-8px_20px_rgba(255,255,255,0.95)]
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
            tracking-[0.18em]
            text-slate-900
          "
        >
          {t("addOns")}
        </h3>

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