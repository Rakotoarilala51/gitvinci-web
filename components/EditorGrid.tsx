"use client";

import { useEffect, useRef, useState } from "react";
import type { Grid, Intensity, Tool, ThemeMode } from "../lib/types";
import {
  calendarColumns,
  canPaint,
  cellToDate,
  dateToKey,
  floodFill,
  getMonthLabels,
  getNextIntensity,
  isCalendarDay,
  isFuture,
} from "../lib/grid";
import { colorFor } from "../lib/colors";

export const CELL_SIZE = 12;
export const CELL_GAP = 3;

type Props = {
  grid: Grid;
  year: number;
  tool?: Tool;
  selectedIntensity?: Intensity;
  theme: ThemeMode;
  onEdit?: (
    next: Grid,
    opts: { startStroke: boolean; intent: "brush" | "fill" | "cycle" },
  ) => void;
  onStrokeEnd?: () => void;
  disabled?: boolean;
};

export default function EditorGrid({
  grid,
  year,
  tool = "brush",
  selectedIntensity = 3,
  theme,
  onEdit,
  onStrokeEnd,
  disabled,
}: Props) {
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

  return (
    <div
      className={`calendar-panel ${theme === "light" ? "calendar-light" : ""}`}
    >
      <div className="calendar-scroll">
        <div style={{ width: 36 + columns * (CELL_SIZE + CELL_GAP) }}>
          <div
            className="calendar-months"
            style={{
              gridTemplateColumns: `36px repeat(${columns}, ${CELL_SIZE}px)`,
              gap: CELL_GAP,
            }}
          >
            <span />
            {months.map((month, x) => (
              <span key={x}>{month}</span>
            ))}
          </div>
          <div className="flex" style={{ gap: CELL_GAP }}>
            <div
              className="calendar-weekdays"
              style={{
                width: 36,
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gap: CELL_GAP,
              }}
            >
              {["", "Mon", "", "Wed", "", "Fri", ""].map((day, y) => (
                <span key={y}>{day}</span>
              ))}
            </div>
            <div
              ref={board}
              className="calendar-cells"
              role={editable ? "group" : "img"}
              aria-label={`Calendrier de contributions ${year}`}
              style={{
                gridTemplateColumns: `repeat(${columns}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gap: CELL_GAP,
                touchAction: editable ? "none" : "auto",
              }}
              onPointerDown={(event) => {
                if (!editable || event.button !== 0) return;
                event.preventDefault();
                board.current?.setPointerCapture(event.pointerId);
                stroke.current = {
                  changed: false,
                  visited: new Set(),
                  last: null,
                };
                const { x, y } = coordinates(event);
                apply(x, y);
                if (stroke.current) stroke.current.last = { x, y };
              }}
              onPointerMove={(event) => {
                const { x, y } = coordinates(event);
                if (isCalendarDay(y, x, year))
                  setHovered(
                    `${dateToKey(cellToDate(y, x, year))} · niveau ${gridRef.current[y]?.[x] ?? 0}`,
                  );
                if (stroke.current) {
                  const last = stroke.current.last ?? { x, y };
                  const steps = Math.max(
                    Math.abs(x - last.x),
                    Math.abs(y - last.y),
                  );
                  for (let i = 1; i <= Math.max(1, steps); i++) {
                    apply(
                      Math.round(
                        last.x + ((x - last.x) * i) / Math.max(1, steps),
                      ),
                      Math.round(
                        last.y + ((y - last.y) * i) / Math.max(1, steps),
                      ),
                    );
                  }
                  stroke.current.last = { x, y };
                }
              }}
              onPointerUp={finish}
              onPointerCancel={finish}
              onLostPointerCapture={finish}
              onPointerLeave={() => setHovered(null)}
            >
              {Array.from({ length: 7 }, (_, y) =>
                Array.from({ length: columns }, (_, x) => {
                  const key = `${x}-${y}`;
                  if (!isCalendarDay(y, x, year)) return <span key={key} />;
                  const available = canPaint(y, x, year);
                  const level = grid[y]?.[x] ?? 0;
                  const label = `${dateToKey(cellToDate(y, x, year))} · niveau ${level}${isFuture(cellToDate(y, x, year)) ? " · date future" : ""}`;
                  const style = {
                    background: colorFor(theme, available ? level : 0),
                  };
                  if (!editable)
                    return (
                      <span
                        key={key}
                        className={`calendar-cell ${available ? "" : "future-cell"}`}
                        style={style}
                        title={label}
                      />
                    );
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`calendar-cell ${available ? "" : "future-cell"}`}
                      style={style}
                      data-cell={key}
                      disabled={!available}
                      tabIndex={activeKey === key ? 0 : -1}
                      aria-label={label}
                      title={label}
                      onFocus={() => {
                        setFocused(key);
                        setHovered(label);
                      }}
                      onClick={(event) => {
                        if (event.detail === 0) apply(x, y);
                      }}
                      onKeyDown={(event) => {
                        const delta: Record<string, [number, number]> = {
                          ArrowLeft: [-1, 0],
                          ArrowRight: [1, 0],
                          ArrowUp: [0, -1],
                          ArrowDown: [0, 1],
                        };
                        const step = delta[event.key];
                        if (!step) return;
                        event.preventDefault();
                        const [nx, ny] = [x + step[0], y + step[1]];
                        if (canPaint(ny, nx, year))
                          board.current
                            ?.querySelector<HTMLButtonElement>(
                              `[data-cell="${nx}-${ny}"]`,
                            )
                            ?.focus();
                      }}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="calendar-footer">
        <span aria-live="polite">
          {hovered ??
            (editable
              ? "Clique-glisse pour dessiner · Flèches et Espace au clavier"
              : "Calendrier annuel · dates UTC")}
        </span>
        <div className="calendar-legend">
          <span>Moins</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <i
              key={level}
              style={{ background: colorFor(theme, level as Intensity) }}
            />
          ))}
          <span>Plus</span>
        </div>
      </div>
    </div>
  );
}
