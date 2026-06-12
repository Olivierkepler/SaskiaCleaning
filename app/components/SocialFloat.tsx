// components/SocialFloat.tsx

"use client";

import { useState } from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaTiktok,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

export default function SocialFloat() {
  const [open, setOpen] = useState(false);

  const socials = [
   
    // {
    //   icon: <FaInstagram size={24} />,
    //   href: "https://instagram.com/yourusername",
    //   color:
    //     "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    //   label: "Instagram",
    // },
    // {
    //   icon: <FaFacebookF size={22} />,
    //   href: "https://facebook.com/yourpage",
    //   color: "bg-[#1877F2]",
    //   label: "Facebook",
    // },
    // {
    //   icon: <FaLinkedinIn size={22} />,
    //   href: "https://linkedin.com/in/yourprofile",
    //   color: "bg-[#0A66C2]",
    //   label: "LinkedIn",
    // },
    // {
    //   icon: <FaTiktok size={22} />,
    //   href: "https://tiktok.com/@yourusername",
    //   color: "bg-black",
    //   label: "TikTok",
    // },
    {
        icon: <FaWhatsapp size={24} />,
        href: "https://wa.me/18573528554",
        color: "bg-[#25D366]",
        label: "WhatsApp",
      },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[9998] flex flex-col items-center gap-3">
      {/* Social Buttons */}
      {socials.map((social, index) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className={`
            flex h-14 w-14 items-center justify-center
            rounded-full text-white shadow-lg
            transition-all duration-300
            hover:scale-110 active:scale-95
            ${social.color}
            ${
              open
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-4 opacity-0"
            }
          `}
          style={{
            transitionDelay: open ? `${index * 75}ms` : "0ms",
          }}
        >
          {social.icon}
        </a>
      ))}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle social links"
        className="
          flex h-16 w-16 items-center justify-center
          rounded-full bg-sky-500 cursor-pointer text-white shadow-lg
          transition-all duration-300
          hover:scale-110 active:scale-95
        "
      >
        {open ? <FaTimes size={28} /> : <FaPlus size={28} />}
      </button>
    </div>
  );
}