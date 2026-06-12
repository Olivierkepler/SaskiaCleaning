"use client";

import { useEffect, useRef, useState } from "react";

type ServiceType = "residential" | "commercial" | "moveout";
type Step = "closed" | "menu" | "form" | "success";

interface LeadForm {
  name: string;
  phone: string;
  zip: string;
}

const BRAND = "#0ea5e9";
const BRAND_DARK = "#0284c7";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const SERVICES: {
  id: ServiceType;
  label: string;
  sub: string;
  icon: string;
}[] = [
  {
    id: "residential",
    label: "Residential",
    sub: "Home, apartment, condo",
    icon: "ti-home",
  },
  {
    id: "commercial",
    label: "Commercial",
    sub: "Office, retail, workspace",
    icon: "ti-building",
  },
  {
    id: "moveout",
    label: "Move-Out",
    sub: "Deep clean before handover",
    icon: "ti-door",
  },
];

const initialForm: LeadForm = {
  name: "",
  phone: "",
  zip: "",
};

export default function FloatingLeadWidget() {
  const [step, setStep] = useState<Step>("closed");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  );
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredService, setHoveredService] = useState<ServiceType | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  const selected = SERVICES.find((service) => service.id === selectedService);

  useEffect(() => {
    if (step === "closed") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setStep("closed");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [step]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStep("closed");
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const openMenu = () => setStep("menu");

  const closeWidget = () => {
    setStep("closed");
    setSelectedService(null);
    setForm(initialForm);
    setHoveredService(null);
  };

  const selectService = (service: ServiceType) => {
    setSelectedService(service);
    setStep("form");
  };

  const handleKeyboardAction = (
    event: React.KeyboardEvent<HTMLDivElement>,
    action: () => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  const updateField =
    (field: keyof LeadForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "zip"
          ? event.target.value.replace(/\D/g, "")
          : event.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setStep("success");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#ffffff",
    padding: "0 12px",
    fontFamily: FONT,
    fontSize: 14,
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };

  return (
    <div
      ref={panelRef}
      className="bottom-50 md:bottom-[400px]"
      style={{
        position: "fixed",
        right: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: 300,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRight: "none",
          borderBottom: "none",
          borderRadius: "12px 0 0 0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
          overflow: "hidden",
          opacity: step !== "closed" ? 1 : 0,
          transform: step !== "closed" ? "translateY(0)" : "translateY(10px)",
          pointerEvents: step !== "closed" ? "auto" : "none",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            minHeight: 300,
          }}
        >
          <div
            style={{
              width: 40,
              flexShrink: 0,
              background: BRAND,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
            }}
          >
            <span
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontFamily: FONT,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
                whiteSpace: "nowrap",
              }}
            >
              Saskia Cleaning
            </span>

            <span
              style={{
                writingMode: "vertical-rl",
                fontFamily: FONT,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.5)",
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
                padding: "11px 14px",
                borderBottom: "1px solid #f1f5f9",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {step === "form" && (
                  <button
                    type="button"
                    onClick={() => setStep("menu")}
                    aria-label="Back"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                      fontSize: 18,
                      display: "flex",
                      alignItems: "center",
                      padding: 2,
                    }}
                  >
                    <i className="ti ti-arrow-left" />
                  </button>
                )}

                <div>
                  <p
                    style={{
                      fontFamily: FONT,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0f172a",
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {step === "form" && selected
                      ? selected.label
                      : step === "success"
                        ? "You're all set!"
                        : "Free quote"}
                  </p>

                  <p
                    style={{
                      fontFamily: FONT,
                      fontSize: 11,
                      color: "#64748b",
                      margin: 0,
                      marginTop: 2,
                      letterSpacing: "0.03em",
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
                onClick={closeWidget}
                aria-label="Close"
                style={{
                  width: 28,
                  height: 28,
                  background: "none",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {step === "menu" && (
              <div
                style={{
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#94a3b8",
                    margin: "0 0 4px",
                  }}
                >
                  What needs cleaning?
                </p>

                {SERVICES.map((service) => {
                  const isHovered = hoveredService === service.id;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => selectService(service.id)}
                      onMouseEnter={() => setHoveredService(service.id)}
                      onMouseLeave={() => setHoveredService(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        background: isHovered ? "#f8fafc" : "#ffffff",
                        border: `1px solid ${isHovered ? BRAND : "#e2e8f0"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition:
                          "border-color 0.15s ease, background 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          background: "#e0f2fe",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: BRAND,
                          fontSize: 17,
                        }}
                      >
                        <i className={`ti ${service.icon}`} aria-hidden="true" />
                      </div>

                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontFamily: FONT,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f172a",
                            margin: 0,
                            lineHeight: 1.3,
                          }}
                        >
                          {service.label}
                        </p>

                        <p
                          style={{
                            fontFamily: FONT,
                            fontSize: 12,
                            color: "#64748b",
                            margin: 0,
                            marginTop: 2,
                          }}
                        >
                          {service.sub}
                        </p>
                      </div>

                      <i
                        className="ti ti-chevron-right"
                        style={{ color: "#94a3b8", fontSize: 14 }}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {step === "form" && (
              <form
                onSubmit={handleSubmit}
                style={{
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={updateField("name")}
                />

                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="Phone number"
                  required
                  value={form.phone}
                  onChange={updateField("phone")}
                />

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="ZIP code"
                  required
                  maxLength={5}
                  value={form.zip}
                  onChange={updateField("zip")}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    height: 40,
                    background: isSubmitting ? "#94a3b8" : BRAND,
                    border: "none",
                    borderRadius: 8,
                    color: "#ffffff",
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    marginTop: 4,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(event) => {
                    if (!isSubmitting) {
                      event.currentTarget.style.background = BRAND_DARK;
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (!isSubmitting) {
                      event.currentTarget.style.background = BRAND;
                    }
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
                  padding: "28px 16px",
                  textAlign: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: "#22c55e",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: 22,
                  }}
                >
                  <i className="ti ti-check" />
                </div>

                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Request received
                </p>

                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: 13,
                    color: "#64748b",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  We'll text{" "}
                  <strong style={{ color: "#0f172a" }}>{form.phone}</strong>{" "}
                  your price within 5 minutes.
                </p>

                <button
                  type="button"
                  onClick={closeWidget}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: FONT,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#94a3b8",
                    marginTop: 8,
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

      {step === "closed" && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Get a free cleaning quote"
          onClick={openMenu}
          onKeyDown={(event) => handleKeyboardAction(event, openMenu)}
          style={{
            width: 40,
            background: BRAND,
            borderRadius: "0 0 0 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "18px 0",
            cursor: "pointer",
            color: "#ffffff",
            fontSize: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            userSelect: "none",
          }}
        >
          <i className="ti ti-sparkles" aria-hidden="true" />

          <span
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontFamily: FONT,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            Free Quote
          </span>
        </div>
      )}

      {step !== "closed" && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close quote widget"
          onClick={closeWidget}
          onKeyDown={(event) => handleKeyboardAction(event, closeWidget)}
          style={{
            width: 300,
            background: "#ffffff",
            borderTop: "1px solid #f1f5f9",
            borderLeft: "1px solid #e2e8f0",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#94a3b8",
            }}
          >
            Close
          </span>
        </div>
      )}
    </div>
  );
}