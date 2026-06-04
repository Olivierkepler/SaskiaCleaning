"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, label, summary, [role='button'], [tabindex]:not([tabindex='-1'])";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractiveRef = useRef(false);
  const isOverNativeCursorRef = useRef(false);

  const [isMoving, setIsMoving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isOverNativeCursor, setIsOverNativeCursor] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rafId: number;

    const move = (e: MouseEvent) => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      const { clientX, clientY } = e;

      // Smooth GPU movement
      rafId = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      });

      if (e.target instanceof Element) {
        const overNativeCursor = !!e.target.closest("[data-native-cursor]");

        if (overNativeCursor !== isOverNativeCursorRef.current) {
          isOverNativeCursorRef.current = overNativeCursor;
          setIsOverNativeCursor(overNativeCursor);
        }

        const overInteractive = !!e.target.closest(INTERACTIVE_SELECTOR);

        if (overInteractive !== isInteractiveRef.current) {
          isInteractiveRef.current = overInteractive;
          setIsInteractive(overInteractive);
        }
      }

      setVisible(true);
      setIsMoving(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsMoving(false), 120);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Hide native cursor */}
      <style>{`
        html, body, * {
          cursor: none !important;
        }
        [data-native-cursor],
        [data-native-cursor] * {
          cursor: auto !important;
        }
        [data-native-cursor] a,
        [data-native-cursor] button {
          cursor: pointer !important;
        }
      `}</style>

      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[99999] pointer-events-none select-none"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          opacity: visible && !isOverNativeCursor ? 1 : 0,
        }}
      >
        <div
          className="flex items-center justify-center transition-all duration-150"
          style={{
            fontSize: isInteractive ? "44px" : isMoving ? "40px" : "36px",
            transform: isInteractive ? "scale(1.12)" : "scale(1)",
            filter: isInteractive
              ? `
              drop-shadow(0 6px 14px rgba(0,0,0,0.3))
              drop-shadow(0 0 22px rgba(56,189,248,0.55))
            `
              : `
              drop-shadow(0 4px 10px rgba(0,0,0,0.25))
              drop-shadow(0 0 14px rgba(56,189,248,0.35))
            `,
          }}
        >
          {isInteractive ? "👆" : isMoving ? "🫧" : "🧽"}
        </div>
      </div>
    </>
  );
}