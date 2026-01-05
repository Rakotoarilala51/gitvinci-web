"use client";

import { useEffect, useState } from "react";
import type { Grid, SavedArt, ThemeMode, ThresholdConfig } from "../lib/types";
import { loadArts, saveArt, deleteArt } from "../lib/storage";
import { editorColorFor, themePanelColors } from "../lib/colors";

type Props = {
  grid: Grid;
  year: number;
  thresholds: ThresholdConfig;
  theme: ThemeMode;
  onLoad: (art: SavedArt) => void;
  onSaveNotification?: (msg: string) => void;
};

export default function Gallery({
  grid,
  year,
  thresholds,
  theme,
  onLoad,
  onSaveNotification,
}: Props) {
  const [arts, setArts] = useState<SavedArt[]>([]);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<SavedArt | null>(null);
  const panel = themePanelColors(theme);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setArts(loadArts());
  }, []);

  const handleSave = () => {
    const art: SavedArt = {
      id: crypto.randomUUID(),
      name: name.trim() || "Sans titre",
      grid: grid.map((r) => [...r]),
      year,
      thresholds: { ...thresholds },
      createdAt: new Date().toISOString(),
      monthLabels: [],
    };
    let next: SavedArt[];
    if (saved) {
      next = saveArt({ ...art, id: saved.id });
    } else {
      next = saveArt(art);
    }
    setArts(next);
    setSaved(art);
    setName("");
    onSaveNotification?.("Motif enregistré dans la galerie !");
  };

  const handleDelete = (id: string) => {
    const next = deleteArt(id);
    setArts(next);
    if (saved?.id === id) setSaved(null);
  };

  const handleLoad = (art: SavedArt) => {
    onLoad(art);
    setSaved(art);
    onSaveNotification?.(`« ${art.name} » chargé.`);
  };

  const input =
    "flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: panel.text }}>
          Galerie
        </h3>
        <span className="text-[11px]" style={{ color: panel.muted }}>
          {arts.length} motif{arts.length > 1 ? "s" : ""} sauvegardé
          {arts.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du motif…"
          className={input}
          style={{ borderColor: panel.border, color: panel.text }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        <button
          onClick={handleSave}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-on transition-colors hover:bg-accent shrink-0"
        >
          {saved ? "Mettre à jour" : "Sauvegarder"}
        </button>
      </div>

      {arts.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {arts.map((art) => (
            <div
              key={art.id}
              className="rounded-lg border p-2"
              style={{ borderColor: panel.border }}
            >
              <button
                onClick={() => handleLoad(art)}
                className="block w-full overflow-x-auto"
                title="Charger ce motif"
              >
                <div
                  className="grid gap-[2px] mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${art.grid[0].length}, 7px)`,
                    gridTemplateRows: `repeat(${art.grid.length}, 7px)`,
                    width: "max-content",
                  }}
                >
                  {art.grid.flatMap((row, y) =>
                    row.map((v, x) => (
                      <div
                        key={`${x}-${y}`}
                        className="rounded-[1px]"
                        style={{
                          width: 7,
                          height: 7,
                          background: editorColorFor(theme, v),
                        }}
                      />
                    )),
                  )}
                </div>
              </button>
              <div className="flex items-center justify-between mt-1.5">
                <div className="min-w-0">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: panel.text }}
                  >
                    {art.name}
                  </div>
                  <div className="text-[10px]" style={{ color: panel.muted }}>
                    {art.year} · {new Date(art.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(art.id)}
                  className="text-xs px-2 py-1 rounded hover:bg-danger/10 text-danger"
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {arts.length === 0 && (
        <p
          className="mt-3 text-center text-xs py-4"
          style={{ color: panel.muted }}
        >
          Rien ici pour l&apos;instant. Dessine puis sauvegarde ton premier
          motif.
        </p>
      )}
    </div>
  );
}
