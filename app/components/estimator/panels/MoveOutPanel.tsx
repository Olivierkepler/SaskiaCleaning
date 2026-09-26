"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ADDON_DISPLAY_KEYS,
  MO_BASE,
  MOVE_OUT_ADDONS,
} from "../constants";
import type { MoveOutAddonLabel, PriceRange } from "../types";
import { calc, toggleInSet } from "../utils";
import { AddonGrid } from "../ui/Addon";
import { ChipGroup } from "../ui/Chip";
import { CollapsibleGroup } from "../ui/CollapsibleGroup";
import { Notice } from "../ui/Notice";

export type MoveOutPanelProps = {
  onPrice: (price: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
};

export function MoveOutPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
}: MoveOutPanelProps) {
  const t = useTranslations("booking");
  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };
  const [typeIdx, setType] = useState(0);
  const [sqftIdx, setSqft] = useState(1);
  const TYPES = ["Apartment", "Condo", "House", "Studio"];
  const SQFTS = ["Under 500", "500–1000", "1000–1500", "1500+"];

  const toggle = useCallback(
    (label: MoveOutAddonLabel) => {
      onSelectedAddonsChange(toggleInSet(selectedAddons, label));
    },
    [selectedAddons, onSelectedAddonsChange],
  );
  const addonTotal = MOVE_OUT_ADDONS.reduce(
    (sum, addon) => sum + (selectedAddons.has(addon.label) ? addon.price : 0),
    0,
  );

  useEffect(
    () => onPrice(calc(MO_BASE[sqftIdx] + addonTotal)),
    [sqftIdx, addonTotal, onPrice],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CollapsibleGroup title="Property type" defaultOpen>
        <ChipGroup options={TYPES} selectedIndex={typeIdx} onSelect={setType} />
      </CollapsibleGroup>

      <CollapsibleGroup title="Square footage" defaultOpen>
        <ChipGroup
          options={SQFTS}
          selectedIndex={sqftIdx}
          onSelect={setSqft}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title={t("moveOutExtras")}>
        <AddonGrid
          addons={MOVE_OUT_ADDONS}
          selectedAddons={selectedAddons}
          onToggle={toggle}
          getDisplayLabel={translateAddon}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="Deposit Protection">
        <div className="rounded-2xl  bg-sky-50 p-4">
          <Notice
            text={
              <>
                <strong style={{ color: "#082F49" }}>
                  Deposit-back guarantee.
                </strong>{" "}
                Our move-out clean meets most landlord inspection standards. If
                your deposit is withheld for cleaning reasons, we'll re-clean
                for free.
              </>
            }
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

export default MoveOutPanel;
