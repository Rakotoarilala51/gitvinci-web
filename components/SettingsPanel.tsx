"use client";

import type { ThresholdConfig, ThemeMode } from "../lib/types";
import { DEFAULT_THRESHOLDS } from "../lib/grid";
import { themePanelColors } from "../lib/colors";

type Props = {
  year: number;
  setYear: (y: number) => void;
  thresholds: ThresholdConfig;
  setThresholds: (t: ThresholdConfig) => void;
  theme: ThemeMode;
};

const LABELS = [
  { key: "l1" as const, level: "Niveau 1", default: DEFAULT_THRESHOLDS.l1 },
  { key: "l2" as const, level: "Niveau 2", default: DEFAULT_THRESHOLDS.l2 },
  { key: "l3" as const, level: "Niveau 3", default: DEFAULT_THRESHOLDS.l3 },
  { key: "l4" as const, level: "Niveau 4", default: DEFAULT_THRESHOLDS.l4 },
];

const YEARS = (() => {
  const now = new Date().getFullYear();
  return [now - 2, now - 1, now, now + 1, now + 2, now + 3];
})();

export default function SettingsPanel({
  year,
  setYear,
  thresholds,
  setThresholds,
  theme,
}: Props) {
  const panel = themePanelColors(theme);
  const input =
    "w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const inputStyle = {
    color: panel.text,
    borderColor: panel.border,
  };

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: panel.text }}>
        Année &amp; intensité des commits
      </h3>

      <label
        className="block mb-1 text-xs font-medium"
        style={{ color: panel.muted }}
      >
        Année du graphique
      </label>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {YEARS.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
              year === y
                ? "border-accent bg-accent/10"
                : "hover:border-accent/40"
            }`}
            style={{
              color: panel.text,
              borderColor: year === y ? undefined : panel.border,
            }}
            aria-pressed={year === y}
          >
            {y}
          </button>
        ))}
      </div>

      <label
        className="block mb-1 text-xs font-medium"
        style={{ color: panel.muted }}
      >
        Commits par jour (paliers fixes — pas les quartiles dynamiques de
        GitHub)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {LABELS.map(({ key, level, default: def }) => (
          <label key={key} className="block">
            <span className="text-[11px]" style={{ color: panel.muted }}>
              {level}
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={thresholds[key]}
              onChange={(e) =>
                setThresholds({
                  ...thresholds,
                  [key]: Number(e.target.value) || def,
                })
              }
              className={input}
              style={inputStyle}
            />
          </label>
        ))}
      </div>
      <p className="mt-2 text-[11px]" style={{ color: panel.muted }}>
        GitHub n&apos;utilise pas de paliers fixes — il calcule des quartiles
        dynamiques par profil. On définit nos propres paliers larges pour
        garantir un contraste net (ex. 1 / 5 / 10 / 20).
      </p>
    </div>
  );
}
