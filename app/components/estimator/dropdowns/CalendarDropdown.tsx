import { useState } from "react";
import { DOW, K, MONTHS } from "../constants";
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
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function changeMonth(dir: number) {
    let m = month + dir,
      y = year;
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

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <Dropdown open={open} minWidth={300}>
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(-1);
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1.5px solid ${K.border}`,
              background: K.white,
              cursor: "pointer",
              fontSize: 14,
              color: K.textSub,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ‹
          </button>
          <span style={{ fontSize: 14, fontWeight: 800, color: K.text }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(1);
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1.5px solid ${K.border}`,
              background: K.white,
              cursor: "pointer",
              fontSize: 14,
              color: K.textSub,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ›
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {DOW.map((d) => (
            <div
              key={d}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: K.hint,
                textAlign: "center",
                padding: "4px 0",
                textTransform: "uppercase",
              }}
            >
              {d}
            </div>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const date = new Date(year, month, d);
            const isPast = date < today;
            const isSel = selected?.toDateString() === date.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            return (
              <button
                key={d}
                disabled={isPast}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(date);
                }}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: isSel ? 700 : 600,
                  borderRadius: 6,
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  borderLeft: "none",
                  cursor: isPast ? "default" : "pointer",
                  background: isSel ? K.blue : "transparent",
                  color: isSel
                    ? "#fff"
                    : isPast
                      ? "#CBD5E1"
                      : isToday
                        ? K.blue
                        : K.text,
                  transition: "all .12s",
                }}
                onMouseEnter={(e) => {
                  if (!isPast && !isSel)
                    e.currentTarget.style.background = K.blueLight;
                }}
                onMouseLeave={(e) => {
                  if (!isSel) e.currentTarget.style.background = "transparent";
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </Dropdown>
  );
}

export default CalendarDropdown;
