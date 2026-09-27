"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  MapPin,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function SummaryRow({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 ">
      {icon && (
        <div
          className="
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-[12px]
            bg-[#ECF0F3]
            text-sky-500
            shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_rgba(255,255,255,0.9)]
          "
        >
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-slate-400
          "
        >
          {label}
        </p>

        <div
          className="
            mt-1
            min-w-0
            text-[13px]
            font-semibold
            leading-5
            text-slate-800
          "
        >
          {children}
        </div>
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
      className={`
        w-full
        overflow-hidden
        rounded-[26px]
        bg-[#F5F7FA]

          ${className}
      `}
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          px-6
          py-5
        "
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              bg-[#ECF0F3]
              text-sky-500
              shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_rgba(255,255,255,0.95)]
            "
          >
            <ReceiptText
              className="h-[19px] w-[19px]"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-slate-400
              "
            >
              Your booking
            </p>

            <h3
              className="
                mt-1
                text-[18px]
                font-bold
                tracking-[-0.025em]
                text-slate-900
              "
            >
              Booking Summary
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
          aria-label={
            collapsed
              ? "Expand booking summary"
              : "Collapse booking summary"
          }
          className="
            flex
            h-10
            w-10
            shrink-0
            cursor-pointer
            items-center
            justify-center
            rounded-full
            bg-[#ECF0F3]
            text-slate-500
            shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_rgba(255,255,255,0.95)]
            transition-all
            duration-200
            hover:text-sky-500
            active:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_rgba(255,255,255,0.9)]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-sky-400
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#ECF0F3]
          "
        >
          <ChevronDown
            className={`
              h-4
              w-4
              transition-transform
              duration-300
              ${collapsed ? "rotate-0" : "rotate-180"}
            `}
            strokeWidth={2}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="booking-summary-content"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            {/* Soft divider */}
            <div
              className="
                mx-6
                h-px
                bg-[#D1D9E6]/70
                shadow-[0_1px_0_rgba(255,255,255,0.9)]
              "
            />

            {/* Booking details */}
            <div
              className="
                grid
                grid-cols-1
                gap-x-10
                gap-y-6
                px-6
                py-6
                md:grid-cols-2
              "
            >
              {/* Left column */}
              <div className="space-y-6">
                <SummaryRow
                  label="Service"
                  icon={
                    <Sparkles
                      className="h-4 w-4"
                      strokeWidth={1.9}
                    />
                  }
                >
                  {service}
                </SummaryRow>

                {location && (
                  <SummaryRow
                    label="Location"
                    icon={
                      <MapPin
                        className="h-4 w-4"
                        strokeWidth={1.9}
                      />
                    }
                  >
                    <span className="break-words">
                      {location}
                    </span>
                  </SummaryRow>
                )}

                {date && (
                  <SummaryRow
                    label="Date"
                    icon={
                      <CalendarDays
                        className="h-4 w-4"
                        strokeWidth={1.9}
                      />
                    }
                  >
                    {formatDate(date)}
                  </SummaryRow>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {frequency && (
                  <SummaryRow label="Frequency">
                    {frequency}
                  </SummaryRow>
                )}

                {selections.map((item) => (
                  <SummaryRow
                    key={item.label}
                    label={item.label}
                  >
                    {item.value}
                  </SummaryRow>
                ))}

                {extras.length > 0 && (
                  <SummaryRow label="Extras">
                    <div className="flex flex-wrap gap-2">
                      {extras.map((extra) => (
                        <span
                          key={extra}
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-[#ECF0F3]
                            px-2.5
                            py-1.5
                            text-[11px]
                            font-semibold
                            text-sky-600
                            shadow-[3px_3px_7px_#D1D9E6,-3px_-3px_7px_rgba(255,255,255,0.95)]
                          "
                        >
                          <Check
                            className="h-3 w-3"
                            strokeWidth={2.5}
                          />

                          {extra}
                        </span>
                      ))}
                    </div>
                  </SummaryRow>
                )}
              </div>
            </div>

            {/* Estimated total */}
            <div className="px-6 pb-6">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-5
                  rounded-[20px]


                  px-5
                  py-5
                   bg-[#F5F7FA]
                  shadow-[inset_4px_4px_12px_#E3EAF1,inset_-4px_-4px_12px_rgba(255,255,255,0.97)]

                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.22em]
                      text-slate-400
                    "
                  >
                    Estimated total
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-[13px]
                      font-medium
                      text-slate-500
                    "
                  >
                    Based on your selections
                  </p>
                </div>

                <span
                  className="
                    whitespace-nowrap
                    text-[30px]
                    font-bold
                    tracking-[-0.045em]
                    text-slate-900
                    tabular-nums
                  "
                >
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state */}
      {collapsed && (
        <>
          <div
            className="
              mx-6
              h-px
              bg-[#D1D9E6]/70
              shadow-[0_1px_0_rgba(255,255,255,0.9)]
            "
          />

          <div className="px-6 py-5">
            <div
              className="
                flex
                items-center
                justify-between
                gap-5
                rounded-[18px]
                bg-[#F5F7FA]
                px-5
                py-4
                shadow-[inset_4px_4px_12px_#E3EAF1,inset_-4px_-4px_12px_rgba(255,255,255,0.97)]
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-slate-400
                  "
                >
                  Estimated total
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Based on your selections
                </p>
              </div>

              <span
                className="
                  whitespace-nowrap
                  text-[24px]
                  font-bold
                  tracking-[-0.04em]
                  text-slate-900
                  tabular-nums
                "
              >
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}