"use client";

import { useState } from "react";
import { FaComments, FaTimes, FaWhatsapp } from "react-icons/fa";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi! Welcome to Saskia Cleaning. What service are you interested in?",
    },
  ]);

  const handleOptionClick = (option: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: option },
      {
        sender: "bot",
        text:
          option === "Get a Quote"
            ? "Great! Please send us your name, location, and the type of cleaning you need."
            : `Perfect — we offer ${option}. Would you like to request a quote or chat with us on WhatsApp?`,
      },
    ]);
  };

  return (
    <div data-chatbot>
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-[9999] w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between bg-sky-500 px-5 py-4 text-white">
            <div>
              <p className="text-sm font-bold">Saskia Assistant</p>
              <p className="text-xs text-white/80">Usually replies quickly</p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              className="rounded-full p-2 transition-colors hover:bg-sky-600 p-5"
            >
              <FaTimes />
            </button>
       
          </div>

          <div className="h-[320px] space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-6 ${
                    message.sender === "user"
                      ? "bg-sky-500 text-white"
                      : "bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-100 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600"
                >
                  {option}
                </button>
              ))}
            </div>

            <a
              href="https://wa.me/18573528554"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
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
        className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-white shadow-xl transition hover:scale-110 hover:bg-sky-600"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={28} />}
      </button>
    </div>
  );
}
