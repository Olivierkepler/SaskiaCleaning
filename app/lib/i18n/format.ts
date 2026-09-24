import type { AppLocale } from "@/i18n/config";

/** BCP 47 tags for public UI formatting (business remains US / USD). */
export function intlLocale(appLocale: string): string {
  switch (appLocale) {
    case "es":
      return "es-US";
    case "fr":
      return "fr-FR";
    case "en":
    default:
      return "en-US";
  }
}

export function formatUsd(
  amount: number,
  appLocale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale(appLocale), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

export function formatPublicDate(
  date: Date | string | number,
  appLocale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(intlLocale(appLocale), {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(value);
}

export type { AppLocale };
