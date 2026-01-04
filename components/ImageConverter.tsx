"use client";

import { useRef, useState } from "react";
import type { Grid, Intensity, ThemeMode } from "../lib/types";
import { GRID_COLS, GRID_ROWS } from "../lib/types";
import { editorColorFor, themePanelColors } from "../lib/colors";

type Props = {
  year: number;
  theme: ThemeMode;
  onPaste: (grid: Grid) => void;
};

type Thresholds = [number, number, number, number];

const DEFAULT_THRESHOLDS: Thresholds = [0.85, 0.7, 0.5, 0.3];

export default function ImageConverter({ year, theme, onPaste }: Props) {
  const [preview, setPreview] = useState<Grid | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [invert, setInvert] = useState(false);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const fileRef = useRef<HTMLInputElement>(null);
  const panel = themePanelColors(theme);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setPreview(sampleImage(img, invert, thresholds));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const reprocess = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setPreview(sampleImage(img, invert, thresholds));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = () => {
    if (!preview) return;
    const full: Grid = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => 0)
    );
    const xOffset = Math.floor((GRID_COLS - preview[0].length) / 2);
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < preview[y].length; x++) {
        full[y][xOffset + x] = preview[y][x] as Intensity;
      }
    }
    onPaste(full);
  };

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: panel.text }}>
          Image → motif
        </h3>
        <span className="text-[11px]" style={{ color: panel.muted }}>
          Seuillage de luminosité
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full rounded-lg border-2 border-dashed px-4 py-4 text-sm transition-colors hover:border-accent"
        style={{ borderColor: panel.border, color: panel.muted }}
      >
        {fileName ? `📷 ${fileName}` : "📁 Choisir une image (PNG, JPG…)"}
      </button>

      {preview && (
        <>
          <div className="flex flex-wrap gap-3 mt-3 items-center">
            <label
              className="flex items-center gap-2 text-xs"
              style={{ color: panel.text }}
            >
              <input
                type="checkbox"
                checked={invert}
                onChange={(e) => {
                  setInvert(e.target.checked);
                  setTimeout(reprocess, 0);
                }}
                className="accent-accent"
              />
              Inverser
            </label>
            <div className="flex items-center gap-1 text-xs" style={{ color: panel.text }}>
              {["N1", "N2", "N3", "N4"].map((cl, i) => (
                <label key={cl} className="flex items-center gap-1">
                  {cl}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={thresholds[i]}
                    onChange={(e) => {
                      const next = [...thresholds] as Thresholds;
                      next[i] = parseFloat(e.target.value);
                      setThresholds(next);
                      setTimeout(reprocess, 0);
                    }}
                    className="w-16 accent-accent"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={handlePaste}
              className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-on transition-colors hover:bg-accent"
            >
              Ajouter au motif ({year})
            </button>
          </div>

          <div className="mt-3">
            <div
              className="grid gap-[2px] inline-block"
              style={{
                gridTemplateColumns: `repeat(${preview[0].length}, 12px)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 12px)`,
              }}
            >
              {preview.flatMap((row, y) =>
                row.map((v, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="rounded-[2px]"
                    style={{
                      width: 12,
                      height: 12,
                      background:
                        v > 0
                          ? editorColorFor(theme, v as Intensity)
                          : editorColorFor(theme, 0),
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function sampleImage(img: HTMLImageElement, invert: boolean, ts: Thresholds): Grid {
  const canvas = document.createElement("canvas");
  const W = 53;
  const H = 7;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return empty();
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

function empty(): Grid {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => 0)
  );
}