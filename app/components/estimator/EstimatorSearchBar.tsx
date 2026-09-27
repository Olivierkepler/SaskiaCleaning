"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";

import { K } from "./constants";
import { CalendarDropdown } from "./dropdowns/CalendarDropdown";
import { LocationDropdown } from "./dropdowns/LocationDropdown";
import type { StateKey } from "./types";
import { SearchField } from "./ui/SearchField";

export type EstimatorTimeSlot = {
  time: string;
  label: string;
};

export type EstimatorSearchBarProps = {
  locationState: StateKey;
  locationCity: string;
  locationOpen: boolean;
  locationConfirmed: boolean;
  locationError: boolean;

  selectedDate: Date | null;
  dateOpen: boolean;
  dateError: boolean;

  shakeKey: number;
  optionsOpen: boolean;

  mobileSearchOpen: boolean;
  mobileSearchSummary: string;

  requiredFieldsMessage: string;

  estimatedDurationMinutes: number | null;
  slotRefreshMessage: string;
  slotsLoading: boolean;
  slotsError: string;
  availableSlots: EstimatorTimeSlot[];
  bookingTime: string | null;

  dateLabel: string;
  dateValue: string;
  customizeLabel: string;
  selectTimeLabel: string;
  loadingSlotsLabel: string;
  noTimesLabel: string;

  onToggleMobileSearch: () => void;
  onLocationFieldClick: () => void;
  onDateFieldClick: () => void;
  onCustomizeClick: () => void;
  onLocationStateChange: (state: StateKey) => void;
  onCitySelect: (city: string, state: StateKey) => void;
  onDateSelect: (date: Date) => void;
  onBookingTimeSelect: (time: string) => void;
};

export function EstimatorSearchBar({
  locationState,
  locationCity,
  locationOpen,
  locationConfirmed,
  locationError,
  selectedDate,
  dateOpen,
  dateError,
  shakeKey,
  optionsOpen,
  mobileSearchOpen,
  mobileSearchSummary,
  requiredFieldsMessage,
  estimatedDurationMinutes,
  slotRefreshMessage,
  slotsLoading,
  slotsError,
  availableSlots,
  bookingTime,
  dateLabel,
  dateValue,
  customizeLabel,
  selectTimeLabel,
  loadingSlotsLabel,
  noTimesLabel,
  onToggleMobileSearch,
  onLocationFieldClick,
  onDateFieldClick,
  onCustomizeClick,
  onLocationStateChange,
  onCitySelect,
  onDateSelect,
  onBookingTimeSelect,
}: EstimatorSearchBarProps) {
  return (
    <>
      <div className="p-3 sm:p-5">
        {/* Mobile summary */}
        <button
          type="button"
          className="
            mb-3
            flex
            w-full
            items-center
            justify-between
            gap-3
            rounded-[18px]
            bg-[#F5F7FA]
            px-4
            py-4
            text-left
            shadow-[5px_5px_12px_#D1D9E6,-5px_-5px_12px_rgba(255,255,255,0.95)]
            sm:hidden
          "
          onClick={onToggleMobileSearch}
        >
          <span className="whitespace-normal text-base font-semibold leading-snug tracking-tight text-slate-900">
            {mobileSearchSummary}
          </span>

          <motion.div
            animate={{ rotate: mobileSearchOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-slate-400"
          >
            <ChevronDown size={20} />
          </motion.div>
        </button>

        <div
          className={`relative z-50 ${
            mobileSearchOpen ? "flex" : "hidden"
          } sm:flex`}
        >
          {/* Main neumorphic search shell */}
          <div
            className="
              flex
              w-full
              flex-col
              gap-2
              rounded-[22px]
              bg-[#F5F7FA]
              p-2
              shadow-[8px_8px_20px_#D1D9E6,-8px_-8px_20px_rgba(255,255,255,0.95)]

              sm:min-h-[64px]
              sm:flex-row
              sm:items-stretch
              sm:gap-1
              sm:p-2
            "
          >
            {/* Location */}
            <div
              className="
                relative
                flex
                w-full
                items-stretch
                rounded-[16px]
                bg-[#F5F7FA]
                shadow-[inset_3px_3px_8px_#E3EAF1,inset_-3px_-3px_8px_rgba(255,255,255,0.97)]

                sm:min-h-0
                sm:flex-[1.33]
              "
              style={{
                zIndex: locationOpen ? 99999 : undefined,
              }}
            >
              <SearchField
                icon={<MapPin size={18} />}
                label="Location"
                value={`${locationCity}, ${locationState}`}
                active={locationOpen}
                onClick={onLocationFieldClick}
                placeholder={!locationConfirmed}
                error={locationError}
                shakeKey={locationError ? shakeKey : 0}
                last
              />

              <motion.div
                animate={{
                  rotate: locationOpen ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 sm:right-4"
                style={{
                  color: locationOpen
                    ? K.blue
                    : K.hint,
                }}
              >
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                />
              </motion.div>

              <LocationDropdown
                open={locationOpen}
                state={locationState}
                city={locationCity}
                onStateChange={onLocationStateChange}
                onCitySelect={onCitySelect}
              />
            </div>

            {/* Date */}
            <div
              className="
                relative
                flex
                w-full
                items-stretch
                rounded-[16px]
                bg-[#F5F7FA]
                shadow-[inset_3px_3px_8px_#E3EAF1,inset_-3px_-3px_8px_rgba(255,255,255,0.97)]

                sm:min-h-0
                sm:flex-1
              "
              style={{
                zIndex: dateOpen ? 99999 : undefined,
              }}
            >
              <SearchField
                icon={<Calendar size={18} />}
                label={dateLabel}
                value={dateValue}
                active={dateOpen}
                onClick={onDateFieldClick}
                placeholder={!selectedDate}
                error={dateError}
                shakeKey={dateError ? shakeKey : 0}
                last
              />

              <motion.div
                animate={{
                  rotate: dateOpen ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 sm:right-4"
                style={{
                  color: dateOpen
                    ? K.blue
                    : K.hint,
                }}
              >
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                />
              </motion.div>

              <CalendarDropdown
                open={dateOpen}
                selected={selectedDate}
                onSelect={onDateSelect}
              />
            </div>

            {/* Customize */}
            <div className="relative flex w-full items-center justify-center p-1 sm:min-h-0 sm:w-auto sm:flex-initial">
              <button
                type="button"
                onClick={onCustomizeClick}
                className="
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  whitespace-nowrap
                  rounded-[14px]
                  bg-sky-500
                  px-4
                  py-3
                  text-xs
                  font-bold
                  text-white
                  shadow-[0_10px_24px_rgba(14,165,233,0.20)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-sky-600

                  sm:h-full
                  sm:min-h-[48px]
                  sm:px-5
                "
              >
                <SlidersHorizontal
                  size={15}
                  strokeWidth={2.25}
                />

                <span>{customizeLabel}</span>

                <motion.div
                  animate={{
                    rotate: optionsOpen ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown
                    size={15}
                    strokeWidth={2.25}
                  />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation */}
      <AnimatePresence initial={false}>
        {requiredFieldsMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-3 sm:px-5"
          >
            <p
              role="alert"
              aria-live="assertive"
              className="
                mb-3
                rounded-[14px]
                bg-red-50
                px-4
                py-3
                text-xs
                font-semibold
                text-red-600
                shadow-[inset_2px_2px_6px_rgba(239,68,68,0.06)]
              "
            >
              {requiredFieldsMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Availability */}
      {selectedDate ? (
        <div
          className="
            mx-3
            mb-3
            rounded-[22px]
            bg-[#F5F7FA]
            px-4
            py-4
            shadow-[inset_3px_3px_9px_#E3EAF1,inset_-3px_-3px_9px_rgba(255,255,255,0.97)]

            sm:mx-5
            sm:px-5
          "
        >
          <p
            className="
              mb-2
              text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            {selectTimeLabel}
          </p>

          {estimatedDurationMinutes != null ? (
            <p className="mb-3 text-sm text-slate-600">
              Estimated duration:{" "}
              {estimatedDurationMinutes < 60
                ? `About ${estimatedDurationMinutes} min`
                : estimatedDurationMinutes % 60 === 0
                  ? `About ${
                      estimatedDurationMinutes / 60
                    } hour${
                      estimatedDurationMinutes === 60
                        ? ""
                        : "s"
                    }`
                  : `About ${Math.floor(
                      estimatedDurationMinutes / 60,
                    )} hr ${
                      estimatedDurationMinutes % 60
                    } min`}
            </p>
          ) : null}

          {slotRefreshMessage ? (
            <p className="mb-3 text-sm font-medium text-amber-700">
              {slotRefreshMessage}
            </p>
          ) : null}

          {slotsLoading ? (
            <p className="text-sm text-slate-500">
              {loadingSlotsLabel}
            </p>
          ) : slotsError ? (
            <p className="text-sm font-medium text-red-600">
              {slotsError}
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-slate-600">
              {noTimesLabel}
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {availableSlots.map((slot) => {
                const selected =
                  bookingTime === slot.time;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() =>
                      onBookingTimeSelect(slot.time)
                    }
                    className={[
                      `
                        cursor-pointer
                        rounded-[14px]
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        transition-all
                        duration-200
                      `,
                      selected
                        ? `
                            bg-[#ECF0F3]
                            text-sky-600
                            shadow-[inset_4px_4px_9px_#D1D9E6,inset_-4px_-4px_9px_rgba(255,255,255,0.95)]
                          `
                        : `
                            bg-[#F5F7FA]
                            text-slate-700
                            shadow-[4px_4px_10px_#D1D9E6,-4px_-4px_10px_rgba(255,255,255,0.95)]
                            hover:text-sky-600
                          `,
                    ].join(" ")}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}

export default EstimatorSearchBar;