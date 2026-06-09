"use client";

import { useEffect, useState } from "react";

interface SocialLink {
  id: string;
  label: string;
  href: string;
  brandColor: string;
  icon: React.ReactNode;
}

const IconFacebook = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconInstagram = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
  </svg>
);

const IconWhatsApp = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24z" />
  </svg>
);

const IconTikTok = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

const IconGoogle = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com/saskiacleaning",
    brandColor: "#1877F2",
    icon: <IconFacebook />,
  },
//   {
//     id: "instagram",
//     label: "Instagram",
//     href: "https://instagram.com/saskiacleaning",
//     brandColor: "#E4405F",
//     icon: <IconInstagram />,
//   },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/14135550100",
    brandColor: "#25D366",
    icon: <IconWhatsApp />,
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://tiktok.com/@saskiacleaning",
    brandColor: "#010101",
    icon: <IconTikTok />,
  },
  {
    id: "google",
    label: "Reviews",
    href: "https://g.page/saskiacleaning",
    brandColor: "#4285F4",
    icon: <IconGoogle />,
  },
];

const DEFAULT_COLOR = "#0ea5e9";

function SocialButton({ link, index }: { link: SocialLink; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Follow us on ${link.label}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-start overflow-hidden rounded-r-xl shadow-lg"
      style={{
        height: "44px",
        width: hovered ? "140px" : "44px",
        backgroundColor: hovered ? link.brandColor : DEFAULT_COLOR,
        transition:
          "width 280ms cubic-bezier(0.34,1.56,0.64,1), background-color 200ms ease",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div
        className="flex flex-shrink-0 items-center justify-center text-white"
        style={{ width: "44px", height: "44px" }}
      >
        {link.icon}
      </div>

      <span
        className="absolute left-[44px] whitespace-nowrap pr-4 text-[13px] font-semibold tracking-wide text-white"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(6px)",
          transition: "opacity 180ms ease, transform 200ms ease",
          transitionDelay: hovered ? "80ms" : "0ms",
        }}
      >
        {link.label}
      </span>
    </a>
  );
}

export default function SocialCorner({ sectionId }: { sectionId: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [sectionId]);

  return (
    <div
      className={`fixed left-0 top-1/2 z-50 flex -translate-y-1/2 flex-col items-start gap-2 transition-all duration-300 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "pointer-events-none -translate-x-full opacity-0"
      }`}
      role="navigation"
      aria-label="Social media links"
    >
      {SOCIAL_LINKS.map((link, i) => (
        <SocialButton key={link.id} link={link} index={i} />
      ))}
    </div>
  );
}