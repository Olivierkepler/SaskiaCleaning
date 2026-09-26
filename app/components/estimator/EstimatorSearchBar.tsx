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
        <button
          type="button"
          className="mb-3 flex w-full items-center justify-between gap-3 rounded-xl  bg-white px-4 py-4 text-left shadow-sm sm:hidden"
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
          <div className="flex w-full flex-col gap-2 sm:min-h-[64px] sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-xl  sm:bg-white sm:p-1 sm:shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
            {/* Location */}
            <div
              className="relative flex w-full items-stretch sm:min-h-0 sm:flex-[1.33] sm:rounded-lg sm:bg-white"
              style={{ zIndex: locationOpen ? 99999 : undefined }}
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
                animate={{ rotate: locationOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 sm:right-4"
                style={{ color: locationOpen ? K.blue : K.hint }}
              >
                <ChevronDown size={16} strokeWidth={2.2} />
              </motion.div>

              <LocationDropdown
                open={locationOpen}
                state={locationState}
                city={locationCity}
                onStateChange={onLocationStateChange}
                onCitySelect={onCitySelect}
              />
            </div>

            <div
              aria-hidden="true"
              className="hidden w-px shrink-0 self-stretch bg-slate-200 sm:my-2 sm:block"
            />

            {/* Date */}
            <div
              className="relative flex w-full items-stretch sm:min-h-0 sm:flex-1 sm:rounded-lg sm:bg-white"
              style={{ zIndex: dateOpen ? 99999 : undefined }}
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
                animate={{ rotate: dateOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 sm:right-4"
                style={{ color: dateOpen ? K.blue : K.hint }}
              >
                <ChevronDown size={16} strokeWidth={2.2} />
              </motion.div>

              <CalendarDropdown
                open={dateOpen}
                selected={selectedDate}
                onSelect={onDateSelect}
              />
            </div>

            <div
              aria-hidden="true"
              className="hidden w-px shrink-0 self-stretch bg-slate-200 sm:my-2 sm:block"
            />

            {/* Options toggle */}
            <div className="relative flex w-full items-center justify-center p-2 sm:min-h-0 sm:w-auto sm:flex-initial sm:p-1">
              <button
                type="button"
                onClick={onCustomizeClick}
                className={[
                  "flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-xs font-bold text-white shadow-sm transition-all duration-200",
                  "max-sm:border-0 sm:h-full sm:min-h-[48px] sm:px-5",
                  optionsOpen
                    ? "bg-sky-500 hover:bg-sky-600"
                    : "bg-sky-500 hover:bg-sky-600",
                ].join(" ")}
              >
                <SlidersHorizontal size={15} strokeWidth={2.25} />
                <span>{customizeLabel}</span>
                <motion.div
                  animate={{ rotate: optionsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={15} strokeWidth={2.25} />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {requiredFieldsMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-3 sm:px-5"
          >
            <p
              role="alert"
              aria-live="assertive"
              className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
            >
              {requiredFieldsMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDate ? (
        <div className="border-t border-slate-100 px-3 py-3 sm:px-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {selectTimeLabel}
          </p>
          {estimatedDurationMinutes != null ? (
            <p className="mb-2 text-sm text-slate-600">
              Estimated duration:{" "}
              {estimatedDurationMinutes < 60
                ? `About ${estimatedDurationMinutes} min`
                : estimatedDurationMinutes % 60 === 0
                  ? `About ${estimatedDurationMinutes / 60} hour${
                      estimatedDurationMinutes === 60 ? "" : "s"
                    }`
                  : `About ${Math.floor(
                      estimatedDurationMinutes / 60,
                    )} hr ${estimatedDurationMinutes % 60} min`}
            </p>
          ) : null}
          {slotRefreshMessage ? (
            <p className="mb-2 text-sm font-medium text-amber-700">
              {slotRefreshMessage}
            </p>
          ) : null}
          {slotsLoading ? (
            <p className="text-sm text-slate-500">{loadingSlotsLabel}</p>
          ) : slotsError ? (
            <p className="text-sm font-medium text-red-600">{slotsError}</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-slate-600">{noTimesLabel}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((slot) => {
                const selected = bookingTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onBookingTimeSelect(slot.time)}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-sky-400 bg-sky-50 text-sky-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
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
