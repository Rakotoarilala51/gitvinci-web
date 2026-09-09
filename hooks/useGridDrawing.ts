"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Grid, Tool, Intensity } from "../lib/types";
import {
  calendarColumns,
  canPaint,
  cellToDate,
  dateToKey,
  isCalendarDay,
  floodFill,
  getMonthLabels,
  getNextIntensity,
} from "../lib/grid";
import { CELL_SIZE, CELL_GAP } from "../lib/editor-config";

export type GridEditOptions = {
  startStroke: boolean;
  intent: "brush" | "fill" | "cycle";
};
export type DrawingOptions = {
  grid: Grid;
  year: number;
  tool: Tool;
  selectedIntensity: Intensity;
  disabled?: boolean;
  onStrokeEnd?: () => void;
  onEdit?: (next: Grid, options: GridEditOptions) => void;
};
export function useGridDrawing({
  grid,
  year,
  tool,
  selectedIntensity,
  disabled,
  onEdit,
  onStrokeEnd,
}: DrawingOptions) {
  const { t } = useTranslation();

  const gridRef = useRef(grid);
  const board = useRef<HTMLDivElement>(null);
  const stroke = useRef<{
    changed: boolean;
    visited: Set<string>;
    last: { x: number; y: number } | null;
  } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  const columns = calendarColumns(year);
  const months = getMonthLabels(year);
  const editable = !!onEdit && !disabled;
  const firstDate = Array.from({ length: columns }, (_, x) => x)
    .flatMap((x) => Array.from({ length: 7 }, (_, y) => ({ x, y })))
    .find(({ x, y }) => canPaint(y, x, year));
  const firstKey = firstDate ? `${firstDate.x}-${firstDate.y}` : "";
  const activeKey = focused ?? firstKey;

  function apply(x: number, y: number) {
    if (!editable || !canPaint(y, x, year)) return;
    const key = `${x}-${y}`;
    const currentStroke = stroke.current;
    if (currentStroke?.visited.has(key)) return;
    currentStroke?.visited.add(key);
    const current = gridRef.current;
    if (tool === "fill" && currentStroke?.changed) return;
    const value =
      tool === "eraser"
        ? 0
        : tool === "cycle"
          ? getNextIntensity(current[y][x], true)
          : selectedIntensity;
    if (current[y][x] === value) return;
    const next =
      tool === "fill"
        ? floodFill(current, x, y, value, (cx, cy) => canPaint(cy, cx, year))
            .grid
        : current.map((row) => [...row]);
    if (tool !== "fill") next[y][x] = value;
    gridRef.current = next;
    onEdit?.(next, {
      startStroke: !currentStroke?.changed,
      intent: tool === "fill" ? "fill" : tool === "cycle" ? "cycle" : "brush",
    });
    if (currentStroke) currentStroke.changed = true;
  }

  function finish() {
    stroke.current = null;
    onStrokeEnd?.();
  }

  function coordinates(event: React.PointerEvent) {
    const rect = board.current!.getBoundingClientRect();
    return {
      x: Math.floor((event.clientX - rect.left) / (CELL_SIZE + CELL_GAP)),
      y: Math.floor((event.clientY - rect.top) / (CELL_SIZE + CELL_GAP)),
    };
  }

  function onPointerDown(event: React.PointerEvent) {
    if (!editable || event.button !== 0) return;
    event.preventDefault();
    board.current?.setPointerCapture(event.pointerId);
    stroke.current = { changed: false, visited: new Set(), last: null };
    const point = coordinates(event);
    apply(point.x, point.y);
    if (stroke.current) stroke.current.last = point;
  }

  function onPointerMove(event: React.PointerEvent) {
    const { x, y } = coordinates(event);
    if (isCalendarDay(y, x, year)) {
      setHovered(
        t("cellLabel", {
          date: dateToKey(cellToDate(y, x, year)),
          level: gridRef.current[y]?.[x] ?? 0,
        }),
      );
    }
    if (!stroke.current) return;
    const last = stroke.current.last ?? { x, y };
    const steps = Math.max(1, Math.abs(x - last.x), Math.abs(y - last.y));
    for (let i = 1; i <= steps; i++) {
      apply(
        Math.round(last.x + ((x - last.x) * i) / steps),
        Math.round(last.y + ((y - last.y) * i) / steps),
      );
    }
    stroke.current.last = { x, y };
  }

  return {
    t,
    board,
    onPointerDown,
    onPointerMove,
    columns,
    months,
    editable,
    activeKey,
    hovered,
    setHovered,
    setFocused,
    apply,
    finish,
  };
}
