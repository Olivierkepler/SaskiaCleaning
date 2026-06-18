"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

type Message = {
  sender: "bot" | "user";
  text: string;
};

type EstimatorContext = {
  service?: string;
  location?: string;
  date?: string;
  frequency?: string;
  extras?: string[];
  estimateLow?: number;
  estimateMid?: number;
  estimateHigh?: number;
};

const QUICK_OPTIONS = [
  "Get a Quote",
  "Residential Cleaning",
  "Deep Cleaning",
  "Airbnb Turnover",
  "Referral Rewards",
];

const WELCOME_MESSAGE = `Hello 👋

I'm the Saskia Assistant.

I can help you with:

• Residential cleaning
• Deep cleaning
• Airbnb turnover
• Commercial cleaning
• Laundry services
• Referral rewards
• Getting a quote

How can I help you today?`;

const FALLBACK_BOT_REPLY =
  "Sorry, I'm having trouble responding right now. You can still request a quote using the booking form.";

/**
 * Sky-blue palette (Tailwind sky-500).
 */
const K = {
  blue: "#0ea5e9", // sky-500
  blueDark: "#0284c7", // sky-600
  blueLight: "#e0f2fe", // sky-100
  black: "#111111",
  white: "#ffffff",
  border: "#d6d7d9",
  bg: "#f1f1f1",
  botBubble: "#f1f1f1",
  text: "#212121",
  muted: "#5b616b",
  green: "#2e8540", // USCIS-style confirmation green
};

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "12px 16px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#9aa1a8",
            display: "inline-block",
            animation: "chatBounce 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

function Avatar({
  size = 36,
  showOnline = true,
}: {
  size?: number;
  showOnline?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      <img
        src="/images/Designer(14).png"
        alt="Saskia Assistant"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "center 20%",
          border: `2px solid ${K.white}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        }}
      />

      {showOnline && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: Math.max(10, size * 0.28),
            height: Math.max(10, size * 0.28),
            borderRadius: "50%",
            background: K.green,
            border: `2px solid ${K.white}`,
          }}
        />
      )}
    </div>
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: WELCOME_MESSAGE,
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [visibleViewport, setVisibleViewport] = useState<{
    height: number;
    bottom: number;
  } | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Holds the latest estimator selections (service, location, price, etc.)
  // so the assistant has context on the user's request without that
  // context ever appearing as a visible chat bubble. Updated every time
  // the "open-chatbot" event fires, so reopening the chat after changing
  // selections always carries the freshest state into the next message.
  const estimatorContextRef = useRef<EstimatorContext | null>(null);

  useEffect(() => {
    const handle = (e: Event) => {
      setIsOpen(true);

      const detail = (e as CustomEvent<EstimatorContext | undefined>).detail;
      if (detail) {
        estimatorContextRef.current = detail;
      }
    };

    window.addEventListener("open-chatbot", handle as EventListener);

    return () => {
      window.removeEventListener("open-chatbot", handle as EventListener);
    };
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handle);

    return () => {
      window.removeEventListener("keydown", handle);
    };
  }, []);

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
      const height = vv?.height ?? window.innerHeight;
      const offsetTop = vv?.offsetTop ?? 0;

      setVisibleViewport({
        height,
        bottom: Math.max(0, window.innerHeight - height - offsetTop),
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

  useEffect(() => {
    if (!visibleViewport) return;

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleViewport]);

  useEffect(() => {
    const syncKeyboardOpen = () => {
      if (window.innerWidth > 768) {
        setIsMobileKeyboardOpen(false);
        return;
      }

      const vv = window.visualViewport;
      const visibleHeight = vv?.height ?? window.innerHeight;
      const keyboardOpen = window.innerHeight - visibleHeight > 120;

      setIsMobileKeyboardOpen(keyboardOpen);
    };

    syncKeyboardOpen();

    const vv = window.visualViewport;

    vv?.addEventListener("resize", syncKeyboardOpen);
    vv?.addEventListener("scroll", syncKeyboardOpen);
    window.addEventListener("resize", syncKeyboardOpen);

    return () => {
      vv?.removeEventListener("resize", syncKeyboardOpen);
      vv?.removeEventListener("scroll", syncKeyboardOpen);
      window.removeEventListener("resize", syncKeyboardOpen);
    };
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setShowQuickOptions(false);

    const userMessage: Message = { sender: "user", text: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: estimatorContextRef.current ?? undefined,
        }),
      });

      const data = (await response.json()) as { reply?: string };
      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : FALLBACK_BOT_REPLY;

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: FALLBACK_BOT_REPLY },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const isMobileFullScreen = Boolean(visibleViewport);

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }

          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @keyframes chatFadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          [data-chatbot-input] {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div data-chatbot style={{ colorScheme: "light" }}>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[9997] bg-white md:hidden"
              aria-hidden="true"
            />

            <div
              style={{
                position: "fixed",
                zIndex: 9999,
                pointerEvents: "none",
                ...(visibleViewport
                  ? {
                      bottom: visibleViewport.bottom,
                      left: 0,
                      right: 0,
                      height: visibleViewport.height,
                      width: "100%",
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
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Saskia Assistant chat"
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: isMobileFullScreen ? "100%" : 450,
                  height: isMobileFullScreen ? visibleViewport?.height : 680,
                  maxHeight: isMobileFullScreen ? visibleViewport?.height : 720,
                  minHeight: isMobileFullScreen ? undefined : 650,
                  display: "flex",
                  flexDirection: "column",
                  background: K.white,
                  border: isMobileFullScreen ? "none" : `1px solid ${K.border}`,
                  borderRadius: isMobileFullScreen ? 0 : 16,
                  boxShadow: isMobileFullScreen
                    ? "none"
                    : "0 4px 14px rgba(17, 46, 81, 0.22)",
                  animation: "chatFadeUp 0.2s ease-out both",
                  pointerEvents: "auto",
                  overflow: "hidden",
                  margin: 0,
                }}
                className="md:mb-6 md:mr-6"
              >
                {!isMobileKeyboardOpen && (
                  <header
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "16px 18px",
                      background: K.blueDark,
                      borderBottom: `3px solid ${K.blue}`,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minWidth: 0,
                      }}
                    >
                      <Avatar size={44} />

                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily:
                              "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: K.white,
                            lineHeight: 1.3,
                            margin: 0,
                          }}
                        >
                          Saskia Assistant
                        </p>

                        <p
                          style={{
                            fontFamily:
                              "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
                            fontSize: 13,
                            fontWeight: 400,
                            color: "#cbd5e1",
                            margin: 0,
                            marginTop: 2,
                            lineHeight: 1.45,
                          }}
                        >
                          Ask about cleaning services, quotes, referrals, and
                          bookings.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close chat"
                      style={{
                        width: 36,
                        height: 36,
                        background: "transparent",
                        border: `1px solid rgba(255,255,255,0.35)`,
                        borderRadius: 10,
                        color: K.white,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background 0.15s, border-color 0.15s",
                      }}
                    >
                      <FaTimes size={14} />
                    </button>
                  </header>
                )}

                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    background: K.bg,
                    padding: "18px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    scrollbarWidth: "thin",
                    scrollbarColor: `${K.border} transparent`,
                  }}
                >
                  {showQuickOptions && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        paddingBottom: 4,
                      }}
                    >
                      {QUICK_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => sendMessage(opt)}
                          disabled={isTyping}
                          style={{
                            fontFamily:
                              "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "8px 14px",
                            border: `1px solid ${K.blue}`,
                            background: K.white,
                            color: K.blue,
                            cursor: isTyping ? "not-allowed" : "pointer",
                            borderRadius: 999,
                            transition: "all 0.15s",
                            opacity: isTyping ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (isTyping) return;
                            e.currentTarget.style.background = K.blue;
                            e.currentTarget.style.borderColor = K.blue;
                            e.currentTarget.style.color = K.white;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = K.white;
                            e.currentTarget.style.borderColor = K.blue;
                            e.currentTarget.style.color = K.blue;
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.sender === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "88%",
                          padding: "12px 16px",
                          borderRadius: 14,
                          fontFamily:
                            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
                          fontSize: 15,
                          lineHeight: 1.6,
                          fontWeight: 400,
                          whiteSpace: "pre-wrap",
                          ...(msg.sender === "user"
                            ? {
                                background: K.blue,
                                color: K.white,
                              }
                            : {
                                background: K.white,
                                color: K.text,
                                border: `1px solid ${K.border}`,
                              }),
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          background: K.white,
                          border: `1px solid ${K.border}`,
                          borderRadius: 14,
                        }}
                      >
                        <TypingDots />
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                <div
                  style={{
                    background: K.white,
                    borderTop: `1px solid ${K.border}`,
                    padding: "14px 16px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      border: `1px solid ${K.border}`,
                      background: K.white,
                      padding: "6px 6px 6px 14px",
                      borderRadius: 14,
                      minHeight: 52,
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      placeholder="Type your question..."
                      aria-label="Type your question"
                      disabled={isTyping}
                      style={{
                        flex: 1,
                        background: K.white,
                        colorScheme: "light",
                        border: "none",
                        outline: "none",
                        fontFamily:
                          "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
                        fontSize: 15,
                        fontWeight: 400,
                        color: K.text,
                        padding: "10px 0",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => sendMessage(input)}
                      disabled={isTyping || !input.trim()}
                      aria-label="Send message"
                      style={{
                        width: 40,
                        height: 40,
                        background:
                          isTyping || !input.trim() ? "#9aa1a8" : K.blue,
                        border: "none",
                        borderRadius: 10,
                        color: K.white,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor:
                          isTyping || !input.trim()
                            ? "not-allowed"
                            : "pointer",
                        flexShrink: 0,
                        transition: "background 0.15s ease",
                      }}
                    >
                      <FaPaperPlane size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Saskia Assistant chat"
            className="fixed bottom-6 right-6 z-[9998] flex items-center justify-center"
          >
            <div
              className="absolute right-[76px] top-1/2 hidden -translate-y-1/2 whitespace-nowrap px-4 py-2 shadow-lg md:block"
              style={{
                background: K.blueDark,
                borderRadius: 12,
              }}
            >
              <p className="text-sm font-semibold text-white">Need Help?</p>
              <p className="text-xs" style={{ color: "#cbd5e1" }}>
                Ask Saskia.
              </p>
            </div>

            <Avatar size={60} />
          </button>
        )}
      </div>
    </>
  );
}