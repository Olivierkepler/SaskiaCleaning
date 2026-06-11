"use client";

import { useEffect, useState } from "react";

export default function WhiteOverlay() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange(); // Initial check

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Don't render anything on tablets/desktops
  if (!isMobile) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] bg-white"
      aria-hidden="true"
    />
  );
}