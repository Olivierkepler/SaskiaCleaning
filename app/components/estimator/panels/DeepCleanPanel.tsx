"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ADDON_DISPLAY_KEYS,
  DEEP_CLEAN_ADDONS,
} from "../constants";
import type { DeepCleanAddonLabel, PriceRange } from "../types";
import { calculateDeepCleanEstimate, DEEP_CLEAN_CONDITION_LABELS, DEEP_CLEAN_SIZE_LABELS } from "@/app/lib/booking-pricing-pure";
import { toggleInSet } from "../utils";
import { AddonGrid } from "../ui/Addon";
import { Checklist } from "../ui/Checklist";
import { CollapsibleGroup } from "../ui/CollapsibleGroup";
import { DiscreteSlider } from "../ui/DiscreteSlider";

export type DeepCleanPanelProps = {
  onPrice: (price: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
  sizeIndex?: number;
  onSizeIndexChange?: (index: number) => void;
  conditionIndex?: number;
  onConditionIndexChange?: (index: number) => void;
};

export function DeepCleanPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
  sizeIndex,
  onSizeIndexChange,
  conditionIndex,
  onConditionIndexChange,
}: DeepCleanPanelProps) {
  const t = useTranslations("booking");

  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };

  const [localSizeIdx, setLocalSizeIdx] = useState(1);
  const [localCondIdx, setLocalCondIdx] = useState(0);
  const sizeIdx = sizeIndex ?? localSizeIdx;
  const condIdx = conditionIndex ?? localCondIdx;
  const setSize = (index: number) => { setLocalSizeIdx(index); onSizeIndexChange?.(index); };
  const setCond = (index: number) => { setLocalCondIdx(index); onConditionIndexChange?.(index); };

  const toggle = useCallback(
    (label: DeepCleanAddonLabel) => {
      onSelectedAddonsChange(
        toggleInSet(selectedAddons, label),
      );
    },
    [selectedAddons, onSelectedAddonsChange],
  );

  useEffect(() => {
    onPrice(calculateDeepCleanEstimate({ sizeIndex: sizeIdx, conditionIndex: condIdx, extras: [...selectedAddons] }));
  }, [sizeIdx, condIdx, selectedAddons, onPrice]);

  return (
    <div className="grid gap-5">
      {/* Home Size + Condition */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Home Size */}
        <div
          className="
            rounded-[10px]
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
            Home size
          </h3>

          <DiscreteSlider
            value={sizeIdx}
            options={DEEP_CLEAN_SIZE_LABELS.map((label, index) => ({
              label,
              value: index,
            }))}
            onChange={setSize}
            ariaLabel="Home size"
          />
        </div>

        {/* Condition */}
        <div
          className="
            rounded-[10px]
            bg-white
            p-5
            shadow-[4px_4px_10px_#E3EAF1,-4px_-4px_10px_rgba(255,255,255,0.97)]
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
            Condition
          </h3>

          <DiscreteSlider
            value={condIdx}
            options={DEEP_CLEAN_CONDITION_LABELS.map((label, index) => ({
              label,
              value: index,
            }))}
            onChange={setCond}
            ariaLabel="Condition"
          />
        </div>
      </div>

      {/* Deep Clean Extras */}
      <CollapsibleGroup
        title={t("deepCleanExtras")}
        defaultOpen
      >
        <AddonGrid
          addons={DEEP_CLEAN_ADDONS}
          selectedAddons={selectedAddons}
          onToggle={toggle}
          getDisplayLabel={translateAddon}
          className="grid-cols-1 sm:grid-cols-2"
        />
      </CollapsibleGroup>

      {/* What's Included — collapsed by default */}
      <CollapsibleGroup title="What's included">
        <div className="rounded-[20px] bg-slate-50/80 p-5 sm:p-6">
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
