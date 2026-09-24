"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { locales, type AppLocale } from "@/i18n/config";
import { setLocalePreference } from "@/app/lib/i18n/set-locale";

const LOCALE_OPTION_KEYS: Record<AppLocale, "english" | "spanish" | "french"> =
  {
    en: "english",
    es: "spanish",
    fr: "french",
  };

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({
  className = "",
}: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(nextLocale: string) {
    if (nextLocale === locale) return;

    startTransition(async () => {
      const saved = await setLocalePreference(nextLocale);
      if (!saved) return;
      router.refresh();
    });
  }

  return (
    <div className={className}>
      <label htmlFor="language-switcher" className="sr-only">
        {t("language")}
      </label>
      <select
        id="language-switcher"
        name="locale"
        value={locale}
        disabled={isPending}
        onChange={(event) => onChange(event.target.value)}
        aria-label={t("language")}
        className="
          cursor-pointer
          rounded-full
          border
          border-slate-200
          bg-white
          px-3.5
          py-2
          text-sm
          font-medium
          text-slate-700
          shadow-sm
          outline-none
          transition
          hover:border-sky-300
          focus-visible:ring-2
          focus-visible:ring-sky-300
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {t(LOCALE_OPTION_KEYS[code])}
          </option>
        ))}
      </select>
    </div>
  );
}
