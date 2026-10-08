"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ADDON_DISPLAY_KEYS,
  MOVE_OUT_ADDONS,
} from "../constants";
import type { MoveOutAddonLabel, PriceRange } from "../types";
import { calculateMoveOutEstimate } from "@/app/lib/booking-pricing-pure";
import { toggleInSet } from "../utils";
import { AddonGrid } from "../ui/Addon";
import { CollapsibleGroup } from "../ui/CollapsibleGroup";
import { DiscreteSlider } from "../ui/DiscreteSlider";
import { Notice } from "../ui/Notice";

export type MoveOutPanelProps = {
  onPrice: (price: PriceRange) => void;
  selectedAddons: Set<string>;
  onSelectedAddonsChange: (addons: Set<string>) => void;
  squareFootageIndex?: number;
  onSquareFootageIndexChange?: (index: number) => void;
};

export function MoveOutPanel({
  onPrice,
  selectedAddons,
  onSelectedAddonsChange,
  squareFootageIndex,
  onSquareFootageIndexChange,
}: MoveOutPanelProps) {
  const t = useTranslations("booking");

  const translateAddon = (label: string) => {
    const key = ADDON_DISPLAY_KEYS[label];
    return key ? t(key as "insideFridge") : label;
  };

  const [typeIdx, setType] = useState(0);
  const [localSqftIdx, setLocalSqftIdx] = useState(1);
  const sqftIdx = squareFootageIndex ?? localSqftIdx;
  const setSqft = (index: number) => { setLocalSqftIdx(index); onSquareFootageIndexChange?.(index); };

  const TYPES = [
    "Apartment",
    "Condo",
    "House",
    "Studio",
  ];

  const SQFTS = [
    "Under 500",
    "500–1000",
    "1000–1500",
    "1500+",
  ];

  const toggle = useCallback(
    (label: MoveOutAddonLabel) => {
      onSelectedAddonsChange(
        toggleInSet(selectedAddons, label),
      );
    },
    [selectedAddons, onSelectedAddonsChange],
  );

  useEffect(() => {
    onPrice(calculateMoveOutEstimate({ squareFootageIndex: sqftIdx, extras: [...selectedAddons] }));
  }, [sqftIdx, selectedAddons, onPrice]);

  return (
    <div className="grid gap-5">
      {/* Property Type + Square Footage */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Property Type */}
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
            Property type
          </h3>

          <DiscreteSlider
            value={typeIdx}
            options={TYPES.map((label, index) => ({
              label,
              value: index,
            }))}
            onChange={setType}
            ariaLabel="Property type"
          />
        </div>

        {/* Square Footage */}
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
        </div>
      </div>

      {/* Move-out Extras */}
      <CollapsibleGroup
        title={t("moveOutExtras")}
        defaultOpen
      >
        <AddonGrid
          addons={MOVE_OUT_ADDONS}
          selectedAddons={selectedAddons}
          onToggle={toggle}
          getDisplayLabel={translateAddon}
          className="grid-cols-1 sm:grid-cols-2"
        />
      </CollapsibleGroup>

      {/* Deposit Protection — collapsed by default */}
      <CollapsibleGroup title="Deposit Protection">
        <div className="rounded-[20px] bg-sky-50/80 p-5 sm:p-6">
          <Notice
            text={
              <>
                <strong style={{ color: "#082F49" }}>
                  Deposit-back guarantee.
                </strong>{" "}
                Our move-out clean meets most landlord inspection standards.
                If your deposit is withheld for cleaning reasons, we&apos;ll
                re-clean for free.
              </>
            }
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

export default MoveOutPanel;
