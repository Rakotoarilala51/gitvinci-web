import type { Grid, Intensity, TextFontName } from "../lib/types";

import { FONT_5X7, FONT_7X9, type CharBitmap } from "../data/bitmap-fonts";

export function getFont(name: TextFontName): Record<string, CharBitmap> {
  return name === "5x7" ? FONT_5X7 : FONT_7X9;
}

export function getFontHeight(name: TextFontName): number {
  return name === "5x7" ? 7 : 9;
}

export function letterSpacing(name: TextFontName): number {
  return name === "5x7" ? 1 : 2;
}

export function textToGrid(
  text: string,
  fontName: TextFontName,
): { grid: Grid; width: number; height: number } {
  const font = getFont(fontName);
  const charH = getFontHeight(fontName);
  const spacing = letterSpacing(fontName);
  const upper = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  const rawWidth = Math.max(
    0,
    [...upper].reduce(
      (w, ch) => w + (font[ch] ?? font["?"])[0].length + spacing,
      0,
    ) - spacing,
  );

  const grid: Grid = Array.from({ length: charH }, () =>
    Array.from({ length: rawWidth }, () => 0 as Intensity),
  );

  let cx = 0;
  for (const ch of upper) {
    const bitmap = font[ch] ?? font["?"];
    if (!bitmap) continue;
    for (let y = 0; y < charH; y++) {
      for (let x = 0; x < bitmap[y].length; x++) {
        if (bitmap[y][x] === "1") {
          grid[y][cx + x] = 1;
        }
      }
    }
    cx += bitmap[0].length + spacing;
  }

  return { grid, width: rawWidth, height: charH };
}
