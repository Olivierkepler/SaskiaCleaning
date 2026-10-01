"use client";

import { useMemo, useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during SSR and hydration, true once rendering on the client.
// Replaces the `useEffect(() => setMounted(true), [])` pattern.
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function subscribeToMediaQuery(query: string) {
  return (onChange: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  };
}

// Tracks a CSS media query. Returns false during SSR and hydration.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    useMemo(() => subscribeToMediaQuery(query), [query]),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
