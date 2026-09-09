"use client";
import { useTranslation } from "react-i18next";

import { useImageImport } from "../hooks/useImageImport";
import type { ImageThresholds } from "../lib/image";
import { normalizeGrid } from "../lib/grid";
import type { Grid, Intensity, ThemeMode } from "../lib/types";
import { GRID_ROWS } from "../lib/types";
import { editorColorFor, themePanelColors } from "../lib/colors";

type Props = {
  year: number;
  theme: ThemeMode;
  onPaste: (grid: Grid) => void;
};

export default function ImageConverter({ year, theme, onPaste }: Props) {
  const { t } = useTranslation();

  const {
    preview,
    fileName,
    invert,
    thresholds,
    fileRef,
    handleFile,
    setInvert,
    setThresholds,
    error,
    loading,
  } = useImageImport(year);
  const panel = themePanelColors(theme);
  const handlePaste = () => {
    if (preview) onPaste(normalizeGrid(preview, year));
  };

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: panel.text }}>
          {t("Image → motif")}
        </h3>
        <span className="text-[11px]" style={{ color: panel.muted }}>
          {t("Seuillage de luminosité")}
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
        {fileName ? `📷 ${fileName}` : t("📁 Choisir une image (PNG, JPG…)")}
      </button>

      {error && <p role="alert">{t("imageError")}</p>}
      {loading && <p role="status">{t("imageLoading")}</p>}
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
                }}
                className="accent-accent"
              />
              {t("Inverser")}
            </label>
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: panel.text }}
            >
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
                      const next = [...thresholds] as ImageThresholds;
                      next[i] = parseFloat(e.target.value);
                      setThresholds(next);
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
              {t("Ajouter au motif (")} {year})
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
                )),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
