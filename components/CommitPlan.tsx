"use client";
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
          <h2 id="commit-title">Les commits, jour par jour</h2>
        </div>
        <span className="eyebrow">
          {plan.length} JOURS · {countCommits(plan)} COMMITS PRÉVUS
        </span>
      </div>
      <p className="section-description">
        Chaque niveau correspond au nombre de commits ci-dessous. Le
        récapitulatif suit ton dessin et ses décalages, dates futures comprises.
      </p>
      <div className="commit-thresholds">
        {(["l1", "l2", "l3", "l4"] as const).map((key, index) => (
          <label key={key}>
            Niveau {index + 1}
            <select
              aria-label={`Commits pour le niveau ${index + 1}`}
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
      <p className="editor-help">
        Ces paliers définissent ton plan ; les nuances réelles de GitHub
        dépendent de l’activité du profil.
      </p>
      <div className="commit-actions">
        <button
          type="button"
          className="tool-button"
          disabled={!plan.length}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(output);
              setFeedback("Récapitulatif copié.");
            } catch {
              setFeedback("Copie indisponible. Tu peux télécharger le CSV.");
            }
          }}
        >
          Copier les dates
        </button>
        <button
          type="button"
          className="tool-button"
          disabled={!plan.length}
          onClick={download}
        >
          Télécharger le CSV
        </button>
        <span role="status">{feedback}</span>
      </div>
      <div className="commit-table">
        <table>
          <caption className="sr-only">
            Nombre de commits à prévoir par date, en UTC
          </caption>
          <thead>
            <tr>
              <th scope="col">Date (JJ-MM-AAAA)</th>
              <th scope="col">Commits à prévoir</th>
              <th scope="col">Période</th>
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
                    ? "À venir"
                    : "Passée / aujourd’hui"}
                </td>
              </tr>
            ))}
            {!plan.length && (
              <tr>
                <td colSpan={3}>
                  Dessine ou choisis un template pour obtenir les dates et les
                  quantités.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
