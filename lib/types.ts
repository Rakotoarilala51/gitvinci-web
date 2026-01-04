export const GRID_COLS = 53;
export const GRID_ROWS = 7;
export const LEVELS = 5;

export type Intensity = 0 | 1 | 2 | 3 | 4;

export type Grid = Intensity[][];

export type Tool = "brush" | "eraser" | "fill" | "cycle";

export type BrushStep = {
  intensity: Intensity;
  x: number;
  y: number;
};

export type CommitEntry = {
  date: string;
  count: number;
  message: string;
};

export type ThemeMode = "light" | "dark";

export type ThresholdConfig = {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
};

export type SavedArt = {
  id: string;
  name: string;
  grid: Grid;
  year: number;
  thresholds: ThresholdConfig;
  createdAt: string;
  monthLabels: string[];
};

export type TextFontName = "5x7" | "7x9";