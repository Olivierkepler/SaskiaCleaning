// components/WhatsAppFloat.tsx

"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/18573528554"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed bottom-6 left-6 z-[9998]
        flex h-16 w-16 items-center justify-center
        rounded-full bg-[#25D366]
        text-white shadow-lg
        transition-all duration-300
        hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.5)]
        active:scale-95
      "
    >
      <FaWhatsapp size={34} />
    </a>
  );
}