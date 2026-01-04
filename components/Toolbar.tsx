"use client";

import type { Tool, ThemeMode } from "../lib/types";
import { themePanelColors } from "../lib/colors";

type Props = {
  tool: Tool;
  setTool: (t: Tool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  theme: ThemeMode;
};

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: "cycle", label: "Cycler", icon: "◔" },
  { id: "brush", label: "Pinceau", icon: "✎" },
  { id: "eraser", label: "Gomme", icon: "⌫" },
  { id: "fill", label: "Remplir", icon: "▤" },
];

export default function Toolbar({
  tool,
  setTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  theme,
}: Props) {
  const panel = themePanelColors(theme);

  const base =
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          className={`${base} ${
            tool === t.id
              ? "bg-accent text-accent-on shadow-sm"
              : "hover:bg-accent/10"
          }`}
          style={tool !== t.id ? { color: panel.text } : undefined}
          aria-pressed={tool === t.id}
        >
          <span className="text-base leading-none">{t.icon}</span>
          {t.label}
        </button>
      ))}

      <div className="w-px h-6 bg-current opacity-15 mx-1" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`${base} ${canUndo ? "hover:bg-accent/10" : "opacity-40 cursor-not-allowed"}`}
        style={{ color: panel.text }}
      >
        ↩ Annuler
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`${base} ${canRedo ? "hover:bg-accent/10" : "opacity-40 cursor-not-allowed"}`}
        style={{ color: panel.text }}
      >
        ↪ Rétablir
      </button>
      <button
        onClick={onClear}
        className={`${base} hover:bg-danger/10`}
        style={{ color: panel.text }}
      >
        ✕ Vider
      </button>
    </div>
  );
}