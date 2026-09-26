import type { ReactNode } from "react";
import { K } from "../constants";

export function Notice({ text }: { text: ReactNode }) {
  return (
    <div
      style={{
        background: K.noticeBg,
        border: `1.5px solid ${K.noticeBorder}`,
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <i
        className="ti ti-info-circle"
        style={{ fontSize: 16, color: K.blue, marginTop: 1, flexShrink: 0 }}
        aria-hidden="true"
      />
      <p style={{ fontSize: 12, color: K.noticeText, fontWeight: 500, lineHeight: 1.5 }}>
        {text}
      </p>
    </div>
  );
}

export default Notice;
