"use client";

import type { Intensity, ThemeMode } from "../lib/types";
import { colorFor, themePanelColors } from "../lib/colors";

type Props = {
  selected: Intensity;
  onChange: (i: Intensity) => void;
  theme: ThemeMode;
};

const LEVEL_INFO: Record<Intensity, string> = {
  0: "Vide",
  1: "Faible",
  2: "Moyen",
  3: "Fort",
  4: "Intense",
};

export default function IntensityPalette({ selected, onChange, theme }: Props) {
  const panel = themePanelColors(theme);

  return (
    <div className="studio-palette">
      <span className="text-sm font-semibold" style={{ color: panel.text }}>
        Intensité
      </span>
      {[1, 2, 3, 4].map((level) => (
        <button
          key={level}
          onClick={() => onChange(level as Intensity)}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium border transition-colors ${
            selected === level
              ? "border-accent bg-accent/10"
              : "hover:border-accent/50"
          }`}
          style={{
            color: panel.text,
            borderColor: selected === level ? undefined : panel.border,
          }}
          title={`Niveau ${level} — ${LEVEL_INFO[level as Intensity]}`}
          aria-label={`Intensité ${level} : ${LEVEL_INFO[level as Intensity]}`}
          aria-pressed={selected === level}
        >
          <span
            className="w-4 h-4 rounded-[3px]"
            style={{ background: colorFor(theme, level as Intensity) }}
          />
          {level}
        </button>
      ))}
    </div>
  );
}
