import Image from "next/image";
import { motion } from "framer-motion";
import { cx } from "../utils";
import type { PricedAddon } from "../types";

export function Addon({
  label,
  displayLabel,
  image,
  selected,
  onClick,
}: {
  label: string;
  displayLabel?: string;
  image: string;
  selected?: boolean;
  onClick: () => void;
}) {
  const shown = displayLabel ?? label;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cx(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left outline-none transition-all duration-200",
        selected
          ? " bg-sky-50 shadow-sm"
          : " bg-white shadow-sm hover:shadow-md",
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <Image
          src={image}
          alt={shown}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-sky-500/35">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 shadow-sm">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5l2.5 2.5 4-4"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
          selected ? "text-sky-700" : "text-slate-500"
        }`}
      >
        {shown}
      </span>
    </motion.button>
  );
}

export function AddonGrid<L extends string>({
  addons,
  selectedAddons,
  onToggle,
  getDisplayLabel,
}: {
  addons: readonly PricedAddon<L>[];
  selectedAddons: Set<string>;
  onToggle: (label: L) => void;
  getDisplayLabel?: (label: string) => string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {addons.map((addon) => (
        <Addon
          key={addon.label}
          label={addon.label}
          displayLabel={getDisplayLabel?.(addon.label)}
          image={addon.image}
          selected={selectedAddons.has(addon.label)}
          onClick={() => onToggle(addon.label)}
        />
      ))}
    </div>
  );
}
