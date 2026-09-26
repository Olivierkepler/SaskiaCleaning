import { motion, AnimatePresence } from "framer-motion";
import { formatUsd } from "@/app/lib/i18n/format";

export function PricePill({
  label,
  value,
  accent,
  locale = "en",
}: {
  label: string;
  value: number;
  accent?: boolean;
  locale?: string;
}) {
  const display = formatUsd(value, locale);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={display}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.13 }}
          className={`text-[20px] sm:text-[20px] font-bold leading-none tracking-tight sm:text-base ${
            accent ? "text-sky-400" : "text-slate-900"
          }`}
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default PricePill;
