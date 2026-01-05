"use client";
import type { Grid, ThemeMode } from "../lib/types";
import EditorGrid from "./EditorGrid";
export default function GridPreview({
  grid,
  year,
  theme,
}: {
  grid: Grid;
  year: number;
  theme: ThemeMode;
}) {
  return <EditorGrid grid={grid} year={year} theme={theme} />;
}
