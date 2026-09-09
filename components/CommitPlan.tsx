"use client";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { CommitEntry, ThresholdConfig } from "../lib/types";
import { countCommits, isFuture } from "../lib/grid";

export default function CommitPlan({
  plan,
  thresholds,
  onThresholdsChange,
}: {
  plan: CommitEntry[];
  thresholds: ThresholdConfig;
  onThresholdsChange: (value: ThresholdConfig) => void;
}) {
  const { t } = useTranslation();

  const [feedback, setFeedback] = useState("");
  const dateLabel = (date: string) => date.split("-").reverse().join("-");
  const output = plan
    .map(
      (entry) =>
        `${dateLabel(entry.date)} : ${entry.count} commit${entry.count > 1 ? "s" : ""}`,
    )
    .join("\n");
  function download() {
    const csv =
      "date,commits\n" +
      plan.map((entry) => `${dateLabel(entry.date)},${entry.count}`).join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "gitvinci-commits.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      id="commit-dates"
      className="commit-output"
      aria-labelledby="commit-title"
    >
      <div className="section-heading">
        <div>
          <span className="step-number">▤</span>
          <h2 id="commit-title">{" "}{t("Les commits, jour par jour")}{" "}</h2>
        </div>
        <span className="eyebrow">
          {plan.length}{" "}{t("JOURS ·")}{" "}{countCommits(plan)}{" "}{t("COMMITS PRÉVUS")}{" "}</span>
      </div>
      <p className="section-description">{" "}{t("Chaque niveau correspond au nombre de commits ci-dessous. Le récapitulatif suit ton dessin et ses décalages, dates futures comprises.")}{" "}</p>
      <div className="commit-thresholds">
        {(["l1", "l2", "l3", "l4"] as const).map((key, index) => (
          <label key={key}>{" "}{t("Niveau")}{" "}{index + 1}
            <select
              aria-label={t("levelCommits", { level: index + 1 })}
              value={thresholds[key]}
              onChange={(event) =>
                onThresholdsChange({
                  ...thresholds,
                  [key]: Number(event.target.value),
                })
              }
            >
              {Array.from({ length: 100 }, (_, i) => i + 1).map((value) => (
                <option key={value} value={value}>
                  {value} commit{value > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <p className="editor-help">{" "}{t("Ces paliers définissent ton plan ; les nuances réelles de GitHub dépendent de l’activité du profil.")}{" "}</p>
      <div className="commit-actions">
        <button
          type="button"
          className="tool-button"
          disabled={!plan.length}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(output);
              setFeedback(t("Récapitulatif copié."));
            } catch {
              setFeedback(t("Copie indisponible. Tu peux télécharger le CSV."));
            }
          }}
        >{" "}{t("Copier les dates")}{" "}</button>
        <button
          type="button"
          className="tool-button"
          disabled={!plan.length}
          onClick={download}
        >{" "}{t("Télécharger le CSV")}{" "}</button>
        <span role="status">{feedback}</span>
      </div>
      <div className="commit-table">
        <table>
          <caption className="sr-only">{" "}{t("Nombre de commits à prévoir par date, en UTC")}{" "}</caption>
          <thead>
            <tr>
              <th scope="col">{" "}{t("Date (JJ-MM-AAAA)")}{" "}</th>
              <th scope="col">{" "}{t("Commits à prévoir")}{" "}</th>
              <th scope="col">{" "}{t("Période")}{" "}</th>
            </tr>
          </thead>
          <tbody>
            {plan.map((entry) => (
              <tr key={entry.date}>
                <td>{dateLabel(entry.date)}</td>
                <td>
                  {entry.count} commit{entry.count > 1 ? "s" : ""}
                </td>
                <td>
                  {isFuture(new Date(entry.date + "T00:00:00Z"))
                    ? t("À venir")
                    : t("Passée / aujourd’hui")}
                </td>
              </tr>
            ))}
            {!plan.length && (
              <tr>
                <td colSpan={3}>{" "}{t("Dessine ou choisis un template pour obtenir les dates et les quantités.")}{" "}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
