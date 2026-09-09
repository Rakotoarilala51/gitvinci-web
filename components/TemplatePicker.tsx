"use client";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Grid, ThemeMode } from "../lib/types";
import { TEMPLATES, buildTemplate } from "../data/templates";
import { colorFor } from "../lib/colors";

export default function TemplatePicker({
  theme,
  year,
  onPaste,
}: {
  theme: ThemeMode;
  year: number;
  onPaste: (grid: Grid) => void;
}) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<string | null>(null);
  return (
    <section
      id="templates"
      className="templates-section"
      aria-labelledby="templates-title"
    >
      <div className="section-heading">
        <div>
          <span className="step-number">▦</span>
          <h2 id="templates-title">{t("Un motif pour commencer")}</h2>
        </div>
        <span className="eyebrow">
          {TEMPLATES.length} {t("TEMPLATES À PERSONNALISER")}
        </span>
      </div>
      <p className="section-description">
        {t(
          "Choisis un modèle, puis fais-le tien dans l’éditeur. Chaque modèle remplace le dessin actuel ; tu peux annuler.",
        )}
      </p>
      <div className="template-cards">
        {TEMPLATES.map((template, index) => {
          const pattern = template.build(year);
          const next = buildTemplate(template, year);
          const fits = next !== null;
          return (
            <article
              key={template.name}
              className={`template-card ${selected === template.name ? "template-selected" : ""}`}
            >
              <div className="template-card-top">
                <span className="eyebrow">
                  {t("MODÈLE")} {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  {template.placement === "calendar"
                    ? t("days", {
                        count: pattern.flat().filter(Boolean).length,
                      })
                    : `${pattern[0].length} × ${pattern.length}`}
                </span>
              </div>
              <div className="template-art" aria-hidden="true">
                <svg
                  viewBox={`0 0 ${pattern[0].length * 10} ${pattern.length * 10}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {pattern.flatMap((row, y) =>
                    row.map((v, x) => (
                      <rect
                        key={`${x}-${y}`}
                        x={x * 10}
                        y={y * 10}
                        width="8"
                        height="8"
                        rx="1"
                        fill={colorFor(theme, v)}
                      />
                    )),
                  )}
                </svg>
              </div>
              <h3>{t(template.name)}</h3>
              <p>{t(template.description)}</p>
              <button
                type="button"
                className="template-use"
                disabled={!fits}
                onClick={() => {
                  if (!next) return;
                  setSelected(template.name);
                  onPaste(next);
                  document.getElementById("editor")?.scrollIntoView({
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  });
                }}
              >
                {fits ? t("Utiliser ce modèle ↗") : t("Période trop courte")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
