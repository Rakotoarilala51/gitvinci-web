"use client";

import { useEffect, useState } from "react";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import fr from "../locales/fr.json";
import en from "../locales/en.json";

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [instance] = useState(() => {
    const i18n = createInstance();
    void i18n.init({
      resources: { fr: { translation: fr }, en: { translation: en } },
      lng: "fr", fallbackLng: "fr", supportedLngs: ["fr", "en"],
      initAsync: false, keySeparator: false, nsSeparator: false,
      interpolation: { escapeValue: false },
    });
    return i18n;
  });
  useEffect(() => {
    const sync = (language: string) => {
      document.documentElement.lang = language;
      try { localStorage.setItem("gitvinci:language", language); } catch { /* Optional storage. */ }
    };
    let language = "fr";
    try { language = localStorage.getItem("gitvinci:language") === "en" ? "en" : "fr"; } catch { /* Default to French. */ }
    instance.on("languageChanged", sync);
    void instance.changeLanguage(language);
    return () => { instance.off("languageChanged", sync); };
  }, [instance]);
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
