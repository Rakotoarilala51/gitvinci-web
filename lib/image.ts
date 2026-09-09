import type { Grid, Intensity } from "./types";
import { GRID_COLS } from "./types";
export type ImageThresholds = [number, number, number, number];
export const DEFAULT_IMAGE_THRESHOLDS: ImageThresholds = [0.85, 0.7, 0.5, 0.3];
export function sampleImage(
  img: HTMLImageElement,
  invert: boolean,
  ts: ImageThresholds,
  columns = GRID_COLS,
): Grid {
  const canvas = document.createElement("canvas");
  const W = columns;
  const H = 7;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const x = (W - drawW) / 2;
  const y = (H - drawH) / 2;
  ctx.drawImage(img, x, y, drawW, drawH);
  const data = ctx.getImageData(0, 0, W, H).data;

  const grid: Grid = [];
  for (let row = 0; row < H; row++) {
    const r: number[] = [];
    for (let col = 0; col < W; col++) {
      const i = (row * W + col) * 4;
      const rv = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let lum = (0.2126 * rv + 0.7152 * g + 0.0722 * b) / 255;
      if (invert) lum = 1 - lum;
      let level: Intensity = 0;
      if (lum >= ts[0]) level = 4;
      else if (lum >= ts[1]) level = 3;
      else if (lum >= ts[2]) level = 2;
      else if (lum >= ts[3]) level = 1;
      r.push(level);
    }
    grid.push(r as number[] as Intensity[]);
  }
  return grid;
}
