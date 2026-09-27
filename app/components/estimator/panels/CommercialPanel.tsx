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
import { DiscreteSlider } from "../ui/DiscreteSlider";

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

  const SCHEDS = [
    { label: "Daily", mult: 1.4 },
    { label: "3x/week", mult: 1 },
    { label: "Weekly", mult: 0.7 },
    { label: "One-time", mult: 0.5 },
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

  const addonTotal = COMMERCIAL_ADDONS.reduce(
    (sum, addon) =>
      sum +
      (selectedAddons.has(addon.label)
        ? addon.price
        : 0),
    0,
  );

  useEffect(() => {
    onPrice(
      calc(
        Math.round(
          (COM_BASE[sqftIdx] + addonTotal) *
            SCHEDS[schedIdx].mult,
        ),
      ),
    );
  }, [
    sqftIdx,
    schedIdx,
    addonTotal,
    onPrice,
  ]);

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
                options={SCHEDS.map((schedule, index) => ({
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