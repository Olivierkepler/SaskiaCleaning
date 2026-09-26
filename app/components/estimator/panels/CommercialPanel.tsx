"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ADDON_DISPLAY_KEYS,
  COM_BASE,
  COMMERCIAL_ADDONS,
  FREQ_DISPLAY_KEYS,
} from "../constants";
import type { CommercialAddonLabel, PriceRange } from "../types";
import { calc, toggleInSet } from "../utils";
import { AddonGrid } from "../ui/Addon";
import { ChipGroup } from "../ui/Chip";
import { CollapsibleGroup } from "../ui/CollapsibleGroup";

export type CommercialPanelProps = {
  onPrice: (price: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
};

export function CommercialPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
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
  const [sqftIdx, setSqft] = useState(0);
  const [schedIdx, setSched] = useState(3);
  const [timingIdx, setTiming] = useState(-1);
  const [contractIdx, setContract] = useState(0); // No contract default

  const TYPES = ["Office", "Retail", "Restaurant", "Medical", "Gym"];
  const SQFTS = ["Under 1k", "1k–2.5k", "2.5k–5k", "5k+"];
  const SCHEDS = [
    { label: "Daily", mult: 1.4 },
    { label: "3x/week", mult: 1 },
    { label: "Weekly", mult: 0.7 },
    { label: "One-time", mult: 0.5 },
  ];
  const TIMINGS = ["Before open", "After close", "Weekend"];
  const CONTRACTS = ["No contract", "3 months", "6 months", "Annual"];

  const toggle = useCallback(
    (label: CommercialAddonLabel) => {
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
    },
    [selectedAddons, onSelectedAddonsChange],
  );
  const addonTotal = COMMERCIAL_ADDONS.reduce(
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(
    () =>
      onPrice(
        calc(
          Math.round(
            (COM_BASE[sqftIdx] + addonTotal) * SCHEDS[schedIdx].mult,
          ),
        ),
      ),
    [sqftIdx, schedIdx, addonTotal, onPrice],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2 ">
      <CollapsibleGroup title="Space type" defaultOpen>
        <ChipGroup options={TYPES} selectedIndex={typeIdx} onSelect={setType} />
      </CollapsibleGroup>

      <CollapsibleGroup title="Square footage" defaultOpen>
        <ChipGroup
          options={SQFTS}
          selectedIndex={sqftIdx}
          onSelect={setSqft}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("schedule")} defaultOpen>
        <ChipGroup
          options={SCHEDS.map((schedule) => schedule.label)}
          selectedIndex={schedIdx}
          onSelect={setSched}
          getDisplayLabel={translateFreq}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("addOns")}>
        <AddonGrid
          addons={COMMERCIAL_ADDONS}
          selectedAddons={selectedAddons}
          onToggle={toggle}
          getDisplayLabel={translateAddon}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="Timing">
        <ChipGroup
          options={TIMINGS}
          selectedIndex={timingIdx}
          onSelect={setTiming}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="Contract">
        <ChipGroup
          options={CONTRACTS}
          selectedIndex={contractIdx}
          onSelect={setContract}
        />
      </CollapsibleGroup>
    </div>
  );
}

export default CommercialPanel;
