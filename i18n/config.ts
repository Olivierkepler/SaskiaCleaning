export const locales = ["en", "es", "fr"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

/** Cookie storing the customer-facing locale preference. */
export const LOCALE_COOKIE = "saskia_locale";

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    (locales as readonly string[]).includes(value)
  );
}

export function resolveLocale(value: unknown): AppLocale {
  return isAppLocale(value) ? value : defaultLocale;
}
