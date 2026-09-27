"use client";

import { useState } from "react";

export type DiscreteSliderOption<T> = {
  label: string;
  value: T;
};

export type DiscreteSliderProps<T> = {
  value: T;
  options: readonly DiscreteSliderOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
};

export function DiscreteSlider<T>({
  value,
  options,
  onChange,
  ariaLabel,
}: DiscreteSliderProps<T>) {
  const [isDragging, setIsDragging] =
    useState(false);

  const foundIndex = options.findIndex(
    (option) => option.value === value,
  );

  const selectedIndex =
    foundIndex >= 0 ? foundIndex : 0;

  const lastIndex = Math.max(
    options.length - 1,
    1,
  );

  const insetPercent =
    options.length > 0
      ? 50 / options.length
      : 0;

  const fillPercent =
    options.length <= 1
      ? 0
      : (selectedIndex / lastIndex) *
        (100 - insetPercent * 2);

  const motionClass = isDragging
    ? ""
    : "transition-all duration-200 ease-out";

  const selectIndex = (index: number) => {
    const next = options[index];

    if (next === undefined) return;

    onChange(next.value);
  };

  return (
    <div className="w-full min-w-0 select-none">
      {/* Labels */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option, index) => {
          const selected =
            index === selectedIndex;

          return (
            <button
              key={index}
              type="button"
              onClick={() =>
                selectIndex(index)
              }
              className={[
                `
                  min-w-0
                  cursor-pointer
                  px-0.5
                  text-center
                  text-[10px]
                  leading-tight
                  tracking-tight
                  transition-colors
                  duration-200
                  sm:text-[11px]
                `,
                selected
                  ? "font-semibold text-sky-600"
                  : "font-medium text-slate-400 hover:text-slate-600",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="relative mt-3 h-12">
        {/* Track */}
        <div
          className="
            pointer-events-none
            absolute
            top-1/2
            h-[4px]
            -translate-y-1/2
            rounded-full
            bg-[#ECF0F3]
            shadow-[inset_2px_2px_4px_#D1D9E6,inset_-2px_-2px_4px_rgba(255,255,255,0.95)]
          "
          style={{
            left: `${insetPercent}%`,
            right: `${insetPercent}%`,
          }}
        />

        {/* Active track */}
        <div
          className={`
            pointer-events-none
            absolute
            top-1/2
            h-[4px]
            -translate-y-1/2
            rounded-full
            bg-sky-400
            ${motionClass}
          `}
          style={{
            left: `${insetPercent}%`,
            width: `${fillPercent}%`,
          }}
        />

        {/* Stops */}
        {options.map((_, index) => {
          const selected =
            index === selectedIndex;

          const completed =
            index <= selectedIndex;

          return (
            <span
              key={index}
              aria-hidden="true"
              className={`
                pointer-events-none
                absolute
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                ${motionClass}

                ${
                  selected
                    ? `
                        z-[2]
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        bg-[#ECF0F3]
                        shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_rgba(255,255,255,0.95)]
                      `
                    : completed
                      ? `
                          h-2.5
                          w-2.5
                          bg-sky-400
                        `
                      : `
                          h-2.5
                          w-2.5
                          bg-[#ECF0F3]
                          shadow-[inset_1px_1px_3px_#D1D9E6,inset_-1px_-1px_3px_rgba(255,255,255,0.95)]
                        `
                }
              `}
              style={{
                left: `${((index + 0.5) / options.length) * 100}%`,
              }}
            >
              {selected && (
                <span
                  className="
                    h-4
                    w-4
                    rounded-full
                    bg-sky-500
                  "
                />
              )}
            </span>
          );
        })}

        {/* Accessible range input */}
        <input
          type="range"
          min={0}
          max={Math.max(
            options.length - 1,
            0,
          )}
          step={1}
          value={selectedIndex}
          aria-label={ariaLabel}
          aria-valuetext={
            options[selectedIndex]?.label
          }
          onChange={(event) =>
            selectIndex(
              Number(event.target.value),
            )
          }
          onPointerDown={() =>
            setIsDragging(true)
          }
          onPointerUp={() =>
            setIsDragging(false)
          }
          onPointerCancel={() =>
            setIsDragging(false)
          }
          className="
            absolute
            top-0
            z-[3]
            h-12
            cursor-pointer
            appearance-none
            bg-transparent
            outline-none

            focus-visible:outline-none

            [&::-moz-range-thumb]:h-12
            [&::-moz-range-thumb]:w-12
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:bg-transparent

            [&::-moz-range-track]:bg-transparent

            [&::-webkit-slider-runnable-track]:bg-transparent

            [&::-webkit-slider-thumb]:h-12
            [&::-webkit-slider-thumb]:w-12
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-0
            [&::-webkit-slider-thumb]:bg-transparent
          "
          style={{
            left: `${insetPercent}%`,
            width: `${100 - insetPercent * 2}%`,
          }}
        />
      </div>
    </div>
  );
}

export default DiscreteSlider;