"use client";

import { useMemo, useState } from "react";
import type { Grid, Intensity, ThemeMode } from "../lib/types";
import { GRID_COLS, GRID_ROWS } from "../lib/types";
import { TEMPLATES } from "../data/templates";
import { editorColorFor, themePanelColors } from "../lib/colors";

type Props = {
  theme: ThemeMode;
  onPaste: (grid: Grid) => void;
};

export default function TemplatePicker({ theme, onPaste }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const panel = themePanelColors(theme);

  const builds = useMemo(
    () => TEMPLATES.map((t) => ({ ...t, grid: t.build() })),
    []
  );

  const paste = (grid: Grid) => {
    const full: Grid = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => 0)
    );
    const xOffset = Math.floor((GRID_COLS - grid[0].length) / 2);
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] > 0) full[y][xOffset + x] = grid[y][x] as Intensity;
      }
    }
    onPaste(full);
  };

  return (
    <div
      className="rounded-xl border p-3 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: panel.text }}>
          Templates
        </h3>
        <span className="text-[11px]" style={{ color: panel.muted }}>
          Clique pour ajouter (centré)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {builds.map((t) => (
          <button
            key={t.name}
            onMouseEnter={() => setActive(t.name)}
            onMouseLeave={() => setActive(null)}
            onClick={() => paste(t.grid)}
            className={`rounded-lg border p-2 text-left transition-colors hover:border-accent ${
              active === t.name ? "ring-1 ring-accent" : ""
            }`}
            style={{ borderColor: panel.border }}
            title={t.description}
          >
            <div className="mb-1.5 overflow-x-auto">
              <div
                className="grid gap-[2px] mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${t.grid[0].length}, 8px)`,
                  gridTemplateRows: `repeat(${t.grid.length}, 8px)`,
                  width: "max-content",
                }}
              >
                {t.grid.flatMap((row, y) =>
                  row.map((v, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="rounded-[2px]"
                      style={{
                        width: 8,
                        height: 8,
                        background: editorColorFor(theme, v as Intensity),
                      }}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="text-xs font-medium" style={{ color: panel.text }}>
              {t.name}
            </div>
            <div className="text-[10px] leading-tight" style={{ color: panel.muted }}>
              {t.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}