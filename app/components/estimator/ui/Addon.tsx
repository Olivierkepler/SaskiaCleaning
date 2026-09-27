import Image from "next/image";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cx } from "../utils";
import type { PricedAddon } from "../types";

type AddonProps = {
  label: string;
  displayLabel?: string;
  image: string;
  price: number;
  selected?: boolean;
  onClick: () => void;
};

export function Addon({
  label,
  displayLabel,
  image,
  price,
  selected = false,
  onClick,
}: AddonProps) {
  const shown = displayLabel ?? label;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cx(
        `
          group
          relative
          flex
          w-full
          cursor-pointer
          items-center
          gap-3
          overflow-hidden

          px-4
          py-4
          text-left
          outline-none
          transition-all
          duration-200

        `,
        selected
          ? `
              border-sky-300
              bg-sky-50/80
              shadow-[0_8px_24px_rgba(14,165,233,0.08)]
            `
          : `
              border-slate-200/80
              bg-white
              shadow-[0_6px_20px_rgba(15,23,42,0.06)]
              hover:border-sky-200
              hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]
            `,
      )}
    >
      {/* Image */}
      <div
        className={cx(
          `
            relative
            -ml-2
            flex
            h-[64px]
            w-[64px]
            shrink-0
            items-center
            justify-center
            overflow-hidden
            transition-all
            duration-200
          `,
          selected
            ? "text-sky-500"
            : "text-slate-500",
        )}
      >
        <motion.div
          className="relative h-[50px] w-[50px]"
          animate={{
            scale: selected ? 1.04 : 1,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <Image
            src={image}
            alt={shown}
            fill
            sizes="50px"
            className="object-contain"
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative min-w-0 flex-1 pr-10">
        {/* Price */}
        <div className="absolute right-0 -top-4">
          <span
            className={cx(
              `
                text-[12px]
                font-bold
                tabular-nums
                transition-colors
              `,
              selected
                ? "text-sky-500"
                : "text-slate-500",
            )}
          >
            +${price}
          </span>
        </div>

        {/* Name */}
        <p
          className={cx(
            `
              pr-8
              text-[15px]
              font-semibold
              leading-snug
              tracking-[-0.015em]
              transition-colors
            `,
            selected
              ? "text-sky-700"
              : "text-slate-800 group-hover:text-slate-950",
          )}
        >
          {shown}
        </p>

        {/* Meta */}
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-slate-400">
            Optional
          </p>

          {/* Selected indicator */}
          <div
            className={cx(
              `
                absolute
                bottom-0
                right-0
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                transition-all
                duration-200
              `,
              selected
                ? "border-sky-500 bg-sky-500"
                : "border-slate-300 bg-white group-hover:border-sky-300",
            )}
          >
            {selected && (
              <Check
                className="h-3.5 w-3.5 text-white"
                strokeWidth={2.5}
              />
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function AddonGrid<L extends string>({
  addons,
  selectedAddons,
  onToggle,
  getDisplayLabel,
  className,
}: {
  addons: readonly PricedAddon<L>[];
  selectedAddons: Set<string>;
  onToggle: (label: L) => void;
  getDisplayLabel?: (label: string) => string;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "grid grid-cols-1 gap-3",
        className,
      )}
    >
      {addons.map((addon) => (
        <Addon
          key={addon.label}
          label={addon.label}
          displayLabel={getDisplayLabel?.(addon.label)}
          image={addon.image}
          price={addon.price}
          selected={selectedAddons.has(addon.label)}
          onClick={() => onToggle(addon.label)}
        />
      ))}
    </div>
  );
}