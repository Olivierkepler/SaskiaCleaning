"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ServiceType = "residential" | "commercial" | "moveout" | null;
type Step = "closed" | "menu" | "form" | "success";
interface LeadForm { name: string; phone: string; zip: string }

// ─── Design tokens ────────────────────────────────────────────────────────────
const K = {
  font:      "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif",
  blue:      "#0ea5e9",
  blueDark:  "#0284c7",
  blueText:  "#082f49",
  white:     "#ffffff",
  black:     "#111111",
  border:    "#e5e5e5",
  bg:        "#fafafa",
  muted:     "#888888",
  secondary: "#64748b",
  green:     "#22c55e",
  red:       "#CC0000",
  type: {} as {
    heading: React.CSSProperties;
    serviceTitle: React.CSSProperties;
    body: React.CSSProperties;
    secondary: React.CSSProperties;
    label: React.CSSProperties;
    cta: React.CSSProperties;
  },
};

K.type = {
  heading: {
    fontFamily: K.font,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  serviceTitle: {
    fontFamily: K.font,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontFamily: K.font,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  secondary: {
    fontFamily: K.font,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
    color: K.secondary,
  },
  label: {
    fontFamily: K.font,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  cta: {
    fontFamily: K.font,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.4,
  },
};

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: "residential" as ServiceType,
    label: "Residential",
    sub: "Home, apartment, condo",
    icon: (
      <svg width={16} height={16} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7.5L9 2l7 5.5V16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5z" />
        <path d="M6.5 17V11h5v6" />
      </svg>
    ),
  },
  {
    id: "commercial" as ServiceType,
    label: "Commercial",
    sub: "Office, retail, workspace",
    icon: (
      <svg width={16} height={16} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="14" height="14" rx="1" />
        <path d="M2 7h14M7 7v9M11 7v9" />
      </svg>
    ),
  },
  {
    id: "moveout" as ServiceType,
    label: "Move-Out",
    sub: "Deep clean before handover",
    icon: (
      <svg width={16} height={16} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9h10M9 5l4 4-4 4" />
        <path d="M13 3h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2" />
      </svg>
    ),
  },
];

// ─── Small icons ─────────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M1 1l10 10M11 1L1 11" />
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
const IconStar = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.6 3.5L7 9.5l-3.1 1.5.6-3.5L2 5l3.5-.5z" />
  </svg>
);

// ─── Ticket notch cutout SVG ──────────────────────────────────────────────────
// Rendered at the perforation boundary — the circles "bite" into the panel
function TicketNotches() {
  return (
    <div style={{
      position: "absolute",
      left: 40,          // matches stub width
      top: 0,
      bottom: 0,
      width: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      pointerEvents: "none",
      zIndex: 10,
    }}>
      {/* Top notch */}
      <div style={{
        width: 14, height: 7,
        background: "#f1f5f9",   // matches page bg — creates the "hole" illusion
        borderRadius: "0 0 100px 100px",
        marginTop: -1,
        border: `1px solid ${K.border}`,
        borderTop: "none",
      }} />
      {/* Bottom notch */}
      <div style={{
        width: 14, height: 7,
        background: "#f1f5f9",
        borderRadius: "100px 100px 0 0",
        marginBottom: -1,
        border: `1px solid ${K.border}`,
        borderBottom: "none",
      }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FloatingLeadWidget() {
  const [step,            setStep]            = useState<Step>("closed");
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [form,            setForm]            = useState<LeadForm>({ name: "", phone: "", zip: "" });
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === "closed") return;
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setStep("closed");
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [step]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setStep("closed"); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleServiceSelect = (id: ServiceType) => { setSelectedService(id); setStep("form"); };

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

  const svc = SERVICES.find((s) => s.id === selectedService);

  // ── Shared input style ───────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 38,
    border: `1.5px solid ${K.border}`,
    borderRadius: 0,
    background: K.white,
    padding: "0 12px",
    ...K.type.body,
    color: K.black,
    outline: "none",
    boxSizing: "border-box",
  };

  // ── Ticket panel dimensions ───────────────────────────────────────────────
  const STUB = 40;   // left stub width in px

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        bottom: 100,
        right: 30,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 0,
      }}
    >
      {/* ── Ticket panel ─────────────────────────────────────────────────── */}
      <div
        style={{
          width: 300,
          background: K.white,
          border: `1.5px solid ${K.border}`,
          borderBottom: "none",
          borderRight: "none",
          borderRadius: 0,
          boxShadow: "-4px -4px 24px rgba(0,0,0,0.10)",
          position: "relative",
          overflow: "visible",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          opacity: step !== "closed" ? 1 : 0,
          transform: step !== "closed" ? "translateY(0)" : "translateY(12px)",
          pointerEvents: step !== "closed" ? "auto" : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Get a cleaning quote"
      >
        {/* Perforation notches */}
        <TicketNotches />

        <div style={{ display: "flex", minHeight: 320 }}>

          {/* Left stub — sky-500 column */}
          <div style={{
            width: STUB,
            flexShrink: 0,
            background: K.blue,
            borderRight: `1.5px dashed rgba(255,255,255,0.35)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0",
          }}>
            {/* Rotated stub label */}
            <span style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              ...K.type.label,
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.8)",
              userSelect: "none",
            }}>
              Saskia Cleaning
            </span>

            {/* Service icon or star */}
            <div style={{ color: "rgba(255,255,255,0.9)" }}>
              {svc ? svc.icon : <IconStar />}
            </div>

            {/* MA · RI */}
            <span style={{
              writingMode: "vertical-rl",
              ...K.type.label,
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.6)",
              userSelect: "none",
            }}>
              MA · RI
            </span>
          </div>

          {/* Right body */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderBottom: `1px solid ${K.border}`,
              background: K.bg,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {step === "form" && (
                  <button
                    type="button"
                    onClick={() => setStep("menu")}
                    aria-label="Go back"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: K.muted, padding: 2, display: "flex",
                    }}
                  >
                    <IconBack />
                  </button>
                )}
                <div>
                  <p style={{
                    ...K.type.heading,
                    color: K.black,
                    margin: 0,
                  }}>
                    {step === "form" && svc ? svc.label : step === "success" ? "You're all set!" : "Free Quote"}
                  </p>
                  <p style={{
                    ...K.type.label,
                    color: K.secondary,
                    margin: 0,
                    marginTop: 2,
                  }}>
                    {step === "success" ? "We'll text you shortly" : "Reply in under 5 min"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                style={{
                  width: 24, height: 24,
                  background: "none",
                  border: `1.5px solid ${K.border}`,
                  borderRadius: 0,
                  cursor: "pointer",
                  color: K.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconClose />
              </button>
            </div>

            {/* ── Menu step ── */}
            {step === "menu" && (
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{
                  ...K.type.label,
                  color: K.secondary,
                  margin: "0 0 4px",
                }}>
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
                      gap: 10,
                      padding: "9px 10px",
                      background: K.white,
                      border: `1.5px solid ${K.border}`,
                      borderRadius: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "border-color 0.13s, background 0.13s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = K.blue;
                      e.currentTarget.style.background = "#f0f9ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = K.border;
                      e.currentTarget.style.background = K.white;
                    }}
                  >
                    <span style={{ color: K.blue, display: "flex", flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        ...K.type.serviceTitle,
                        color: K.black,
                        margin: 0,
                      }}>
                        {s.label}
                      </p>
                      <p style={{
                        ...K.type.secondary,
                        margin: 0,
                        marginTop: 1,
                      }}>
                        {s.sub}
                      </p>
                    </div>
                    <span style={{ color: K.muted, display: "flex" }}><IconArrow /></span>
                  </button>
                ))}

                {/* Social proof */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                  paddingTop: 8,
                  borderTop: `1px solid ${K.border}`,
                }}>
                  <div style={{ display: "flex" }}>
                    {["#F59E0B","#10B981","#6366F1"].map((c, i) => (
                      <div key={i} style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: c,
                        border: `2px solid ${K.white}`,
                        marginLeft: i === 0 ? 0 : -6,
                      }} />
                    ))}
                  </div>
                  <p style={{
                    ...K.type.secondary,
                    margin: 0,
                  }}>
                    <span style={{ fontWeight: 600, color: K.black }}>1,500+</span> homeowners trust us
                  </p>
                </div>
              </div>
            )}

            {/* ── Form step ── */}
            {step === "form" && (
              <form onSubmit={handleSubmit} style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
                <p style={{
                  ...K.type.body,
                  color: K.secondary,
                  margin: 0,
                }}>
                  3-field form — we'll text your price in 5 min.
                </p>

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onFocus={(e) => { e.currentTarget.style.borderColor = K.blue; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = K.border; }}
                />
                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="Phone number"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  onFocus={(e) => { e.currentTarget.style.borderColor = K.blue; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = K.border; }}
                />
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="ZIP code"
                  required
                  maxLength={5}
                  value={form.zip}
                  onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g,"") }))}
                  onFocus={(e) => { e.currentTarget.style.borderColor = K.blue; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = K.border; }}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    height: 38,
                    background: isSubmitting ? K.muted : K.blue,
                    border: "none",
                    borderRadius: 0,
                    color: K.white,
                    ...K.type.cta,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    marginTop: 2,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = K.blueDark; }}
                  onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = K.blue; }}
                >
                  {isSubmitting ? (
                    <>
                      <svg style={{ animation: "spin 0.8s linear infinite" }} width={13} height={13} viewBox="0 0 13 13" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
                        <path d="M6.5 1.5a5 5 0 1 1-3.54 1.46" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>Text me my price <IconArrow /></>
                  )}
                </button>

                <p style={{
                  ...K.type.label,
                  color: K.secondary,
                  textAlign: "center",
                  margin: 0,
                }}>
                  No spam. No commitment.
                </p>
              </form>
            )}

            {/* ── Success step ── */}
            {step === "success" && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "24px 16px", textAlign: "center", gap: 8,
              }}>
                <div style={{
                  width: 44, height: 44,
                  background: K.green,
                  borderRadius: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 4,
                }}>
                  <IconCheck />
                </div>
                <p style={{
                  ...K.type.heading,
                  fontSize: 16,
                  color: K.black,
                  margin: 0,
                }}>
                  Request received!
                </p>
                <p style={{
                  ...K.type.body,
                  color: K.secondary,
                  margin: 0,
                }}>
                  We'll text <span style={{ color: K.black, fontWeight: 600 }}>{form.phone}</span> your price in under 5 minutes.
                </p>
                {svc && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 12px",
                    background: "#f0f9ff",
                    border: `1.5px solid ${K.blue}`,
                    borderRadius: 0,
                    marginTop: 4,
                  }}>
                    <span style={{ color: K.blue }}>{svc.icon}</span>
                    <span style={{
                      ...K.type.serviceTitle,
                      color: K.blue,
                    }}>
                      {svc.label}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    ...K.type.label,
                    color: K.secondary,
                    marginTop: 8,
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Trigger tab — the visible ticket edge when closed ─────────────── */}
      <button
        type="button"
        onClick={() => setStep(step === "closed" ? "menu" : "closed")}
        aria-label={step !== "closed" ? "Close quote widget" : "Get a free cleaning quote"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {/* Sky stub tab */}
        <div style={{
          width: STUB,
          background: K.blue,
          padding: "10px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          borderRight: `1.5px dashed rgba(255,255,255,0.35)`,
          transition: "background 0.15s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = K.blueDark; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = K.blue; }}
        >
          <IconStar />
        </div>

        {/* White label area */}
        <div style={{
          width: 300 - STUB,
          background: K.white,
          borderTop: `1.5px solid ${K.border}`,
          borderLeft: "none",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.06)",
        }}>
          <div>
            <p style={{
              ...K.type.heading,
              color: K.black,
              margin: 0,
            }}>
              {step !== "closed" ? "Close" : "Get a free quote"}
            </p>
            <p style={{
              ...K.type.label,
              color: K.secondary,
              margin: 0,
              marginTop: 2,
            }}>
              MA & RI · Reply in 5 min
            </p>
          </div>
          <div style={{
            width: 24, height: 24,
            background: step !== "closed" ? K.muted : K.blue,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: K.white, borderRadius: 0,
            transition: "background 0.15s",
          }}>
            {step !== "closed" ? <IconClose /> : <IconArrow />}
          </div>
        </div>
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}