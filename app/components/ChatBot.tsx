"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaTimes, FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";

type Message = { sender: "bot" | "user"; text: string };

const QUICK_OPTIONS = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Airbnb Cleaning",
  "Laundry Services",
  "Get a Quote",
];

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

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#ccc", display: "inline-block",
            animation: "chatBounce 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

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

export default function ChatBot() {
  const [isOpen,           setIsOpen]           = useState(false);
  const [input,            setInput]            = useState("");
  const [isTyping,         setIsTyping]         = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const [messages,         setMessages]         = useState<Message[]>([
    { sender: "bot", text: "Hi, welcome to Saskia Cleaning ✨ How can I help you today?" },
  ]);

  // ── Viewport tracking ──────────────────────────────────────────────────────
  // On mobile, visualViewport shrinks when the software keyboard opens.
  // We track its height and offsetTop so the panel fills exactly the visible area
  // and the input row sits flush against the top of the keyboard.
  const [vvHeight, setVvHeight] = useState<number | null>(null);
  const [vvBottom, setVvBottom] = useState<number>(0); // distance from layout-bottom to vv-bottom

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, vvHeight]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // External open event
  useEffect(() => {
    const h = () => setIsOpen(true);
    window.addEventListener("open-chatbot", h);
    return () => window.removeEventListener("open-chatbot", h);
  }, []);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── visualViewport sync ───────────────────────────────────────────────────
  // Only activate on mobile (≤ 768 px). On desktop we use fixed positioning relative
  // to the FAB instead, so no viewport math is needed.
  useLayoutEffect(() => {
    if (!isOpen) {
      setVvHeight(null);
      setVvBottom(0);
      return;
    }

    const mq = window.matchMedia("(max-width: 768px)");

    const sync = () => {
      if (!mq.matches) {
        setVvHeight(null);
        setVvBottom(0);
        return;
      }
      const vv = window.visualViewport;
      if (!vv) return;

      // How far the visible viewport's bottom edge is from the layout viewport's bottom edge.
      // When the keyboard is hidden this is 0. When the keyboard is shown this equals the keyboard height.
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;

      setVvHeight(vv.height);
      setVvBottom(Math.max(0, keyboardHeight));
    };

    sync();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    mq.addEventListener("change", sync);

    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      mq.removeEventListener("change", sync);
    };
  }, [isOpen]);

  const isMobileLayout = vvHeight !== null;

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

  // ── Panel geometry ─────────────────────────────────────────────────────────
  // Mobile: panel is anchored to the bottom of the VISIBLE viewport (above keyboard).
  //   bottom = keyboardHeight (vvBottom), height = vvHeight.
  // Desktop: panel sits 88 px above the FAB (bottom-[88px] right-6).
  const panelStyle: React.CSSProperties = isMobileLayout
    ? {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: vvBottom,          // flush with keyboard top
        height: vvHeight!,         // fill exactly the visible area
        maxHeight: vvHeight!,
        width: "100%",
        maxWidth: "100%",
        borderRadius: 0,
        border: "none",
        boxShadow: "none",
      }
    : {
        position: "fixed",
        right: 24,
        bottom: 88,                // 60px FAB + 24px gap + 4px breathing room
        width: 440,
        maxWidth: "calc(100vw - 48px)",
        height: "auto",
        maxHeight: "min(680px, calc(100vh - 110px))",
        borderRadius: 10,
        border: `1.5px solid ${K.border}`,
        boxShadow: "0 8px 40px rgba(0,0,0,0.16)",
      };

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        /* Prevent iOS Safari auto-zoom on focus (inputs < 16px trigger it) */
        @media (max-width: 768px) {
          [data-chatbot-input] { font-size: 16px !important; }
        }
      `}</style>

      <div data-chatbot>

        {/* ── Mobile backdrop ───────────────────────────────────────────── */}
        {isOpen && isMobileLayout && (
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "rgba(0,0,0,0.35)",
            }}
          />
        )}

        {/* ── Chat panel ───────────────────────────────────────────────── */}
        {isOpen && (
          <div
            style={{
              ...panelStyle,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              background: K.white,
              overflow: "hidden",
              animation: "chatSlideUp 0.22s ease-out both",
            }}
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
                      color: K.white, lineHeight: 1.2, letterSpacing: "-0.01em",
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
                    borderRadius: 10,
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

            {/* Messages — flex: 1 + minHeight: 0 lets this shrink when keyboard opens */}
            <div style={{
              flex: 1,
              minHeight: 0,          // ← critical: allows the flex child to shrink below its content size
              overflowY: "auto",
              background: K.bg,
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              scrollbarWidth: "thin",
              scrollbarColor: `${K.border} transparent`,
              WebkitOverflowScrolling: "touch", // smooth momentum scroll on iOS
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
                    borderRadius: 10,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 13, lineHeight: 1.55, fontWeight: 500,
                    ...(msg.sender === "user"
                      ? { background: K.blue, color: K.white, borderLeft: `3px solid ${K.blueDark}` }
                      : { background: K.white, color: K.text, border: `1px solid ${K.border}`, borderLeft: `3px solid ${K.blue}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                    ),
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <Avatar size={30} />
                  <div style={{
                    background: K.white, border: `1px solid ${K.border}`,
                    borderLeft: `3px solid ${K.blue}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    borderRadius: 10,
                  }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Footer — flexShrink: 0 keeps it anchored at the bottom, never scrolls away */}
            <div style={{
              flexShrink: 0,         // ← never shrink; the message area absorbs all compression
              background: K.white,
              borderTop: `1px solid ${K.border}`,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>

              {/* Quick options — hidden on mobile to save vertical space */}
              {!isMobileLayout && (
                <div style={{ border: `1px solid ${K.border}`, background: K.white, borderRadius: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowQuickOptions((v) => !v)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      justifyContent: "space-between", padding: "9px 12px",
                      background: "none", border: "none", cursor: "pointer",
                      borderBottom: showQuickOptions ? `1px solid ${K.border}` : "none",
                    }}
                  >
                    <span style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.13em", color: K.black,
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
                              letterSpacing: "0.08em", textTransform: "uppercase",
                              padding: "6px 12px",
                              border: `1.5px solid ${K.border}`,
                              background: K.white, color: K.text,
                              cursor: "pointer", borderRadius: 10,
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
              )}

              {/* Input row */}
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  border: `1.5px solid ${K.border}`,
                  background: K.white,
                  padding: "4px 4px 4px 12px",
                  borderRadius: 10,
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
                    flex: 1, background: "transparent",
                    border: "none", outline: "none",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 13, fontWeight: 500, color: K.text,
                    padding: "8px 0",
                  }}
                />
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  aria-label="Send message"
                  style={{
                    width: 36, height: 36,
                    background: K.blue, border: "none", borderRadius: 10,
                    color: K.white,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", flexShrink: 0,
                    transition: "background 0.15s, transform 0.15s",
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
                color: K.muted, textAlign: "center", margin: 0,
              }}>
                Saskia Cleaning · MA & RI
              </p>
            </div>
          </div>
        )}

        {/* ── FAB ──────────────────────────────────────────────────────── */}
        {/* Kept in its own stacking context, completely separate from the panel,
            so its fixed positioning never interferes with the panel's geometry. */}
        <div style={{
          position: "fixed",
          bottom: 24, right: 24,
          zIndex: 9998,          // one layer below the panel (9999)
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          {/* Tooltip bubble — only when chat is closed */}
          {!isOpen && (
            <div style={{
              background: K.white,
              border: `1px solid ${K.border}`,
              borderRadius: 12,
              padding: "8px 14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              lineHeight: 1.4,
              pointerEvents: "none",
            }}>
              <p style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, fontWeight: 700, color: K.black, margin: 0 }}>
                Need help?
              </p>
              <p style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, color: K.muted, margin: 0 }}>
                Chat with Saskia.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close chat" : "Chat with us"}
            style={{
              width: 60, height: 60,
              border: "none", cursor: "pointer", padding: 0,
              borderRadius: "50%",
              background: isOpen ? K.blue : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              transition: "background 0.18s, transform 0.18s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {isOpen
              ? <FaTimes size={20} color={K.white} />
              : <Avatar size={60} />
            }
          </button>
        </div>

      </div>
    </>
  );
}