"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaTimes, FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";

// ── Types ────────────────────────────────────────────────────────────────────
type Message = { sender: "bot" | "user"; text: string };

// ── Constants ────────────────────────────────────────────────────────────────
const QUICK_OPTIONS = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Airbnb Cleaning",
  "Laundry Services",
  "Get a Quote",
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const K = {
  blue:      "#0ea5e9",
  blueDark:  "#0284c7",
  blueLight: "#e0f2fe",
  black:     "#111111",
  white:     "#ffffff",
  border:    "#e5e5e5",
  bg:        "#fafafa",
  text:      "#111111",
  muted:     "#888888",
  green:     "#22c55e",
};

// ── Bot reply logic ───────────────────────────────────────────────────────────
function getBotReply(userText: string): string {
  const t = userText.toLowerCase();
  if (t.includes("quote") || t.includes("price") || t.includes("cost"))
    return "Please share your name, location, type of cleaning, number of rooms, and preferred date — I'll prepare your quote right away.";
  if (t.includes("residential"))
    return "Residential cleaning covers kitchens, bathrooms, bedrooms, floors, dusting, and a full home refresh. Would you prefer a standard clean or deep clean?";
  if (t.includes("commercial"))
    return "We clean offices, salons, studios, and small businesses across MA & RI. How often would you need service?";
  if (t.includes("airbnb"))
    return "Our Airbnb turnover includes cleaning, restocking, linen changes, and guest-ready staging. What city is the property in?";
  if (t.includes("laundry"))
    return "We offer wash-and-fold, linen service, and laundry bundled with cleaning. Which works best for you?";
  return "I can help with residential cleaning, commercial cleaning, Airbnb turnovers, laundry, or a custom quote. What would you like to explore?";
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#ccc",
            display: "inline-block",
            animation: "chatBounce 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ size = 36 }: { size?: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
      <img
        src="/images/Designer(14).png"
        alt="Saskia Assistant"
        style={{
          width: size, height: size,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "center 20%",
          border: `2px solid ${K.white}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
      />
      <span style={{
        position: "absolute", bottom: 1, right: 1,
        width: size * 0.28, height: size * 0.28,
        borderRadius: "50%",
        background: K.green,
        border: `2px solid ${K.white}`,
      }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen,           setIsOpen]           = useState(false);
  const [input,            setInput]            = useState("");
  const [isTyping,         setIsTyping]         = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const [messages,         setMessages]         = useState<Message[]>([
    { sender: "bot", text: "Hi, welcome to Saskia Cleaning ✨ How can I help you today?" },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── CHANGE 1: `top` instead of `bottom` in state shape ───────────────────
  // `top` = visualViewport.offsetTop = distance from layout-viewport top to
  // the visible-viewport top. We pin the panel with `top + bottom: 0` so the
  // browser resolves height purely via CSS geometry — no JS arithmetic gap.
  const [visibleViewport, setVisibleViewport] = useState<{
    height: number; // visible area height (shrinks when keyboard opens)
    top: number;    // layout-top offset of the visible viewport
  } | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // Listen for external open event
  useEffect(() => {
    const handle = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handle);
    return () => window.removeEventListener("open-chatbot", handle);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // ── CHANGE 2: syncVisibleViewport stores `top` instead of `bottom` ────────
  useLayoutEffect(() => {
    if (!isOpen) {
      setVisibleViewport(null);
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 768px)");

    const syncVisibleViewport = () => {
      if (!mobileQuery.matches) {
        setVisibleViewport(null);
        return;
      }

      const vv = window.visualViewport;
      // visualViewport.height  = visible area height after keyboard shrinks it.
      // visualViewport.offsetTop = scroll offset of visual viewport within the
      //   layout viewport (non-zero on some Android browsers when the page
      //   scrolls up to keep the focused input visible).
      const height    = vv?.height    ?? window.innerHeight;
      const offsetTop = vv?.offsetTop ?? 0;

      setVisibleViewport({
        height,
        // top: where the visible area starts inside the layout viewport.
        // Panel will use `top: offsetTop` + `bottom: 0` — browser handles
        // all sizing, no gap from mismatched reference frames.
        top: offsetTop,
      });
    };

    syncVisibleViewport();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncVisibleViewport);
    vv?.addEventListener("scroll", syncVisibleViewport);

    return () => {
      vv?.removeEventListener("resize", syncVisibleViewport);
      vv?.removeEventListener("scroll", syncVisibleViewport);
    };
  }, [isOpen]);

  // Keep latest message in view when keyboard opens / closes
  useEffect(() => {
    if (!visibleViewport) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleViewport]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setShowQuickOptions(false);
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: getBotReply(text) }]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <>
      {/* ── CHANGE 4: CSS keyframes + 100dvh mobile fallback ─────────────────
          100dvh vs 100vh:
          - 100vh on iOS Safari is frozen to the *initial* viewport height and
            does not shrink when the software keyboard opens, causing overflow
            or a gap below the input.
          - 100dvh (dynamic viewport height) updates in real time as the
            keyboard appears/disappears, matching the Visual Viewport API.
          - Used as a CSS-only fallback on [data-chatbot-panel-mobile] so
            there is no visible flash before the first JS state update fires.
      ──────────────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(14,165,233,0); }
        }
        @media (max-width: 768px) {
          /* Prevent iOS Safari auto-zoom on inputs smaller than 16px */
          [data-chatbot-input] {
            font-size: 16px !important;
          }
          /* dvh fallback: correct visible-area height before JS fires.
             Overridden immediately once visibleViewport state populates. */
          [data-chatbot-panel-mobile] {
            height: 100dvh;
            max-height: 100dvh;
          }
        }
      `}</style>

      <div data-chatbot>

        {/* ── Chat window ──────────────────────────────────────────────────── */}
        {isOpen && (

          // ── CHANGE 3a: outer wrapper ────────────────────────────────────
          // Mobile: `inset: 0` makes the wrapper a full-screen fixed layer.
          // The panel inside is then positioned with top + bottom: 0, so
          // the browser resolves its height via CSS box-model geometry.
          // Desktop: unchanged — bottom-right flex anchor.
          <div
            style={{
              position: "fixed",
              zIndex: 9999,
              pointerEvents: "none",
              ...(visibleViewport
                ? {
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                  }
                : {
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    bottom: 0,
                    right: 0,
                  }),
            }}
          >
            {/* Backdrop (mobile only) */}
            <div
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.35)",
                pointerEvents: "auto",
              }}
              className="md:hidden"
            />

            {/* ── CHANGE 3b: panel — top + bottom:0 instead of height ─────────
                WHY top + bottom instead of height:
                The previous code set both `bottom: layoutViewportHeight - vpHeight`
                and `height: vpHeight`. On some browsers these are measured from
                different reference frames (layout vs visual viewport), so their
                sum leaves a gap between the input and the keyboard.

                Setting `top: visualViewport.offsetTop` and `bottom: 0` tells
                the browser: "start here, end at the layout-bottom edge." Because
                the software keyboard lives *outside* the layout viewport, bottom:0
                lands flush against the top of the keyboard automatically.

                Desktop: position:relative inside the flex wrapper — unchanged.
            ──────────────────────────────────────────────────────────────── */}
            <div
              {...(visibleViewport ? { "data-chatbot-panel-mobile": "" } : {})}
              style={{
                ...(visibleViewport
                  ? {
                      position: "fixed" as const,
                      // Pin to where the visual viewport starts (handles Android
                      // browsers that scroll the page up when input is focused).
                      top: visibleViewport.top,
                      // bottom:0 = flush with layout-viewport bottom edge =
                      // flush against the top of the software keyboard.
                      bottom: 0,
                      left: 0,
                      right: 0,
                      // Explicit px height as JS override; dvh CSS above covers
                      // the flash window before the first state update.
                      height: `${visibleViewport.height}px`,
                      maxHeight: `${visibleViewport.height}px`,
                    }
                  : {
                      position: "relative" as const,
                      width: "100%",
                      maxWidth: 440,
                    }),
                display: "flex",
                flexDirection: "column",
                background: K.white,
                border: visibleViewport ? "none" : `1.5px solid ${K.border}`,
                borderRadius: visibleViewport ? 0 : "10px",
                boxShadow: visibleViewport ? "none" : "0 8px 40px rgba(0,0,0,0.16)",
                animation: "chatSlideUp 0.22s ease-out both",
                pointerEvents: "auto",
                overflow: "hidden",
                margin: 0,
              }}
              className="md:bottom-[88px] md:right-6 md:h-auto md:max-h-[680px] md:max-w-[440px] md:rounded-[10px] md:border md:shadow-2xl"
            >

              {/* Header */}
              <div style={{ background: K.blue, padding: "14px 16px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar size={48} />
                    <div>
                      <p style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontSize: 15, fontWeight: 700,
                        color: K.white, lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                      }}>
                        Saskia Assistant
                      </p>
                      <p style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 11, fontWeight: 600,
                        color: "rgba(255,255,255,0.75)",
                        marginTop: 3, letterSpacing: "0.02em",
                      }}>
                        Online · Usually replies quickly
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                    style={{
                      width: 32, height: 32,
                      background: "rgba(255,255,255,0.15)",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      borderRadius: "10px",
                      color: K.white,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              {/* Messages — flex:1 + minHeight:0 makes this the only scrollable
                  region. The panel height is fully owned by top+bottom on mobile,
                  so this div expands to fill all space between header and footer. */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                background: K.bg,
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                scrollbarWidth: "thin",
                scrollbarColor: `${K.border} transparent`,
              }}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 8,
                      justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.sender === "bot" && <Avatar size={30} />}
                    <div style={{
                      maxWidth: "76%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 13, lineHeight: 1.55, fontWeight: 500,
                      ...(msg.sender === "user"
                        ? {
                            background: K.blue,
                            color: K.white,
                            borderLeft: `3px solid ${K.blueDark}`,
                          }
                        : {
                            background: K.white,
                            color: K.text,
                            border: `1px solid ${K.border}`,
                            borderLeft: `3px solid ${K.blue}`,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          }),
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                    <Avatar size={30} />
                    <div style={{
                      background: K.white,
                      border: `1px solid ${K.border}`,
                      borderLeft: `3px solid ${K.blue}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Footer — position:sticky + bottom:0 keeps the input row pinned
                  to the bottom of the panel. On mobile the panel is already flush
                  against the keyboard, so this just prevents the message list
                  from ever pushing the footer off-screen. */}
              <div style={{
                position: "sticky",
                bottom: 0,
                zIndex: 2,
                background: K.white,
                borderTop: `1px solid ${K.border}`,
                padding: "12px 14px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>

                {/* Quick options — desktop only */}
                <div
                  className="hidden md:block"
                  style={{
                    border: `1px solid ${K.border}`,
                    background: K.white,
                    borderRadius: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowQuickOptions((v) => !v)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      borderBottom: showQuickOptions ? `1px solid ${K.border}` : "none",
                    }}
                  >
                    <span style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.13em",
                      color: K.black,
                    }}>
                      Suggested Services
                    </span>
                    <span style={{ color: K.muted }}>
                      {showQuickOptions ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                    </span>
                  </button>

                  <div style={{
                    display: "grid",
                    gridTemplateRows: showQuickOptions ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.22s ease",
                    overflow: "hidden",
                  }}>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px" }}>
                        {QUICK_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => sendMessage(opt)}
                            style={{
                              fontFamily: "Arial, Helvetica, sans-serif",
                              fontSize: 10, fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              padding: "6px 12px",
                              border: `1.5px solid ${K.border}`,
                              background: K.white,
                              color: K.text,
                              cursor: "pointer",
                              borderRadius: "10px",
                              transition: "all 0.13s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = K.blue;
                              e.currentTarget.style.color = K.white;
                              e.currentTarget.style.borderColor = K.blue;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = K.white;
                              e.currentTarget.style.color = K.text;
                              e.currentTarget.style.borderColor = K.border;
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: `1.5px solid ${K.border}`,
                    background: K.white,
                    padding: "4px 4px 4px 12px",
                    borderRadius: "10px",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocusCapture={(e) => {
                    e.currentTarget.style.borderColor = K.blue;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${K.blueLight}`;
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = K.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <input
                    ref={inputRef}
                    data-chatbot-input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                    placeholder="Type your message…"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 13, // 16px override applied on mobile via CSS (prevents iOS zoom)
                      fontWeight: 500,
                      color: K.text,
                      padding: "8px 0",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => sendMessage(input)}
                    aria-label="Send message"
                    style={{
                      width: 36, height: 36,
                      background: K.blue,
                      border: "none",
                      borderRadius: "10px",
                      color: K.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "background 0.15s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = K.blueDark;
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = K.blue;
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <FaPaperPlane size={12} />
                  </button>
                </div>

                {/* Branding */}
                <p style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 9, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  color: K.muted,
                  textAlign: "center",
                  margin: 0,
                }}>
                  Saskia Cleaning · MA & RI
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── FAB trigger ──────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close chat" : "Chat with us"}
          className="fixed bottom-6 right-6 z-[9998] flex items-center justify-center"
        >
          {!isOpen && (
            <div className="absolute right-[76px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-white px-4 py-2 shadow-lg ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-900">Need help?</p>
              <p className="text-xs text-slate-500">Chat with Saskia.</p>
            </div>
          )}

          {isOpen ? (
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-sky-500 text-white shadow-lg">
              <FaTimes size={20} />
            </div>
          ) : (
            <Avatar size={60} />
          )}
        </button>

      </div>
    </>
  );
}