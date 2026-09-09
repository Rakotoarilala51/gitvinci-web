"use client";
import { useGridDrawing } from "../hooks/useGridDrawing";

import type { Grid, Intensity, Tool, ThemeMode } from "../lib/types";
import {
  canPaint,
  cellToDate,
  dateToKey,
  isCalendarDay,
  isFuture,
} from "../lib/grid";
import { colorFor } from "../lib/colors";

import { CELL_SIZE, CELL_GAP } from "../lib/editor-config";

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
  const {
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
  } = useGridDrawing({
    grid,
    year,
    tool,
    selectedIntensity,
    disabled,
    onEdit,
    onStrokeEnd,
  });

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
              aria-label={t("calendarLabel", { year })}
              style={{
                gridTemplateColumns: `repeat(${columns}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gap: CELL_GAP,
                touchAction: editable ? "none" : "auto",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
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
                  const label =
                    t("cellLabel", {
                      date: dateToKey(cellToDate(y, x, year)),
                      level,
                    }) +
                    (isFuture(cellToDate(y, x, year))
                      ? t(" · date future")
                      : "");
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
              ? t("Clique-glisse pour dessiner · Flèches et Espace au clavier")
              : t("Calendrier annuel · dates UTC"))}
        </span>
        <div className="calendar-legend">
          <span>{t("Moins")}</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <i
              key={level}
              style={{ background: colorFor(theme, level as Intensity) }}
            />
          ))}
          <span>{t("Plus")}</span>
        </div>
      </div>
    </div>
  );
}
