import {
  type Grid,
  type Intensity,
  type CommitEntry,
  type ThresholdConfig,
  GRID_COLS,
  GRID_ROWS,
  LEVELS,
} from "./types";

export function emptyGrid(columns = GRID_COLS): Grid {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: columns }, () => 0 as Intensity)
  );
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  return a.length === b.length && a.every((row, y) =>
    row.length === b[y].length && row.every((v, x) => v === b[y][x]));
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
  const end = new Date(Date.UTC(year, 11, 31));
  end.setUTCDate(end.getUTCDate() + 6 - end.getUTCDay());
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
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
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

export function calendarColumns(year: number): number {
  const { start, end } = getGridRange(year);
  return Math.round((end.getTime() - start.getTime()) / 86400000 + 1) / 7;
}

export function isCalendarDay(row: number, col: number, year: number): boolean {
  return row >= 0 && row < 7 && col >= 0 && col < calendarColumns(year) &&
    cellToDate(row, col, year).getUTCFullYear() === year;
}

export function canPaint(row: number, col: number, year: number): boolean {
  return isCalendarDay(row, col, year);
}

export function normalizeGrid(grid: Grid, year: number): Grid {
  return emptyGrid(calendarColumns(year)).map((row, y) => row.map((_, x) => {
    const value = grid[y]?.[x];
    return canPaint(y, x, year) && Number.isInteger(value) && value >= 0 && value <= 4 ? value : 0;
  }));
}

export function patternSpace(year: number): { start: number; width: number } {
  const weeks = Array.from({ length: calendarColumns(year) }, (_, x) => x)
    .filter(x => canPaint(0, x, year) && canPaint(6, x, year));
  return { start: weeks[0] ?? 0, width: weeks.length };
}

export function placePattern(pattern: Grid, year: number, intensity?: Intensity): Grid | null {
  const { start, width } = patternSpace(year);
  const patternWidth = pattern[0]?.length ?? 0;
  if (pattern.length > 7 || patternWidth > width ||
      pattern.some(row => row.length !== patternWidth)) return null;
  const result = emptyGrid(calendarColumns(year));
  const offset = start + Math.floor((width - patternWidth) / 2);
  const top = Math.floor((7 - pattern.length) / 2);
  pattern.forEach((row, y) => row.forEach((v, x) => {
    result[y + top][x + offset] = v ? intensity ?? v : 0;
  }));
  return result;
}

export function getMonthLabels(year: number): string[] {
  const labels = Array.from({ length: calendarColumns(year) }, () => "");
  const { start } = getGridRange(year);
  for (let month = 0; month < 12; month++) {
    const first = new Date(Date.UTC(year, month, 1));
    const col = Math.floor((first.getTime() - start.getTime()) / 86400000 / 7);
    labels[col] = MONTH_SHORT[month];
  }
  return labels;
}

export function countActiveCells(grid: Grid, level?: number): number {
  let count = 0;
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
      const v = grid[y][x];
      if (level !== undefined ? v === level : v > 0) count++;
    }
  }
  return count;
}

export function maxIntensity(grid: Grid): number {
  let max = 0;
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
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
    for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
      const level = grid[y][x];
      if (!level || !isCalendarDay(y, x, year)) continue;
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
  value: Intensity,
  allowed: (x: number, y: number) => boolean = () => true
): { grid: Grid; cells: { x: number; y: number }[] } {
  const target = grid[startY][startX];
  if (target === value) return { grid, cells: [] };

  const newGrid = cloneGrid(grid);
  const cells: { x: number; y: number }[] = [];
  const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];

  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[y].length || !allowed(x, y)) continue;
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
// A column is one week. Refuse a move that would discard painted dates.
export function shiftGrid(grid: Grid, year: number, direction: -1 | 1): Grid | null {
  const next = emptyGrid(calendarColumns(year));
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (!grid[y][x]) continue;
      const target = x + direction;
      if (!isCalendarDay(y, target, year)) return null;
      next[y][target] = grid[y][x];
    }
  }
  return next;
}
