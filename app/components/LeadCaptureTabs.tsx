"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = "residential" | "commercial" | "moveout" | null;
type Step = "closed" | "menu" | "form" | "success";

interface LeadForm {
  name: string;
  phone: string;
  zip: string;
}

// ─── Service options ──────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "residential" as ServiceType,
    label: "Residential Cleaning",
    description: "Home, apartment, condo",
    icon: (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7.5L9 2l7 5.5V16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5z" />
        <path d="M6.5 17V11h5v6" />
      </svg>
    ),
  },
  {
    id: "commercial" as ServiceType,
    label: "Commercial Cleaning",
    description: "Office, retail, workspace",
    icon: (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="14" height="14" rx="1" />
        <path d="M2 7h14M7 7v9M11 7v9" />
        <path d="M5 4.5h1M8.5 4.5h1M12 4.5h1" />
      </svg>
    ),
  },
  {
    id: "moveout" as ServiceType,
    label: "Move-Out Cleaning",
    description: "Deep clean before handover",
    icon: (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9h10M9 5l4 4-4 4" />
        <path d="M13 3h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2" />
      </svg>
    ),
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSparkle = () => (
  <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <path d="M9 2v3M9 13v3M2 9h3M13 9h3M4.22 4.22l2.12 2.12M11.66 11.66l2.12 2.12M4.22 13.78l2.12-2.12M11.66 6.34l2.12-2.12" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
    <circle cx="9" cy="9" r="2.5" fill="white" />
  </svg>
);

const IconClose = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M2 2l10 10M12 2L2 12" />
  </svg>
);

const IconArrow = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7h9M7.5 3.5 11 7l-3.5 3.5" />
  </svg>
);

const IconCheck = () => (
  <svg width={28} height={28} viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 14l6 6L23 8" />
  </svg>
);

const IconBack = () => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 7h-9M5.5 3.5 2 7l3.5 3.5" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FloatingLeadWidget() {
  const [step, setStep] = useState<Step>("closed");
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [form, setForm] = useState<LeadForm>({ name: "", phone: "", zip: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (step === "closed") return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setStep("closed");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [step]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStep("closed");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleServiceSelect = (id: ServiceType) => {
    setSelectedService(id);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: replace with real API call
    // await fetch("/api/lead", { method: "POST", body: JSON.stringify({ ...form, service: selectedService }) });
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("closed");
    setSelectedService(null);
    setForm({ name: "", phone: "", zip: "" });
  };

  const selectedServiceData = SERVICES.find((s) => s.id === selectedService);

  return (
    // Fixed wrapper — place this once in your root layout
    <div className="fixed bottom-7 right-30 z-50 flex flex-col items-end gap-3" ref={panelRef}>

      {/* ── Panel ── */}
      <div
        className={[
          "w-[320px] overflow-hidden rounded-2xl bg-white shadow-2xl",
          "border border-stone-100",
          "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          step !== "closed"
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        ].join(" ")}
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Get a cleaning quote"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-500 to-sky-400 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            {step === "form" && (
              <button
                type="button"
                onClick={() => setStep("menu")}
                className="mr-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Go back"
              >
                <IconBack />
              </button>
            )}
            <div>
              <p className="text-[13px] font-semibold text-white leading-none">
                {step === "form" && selectedServiceData
                  ? selectedServiceData.label
                  : step === "success"
                  ? "You're all set!"
                  : "Get a free quote"}
              </p>
              <p className="mt-0.5 text-[11px] text-white/75">
                {step === "success"
                  ? "We'll be in touch shortly"
                  : "MA & RI · Respond in under 5 min"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <IconClose />
          </button>
        </div>

        {/* ── Step: Menu ── */}
        {step === "menu" && (
          <div className="p-3 space-y-1.5">
            <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-stone-400">
              What do you need cleaned?
            </p>
            {SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceSelect(service.id)}
                className="group flex w-full items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3 text-left transition-all hover:border-sky-200 hover:bg-sky-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-stone-500 shadow-sm transition-colors group-hover:bg-sky-500 group-hover:text-white">
                  {service.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-stone-800 group-hover:text-sky-700">
                    {service.label}
                  </p>
                  <p className="text-[11px] text-stone-400">{service.description}</p>
                </div>
                <span className="text-stone-300 transition-colors group-hover:text-sky-400">
                  <IconArrow />
                </span>
              </button>
            ))}

            {/* Footer nudge */}
            <div className="flex items-center justify-center gap-1.5 pt-1.5">
              <div className="flex -space-x-1.5">
                {["#F59E0B", "#10B981", "#6366F1"].map((color, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded-full border-2 border-white"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-stone-400">
                <span className="font-medium text-stone-600">1,500+</span> homeowners trust us
              </p>
            </div>
          </div>
        )}

        {/* ── Step: Form ── */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-2.5 p-4">
            <p className="text-[12px] text-stone-500">
              Quick 3-field form — we'll text you a price within 5 minutes.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 text-[14px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
              <input
                type="tel"
                placeholder="Phone number"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 text-[14px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
              <input
                type="text"
                placeholder="ZIP code"
                required
                maxLength={5}
                value={form.zip}
                onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value.replace(/\D/g, "") }))}
                className="h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 text-[14px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={[
                "flex h-11 w-full items-center justify-center gap-2 rounded-xl",
                "text-[13px] font-semibold uppercase tracking-[0.06em] text-white",
                "transition-all duration-200",
                isSubmitting
                  ? "cursor-not-allowed bg-sky-400 opacity-80"
                  : "bg-sky-500 hover:bg-sky-600 hover:shadow-[0_4px_16px_rgba(14,165,233,0.35)] active:scale-[0.98]",
              ].join(" ")}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" width={15} height={15} viewBox="0 0 15 15" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
                    <path d="M7.5 1.5a6 6 0 1 1-4.24 1.76" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  Text me my price
                  <IconArrow />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-stone-400">
              No spam. No commitment. Cancel anytime.
            </p>
          </form>
        )}

        {/* ── Step: Success ── */}
        {step === "success" && (
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
              <IconCheck />
            </div>
            <p className="text-[15px] font-semibold text-stone-800">
              Request received!
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">
              We'll text{" "}
              <span className="font-medium text-stone-700">{form.phone}</span>
              {" "}with your price in under 5 minutes.
            </p>
            {selectedServiceData && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[12px] font-medium text-sky-600">
                {selectedServiceData.icon}
                {selectedServiceData.label}
              </span>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 text-[12px] text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setStep(step === "closed" ? "menu" : "closed")}
        aria-label={step !== "closed" ? "Close quote widget" : "Get a free cleaning quote"}
        className={[
          "group relative flex h-14 w-14 items-center justify-center rounded-full",
          "shadow-lg transition-all duration-300",
          step !== "closed"
            ? "bg-sky-500 hover:bg-sky-600 rotate-0 scale-95"
            : "bg-sky-500 hover:bg-sky-600 hover:scale-105 hover:shadow-[0_8px_24px_rgb(14 165 233 / 40%)]",
        ].join(" ")}
      >
        {/* Pulse ring — only when closed */}
        {step === "closed" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-400 opacity-30" />
        )}

        {/* Icon swap */}
        <span
          className={[
            "absolute transition-all duration-200",
            step !== "closed" ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-75",
          ].join(" ")}
        >
          <IconClose />
        </span>
        <span
          className={[
            "absolute transition-all duration-200",
            step === "closed" ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-75",
          ].join(" ")}
        >
          <IconSparkle />
        </span>

        {/* Tooltip */}
        {step === "closed" && (
          <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-stone-900 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Get a free quote
            <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-stone-900" />
          </span>
        )}
      </button>
    </div>
  );
}