"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Grid, Intensity, Tool, ThemeMode } from "../lib/types";
import { GRID_COLS, GRID_ROWS } from "../lib/types";
import {
  WEEKDAY_SHORT,
  getNextIntensity,
  floodFill,
} from "../lib/grid";
import { editorColorFor, themePanelColors } from "../lib/colors";

export const CELL_SIZE = 14;
export const CELL_GAP = 3;

type Props = {
  grid: Grid;
  tool: Tool;
  selectedIntensity: Intensity;
  theme: ThemeMode;
  monthLabels: string[];
  onEdit: (
    next: Grid,
    opts: { startStroke: boolean; intent: "brush" | "fill" | "cycle" }
  ) => void;
  onStrokeEnd: () => void;
  disabled?: boolean;
};

export default function EditorGrid({
  grid,
  tool,
  selectedIntensity,
  theme,
  monthLabels,
  onEdit,
  onStrokeEnd,
  disabled,
}: Props) {
  const [painting, setPainting] = useState(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const gridRef = useRef(grid);
  const panel = themePanelColors(theme);
  const toolRef = useRef(tool);
  const intensityRef = useRef(selectedIntensity);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  useEffect(() => {
    intensityRef.current = selectedIntensity;
  }, [selectedIntensity]);

  const apply = useCallback(
    (x: number, y: number, isDrag: boolean) => {
      if (disabled) return;
      const cur = gridRef.current;
      const curTool = toolRef.current;
      const curIntensity = intensityRef.current;
      if (!isDrag) {
        if (curTool === "cycle") {
          const nextLevel = getNextIntensity(cur[y][x], true);
          const copy = cur.map((r) => [...r]);
          copy[y][x] = nextLevel;
          onEdit(copy, { startStroke: true, intent: "cycle" });
          lastRef.current = { x, y };
          return;
        }
        if (curTool === "fill") {
          const { grid: nextGrid } = floodFill(cur, x, y, curIntensity);
          onEdit(nextGrid, { startStroke: true, intent: "fill" });
          lastRef.current = { x, y };
          return;
        }
      }
      if (isDrag && lastRef.current?.x === x && lastRef.current?.y === y) return;
      const value: Intensity =
        curTool === "eraser" ? 0 : curTool === "cycle" ? getNextIntensity(cur[y][x], true) : curIntensity;
      if (cur[y][x] === value) return;
      const copy = cur.map((r) => [...r]);
      copy[y][x] = value;
      onEdit(copy, { startStroke: !isDrag, intent: "brush" });
      lastRef.current = { x, y };
    },
    [disabled, onEdit]
  );

  const bindCell = (x: number, y: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      setPainting(true);
      lastRef.current = null;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      apply(x, y, false);
    },
    onPointerEnter: (e: React.PointerEvent) => {
      if (!painting) return;
      e.preventDefault();
      apply(x, y, true);
    },
    onPointerUp: () => {
      setPainting(false);
      lastRef.current = null;
      onStrokeEnd();
    },
  });

  const stopPaint = useCallback(() => {
    if (painting) {
      setPainting(false);
      lastRef.current = null;
      onStrokeEnd();
    }
  }, [painting, onStrokeEnd]);

  const rowGap = CELL_GAP;

  return (
    <div
      className="rounded-xl border p-3 sm:p-4 transition-colors overflow-x-auto"
      style={{ borderColor: panel.border, background: panel.card }}
      onPointerUp={stopPaint}
      onPointerLeave={stopPaint}
    >
      <div className="inline-block min-w-0">
        <div
          className="flex mb-1 pr-1"
          style={{ color: panel.muted }}
        >
          <div style={{ width: 30 }} className="shrink-0" />
          {monthLabels.map((label, i) => (
            <span
              key={i}
              className="shrink-0 text-[10px] leading-none"
              style={{ width: CELL_SIZE + CELL_GAP }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex">
          <div
            className="flex flex-col mr-2 text-[10px] leading-none font-medium shrink-0"
            style={{ width: 30, color: panel.muted }}
          >
            {WEEKDAY_SHORT.map((d) => (
              <span key={d} style={{ height: CELL_SIZE + rowGap }}>
                <span style={{ display: "inline-block", height: CELL_SIZE, lineHeight: `${CELL_SIZE}px` }}>
                  {d}
                </span>
              </span>
            ))}
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
              gap: `${CELL_GAP}px`,
            }}
          >
            {grid.map((row, y) =>
              row.map((level, x) => (
                <div
                  key={`${x}-${y}`}
                  {...bindCell(x, y)}
                  className="rounded-[2px] select-none cursor-pointer touch-none"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: editorColorFor(theme, level),
                  }}
                  title={`Ligne ${y + 1} (${WEEKDAY_SHORT[y]}), Colonne ${x + 1} — niveau ${level}`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 mt-3 pt-3 border-t"
        style={{ borderColor: panel.border, color: panel.muted }}
      >
        <span className="text-[11px]">Moins</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="rounded-[2px]"
            style={{
              width: 11,
              height: 11,
              background: editorColorFor(theme, lvl as Intensity),
            }}
          />
        ))}
        <span className="text-[11px]">Plus</span>
        <span className="ml-auto text-[10px]">
          {tool === "cycle" ? "Clique pour cycler les niveaux · Clique-glisse pour peindre" : tool === "fill" ? "Clique sur une zone à remplir" : "Clique-glisse pour peindre"}
        </span>
      </div>
    </div>
  );
}