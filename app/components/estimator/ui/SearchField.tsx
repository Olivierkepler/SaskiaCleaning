import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cx } from "../utils";

export function SearchField({
  icon,
  label,
  value,
  flex = 1,
  last = false,
  active = false,
  onClick,
  placeholder = false,
  error = false,
  shakeKey = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  flex?: number;
  last?: boolean;
  active?: boolean;
  onClick?: () => void;
  placeholder?: boolean;
  error?: boolean;
  shakeKey?: number;
}) {
  return (
    <motion.div
      data-cursor-pointer="pointer"
      onClick={onClick}
      animate={
        shakeKey > 0
          ? { x: [0, -6, 6, -5, 5, -2, 2, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cx(
        "relative flex w-full min-w-0 cursor-pointer items-center gap-2.5 self-stretch bg-white px-3.5 py-3 transition-colors duration-200",
        "sm:min-h-0 sm:h-full sm:px-4 sm:py-0",
        "max-sm:rounded-xl  max-sm:shadow-sm",
        error ? "sm:bg-red-50/40" : active ? "sm:bg-white" : "hover:bg-slate-50/80",
      )}
      style={{ flex }}
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          error ? "bg-red-50" : "bg-slate-50"
        } ${error ? "text-red-500" : active ? "text-sky-500" : "text-slate-900"}`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-0">
        <span
          className={`block text-[10px] font-semibold uppercase tracking-[0.08em] leading-none sm:text-[10px] ${
            error ? "text-red-500" : active ? "text-sky-500" : "text-slate-400"
          }`}
        >
          {label}
        </span>
        <span
          className={`block whitespace-normal text-sm font-semibold leading-tight tracking-tight sm:truncate sm:text-sm ${
            placeholder ? (error ? "text-red-400" : "text-slate-400") : "text-slate-900"
          }`}
        >
          {value}
        </span>
      </div>
    </motion.div>
  );
}

export default SearchField;
