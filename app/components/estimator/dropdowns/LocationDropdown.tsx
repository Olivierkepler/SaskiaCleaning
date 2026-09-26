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
  onCitySelect: (city: string, state: StateKey) => void;
}) {
  return (
    <Dropdown open={open} minWidth={280}>
      {/* State tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${K.borderLight}` }}>
        {(["MA", "RI"] as StateKey[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStateChange(s);
            }}
            style={{
              flex: 1,
              padding: 10,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              color: state === s ? K.blue : K.muted,
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: `2px solid ${state === s ? K.blue : "transparent"}`,
            }}
          >
            {s === "MA" ? "Massachusetts" : "Rhode Island"}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: 6,
          maxHeight: 320,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {LOCATIONS[state].map((loc) => {
          const active = loc.city === city;
          return (
            <div
              key={loc.city}
              onClick={(e) => {
                e.stopPropagation();
                onCitySelect(loc.city, state);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: active ? K.blueLight : "transparent",
                transition: "background .12s",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = K.blueFaint;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <i
                className="ti ti-map-pin"
                style={{ fontSize: 16, color: active ? K.blue : K.hint }}
                aria-hidden="true"
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: K.text }}>
                  {loc.city}
                </div>
                <div style={{ fontSize: 11, color: K.hint, fontWeight: 500 }}>
                  {loc.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Dropdown>
  );
}

export default LocationDropdown;
