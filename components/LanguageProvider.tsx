"use client";

import { useEffect, useState } from "react";
import { createI18n, LANGUAGE_STORAGE_KEY } from "../lib/i18n";
import { I18nextProvider } from "react-i18next";

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [instance] = useState(() => {
    return createI18n();
  });
  useEffect(() => {
    const sync = (language: string) => {
      document.documentElement.lang = language;
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch {
        /* Optional storage. */
      }
    };
    let language = "fr";
    try {
      language =
        localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "fr";
    } catch {
      /* Default to French. */
    }
    instance.on("languageChanged", sync);
    void instance.changeLanguage(language);
    return () => {
      instance.off("languageChanged", sync);
    };
  }, [instance]);
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
