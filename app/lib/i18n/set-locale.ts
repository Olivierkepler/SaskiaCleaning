"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  LOCALE_COOKIE,
  isAppLocale,
  type AppLocale,
} from "@/i18n/config";

export async function setLocalePreference(locale: string): Promise<AppLocale | null> {
  if (!isAppLocale(locale)) {
    return null;
  }

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });

  // Refresh current views so server components pick up the new locale.
  revalidatePath("/", "layout");

  return locale;
}
