"use client";

import { useEffect, useRef, useState } from "react";
import { FaComments, FaTimes, FaWhatsapp, FaPaperPlane } from "react-icons/fa";

type Message = {
  sender: "bot" | "user";
  text: string;
};

const quickOptions = [
  "Residential Cleaning",
  "Commercial Cleaning",
  "Airbnb Cleaning",
  "Laundry Services",
  "Get a Quote",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi, welcome to Saskia Cleaning ✨ How can I help you today?",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getBotReply = (userText: string) => {
    const text = userText.toLowerCase();

    if (text.includes("quote") || text.includes("price") || text.includes("cost")) {
      return "Absolutely. Please send your name, location, type of cleaning, number of rooms, and preferred date. I’ll help prepare your quote.";
    }

    if (text.includes("residential")) {
      return "Our residential cleaning includes kitchens, bathrooms, bedrooms, floors, dusting, and general home refreshes. Would you like a standard clean or deep clean?";
    }

    if (text.includes("commercial")) {
      return "We offer commercial cleaning for offices, salons, studios, and small businesses. How often do you need service?";
    }

    if (text.includes("airbnb")) {
      return "Our Airbnb turnover service includes cleaning, restocking, linen changes, and guest-ready preparation. What city is the property in?";
    }

    if (text.includes("laundry")) {
      return "Yes, we offer laundry services. Do you need wash-and-fold, linen service, or laundry included with cleaning?";

    }

    return "Thanks for sharing. I can help with residential cleaning, commercial cleaning, Airbnb turnover, laundry, or quotes. What would you like to do next?";
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: getBotReply(text) },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div data-chatbot>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[460px] overflow-hidden rounded-[10px] bg-white shadow-2xl ring-1 ring-black/10">
          <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold tracking-wide">
                  Saskia Cleaning Assistant
                </p>
                <p className="mt-1 text-xs text-white/70">
                  Online now • Usually replies quickly
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
                className="rounded-full p-2 transition hover:bg-white/10"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="h-[380px] space-y-3 overflow-y-auto bg-[#f7f7f7] p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-xl px-4 py-2 text-sm leading-6 ${
                    message.sender === "user"
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="w-fit rounded-xl bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                Saskia is typing...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => sendMessage(option)}
                  className="rounded-[10px] border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage(input);
                }}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm outline-none"
              />

              <button
                type="button"
                onClick={() => sendMessage(input)}
                className="rounded-full bg-slate-950 p-2 text-white transition hover:scale-105"
                aria-label="Send message"
              >
                <FaPaperPlane size={13} />
              </button>
            </div>

            <a
              href="https://wa.me/18573528554"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-[10px] bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              <FaWhatsapp />
              Continue on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open chatbot"
        className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl transition hover:scale-110"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={28} />}
      </button>
    </div>
  );
}