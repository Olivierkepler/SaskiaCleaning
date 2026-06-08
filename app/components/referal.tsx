"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmitStatus = "idle" | "loading" | "success";

interface ReferralAdProps {
  onClose?: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Sparkle = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={style}>
    <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

const IconGift = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13h20v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V13z" />
    <path d="M2 8h24v5H2z" />
    <path d="M14 8V25M14 8C14 8 14 4 10 4S6 8 14 8zM14 8C14 8 14 4 18 4s4 4-4 4z" />
  </svg>
);

const IconClose = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);

const IconArrow = () => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M8.5 4L13 8l-4.5 4" />
  </svg>
);

const IconCopy = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="8" height="8" rx="1" />
    <path d="M10 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
  </svg>
);

const IconCheckSmall = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7.5l3 3 6-6" />
  </svg>
);

const IconPhone = () => (
  <svg width={13} height={13} viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 1h3l1.5 3.5-2 1.2a7 7 0 0 0 3.3 3.3l1.2-2L12.5 8.5V11.5A1 1 0 0 1 11.5 12.5C5.5 12 1 6.5 0.5 1.5A1 1 0 0 1 1.5 0.5H2Z" />
  </svg>
);

const IconSMS = () => (
  <svg width={13} height={13} viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4l-3 3V2a1 1 0 0 1 1-1z" />
    <path d="M4 5h5M4 8h3" />
  </svg>
);

// ─── Coupon code display ──────────────────────────────────────────────────────

const COUPON_CODE = "SASKIA25";

function CouponCode({ dark = false }: { dark?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`rounded-xl border-2 border-dashed ${dark ? "border-white/30 bg-white/10" : "border-sky-200 bg-sky-50"} p-3`}>
      <p className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${dark ? "text-white/60" : "text-sky-400"}`}>
        Your discount code
      </p>
      <div className="flex items-center gap-2">
        <span
          className={`flex-1 font-mono text-[22px] font-black tracking-[0.18em] ${dark ? "text-white" : "text-sky-600"}`}
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {COUPON_CODE}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all active:scale-95 ${
            copied
              ? "bg-emerald-500 text-white"
              : dark
              ? "bg-white/20 text-white hover:bg-white/30"
              : "bg-sky-500 text-white hover:bg-sky-600"
          }`}
        >
          {copied ? <><IconCheckSmall /> Copied!</> : <><IconCopy /> Copy</>}
        </button>
      </div>
      <p className={`mt-2 text-[11px] ${dark ? "text-white/50" : "text-slate-400"}`}>
        Valid 30 days · mention code when booking
      </p>
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({ phone, dark = false }: { phone: string; dark?: boolean }) {
  return (
    <div className="space-y-3">
      {/* Coupon code — the most important element */}
      <CouponCode dark={dark} />

      {/* Confirmation rows */}
      <div className={`space-y-2 rounded-xl ${dark ? "bg-white/10" : "bg-slate-50"} p-3`}>
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${dark ? "text-white/50" : "text-slate-400"}`}>
          Also sent to {phone}
        </p>
        <div className={`flex items-start gap-2 text-[12px] ${dark ? "text-white/80" : "text-slate-600"}`}>
          <span className="mt-0.5 shrink-0 text-emerald-400"><IconSMS /></span>
          SMS with your code + booking instructions
        </div>
        <div className={`flex items-start gap-2 text-[12px] ${dark ? "text-white/80" : "text-slate-600"}`}>
          <span className="mt-0.5 shrink-0 text-sky-400"><IconPhone /></span>
          Call us at{" "}
          <a href="tel:+14135550100" className={`font-semibold underline underline-offset-2 ${dark ? "text-white" : "text-sky-600"}`}>
            (413) 555-0100
          </a>
          {" "}to book
        </div>
      </div>

      <p className={`text-center text-[11px] ${dark ? "text-white/40" : "text-slate-400"}`}>
        Screenshot this screen to save your code 📸
      </p>
    </div>
  );
}

// ─── Shared form ──────────────────────────────────────────────────────────────

function ReferralForm({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  };

  if (status === "success") {
    return <SuccessState phone={phone} dark={dark} />;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${compact ? "flex-row" : "flex-col sm:flex-row"}`}>
      <input
        type="tel"
        required
        placeholder="Your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={`
          flex-1 rounded-xl border px-4 text-[14px] outline-none transition-all
          placeholder:text-slate-400 focus:ring-2
          ${dark
            ? "border-white/20 bg-white/15 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20"
            : "border-slate-200 bg-white text-slate-800 focus:border-sky-400 focus:ring-sky-100"
          }
          ${compact ? "h-10" : "h-12"}
        `}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={`
          flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold
          text-white transition-all active:scale-[0.97] disabled:opacity-70
          ${dark
            ? "bg-white/20 hover:bg-white/30"
            : "bg-sky-500 hover:bg-sky-600 hover:shadow-[0_4px_16px_rgba(14,165,233,0.4)]"
          }
          ${compact ? "h-10 px-4 text-[13px]" : "h-12 px-5 text-[14px]"}
        `}
      >
        {status === "loading" ? (
          <svg className="animate-spin" width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
            <path d="M8 1.5a6.5 6.5 0 1 1-4.6 1.9" />
          </svg>
        ) : (
          <>Claim $25 <IconArrow /></>
        )}
      </button>
    </form>
  );
}

// ─── Variant A: Banner ────────────────────────────────────────────────────────

function BannerAd({ onClose }: ReferralAdProps) {
  const [visible, setVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  useEffect(() => { setTimeout(() => setVisible(true), 300); }, []);

  const close = () => { setVisible(false); setTimeout(() => onClose?.(), 350); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-400 p-[1.5px] shadow-xl shadow-sky-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        transition: "opacity 400ms ease, transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-[14px] bg-white px-6 py-5 sm:flex-row sm:items-start">
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,#0ea5e9 0,#0ea5e9 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }}
        />

        {/* Badge */}
        <div className="flex shrink-0 items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-200">
            <IconGift />
            <Sparkle size={12} style={{ position: "absolute", top: -4, right: -4, color: "#f59e0b" }} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black leading-none text-sky-500" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}>$25</span>
              <span className="text-[13px] font-semibold uppercase tracking-wider text-sky-400">off</span>
            </div>
            <p className="text-[12px] font-medium text-slate-500">your first cleaning</p>
          </div>
        </div>

        <div className="hidden h-auto w-px self-stretch bg-slate-100 sm:block" />

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-slate-800 leading-tight">Refer a friend → both of you save</p>
          <p className="mt-0.5 text-[13px] text-slate-500">Share your number — get code <strong className="text-sky-600 font-mono">SASKIA25</strong> instantly by SMS.</p>
        </div>

        {/* Form or success */}
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          {status === "success" ? (
            <SuccessState phone={phone} />
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="tel" required placeholder="Your phone"
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <button type="submit" disabled={status === "loading"}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-sky-500 px-4 text-[13px] font-semibold text-white transition-all hover:bg-sky-600 disabled:opacity-70">
                {status === "loading"
                  ? <svg className="animate-spin" width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round"><path d="M7 1.5a5.5 5.5 0 1 1-3.9 1.6" /></svg>
                  : <>Claim <IconArrow /></>}
              </button>
            </form>
          )}
        </div>

        {onClose && (
          <button type="button" onClick={close} aria-label="Close"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <IconClose />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Variant B: Popup ─────────────────────────────────────────────────────────

function PopupAd({ onClose }: ReferralAdProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 300); }, []);
  const close = () => { setVisible(false); setTimeout(() => onClose?.(), 350); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
      onClick={close}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(20px)", transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Hero */}
        <div className="relative flex flex-col items-center overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 px-8 pt-10 pb-8 text-center text-white">
          {[
            { top: "12%", left: "8%", size: 20, delay: "0s" },
            { top: "18%", right: "10%", size: 14, delay: "0.3s" },
            { bottom: "20%", left: "15%", size: 12, delay: "0.6s" },
            { bottom: "28%", right: "8%", size: 18, delay: "0.9s" },
          ].map((s, i) => (
            <div key={i} className="absolute animate-pulse text-white/40" style={{ top: s.top, left: s.left, right: (s as any).right, bottom: (s as any).bottom, animationDelay: s.delay }}>
              <Sparkle size={s.size} />
            </div>
          ))}
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/20 text-white shadow-lg backdrop-blur-sm">
            <IconGift size={40} />
          </div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sky-100 mb-1">Referral reward</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-7xl font-black leading-none" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}>$25</span>
            <div className="text-left">
              <p className="text-lg font-bold leading-none">OFF</p>
              <p className="text-[12px] text-sky-100 leading-tight">your first<br />cleaning</p>
            </div>
          </div>
          <p className="text-[13px] text-sky-100 leading-relaxed max-w-xs">
            Refer a friend to Saskia Cleaning — you both get $25 off your next booking.
          </p>
        </div>

        {/* Form + success */}
        <div className="px-8 py-6 space-y-4">
          <ReferralForm dark={false} />
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            {["No spam", "No commitment", "MA & RI only"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <svg width={8} height={8} viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#22c55e" /></svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        <button type="button" onClick={close} aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30">
          <IconClose />
        </button>
      </div>
    </div>
  );
}

// ─── Variant C: Card ──────────────────────────────────────────────────────────

function CardAd() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 300); }, []);

  return (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-xl"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 400ms ease, transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* Top */}
      <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-sky-600 to-cyan-400 px-5 py-4 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-100">Referral offer</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-4xl font-black leading-none" style={{ fontFamily: "'Georgia', serif" }}>$25</span>
            <span className="text-[13px] font-semibold">off your<br />first clean</span>
          </div>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white">
          <IconGift />
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4 space-y-3">
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Refer a friend to Saskia Cleaning — when they book, you both save $25. No catch.
        </p>
        <ReferralForm compact dark={false} />
        <p className="text-center text-[11px] text-slate-400">Serving Massachusetts & Rhode Island</p>
      </div>
    </div>
  );
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export default function ReferralAdShowcase() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-8"
      style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="mx-auto max-w-3xl space-y-10">

        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-500 mb-2">Saskia Cleaning · Ad variants</p>
          <h1 className="text-3xl text-slate-800" style={{ fontFamily: "'Georgia', serif", fontWeight: 400 }}>
            $25 Referral Discount
          </h1>
          <p className="mt-2 text-[14px] text-slate-500">Submit your phone to see the coupon code appear on screen.</p>
        </div>

        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Variant A — Horizontal banner</p>
          <BannerAd />
        </section>

        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Variant B — Popup modal</p>
          <button type="button" onClick={() => setShowPopup(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 text-[14px] font-semibold text-sky-600 transition-colors hover:bg-sky-100">
            <IconGift size={20} /> Click to preview popup →
          </button>
          {showPopup && <PopupAd onClose={() => setShowPopup(false)} />}
        </section>

        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Variant C — Compact card</p>
          <div className="flex justify-center"><CardAd /></div>
        </section>

      </div>
    </div>
  );
}