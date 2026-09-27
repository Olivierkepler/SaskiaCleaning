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
      whileHover={{ y: -1 }}
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
          rounded-[18px]
          px-4
          py-4
          text-left
          outline-none
          transition-all
          duration-200

          focus-visible:ring-2
          focus-visible:ring-sky-400
          focus-visible:ring-offset-2
          focus-visible:ring-offset-[#F5F7FA]
        `,
        selected
          ? `
              bg-[#ECF0F3]
              shadow-[inset_4px_4px_10px_#D1D9E6,inset_-4px_-4px_10px_rgba(255,255,255,0.95)]
            `
          : `
              bg-[#F5F7FA]
              shadow-[inset_3px_3px_9px_#E3EAF1,inset_-3px_-3px_9px_rgba(255,255,255,0.97)]
              hover:shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_rgba(255,255,255,0.94)]
            `,
      )}
    >
      {/* Image */}
      <div
        className="
          relative
          -ml-1
          flex
          h-[64px]
          w-[64px]
          shrink-0
          items-center
          justify-center
        "
      >
        <motion.div
          className="
            relative
            h-[50px]
            w-[50px]
          "
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
        <div className="absolute -top-3 right-0">
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

        <p
          className="
            mt-1
            text-[11px]
            font-medium
            text-slate-400
          "
        >
          Optional
        </p>

        {/* Selection control */}
        <div
          className={cx(
            `
              absolute
              bottom-0
              right-0
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              transition-all
              duration-200
            `,
            selected
              ? `
                  bg-sky-500
                  text-white
                  shadow-[3px_3px_7px_#D1D9E6,-3px_-3px_7px_rgba(255,255,255,0.9)]
                `
              : `
                  bg-[#ECF0F3]
                  text-slate-400
                  shadow-[3px_3px_7px_#D1D9E6,-3px_-3px_7px_rgba(255,255,255,0.95)]
                `,
          )}
        >
          {selected && (
            <Check
              className="h-4 w-4"
              strokeWidth={2.5}
            />
          )}
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
          displayLabel={getDisplayLabel?.(
            addon.label,
          )}
          image={addon.image}
          price={addon.price}
          selected={selectedAddons.has(
            addon.label,
          )}
          onClick={() =>
            onToggle(addon.label)
          }
        />
      ))}
    </div>
  );
}