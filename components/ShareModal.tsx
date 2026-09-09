"use client";
import { useTranslation } from "react-i18next";

import { useState } from "react";
import type { Grid, ThemeMode, ThresholdConfig } from "../lib/types";
import { buildShareUrl } from "../lib/storage";
import { editorColorFor, themePanelColors } from "../lib/colors";

type Props = {
  grid: Grid;
  year: number;
  thresholds: ThresholdConfig;
  id: string;
  theme: ThemeMode;
  onClose: () => void;
};

export default function ShareModal({
  grid,
  year,
  thresholds,
  id,
  theme,
  onClose,
}: Props) {
  const { t } = useTranslation();

  const [copied, setCopied] = useState(false);
  const panel = themePanelColors(theme);
  const url = buildShareUrl(id, grid, year, thresholds);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-5"
        style={{ background: panel.card, border: `1px solid ${panel.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: panel.text }}
        >{" "}{t("Partager ce motif")}{" "}</h3>

        <div
          className="grid gap-[2px] rounded-lg border p-3 mb-3 justify-start overflow-x-auto"
          style={{ borderColor: panel.border }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${grid[0].length}, 8px)`,
              gridTemplateRows: `repeat(${grid.length}, 8px)`,
              gap: 1,
            }}
          >
            {grid.flatMap((row, y) =>
              row.map((v, x) => (
                <div
                  key={`${x}-${y}`}
                  className="rounded-[1px]"
                  style={{
                    width: 8,
                    height: 8,
                    background: editorColorFor(theme, v),
                  }}
                />
              )),
            )}
          </div>
        </div>

        <div
          className="rounded-lg border p-2 flex items-center gap-2"
          style={{ borderColor: panel.border }}
        >
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs font-mono outline-none"
            style={{ color: panel.text }}
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={copy}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-on hover:bg-accent"
          >
            {copied ? t("✓ Copié") : t("Copier")}
          </button>
        </div>

        <p className="mt-3 text-[11px]" style={{ color: panel.muted }}>{" "}{t("Le lien embarque tout le motif — tu peux l'envoyer à n'importe qui, il s'affichera directement dans l'éditeur.")}{" "}</p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border py-2 text-sm font-semibold hover:bg-accent/10 transition-colors"
          style={{ color: panel.text, borderColor: panel.border }}
        >{" "}{t("Fermer")}{" "}</button>
      </div>
    </div>
  );
}
