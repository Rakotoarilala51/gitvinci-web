"use client";

import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  return <header className="site-header arcade-navbar">
    <div className="app-container navbar-inner">
      <a href="#" className="brand" aria-label={t("Gitvinci, accueil")}>
        <span className="brand-mark" aria-hidden="true">G<span>▝</span></span>
        <span>gitvinci<span className="brand-dot">.</span></span>
      </a>
      <div className="language-switch" role="group" aria-label={t("Langue")}>
        {(["fr", "en"] as const).map(language => <button key={language} type="button"
          lang={language} aria-label={language === "fr" ? "Français" : "English"}
          aria-pressed={i18n.resolvedLanguage === language}
          onClick={() => { void i18n.changeLanguage(language); }}>
          {language.toUpperCase()}
        </button>)}
      </div>
    </div>
  </header>;
}
