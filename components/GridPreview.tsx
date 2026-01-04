"use client";

import { useMemo } from "react";
import type { Grid, ThemeMode } from "../lib/types";
import { GRID_COLS, GRID_ROWS } from "../lib/types";
import {
  WEEKDAY_SHORT,
  cellToDate,
  isFuture,
  dateToKey,
  getMonthLabels,
} from "../lib/grid";
import { colorFor, themePanelColors } from "../lib/colors";

type Props = {
  grid: Grid;
  year: number;
  theme: ThemeMode;
};

const PX = 10;
const GAP = 2;

export default function GridPreview({ grid, year, theme }: Props) {
  const panel = { ...themePanelColors(theme), card: theme === "dark" ? "#0d1117" : "#ffffff", text: theme === "dark" ? "#e6edf3" : "#1f2328", muted: theme === "dark" ? "#9198a1" : "#656d76" };
  const monthLabels = useMemo(() => getMonthLabels(year), [year]);

  const scale = useMemo(
    () => ({
      0: colorFor(theme, 0),
      1: colorFor(theme, 1),
      2: colorFor(theme, 2),
      3: colorFor(theme, 3),
      4: colorFor(theme, 4),
    }),
    [theme]
  );

  return (
    <div
      className="rounded-xl border p-4 sm:p-6 w-full transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: panel.text }}>
            {String(year)} — rendu sur ton profil
          </p>
          <p className="text-xs" style={{ color: panel.muted }}>
            Aperçu en direct
          </p>
        </div>
        <div
          className="flex items-center gap-1 text-[10px]"
          style={{ color: panel.muted }}
        >
          <span>Moins</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              className="rounded-[2px]"
              style={{ width: PX, height: PX, background: scale[lvl as keyof typeof scale] }}
            />
          ))}
          <span>Plus</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max">
          <div className="w-6 shrink-0 mr-2">
            <div
              className="grid text-[9px] font-medium"
              style={{
                gridTemplateRows: `repeat(${GRID_ROWS}, ${PX}px)`,
                gap: `${GAP}px`,
                color: panel.muted,
              }}
            >
              {WEEKDAY_SHORT.map((d) => (
                <span key={d} className="leading-[10px] h-[10px]">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div
              className="flex gap-[2px] mb-1"
              style={{ color: panel.muted }}
            >
              {monthLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-[9px] leading-none shrink-0"
                  style={{ width: PX + GAP }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, ${PX}px)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, ${PX}px)`,
                gap: `${GAP}px`,
              }}
            >
              {grid.map((row, y) =>
                row.map((level, x) => {
                  const date = cellToDate(y, x, year);
                  const future = isFuture(date);
                  return (
                    <div
                      key={`${x}-${y}`}
                      className="rounded-[2px]"
                      style={{
                        width: PX,
                        height: PX,
                        background: future
                          ? scale[0]
                          : scale[level as keyof typeof scale],
                        boxShadow: future
                          ? "inset 0 0 0 1px rgba(128,128,128,.25)"
                          : undefined,
                      }}
                      title={
                        `${dateToKey(date)} — ${level} commit${level > 1 ? "s" : ""}` +
                        (future ? " (futur, impossible)" : "")
                      }
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-[11px]" style={{ color: panel.muted }}>
        Les cases encadrées sont des dates futures : impossible d&apos;y commiter.
      </p>
    </div>
  );
}