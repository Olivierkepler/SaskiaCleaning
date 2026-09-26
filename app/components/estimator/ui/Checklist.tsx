import { K } from "../constants";

export function Checklist({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
        <div
          key={item}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 12,
            color: K.textSub,
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: K.blue,
              flexShrink: 0,
              marginTop: 5,
            }}
          />
          {item}
        </div>
      ))}
    </div>
  );
}

export default Checklist;
