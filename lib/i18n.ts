import { createInstance } from "i18next";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
export const LANGUAGE_STORAGE_KEY = "gitvinci:language";
export function createI18n() {
  const i18n = createInstance();
  void i18n.init({
    resources: { fr: { translation: fr }, en: { translation: en } },
    lng: "fr",
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    initAsync: false,
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
  });
  return i18n;
}
