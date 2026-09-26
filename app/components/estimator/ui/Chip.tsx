import { motion } from "framer-motion";
import { cx } from "../utils";

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: selected ? 1 : 1.03, y: selected ? 0 : -1 }}
      whileTap={{ scale: 0.97 }}
      className={cx(
        "cursor-pointer rounded-[5px] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] outline-none transition-all duration-200",
        selected
          ? " bg-sky-50 text-sky-600 shadow-sm"
          : "border border-neutral-200 bg-white text-slate-500 shadow-sm  hover:text-sky-500 hover:shadow-md",
      )}
    >
      {label}
    </motion.button>
  );
}

export function ChipGroup({
  options,
  selectedIndex,
  onSelect,
  className = "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap",
  getDisplayLabel,
}: {
  options: readonly string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
  getDisplayLabel?: (option: string) => string;
}) {
  return (
    <div className={className}>
      {options.map((option, index) => (
        <Chip
          key={option}
          label={getDisplayLabel ? getDisplayLabel(option) : option}
          selected={selectedIndex === index}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
