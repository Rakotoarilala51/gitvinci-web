"use client";
import { useTranslation } from "react-i18next";

import { useEditorShortcuts } from "../hooks/useEditorShortcuts";
import { EDITOR_TOOLS } from "../data/editor-tools";
import type { Tool, ThemeMode } from "../lib/types";

type Props = {
  tool: Tool;
  setTool: (tool: Tool) => void;
  canUndo: boolean;
  canRedo: boolean;
  canClear: boolean;
  canShiftLeft: boolean;
  canShiftRight: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onShift: (direction: -1 | 1) => void;
  theme: ThemeMode;
  disabled?: boolean;
};

function Icon({ path }: { path: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
export default function Toolbar(props: Props) {
  const { t } = useTranslation();

  const {
    tool,
    setTool,
    canUndo,
    canRedo,
    canClear,
    canShiftLeft,
    canShiftRight,
    onUndo,
    onRedo,
    onClear,
    onShift,
    disabled,
  } = props;
  useEditorShortcuts({ disabled, canUndo, canRedo, onUndo, onRedo, setTool });

  return (
    <div className="editor-tool-groups">
      <div
        className="tool-group"
        role="group"
        aria-label={t("Outils de dessin")}
      >
        {EDITOR_TOOLS.map((item) => (
          <button
            type="button"
            key={item.id}
            disabled={disabled}
            className="tool-button"
            aria-pressed={tool === item.id}
            title={`${t(item.label)} (${item.shortcut})`}
            onClick={() => setTool(item.id)}
          >
            <Icon path={item.path} />
            <span>{t(item.label)}</span>
            <kbd>{item.shortcut}</kbd>
          </button>
        ))}
      </div>
      <div className="tool-group" role="group" aria-label={t("Historique")}>
        <button
          type="button"
          className="tool-button"
          disabled={disabled || !canUndo}
          onClick={onUndo}
          title={t("Annuler (Ctrl / ⌘ Z)")}
        >
          <Icon path="M9 4 3 10l6 6M3 10h11a7 7 0 0 1 7 7v3" />
          {t("Annuler")}
        </button>
        <button
          type="button"
          className="tool-button"
          disabled={disabled || !canRedo}
          onClick={onRedo}
          title={t("Rétablir (Ctrl / ⌘ Maj Z)")}
        >
          <Icon path="m15 4 6 6-6 6M21 10H10a7 7 0 0 0-7 7v3" />
          {t("Rétablir")}
        </button>
        <button
          type="button"
          className="tool-button tool-danger"
          disabled={disabled || !canClear}
          onClick={onClear}
          title={t("Effacer tout le motif (annulable)")}
        >
          <Icon path="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
          {t("Vider")}
        </button>
      </div>
      <div
        className="tool-group"
        role="group"
        aria-label={t("Décaler le motif")}
      >
        <button
          type="button"
          className="tool-button"
          disabled={disabled || !canShiftLeft}
          onClick={() => onShift(-1)}
          title={t("Décaler d’une colonne à gauche (−7 jours)")}
        >
          <Icon path="m10 5-7 7 7 7M3 12h18" />
          {t("Gauche")}
        </button>
        <button
          type="button"
          className="tool-button"
          disabled={disabled || !canShiftRight}
          onClick={() => onShift(1)}
          title={t("Décaler d’une colonne à droite (+7 jours)")}
        >
          <Icon path="m14 5 7 7-7 7M21 12H3" />
          {t("Droite")}
        </button>
      </div>
    </div>
  );
}
