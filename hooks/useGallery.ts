"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Grid, SavedArt, ThresholdConfig } from "../lib/types";
import { loadArts, saveArt, deleteArt } from "../lib/storage";
type Options = {
  grid: Grid;
  year: number;
  thresholds: ThresholdConfig;
  onLoad: (art: SavedArt) => void;
  onSaveNotification?: (message: string) => void;
};
export function useGallery({
  grid,
  year,
  thresholds,
  onLoad,
  onSaveNotification,
}: Options) {
  const { t } = useTranslation();
  const [arts, setArts] = useState<SavedArt[]>([]);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<SavedArt | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setArts(loadArts());
  }, []);

  const handleSave = () => {
    const art: SavedArt = {
      id: saved?.id ?? crypto.randomUUID(),
      name: name.trim() || t("Sans titre"),
      grid: grid.map((r) => [...r]),
      year,
      thresholds: { ...thresholds },
      createdAt: new Date().toISOString(),
      monthLabels: [],
    };
    const next = saveArt(art);
    setArts(next);
    setSaved(art);
    setName("");
    onSaveNotification?.(t("Motif enregistré dans la galerie !"));
  };

  const handleDelete = (id: string) => {
    const next = deleteArt(id);
    setArts(next);
    if (saved?.id === id) setSaved(null);
  };

  const handleLoad = (art: SavedArt) => {
    onLoad(art);
    setSaved(art);
    onSaveNotification?.(t("loadedPattern", { name: art.name }));
  };

  return { arts, name, saved, setName, handleSave, handleDelete, handleLoad };
}
