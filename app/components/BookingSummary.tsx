"use client";

import { useState } from "react";

export interface BookingSummaryProps {
  service: string;
  frequency?: string;
  location?: string;
  date?: Date | null;
  selections?: {
    label: string;
    value: string | number;
  }[];
  extras?: string[];
  total: number;
  className?: string;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {collapsed && (
        <path d="M14 9v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-[90px] shrink-0 text-xs font-medium text-slate-400">
        {label}
      </span>
      <span className="text-xs text-slate-300">:</span>
      <div className="flex flex-1 flex-col gap-0.5 text-xs font-semibold text-slate-900">
        {children}
      </div>
    </div>
  );
}

export default function BookingSummary({
  service,
  frequency,
  location,
  date,
  selections = [],
  extras = [],
  total,
  className = "",
}: BookingSummaryProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_1px_3px_rgba(12,26,46,.04),0_16px_48px_rgba(12,26,46,.07)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-sky-50 bg-sky-50/60 px-4 py-3">
        <h3 className="text-lg font-bold text-slate-900">Booking Summary</h3>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand booking summary" : "Collapse booking summary"}
          className="text-slate-400 transition-colors hover:text-sky-500"
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="flex flex-col gap-3 px-4 py-4">
            <SummaryRow label="Service">{service}</SummaryRow>

            {location && <SummaryRow label="Location">{location}</SummaryRow>}

            {date && <SummaryRow label="Date">{formatDate(date)}</SummaryRow>}

            {frequency && <SummaryRow label="Frequency">{frequency}</SummaryRow>}

            {selections.map((item) => (
              <SummaryRow key={item.label} label={item.label}>
                {item.value}
              </SummaryRow>
            ))}

            {extras.length > 0 && (
              <SummaryRow label="Extras">
                {extras.map((extra) => (
                  <span key={extra}>{extra}</span>
                ))}
              </SummaryRow>
            )}
          </div>

          <div className="mx-4 border-t border-sky-50" />

          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">
              Total
            </span>
            <span className="text-2xl font-black text-sky-500">
              ${total.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}