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
import { ChipGroup } from "../ui/Chip";
import { CollapsibleGroup } from "../ui/CollapsibleGroup";

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
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(() => {
    const b =
      BED_BASE[bedIdx] + (BATH_VALS[bathIdx] - 1) * 18 + addonTotal;

    const discount = freqIdx >= 0 ? FREQS[freqIdx].discount : 0;

    onPrice(calc(Math.round(b * (1 - discount / 100))));
  }, [bedIdx, bathIdx, freqIdx, addonTotal, onPrice]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CollapsibleGroup title={t("bedrooms")} defaultOpen>
        <ChipGroup
          options={BEDS}
          selectedIndex={bedIdx}
          onSelect={onBedIdxChange}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("bathrooms")} defaultOpen>
        <ChipGroup
          options={BATH_VALS.map(String)}
          selectedIndex={bathIdx}
          onSelect={onBathIdxChange}
          className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap"
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("frequency")}>
        <ChipGroup
          options={FREQS.map((frequencyOption) => frequencyOption.label)}
          selectedIndex={freqIdx}
          onSelect={(index) => onFrequencyChange(FREQS[index].label)}
          getDisplayLabel={translateFreq}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("addOns")}>
        <AddonGrid
          addons={STANDARD_ADDONS}
          selectedAddons={selectedAddons}
          onToggle={toggle}
          getDisplayLabel={translateAddon}
        />
      </CollapsibleGroup>
    </div>
  );
}

export default StandardPanel;
