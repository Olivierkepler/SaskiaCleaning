import { useState } from "react";

import {
  DOW,
  MONTHS,
} from "../constants";
import { Dropdown } from "../ui/Dropdown";

export function CalendarDropdown({
  open,
  selected,
  onSelect,
}: {
  open: boolean;
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, setYear] = useState(
    today.getFullYear(),
  );

  const [month, setMonth] = useState(
    today.getMonth(),
  );

  function changeMonth(dir: number) {
    let m = month + dir;
    let y = year;

    if (m > 11) {
      m = 0;
      y++;
    }

    if (m < 0) {
      m = 11;
      y--;
    }

    setMonth(m);
    setYear(y);
  }

  const firstDow = new Date(
    year,
    month,
    1,
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  return (
    <Dropdown open={open} minWidth={320}>
      <div
        className="
          rounded-[18px]
          bg-[#F5F7FA]
          p-4
          shadow-[8px_8px_20px_#D1D9E6,-8px_-8px_20px_rgba(255,255,255,0.95)]
        "
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(-1);
            }}
            className="
              flex
              h-9
              w-9
              cursor-pointer
              items-center
              justify-center
              rounded-full
              bg-[#ECF0F3]
              text-slate-500
              shadow-[4px_4px_9px_#D1D9E6,-4px_-4px_9px_rgba(255,255,255,0.95)]
              transition-all
              hover:text-sky-500
              active:shadow-[inset_3px_3px_7px_#D1D9E6,inset_-3px_-3px_7px_rgba(255,255,255,0.95)]
            "
          >
            ‹
          </button>

          <span className="text-lg font-bold text-slate-900">
            {MONTHS[month]} {year}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(1);
            }}
            className="
              flex
              h-9
              w-9
              cursor-pointer
              items-center
              justify-center
              rounded-full
              bg-[#ECF0F3]
              text-slate-500
              shadow-[4px_4px_9px_#D1D9E6,-4px_-4px_9px_rgba(255,255,255,0.95)]
              transition-all
              hover:text-sky-500
              active:shadow-[inset_3px_3px_7px_#D1D9E6,inset_-3px_-3px_7px_rgba(255,255,255,0.95)]
            "
          >
            ›
          </button>
        </div>

        {/* Days */}
        <div
          className="
            grid
            grid-cols-7
            gap-1
          "
        >
          {DOW.map((d) => (
            <div
              key={d}
              className="
                py-1
                text-center
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-slate-400
              "
            >
              {d}
            </div>
          ))}

          {Array.from({
            length: firstDow,
          }).map((_, i) => (
            <div key={`e${i}`} />
          ))}

          {Array.from(
            { length: daysInMonth },
            (_, i) => i + 1,
          ).map((day) => {
            const date = new Date(
              year,
              month,
              day,
            );

            const isPast = date < today;

            const isSel =
              selected?.toDateString() ===
              date.toDateString();

            const isToday =
              date.toDateString() ===
              today.toDateString();

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(date);
                }}
                className={[
                  `
                    flex
                    aspect-square
                    w-full
                    items-center
                    justify-center
                    rounded-[10px]
                    text-xs
                    font-semibold
                    transition-all
                    duration-150
                  `,
                  isPast
                    ? `
                        cursor-default
                        text-slate-300
                      `
                    : isSel
                      ? `
                          cursor-pointer
                          bg-sky-500
                          text-white
                          shadow-[0_6px_14px_rgba(14,165,233,0.22)]
                        `
                      : isToday
                        ? `
                            cursor-pointer
                            bg-[#ECF0F3]
                            text-sky-600
                            shadow-[inset_2px_2px_5px_#D1D9E6,inset_-2px_-2px_5px_rgba(255,255,255,0.95)]
                          `
                        : `
                            cursor-pointer
                            text-slate-700
                            hover:bg-[#ECF0F3]
                            hover:text-sky-600
                            hover:shadow-[3px_3px_7px_#D1D9E6,-3px_-3px_7px_rgba(255,255,255,0.95)]
                          `,
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </Dropdown>
  );
}

export default CalendarDropdown;