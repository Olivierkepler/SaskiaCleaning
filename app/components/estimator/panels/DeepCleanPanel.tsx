"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ADDON_DISPLAY_KEYS,
  DEEP_BASE,
  DEEP_CLEAN_ADDONS,
  DEEP_COND,
} from "../constants";
import type { DeepCleanAddonLabel, PriceRange } from "../types";
import { calc, toggleInSet } from "../utils";
import { AddonGrid } from "../ui/Addon";
import { Checklist } from "../ui/Checklist";
import { ChipGroup } from "../ui/Chip";
import { CollapsibleGroup } from "../ui/CollapsibleGroup";

export type DeepCleanPanelProps = {
  onPrice: (price: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
};

export function DeepCleanPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
}: DeepCleanPanelProps) {
  const t = useTranslations("booking");
  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };
  const [sizeIdx, setSize] = useState(1);
  const [condIdx, setCond] = useState(0);
  const SIZES = ["Studio", "1–2 bed", "3–4 bed", "5+ bed"];
  const CONDS = ["Good", "Needs work", "Very dirty"];

  const toggle = useCallback(
    (label: DeepCleanAddonLabel) => {
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
    },
    [selectedAddons, onSelectedAddonsChange],
  );
  const addonTotal = DEEP_CLEAN_ADDONS.reduce(
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(
    () =>
      onPrice(calc(DEEP_BASE[sizeIdx] + DEEP_COND[condIdx] + addonTotal)),
    [sizeIdx, condIdx, addonTotal, onPrice],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CollapsibleGroup title="Home size" defaultOpen>
        <ChipGroup options={SIZES} selectedIndex={sizeIdx} onSelect={setSize} />
      </CollapsibleGroup>

      <CollapsibleGroup title="Condition" defaultOpen>
        <ChipGroup
          options={CONDS}
          selectedIndex={condIdx}
          onSelect={setCond}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("deepCleanExtras")}>
        <AddonGrid
          addons={DEEP_CLEAN_ADDONS}
          selectedAddons={selectedAddons}
          onToggle={toggle}
          getDisplayLabel={translateAddon}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="What's included">
        <div className="rounded-xl bg-slate-50 p-4">
          <Checklist
            items={[
              "Everything in Standard clean",
              "Inside appliances (fridge + oven)",
              "Light fixtures & ceiling fans",
              "Behind & under furniture",
              "Window sills & tracks",
              "Sanitize all surfaces",
            ]}
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

export default DeepCleanPanel;
