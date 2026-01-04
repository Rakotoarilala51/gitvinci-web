"use client";

import { useMemo, useState } from "react";
import type { Grid, Intensity, TextFontName, ThemeMode } from "../lib/types";
import { GRID_COLS } from "../lib/types";
import { textToGrid } from "../lib/fonts";
import { editorColorFor, themePanelColors } from "../lib/colors";

type Props = {
  year: number;
  theme: ThemeMode;
  onPaste: (grid: Grid) => void;
};

export default function TextConverter({ year, theme, onPaste }: Props) {
  const [text, setText] = useState("HIRE ME!");
  const [fontSize, setFontSize] = useState<TextFontName>("5x7");
  const [intensity, setIntensity] = useState<Intensity>(3);
  const panel = themePanelColors(theme);

  const { preview, width } = useMemo(() => {
    const t = textToGrid(text, fontSize);
    return { preview: t.grid, width: t.width };
  }, [text, fontSize]);

  const fits = width <= GRID_COLS;

  const handlePaste = () => {
    const t = textToGrid(text, fontSize);
    const out = t.grid.map((row) =>
      row.map((v) => (v > 0 ? intensity : 0))
    );
    const xOffset = Math.floor((GRID_COLS - t.width) / 2);
    const full: Grid = Array.from({ length: 7 }, () =>
      Array.from({ length: GRID_COLS }, () => 0)
    );
    for (let y = 0; y < out.length; y++) {
      for (let x = 0; x < out[y].length; x++) {
        if (out[y][x] > 0) {
          full[y][xOffset + x] = out[y][x] as Intensity;
        }
      }
    }
    onPaste(full);
  };

  const input =
    "w-full rounded-lg border border-border-soft bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: panel.text }}>
          Texte → pixel art
        </h3>
        <span className={`text-[11px] ${fits ? "text-accent" : "text-danger"}`}>
          {fits ? `${width} colonnes — ça rentre !` : `${width} colonnes — trop large (max ${GRID_COLS})`}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.toUpperCase())}
          placeholder="HIRE ME !"
          aria-label="Texte à convertir en pixel art"
          className={input}
          maxLength={12}
        />
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value as TextFontName)}
          className={input}
          style={{ color: panel.text }}
          aria-label="Taille de police"
        >
          <option value="5x7">5×7</option>
          <option value="7x9">7×9</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs font-medium" style={{ color: panel.text }}>
          Intensité :
        </span>
        {[1, 2, 3, 4].map((l) => (
          <button
            key={l}
            onClick={() => setIntensity(l as Intensity)}
            className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-colors ${
              intensity === l
                ? "ring-2 ring-accent"
                : "opacity-70 hover:opacity-100"
            }`}
            style={{
              background: editorColorFor(theme, l as Intensity),
              color: l >= 3 ? "var(--ink)" : "var(--accent-on)",
              borderColor: panel.border,
            }}
            aria-label={`Intensité ${l}`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={handlePaste}
          disabled={!fits}
          className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-on transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Ajouter au motif ({year})
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="inline-block">
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${preview.length > 0 ? preview[0].length : 0}, 12px)`,
              gridTemplateRows: `repeat(${preview.length}, 12px)`,
            }}
          >
            {preview.flatMap((row, y) =>
              row.map((v, x) => (
                <div
                  key={`${x}-${y}`}
                  className="rounded-[2px]"
                  style={{
                    width: 12,
                    height: 12,
                    background: v > 0
                      ? editorColorFor(theme, intensity)
                      : editorColorFor(theme, 0),
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}