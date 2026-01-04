import {
  type Grid,
  type Intensity,
  type CommitEntry,
  type ThresholdConfig,
  GRID_COLS,
  GRID_ROWS,
  LEVELS,
} from "./types";

export function emptyGrid(): Grid {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => 0 as Intensity)
  );
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (a[y][x] !== b[y][x]) return false;
    }
  }
  return true;
}

export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getGridRange(year: number): { start: Date; end: Date } {
  const anchor = new Date(Date.UTC(year, 0, 1));
  const jan1Weekday = anchor.getUTCDay();
  const start = new Date(Date.UTC(year, 0, 1 - jan1Weekday));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + GRID_COLS * 7 - 1);
  return { start, end };
}

export function cellToDate(row: number, col: number, year: number): Date {
  const { start } = getGridRange(year);
  const d = new Date(start);
  d.setUTCDate(d.getUTCDate() + col * 7 + row);
  return d;
}

export function isFuture(date: Date): boolean {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return date.getTime() > today.getTime();
}

export function dateToKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateToGithub(date: Date): string {
  return date.toISOString();
}

export function getMonthLabels(year: number): string[] {
  const { start } = getGridRange(year);
  const labels = Array.from({ length: GRID_COLS }, () => "");
  let lastMonthIndex = -1;
  for (let col = 0; col < GRID_COLS; col++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + col * 7 + 3);
    const monthIndex = d.getUTCMonth();
    for (let probe = col; probe < GRID_COLS; probe++) {
      labels[probe] = "";
    }
    if (monthIndex !== lastMonthIndex) {
      labels[col] = MONTH_SHORT[monthIndex];
      lastMonthIndex = monthIndex;
    }
  }
  return labels;
}

export function countActiveCells(grid: Grid, level?: number): number {
  let count = 0;
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const v = grid[y][x];
      if (level !== undefined ? v === level : v > 0) count++;
    }
  }
  return count;
}

export function maxIntensity(grid: Grid): number {
  let max = 0;
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (grid[y][x] > max) max = grid[y][x];
    }
  }
  return max;
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  l1: 1,
  l2: 5,
  l3: 10,
  l4: 20,
};

export function levelToCommitCount(level: Intensity, thresholds: ThresholdConfig): number {
  switch (level) {
    case 0:
      return 0;
    case 1:
      return thresholds.l1;
    case 2:
      return thresholds.l2;
    case 3:
      return thresholds.l3;
    case 4:
      return thresholds.l4;
  }
}

export function maxCommitCount(thresholds: ThresholdConfig): number {
  return Math.max(
    thresholds.l1,
    thresholds.l2,
    thresholds.l3,
    thresholds.l4
  );
}

export function buildCommitPlan(
  grid: Grid,
  year: number,
  thresholds: ThresholdConfig,
  message: string,
  includeFuture: boolean
): CommitEntry[] {
  const plan: CommitEntry[] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const level = grid[y][x];
      if (level === 0) continue;
      const date = cellToDate(y, x, year);
      if (!includeFuture && isFuture(date)) continue;
      const count = levelToCommitCount(level, thresholds);
      if (count <= 0) continue;
      plan.push({
        date: dateToKey(date),
        count,
        message,
      });
    }
  }
  plan.sort((a, b) => a.date.localeCompare(b.date));
  return plan;
}

export function countCommits(plan: CommitEntry[]): number {
  return plan.reduce((sum, e) => sum + e.count, 0);
}

export function floodFill(
  grid: Grid,
  startX: number,
  startY: number,
  value: Intensity
): { grid: Grid; cells: { x: number; y: number }[] } {
  const target = grid[startY][startX];
  if (target === value) return { grid, cells: [] };

  const newGrid = cloneGrid(grid);
  const cells: { x: number; y: number }[] = [];
  const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];

  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) continue;
    if (newGrid[y][x] !== target) continue;
    newGrid[y][x] = value;
    cells.push({ x, y });
    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  return { grid: newGrid, cells };
}

export function getNextIntensity(current: Intensity, cycleUp: boolean): Intensity {
  if (cycleUp) {
    return current === LEVELS - 1 ? 0 : ((current + 1) as Intensity);
  }
  return current === 0 ? ((LEVELS - 1) as Intensity) : ((current - 1) as Intensity);
}