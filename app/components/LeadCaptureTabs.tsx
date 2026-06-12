// components/FloatingLeadWidget.tsx

"use client";

import { useState, useEffect, useRef } from "react";

type ServiceType = "residential" | "commercial" | "moveout" | null;
type Step = "closed" | "menu" | "form" | "success";

interface LeadForm {
  name: string;
  phone: string;
  zip: string;
}

const K = {
  blue: "#0ea5e9",
  blueDark: "#0284c7",
  white: "#ffffff",
  black: "#111111",
  border: "#e5e5e5",
  bg: "#fafafa",
  muted: "#888888",
  green: "#22c55e",
};

const IconClose = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M1 1l10 10M11 1L1 11" />
  </svg>
);

const IconStar = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.6 3.5L7 9.5l-3.1 1.5.6-3.5L2 5l3.5-.5z" />
  </svg>
);

const IconArrow = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6h8M6 3l3 3-3 3" />
  </svg>
);

const IconBack = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 6H2M6 3L3 6l3 3" />
  </svg>
);

const IconCheck = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 7" />
  </svg>
);

const SERVICES = [
  {
    id: "residential" as ServiceType,
    label: "Residential",
    sub: "Home, apartment, condo",
    icon: <IconStar />,
  },
  {
    id: "commercial" as ServiceType,
    label: "Commercial",
    sub: "Office, retail, workspace",
    icon: <IconStar />,
  },
  {
    id: "moveout" as ServiceType,
    label: "Move-Out",
    sub: "Deep clean before handover",
    icon: <IconStar />,
  },
];

function TicketNotches() {
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 0,
        bottom: 0,
        width: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 14,
          height: 7,
          background: "#f1f5f9",
          borderRadius: "0 0 100px 100px",
          marginTop: -1,
          border: `1px solid ${K.border}`,
          borderTop: "none",
        }}
      />

      <div
        style={{
          width: 14,
          height: 7,
          background: "#f1f5f9",
          borderRadius: "100px 100px 0 0",
          marginBottom: -1,
          border: `1px solid ${K.border}`,
          borderBottom: "none",
        }}
      />
    </div>
  );
}

export default function FloatingLeadWidget() {
  const [step, setStep] = useState<Step>("closed");
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [form, setForm] = useState<LeadForm>({
    name: "",
    phone: "",
    zip: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const STUB = 40;

  const svc = SERVICES.find((s) => s.id === selectedService);

  useEffect(() => {
    if (step === "closed") return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setStep("closed");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [step]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStep("closed");
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleServiceSelect = (id: ServiceType) => {
    setSelectedService(id);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("closed");
    setSelectedService(null);
    setForm({ name: "", phone: "", zip: "" });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    border: `1.5px solid ${K.border}`,
    borderRadius: 0,
    background: K.white,
    padding: "0 14px",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 15,
    color: K.black,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        
        left: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}

      className="bottom-30 md:bottom-[450]"
    >
      <div
        style={{
          width: 300,
          background: K.white,
          border: `1.5px solid ${K.border}`,
          borderBottom: "none",
          borderRight: "none",
          boxShadow: "-4px -4px 24px rgba(0,0,0,0.10)",
          position: "relative",
          overflow: "visible",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          opacity: step !== "closed" ? 1 : 0,
          transform: step !== "closed" ? "translateY(0)" : "translateY(12px)",
          pointerEvents: step !== "closed" ? "auto" : "none",
        }}
      >
        <TicketNotches />

        <div style={{ display: "flex", minHeight: 340 }}>
          <div
            style={{
              width: STUB,
              flexShrink: 0,
              background: K.blue,
              borderRight: `1.5px dashed rgba(255,255,255,0.35)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.8)",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              Saskia Cleaning
            </span>

            <div style={{ color: "rgba(255,255,255,0.9)" }}>
              {svc ? svc.icon : <IconStar />}
            </div>

            <span
              style={{
                writingMode: "vertical-rl",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.6)",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              MA · RI
            </span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderBottom: `1px solid ${K.border}`,
                background: K.bg,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {step === "form" && (
                  <button
                    type="button"
                    onClick={() => setStep("menu")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: K.muted,
                      padding: 4,
                      minWidth: 32,
                      minHeight: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconBack />
                  </button>
                )}

                <div>
                  <p
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: K.black,
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {step === "form" && svc
                      ? svc.label
                      : step === "success"
                      ? "You're all set!"
                      : "Free Quote"}
                  </p>

                  <p
                    style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: K.muted,
                      margin: 0,
                      marginTop: 3,
                    }}
                  >
                    {step === "success"
                      ? "We'll text you shortly"
                      : "Reply in under 5 min"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  width: 28,
                  height: 28,
                  background: "none",
                  border: `1.5px solid ${K.border}`,
                  cursor: "pointer",
                  color: K.muted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconClose />
              </button>
            </div>

            {step === "menu" && (
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                <p
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: K.muted,
                    margin: "0 0 6px",
                  }}
                >
                  What needs cleaning?
                </p>

                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleServiceSelect(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 12px",
                      minHeight: 52,
                      background: K.white,
                      border: `1.5px solid ${K.border}`,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <span style={{ color: K.blue, display: "flex" }}>
                      {s.icon}
                    </span>

                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "Arial, Helvetica, sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          color: K.black,
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {s.label}
                      </p>

                      <p
                        style={{
                          fontFamily: "Arial, Helvetica, sans-serif",
                          fontSize: 12,
                          color: K.muted,
                          margin: 0,
                          marginTop: 2,
                          lineHeight: 1.35,
                        }}
                      >
                        {s.sub}
                      </p>
                    </div>

                    <IconArrow />
                  </button>
                ))}
              </div>
            )}

            {step === "form" && (
              <form onSubmit={handleSubmit} style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />

                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="Phone number"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="ZIP code"
                  required
                  maxLength={5}
                  value={form.zip}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      zip: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    height: 44,
                    background: isSubmitting ? K.muted : K.blue,
                    border: "none",
                    color: K.white,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    marginTop: 2,
                  }}
                >
                  {isSubmitting ? "Sending…" : "Text me my price"}
                </button>
              </form>
            )}

            {step === "success" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "24px 16px",
                  textAlign: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: K.green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCheck />
                </div>

                <p
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: K.black,
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  Request received!
                </p>

                <p
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 14,
                    color: K.muted,
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  We'll text{" "}
                  <strong style={{ color: K.black }}>{form.phone}</strong> your
                  price shortly.
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: K.muted,
                    marginTop: 10,
                    padding: "6px 10px",
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsed/Open Trigger */}
      <button
        type="button"
        onClick={() => setStep(step === "closed" ? "menu" : "closed")}
        aria-label={
          step !== "closed" ? "Close quote widget" : "Get a free cleaning quote"
        }
        style={{
          display: "flex",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: STUB,
            minHeight: step === "closed" ? 158 : 46,
            background: K.blue,
            color: K.white,
            padding: "14px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.2s ease",
            overflow: "hidden",
          }}
        >
          {step !== "closed" ? (
            <IconClose />
          ) : (
            <>
              <IconStar />

              <span
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.9)",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  textAlign: "center",
                  maxHeight: "100%",
                  overflow: "hidden",
                }}
              >
                Free Quote.
              </span>
            </>
          )}
        </div>

        {step !== "closed" && (
          <div
            style={{
              width: 300 - STUB,
              background: K.white,
              borderTop: `1.5px solid ${K.border}`,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              boxShadow: "-2px 0 8px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 15,
                fontWeight: 700,
                color: K.black,
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              Close
            </p>
          </div>
        )}
      </button>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}