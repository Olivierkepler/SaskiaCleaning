import type { StateKey } from "../types";
import { K, LOCATIONS } from "../constants";
import { Dropdown } from "../ui/Dropdown";

export function LocationDropdown({
  open,
  state,
  city,
  onStateChange,
  onCitySelect,
}: {
  open: boolean;
  state: StateKey;
  city: string;
  onStateChange: (s: StateKey) => void;
  onCitySelect: (
    city: string,
    state: StateKey,
  ) => void;
}) {
  return (
    <Dropdown open={open} minWidth={300}>
      <div
        className="
          overflow-hidden
          rounded-[18px]
          bg-[#F5F7FA]
          shadow-[8px_8px_20px_#D1D9E6,-8px_-8px_20px_rgba(255,255,255,0.95)]
        "
      >
        {/* State tabs */}
        <div className="flex gap-2 p-2">
          {(["MA", "RI"] as StateKey[]).map(
            (s) => {
              const active = state === s;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onStateChange(s);
                  }}
                  className={[
                    `
                      flex-1
                      cursor-pointer
                      rounded-[12px]
                      px-3
                      py-2.5
                      text-[15px]
                      font-bold
                      transition-all
                      duration-200
                    `,
                    active
                      ? `
                          bg-[#ECF0F3]
                          text-sky-600
                          shadow-[inset_3px_3px_7px_#D1D9E6,inset_-3px_-3px_7px_rgba(255,255,255,0.95)]
                        `
                      : `
                          bg-[#F5F7FA]
                          text-slate-500
                          hover:text-slate-700
                        `,
                  ].join(" ")}
                >
                  {s === "MA"
                    ? "Massachusetts"
                    : "Rhode Island"}
                </button>
              );
            },
          )}
        </div>

        <div
          className="
            max-h-[min(320px,calc(100vh-20rem))]
            overflow-x-hidden
            overflow-y-auto
            overscroll-contain
            p-2

            lg:max-h-[min(320px,calc(100vh-22rem))]
          "
        >
          {LOCATIONS[state].map((loc) => {
            const active = loc.city === city;

            return (
              <button
                key={loc.city}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCitySelect(
                    loc.city,
                    state,
                  );
                }}
                className={[
                  `
                    mb-1
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    gap-3
                    rounded-[14px]
                    px-3
                    py-3
                    text-left
                    transition-all
                    duration-200
                  `,
                  active
                    ? `
                        bg-[#ECF0F3]
                        shadow-[inset_3px_3px_7px_#D1D9E6,inset_-3px_-3px_7px_rgba(255,255,255,0.95)]
                      `
                    : `
                        hover:bg-[#ECF0F3]
                      `,
                ].join(" ")}
              >
                <i
                  className="ti ti-map-pin"
                  style={{
                    fontSize: 16,
                    color: active
                      ? K.blue
                      : K.hint,
                  }}
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <div
                    className="
                      truncate
                      text-[13px]
                      font-semibold
                      text-slate-800
                    "
                  >
                    {loc.city}
                  </div>

                  <div
                    className="
                      mt-0.5
                      text-[11px]
                      font-medium
                      text-slate-400
                    "
                  >
                    {loc.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Dropdown>
  );
}

export default LocationDropdown;