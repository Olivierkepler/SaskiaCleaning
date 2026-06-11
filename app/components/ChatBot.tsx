"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaPaperPlane,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import WhiteOverlay from "./WhiteOverlay";

type Message = {
  sender: "bot" | "user";
  text: string;
};

const QUICK_OPTIONS = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Airbnb Cleaning",
  "Laundry Services",
  "Get a Quote",
];

const K = {
  blue: "#0ea5e9",
  blueDark: "#0284c7",
  blueLight: "#e0f2fe",
  black: "#111111",
  white: "#ffffff",
  border: "#e5e5e5",
  bg: "#fafafa",
  text: "#111111",
  muted: "#888888",
  green: "#22c55e",
};

function getBotReply(userText: string): string {
  const t = userText.toLowerCase();

  if (t.includes("quote") || t.includes("price") || t.includes("cost")) {
    return "Please share your name, location, type of cleaning, number of rooms, and preferred date — I'll prepare your quote right away.";
  }

  if (t.includes("residential")) {
    return "Residential cleaning covers kitchens, bathrooms, bedrooms, floors, dusting, and a full home refresh. Would you prefer a standard clean or deep clean?";
  }

  if (t.includes("commercial")) {
    return "We clean offices, salons, studios, and small businesses across MA & RI. How often would you need service?";
  }

  if (t.includes("airbnb")) {
    return "Our Airbnb turnover includes cleaning, restocking, linen changes, and guest-ready staging. What city is the property in?";
  }

  if (t.includes("laundry")) {
    return "We offer wash-and-fold, linen service, and laundry bundled with cleaning. Which works best for you?";
  }

  return "I can help with residential cleaning, commercial cleaning, Airbnb turnovers, laundry, or a custom quote. What would you like to explore?";
}

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
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

function Avatar({ size = 36 }: { size?: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: size, height: size }}>
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
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
      />

      <span
        style={{
          position: "absolute",
          bottom: 1,
          right: 1,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: "50%",
          background: K.green,
          border: `2px solid ${K.white}`,
        }}
      />
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
      text: "Hi, welcome to Saskia Cleaning ✨ How can I help you today?",
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

  useEffect(() => {
    const handle = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handle);

    return () => {
      window.removeEventListener("open-chatbot", handle);
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    setShowQuickOptions(false);
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: getBotReply(text),
        },
      ]);

      setIsTyping(false);
    }, 750);
  };

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }

          30% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }

        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
            <WhiteOverlay />

            <div
              style={{
                position: "fixed",
                zIndex: 10000,
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
              className="md:h-[90%]"
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: visibleViewport ? "100%" : 440,
                  height: visibleViewport ? visibleViewport.height : "100%",
                  maxHeight: visibleViewport ? visibleViewport.height : "100%",
                  display: "flex",
                  flexDirection: "column",
                  background: K.white,
                  border: visibleViewport ? "none" : `1.5px solid ${K.border}`,
                  borderRadius: visibleViewport ? 0 : "10px",
                  boxShadow: visibleViewport
                    ? "none"
                    : "0 8px 40px rgba(0,0,0,0.16)",
                  animation: "chatSlideUp 0.22s ease-out both",
                  pointerEvents: "auto",
                  overflow: "hidden",
                  margin: 0,
                }}
                className="bottom-0 md:bottom-[88px] md:right-6 md:h-auto md:max-h-[680px] md:max-w-[440px] md:rounded-[10px] md:border md:shadow-2xl"
              >
                {!isMobileKeyboardOpen && (
                  <div
                    style={{
                      background: K.blue,
                      padding: "14px 16px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar size={48} />

                        <div>
                          <p
                            style={{
                              fontFamily: "Georgia, 'Times New Roman', serif",
                              fontSize: 15,
                              fontWeight: 700,
                              color: K.white,
                              lineHeight: 1.2,
                              letterSpacing: "-0.01em",
                              margin: 0,
                            }}
                          >
                            Saskia Assistant
                          </p>

                          <p
                            style={{
                              fontFamily: "Arial, Helvetica, sans-serif",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.75)",
                              margin: 0,
                              marginTop: 3,
                              letterSpacing: "0.02em",
                            }}
                          >
                            Online · Usually replies quickly
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                        style={{
                          width: 32,
                          height: 32,
                          background: "rgba(255,255,255,0.15)",
                          border: "1.5px solid rgba(255,255,255,0.3)",
                          borderRadius: "10px",
                          color: K.white,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    background: K.bg,
                    padding: isMobileKeyboardOpen
                      ? "20px 16px 20px"
                      : "20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    scrollbarWidth: "thin",
                    scrollbarColor: `${K.border} transparent`,
                  }}
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 8,
                        justifyContent:
                          msg.sender === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      {msg.sender === "bot" && <Avatar size={30} />}

                      <div
                        style={{
                          maxWidth: "76%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          fontSize: 18,
                          lineHeight: 1.55,
                          fontWeight: 500,
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
                        alignItems: "flex-end",
                        gap: 8,
                      }}
                    >
                      <Avatar size={30} />

                      <div
                        style={{
                          background: K.white,
                          border: `1px solid ${K.border}`,
                          borderLeft: `3px solid ${K.blue}`,
                          borderRadius: "10px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
                  }}
                >
                  <div
                    className="hidden md:block"
                    style={{
                      border: `1px solid ${K.border}`,
                      background: K.white,
                      borderRadius: "10px",
                      overflow: "hidden",
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
                        borderBottom: showQuickOptions
                          ? `1px solid ${K.border}`
                          : "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Arial, Helvetica, sans-serif",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.13em",
                          color: K.black,
                        }}
                      >
                        Suggested Services
                      </span>

                      <span style={{ color: K.muted }}>
                        {showQuickOptions ? (
                          <FaChevronUp size={11} />
                        ) : (
                          <FaChevronDown size={11} />
                        )}
                      </span>
                    </button>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateRows: showQuickOptions ? "1fr" : "0fr",
                        transition: "grid-template-rows 0.22s ease",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ overflow: "hidden" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                            padding: "10px 12px",
                          }}
                        >
                          {QUICK_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => sendMessage(opt)}
                              style={{
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                padding: "6px 12px",
                                border: `1.5px solid ${K.border}`,
                                background: K.white,
                                color: K.text,
                                cursor: "pointer",
                                borderRadius: "10px",
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: `1.5px solid ${K.border}`,
                      background: K.white,
                      padding: "4px 4px 4px 12px",
                      borderRadius: "10px",
                    }}
                  >
                    <input
                      ref={inputRef}
                      data-chatbot-input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendMessage(input);
                        }
                      }}
                      placeholder="Type your message…"
                      style={{
                        flex: 1,
                        background: K.white,
                        colorScheme: "light",
                        border: "none",
                        outline: "none",
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 13,
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
                        width: 36,
                        height: 36,
                        background: K.blue,
                        border: "none",
                        borderRadius: "10px",
                        color: K.white,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <FaPaperPlane size={12} />
                    </button>
                  </div>

                  <p
                    style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 9,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: K.muted,
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    Saskia Cleaning · MA & RI
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close chat" : "Chat with us"}
          className="fixed bottom-6 right-6 z-[10001] flex items-center justify-center"
        >
          {!isOpen && (
            <div className="absolute right-[76px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-white px-4 py-2 shadow-lg ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-900">Need help?</p>
              <p className="text-xs text-slate-500">Chat with Saskia</p>
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