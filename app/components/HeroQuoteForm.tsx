"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

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
const IDEMPOTENCY_STORAGE_KEY = "saskia:inquiry-key:hero_quote";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto === "undefined") {
    throw new Error("Secure request identifiers are unavailable.");
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function getInquiryKey(current: { current: string | null }): string {
  if (current.current) return current.current;
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
  } catch {
    // Keep the key in memory if browser storage is unavailable.
  }
  const key = stored || createIdempotencyKey();
  current.current = key;
  try {
    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, key);
  } catch {
    // The in-memory key still protects retries while this form remains mounted.
  }
  return key;
}

function rotateInquiryKey(current: { current: string | null }): void {
  const key = createIdempotencyKey();
  current.current = key;
  try {
    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, key);
  } catch {
    // The form can continue with its in-memory key.
  }
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: CounterField & { onChange: (v: number) => void }) {
  const t = useTranslations("hero");
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className="grid h-[48px] w-full grid-cols-[42px_1fr_42px] overflow-hidden rounded-md border border-white/30 bg-white shadow-sm transition-colors focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 sm:h-[54px] sm:grid-cols-[48px_1fr_48px] sm:w-auto sm:min-w-[178px]">
      <button
        type="button"
        aria-label={t("decrease", { label })}
        aria-disabled={atMin}
        onClick={() => {
          if (atMin) return;
          onChange(Math.max(min, value - 1));
        }}
        className={[
          "flex h-full items-center justify-center text-xl font-medium text-slate-400 transition-colors",
          atMin
            ? "pointer-events-none cursor-not-allowed opacity-30"
            : "cursor-pointer hover:bg-sky-500 hover:text-white",
        ].join(" ")}
      >
        −
      </button>

      <div className="flex min-w-0 select-none flex-col items-center justify-center border-x border-stone-100 px-2">
        <span className="text-[18px] font-semibold leading-none text-slate-900 tabular-nums">
          {value}
        </span>

        <span className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>

      <button
        type="button"
        aria-label={t("increase", { label })}
        aria-disabled={atMax}
        onClick={() => {
          if (atMax) return;
          onChange(Math.min(max, value + 1));
        }}
        className={[
          "flex h-full items-center justify-center text-xl font-medium text-slate-400 transition-colors",
          atMax
            ? "pointer-events-none cursor-not-allowed opacity-30"
            : "cursor-pointer hover:bg-sky-500 hover:text-white",
        ].join(" ")}
      >
        +
      </button>
    </div>
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

export default function HeroBooking() {
  const t = useTranslations("hero");
  const idempotencyKey = useRef<string | null>(null);
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

    try {
      const requestKey = getInquiryKey(idempotencyKey);
      const response = await fetch("/api/service-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "hero_quote",
          idempotencyKey: requestKey,
          fullName: form.name,
          email: form.email,
          phone: form.mobile,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: unknown }
          | null;
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : t("errorAlert"),
        );
      }

      setStatus("success");

      setForm({
        name: "",
        email: "",
        mobile: "",
        bedrooms: 1,
        bathrooms: 1,
      });
      rotateInquiryKey(idempotencyKey);

      setTimeout(() => setStatus("idle"), 3500);
    } catch (error) {
      alert(error instanceof Error ? error.message : t("errorAlert"));
      setStatus("idle");
    }
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const inputClassName =
    "h-[48px] w-full rounded-md border border-stone-200 bg-white px-4 text-[18px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:h-[52px]";

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl space-y-4 px-4 sm:space-y-5 sm:px-0"
      >
        <h1
           className="
           font-heading
           max-w-3xl
           text-3xl
           font-thin
           leading-[0.95]
           tracking-tight
           sm:text-4xl
           lg:text-5xl
         "
        >
          {t("headline")}
        </h1>

        <p className="text-[16px] font-medium uppercase tracking-[0.09em] text-white/90 sm:text-[18px]">
          {t("subhead")}
        </p>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-3">
          <input
            type="text"
            placeholder={t("fullName")}
            autoComplete="given-name"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className={inputClassName}
          />


          <Counter
            label={t("bedrooms")}
            value={form.bedrooms}
            min={1}
            max={8}
            onChange={(v) => setField("bedrooms", v)}
          />

          <Counter
            label={t("bathrooms")}
            value={form.bathrooms}
            min={1}
            max={6}
            onChange={(v) => setField("bathrooms", v)}
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          <input
            type="email"
            placeholder={t("email")}
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className={inputClassName}
          />

          <input
            type="tel"
            placeholder={t("phoneNumber")}
            autoComplete="tel"
            value={form.mobile}
            onChange={(e) => setField("mobile", e.target.value)}
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className={[
            "flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[14px] sm:h-14",
            "text-[16px] font-semibold uppercase tracking-[0.14em] text-white",
            "transition-all duration-200",
            isSuccess
              ? "bg-emerald-600"
              : "bg-sky-500 hover:bg-sky-600 active:scale-[0.99]",
            isLoading || isSuccess
              ? "cursor-not-allowed opacity-90"
              : "cursor-pointer",
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
              {t("submitting")}
            </>
          ) : isSuccess ? (
            <div className="flex items-center gap-2">
              <IconCheck />
              {t("success")}
            </div>
          ) : (
            <>
              <span>{t("submit")}</span>
              <IconArrow />
            </>
          )}
        </button>

        <p className="text-center text-sm font-medium text-white/80">
          {t("trustLine")}
        </p>
      </form>
    </div>
  );
}
