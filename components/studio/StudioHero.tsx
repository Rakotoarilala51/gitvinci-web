"use client";
import { useTranslation } from "react-i18next";
export default function StudioHero() {
  const { t } = useTranslation();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div>
        <p className="eyebrow">
          {" "}
          {t("GITHUB CONTRIBUTION ART / ÉDITION ARCADE")}{" "}
        </p>
        <h1 id="hero-title">
          {" "}
          {t("Tes commits.")} <br />
          <span> {t("Ton terrain de jeu.")} </span>
        </h1>
        <p className="hero-description">
          {" "}
          {t(
            "Un vrai calendrier, des pixels et tes idées. Dessine à la main, écris directement dans l’éditeur ou pars d’un template.",
          )}{" "}
        </p>
        <a href="#editor" className="hero-cta">
          {" "}
          {t("À toi de jouer")} <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div className="pixel-art" aria-hidden="true">
        {[
          "00100000100",
          "00010001000",
          "00111111100",
          "01101110110",
          "11111111111",
          "10100000101",
          "00011011000",
        ].flatMap((row, y) =>
          [...row].map((cell, x) => (
            <span key={y * 11 + x} className={cell === "1" ? "pixel-on" : ""} />
          )),
        )}
        <p>MAKE COMMITS. MAKE ART.</p>
      </div>
    </section>
  );
}
