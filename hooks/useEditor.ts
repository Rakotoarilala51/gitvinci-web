"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Grid,
  Intensity,
  SavedArt,
  ThemeMode,
  Tool,
  ThresholdConfig,
} from "../lib/types";
import {
  calendarColumns,
  DEFAULT_THRESHOLDS,
  emptyGrid,
  normalizeGrid,
  patternSpace,
  placePattern,
  shiftGrid,
  buildCommitPlan,
} from "../lib/grid";
import { textToGrid } from "../lib/fonts";
import {
  currentYear,
  maxYear,
  DRAFT_KEY,
  parseThresholds,
} from "../lib/editor-config";
import { useGridHistory } from "./useGridHistory";
import { readDraft } from "../lib/draft";

export function useEditor() {
  const [year, setYear] = useState(currentYear);
  const history = useGridHistory(() => emptyGrid(calendarColumns(currentYear)));
  const { grid, reset } = history;
  const [tool, setTool] = useState<Tool>("brush");
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>(4);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [text, setText] = useState("");
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    ...DEFAULT_THRESHOLDS,
  });
  const [ready, setReady] = useState(false);
  const textStroke = useRef(false);
  const space = patternSpace(year);
  const textPattern = textToGrid(text, "5x7");
  const textFits = textPattern.width <= space.width;
  const hasArt = grid.some((row) => row.some(Boolean));
  const shiftedLeft = useMemo(() => shiftGrid(grid, year, -1), [grid, year]);
  const shiftedRight = useMemo(() => shiftGrid(grid, year, 1), [grid, year]);
  const plan = useMemo(
    () => buildCommitPlan(grid, year, thresholds, "gitvinci pattern", true),
    [grid, year, thresholds],
  );

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(DRAFT_KEY);
    } catch {
      /* Optional storage. */
    }
    const draft = readDraft(window.location.search, raw);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore browser-only persisted state
    setThresholds(draft.thresholds);
    setYear(draft.year);
    reset(draft.grid);
    setReady(true);
  }, [reset]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ grid, year, thresholds }),
      );
    } catch {
      /* Editing remains available without local storage. */
    }
  }, [grid, year, ready, thresholds]);

  function replace(next: Grid) {
    history.edit(next);
    setText("");
    endTextSession();
  }
  function undo() {
    if (!history.canUndo) return;
    history.undo();
    setText("");
    endTextSession();
  }
  function redo() {
    if (!history.canRedo) return;
    history.redo();
    setText("");
    endTextSession();
  }

  function changeYear(nextYear: number) {
    reset(normalizeGrid(grid, nextYear));
    setYear(nextYear);
    setText("");
    textStroke.current = false;
  }

  function writeText(value: string, intensity = selectedIntensity) {
    setText(value);
    const pattern = textToGrid(value, "5x7");
    const next = placePattern(pattern.grid, year, intensity);
    if (!next) return;
    history.edit(next, !textStroke.current);
    textStroke.current = true;
  }

  function loadArt(art: SavedArt) {
    if (art.year < 2001 || art.year > maxYear) {
      return false;
    }
    setThresholds(parseThresholds(art.thresholds));
    setYear(art.year);
    reset(normalizeGrid(art.grid, art.year));
    setText("");
    textStroke.current = false;
  }

  function clear() {
    replace(emptyGrid(calendarColumns(year)));
  }
  function shift(direction: -1 | 1) {
    const next = direction === -1 ? shiftedLeft : shiftedRight;
    if (next) replace(next);
  }
  function endTextSession() {
    textStroke.current = false;
  }
  function changeIntensity(value: Intensity) {
    setSelectedIntensity(value);
    if (text && textFits) {
      endTextSession();
      writeText(text, value);
      endTextSession();
    }
  }
  function edit(next: Grid, options: { startStroke: boolean }) {
    history.edit(next, options.startStroke);
    setText("");
    endTextSession();
  }
  return {
    year,
    grid,
    tool,
    setTool,
    selectedIntensity,
    theme,
    setTheme,
    thresholds,
    setThresholds,
    ready,
    text,
    textFits,
    textWidth: textPattern.width,
    availableWidth: space.width,
    hasArt,
    plan,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    canShiftLeft: hasArt && !!shiftedLeft,
    canShiftRight: hasArt && !!shiftedRight,
    replace,
    undo,
    redo,
    changeYear,
    writeText,
    loadArt,
    clear,
    shift,
    endTextSession,
    changeIntensity,
    edit,
  };
}
export type EditorController = ReturnType<typeof useEditor>;
