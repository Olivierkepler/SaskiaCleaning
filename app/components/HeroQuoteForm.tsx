"use client";

import { useState } from "react";

interface CounterField {
  label: string;
  value: number;
  min: number;
  max: number;
}

interface FormState {
  name: string;
  email: string;
  mobile: string;
  bedrooms: number;
  bathrooms: number;
}

type SubmitStatus = "idle" | "loading" | "success";

function Counter({
    label,
    value,
    min,
    max,
    onChange,
  }: CounterField & { onChange: (v: number) => void }) {
    const plural = value !== 1;
  
    return (
      <div
        className="
          grid h-[54px] w-full grid-cols-[48px_1fr_48px]
          overflow-hidden rounded-md border border-white/30 bg-white
          shadow-sm transition-colors
          focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100
          sm:w-auto sm:min-w-[178px]
        "
      >
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="
            flex h-full items-center justify-center
            text-xl font-medium text-slate-400 transition-colors
            hover:bg-sky-500 hover:text-white
            disabled:cursor-not-allowed disabled:opacity-30
          "
        >
          −
        </button>
  
        <div className="flex min-w-0 select-none flex-col items-center justify-center border-x border-stone-100 px-2">
          <span className="text-[18px] font-semibold leading-none text-slate-900 tabular-nums">
            {value}
          </span>
  
          <span className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
            {plural ? "s" : ""}
          </span>
        </div>
  
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="
            flex h-full items-center justify-center
            text-xl font-medium text-slate-400 transition-colors
            hover:bg-sky-500 hover:text-white
            disabled:cursor-not-allowed disabled:opacity-30
          "
        >
          +
        </button>
      </div>
    );
  }

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-500">
      {icon}
      {label}
    </span>
  );
}

const IconArrow = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M8.5 4 13 8l-4.5 4" />
  </svg>
);

const IconCheck = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l3.5 3.5L13 5" />
  </svg>
);

const IconShield = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="#D4622A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 1L10.5 3v3.5C10.5 9.5 6 11 6 11S1.5 9.5 1.5 6.5V3L6 1z" />
  </svg>
);

const IconClock = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="#D4622A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="4.5" />
    <path d="M6 3.5V6l1.5 1.5" />
  </svg>
);

const IconVerified = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="#D4622A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6l3 3 5-5" />
  </svg>
);

const StarIcon = () => (
  <svg width={14} height={14} viewBox="0 0 14 14">
    <polygon points="7,1 8.8,5 13,5.5 10,8.5 10.9,13 7,10.8 3.1,13 4,8.5 1,5.5 5.2,5" fill="#D4622A" />
  </svg>
);

export default function HeroBooking() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    mobile: "",
    bedrooms: 1,
    bathrooms: 1,
  });

  const [status, setStatus] = useState<SubmitStatus>("idle");

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setStatus("success");
    setTimeout(() => setStatus("idle"), 3500);
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <div
      className="flex items-center justify-center  "
     
    >
         <form
  onSubmit={handleSubmit}
  className="mx-auto w-full max-w-4xl space-y-4"
>
           <h1
           className="
           font-heading
           max-w-3xl
           animate-[fadeInUp_0.8s_ease-out_forwards]
           text-3xl
           font-thin
           leading-[0.95]
           tracking-tight
           sm:text-4xl
           lg:text-5xl
         "
             style={{
               fontWeight: 300,
               letterSpacing: "-0.01em",
             }}
           >
             Trusted Home Cleaning Across Massachusetts & Rhode Island.
           </h1>
       


            
            <br />
          <p className="mb-4 text-[16px] font-medium uppercase tracking-[0.09em] text-white">

            Book a trusted cleaner instantly below.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            <input
              type="text"
              placeholder="Your name"
              autoComplete="given-name"
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="h-[52px] w-full rounded-md border border-stone-200 bg-white px-4 text-[18px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            <Counter
              label="Bedroom"
              value={form.bedrooms}
              min={1}
              max={8}
              onChange={(v) => setField("bedrooms", v)}
            />

            <Counter
              label="Bathroom"
              value={form.bathrooms}
              min={1}
              max={6}
              onChange={(v) => setField("bathrooms", v)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="h-[52px] w-full rounded-md border border-stone-200 bg-white px-4 text-[18px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

            <input
              type="tel"
              placeholder="Mobile number"
              autoComplete="tel"
              value={form.mobile}
              onChange={(e) => setField("mobile", e.target.value)}
              className="h-[52px] w-full rounded-md border border-stone-200 bg-white px-4 text-[18px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={[
              "flex h-14 w-full items-center justify-center gap-2.5 rounded-[14px]",
              "text-[16px] font-bold uppercase tracking-[0.05em] text-white",
              "transition-all duration-200",
              isSuccess
                ? "bg-emerald-600"
                : "bg-sky-500 hover:bg-sky-600 active:scale-[0.99]",
              isLoading ? "cursor-not-allowed opacity-80" : "",
              !isSuccess && !isLoading
                ? "hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(56,189,248,0.3)]"
                : "",
            ].join(" ")}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
                  <path d="M9 2a7 7 0 1 1-4.95 2.05" />
                </svg>
                Preparing your estimate...
              </>
            ) : isSuccess ? (
              <>
                <IconCheck />
                Quote request received!
              </>
            ) : (
              <>
                Get my instant estimate
                <IconArrow />
              </>
            )}
          </button>
        </form>

      {/* <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
        style={{
          boxShadow:
            "0 2px 4px rgba(26,22,20,.04), 0 16px 56px rgba(26,22,20,.12)",
        }}
      >
        <div className="h-1 bg-gradient-to-r from-orange-600 to-orange-400" />

        <div className="flex flex-col gap-5 px-6 pb-7 pt-8 sm:flex-row sm:gap-6 sm:px-10 sm:pb-8 sm:pt-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-orange-500 sm:mt-1">
            <svg width={26} height={26} viewBox="0 0 26 26" fill="none" stroke="white" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19L19 7" />
              <path d="M13 7c0 0 4-2 6 0s0 6 0 6" />
              <path d="M7 19c0 0-3 2-2 5 1.5.5 4-1 4-1" />
              <circle cx="21" cy="5" r="1.5" fill="white" stroke="none" />
            </svg>
          </div>

          
        </div>

        <div className="mx-6 h-px bg-stone-100 sm:mx-10" />

     
        <div className="flex flex-col gap-4 border-t border-stone-100 bg-stone-50 px-6 py-5 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex shrink-0 gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>

            <p className="text-[13px] leading-5 text-stone-500">
              <span className="font-medium text-stone-700">Rated 4.8/5</span>{" "}
              by <span className="font-medium text-stone-700">1,500+</span>{" "}
              homeowners
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TrustBadge icon={<IconShield />} label="Licensed & insured" />
            <TrustBadge icon={<IconVerified />} label="Background checked" />
            <TrustBadge icon={<IconClock />} label="Flexible scheduling" />
          </div>
        </div>
      </div> */}
    </div>
  );
}