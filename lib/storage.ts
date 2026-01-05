import type { SavedArt, Grid, ThresholdConfig } from "./types";
import { emptyGrid } from "./grid";

const STORAGE_KEY = "gitvinci:arts";

export function loadArts(): SavedArt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedArt[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((a) => a && a.grid && Array.isArray(a.grid));
  } catch {
    return [];
  }
}

export function saveArt(art: SavedArt): SavedArt[] {
  const arts = loadArts();
  const idx = arts.findIndex((a) => a.id === art.id);
  if (idx >= 0) {
    arts[idx] = art;
  } else {
    arts.unshift(art);
  }
  writeArts(arts);
  return arts;
}

export function deleteArt(id: string): SavedArt[] {
  const arts = loadArts().filter((a) => a.id !== id);
  writeArts(arts);
  return arts;
}

function writeArts(arts: SavedArt[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arts.slice(0, 100)));
}

export function encodeGrid(grid: Grid): string {
  let out = "";
  for (let c = 0; c < (grid[0]?.length ?? 0); c++) {
    let col = 0;
    for (let r = 0; r < 7; r++) {
      col |= (grid[r][c] & 7) << (r * 3);
    }
    out += col.toString(32).padStart(5, "0");
  }
  return out;
}

export function decodeGrid(encoded: string, length = 53): Grid {
  const cells = Math.min(54, Math.max(0, length));
  const grid = emptyGrid(cells);
  for (let c = 0; c < cells && (c + 1) * 5 <= encoded.length; c++) {
    const chunk = encoded.slice(c * 5, c * 5 + 5);
    const col = parseInt(chunk, 32);
    if (isNaN(col)) continue;
    for (let r = 0; r < 7; r++) {
      const v = (col >> (r * 3)) & 7;
      grid[r][c] = (v > 4 ? 0 : v) as 0 | 1 | 2 | 3 | 4;
    }
  }
  return grid;
}

export function buildShareUrl(
  id: string,
  grid: Grid,
  year: number,
  thresholds: ThresholdConfig,
): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams({
    art: id,
    grid: encodeGrid(grid),
    year: String(year),
    t: `${thresholds.l1},${thresholds.l2},${thresholds.l3},${thresholds.l4}`,
  });
  return `${base}?${params.toString()}`;
}

export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "");
  if (m.length === 3) {
    const r = parseInt(m[0] + m[0], 16);
    const g = parseInt(m[1] + m[1], 16);
    const b = parseInt(m[2] + m[2], 16);
    if ([r, g, b].some((n) => isNaN(n))) return null;
    return { r, g, b };
  }
  if (m.length === 6) {
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    if ([r, g, b].some((n) => isNaN(n))) return null;
    return { r, g, b };
  }
  return null;
}

export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}
