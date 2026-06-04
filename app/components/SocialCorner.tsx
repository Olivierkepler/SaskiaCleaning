"use client";

import {
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa6";

type SocialLink = {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
  color: string; // brand hover color
};

const socialLinks: SocialLink[] = [
  {
    label: "X (Twitter)",
    href: "https://x.com/",
    icon: FaXTwitter,
    external: true,
    color: "hover:bg-black",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/",
    icon: FaFacebookF,
    external: true,
    color: "hover:bg-blue-600",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: FaInstagram,
    external: true,
    color: "hover:bg-pink-500",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: FaLinkedinIn,
    external: true,
    color: "hover:bg-blue-500",
  },
//   {
//     label: "Text us",
//     href: "sms:8573528554",
//     icon: MessageCircle,
//     color: "hover:bg-green-500",
//   },
//   {
//     label: "Call us",
//     href: "tel:8573528554",
//     icon: Phone,
//     color: "hover:bg-emerald-500",
//   },
//   {
//     label: "Email us",
//     href: "mailto:cleaningsaskia@gmail.com",
//     icon: Mail,
//     color: "hover:bg-sky-500",
//   },
];

export default function SocialCorner() {
  return (
    <div className="fixed left-4 top-1/2 z-[9999] hidden -translate-y-1/2 flex-col gap-4 md:flex">
      {socialLinks.map(({ label, href, icon: Icon, external, color }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={`
            group relative flex h-12 w-12 items-center justify-center
            rounded-2xl border border-white/20
            bg-sky-500 backdrop-blur-xl
            text-white shadow-xl
            transition-all duration-300

            hover:-translate-y-1
            hover:shadow-lg
            ${color}

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-sky-400
            focus-visible:ring-offset-2
            focus-visible:ring-offset-black
          `}
        >
          {/* Icon */}
          <Icon
            size={18}
            className="transition-transform duration-300 group-hover:scale-110"
          />

          {/* Tooltip */}
          <span
            className="
              pointer-events-none absolute left-full ml-3
              whitespace-nowrap rounded-lg bg-black/80 px-3 py-1.5 text-xs
              text-white opacity-0 shadow-lg backdrop-blur-md
              transition-all duration-300

              group-hover:translate-x-1
              group-hover:opacity-100
            "
          >
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}