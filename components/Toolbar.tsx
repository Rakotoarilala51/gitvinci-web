"use client";

import { useEffect } from "react";
import type { Tool, ThemeMode } from "../lib/types";

type Props = {
  tool: Tool; setTool: (tool: Tool) => void;
  canUndo: boolean; canRedo: boolean; canClear: boolean;
  canShiftLeft: boolean; canShiftRight: boolean;
  onUndo: () => void; onRedo: () => void; onClear: () => void;
  onShift: (direction: -1 | 1) => void; theme: ThemeMode; disabled?: boolean;
};

const tools: { id: Tool; label: string; shortcut: string; path: string }[] = [
  { id: "brush", label: "Pinceau", shortcut: "B", path: "m14 3 7 7-9 9-7-7 9-9ZM5 12l-2 9 9-2M12 5l7 7" },
  { id: "eraser", label: "Gomme", shortcut: "E", path: "m14 3 7 7-11 11H6l-4-4L14 3ZM7 12l7 7M10 21h12" },
  { id: "fill", label: "Remplir", shortcut: "F", path: "m10 3 9 9-8 8-9-9 8-8ZM2 11h17M8 1l5 5M21 16s-2 3-2 4a2 2 0 0 0 4 0c0-1-2-4-2-4Z" },
  { id: "cycle", label: "Cycle", shortcut: "C", path: "M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6M4 17a9 9 0 0 0 15 2l3-3m0 6v-6h-6" },
];
function Icon({ path }: { path: string }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}
export default function Toolbar(props: Props) {
  const { tool, setTool, canUndo, canRedo, canClear, canShiftLeft, canShiftRight, onUndo, onRedo, onClear, onShift, disabled } = props;
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (disabled || event.altKey || (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable=true], [role=dialog]"))) return;
      const key = event.key.toLowerCase();
      if (event.metaKey || event.ctrlKey) {
        if (key === "z") { event.preventDefault(); if (event.shiftKey ? canRedo : canUndo) (event.shiftKey ? onRedo : onUndo)(); }
        if (key === "y") { event.preventDefault(); if (canRedo) onRedo(); }
        return;
      }
      const selected = tools.find(item => item.shortcut.toLowerCase() === key);
      if (selected) { event.preventDefault(); setTool(selected.id); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [disabled, setTool, canUndo, canRedo, onUndo, onRedo]);

  return <div className="editor-tool-groups">
    <div className="tool-group" role="group" aria-label="Outils de dessin">
      {tools.map(item => <button type="button" key={item.id} disabled={disabled} className="tool-button" aria-pressed={tool === item.id}
        title={`${item.label} (${item.shortcut})`} onClick={() => setTool(item.id)}>
        <Icon path={item.path} /><span>{item.label}</span><kbd>{item.shortcut}</kbd>
      </button>)}
    </div>
    <div className="tool-group" role="group" aria-label="Historique">
      <button type="button" className="tool-button" disabled={disabled || !canUndo} onClick={onUndo} title="Annuler (Ctrl / ⌘ Z)"><Icon path="M9 4 3 10l6 6M3 10h11a7 7 0 0 1 7 7v3" />Annuler</button>
      <button type="button" className="tool-button" disabled={disabled || !canRedo} onClick={onRedo} title="Rétablir (Ctrl / ⌘ Maj Z)"><Icon path="m15 4 6 6-6 6M21 10H10a7 7 0 0 0-7 7v3" />Rétablir</button>
      <button type="button" className="tool-button tool-danger" disabled={disabled || !canClear} onClick={onClear} title="Effacer tout le motif (annulable)"><Icon path="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />Vider</button>
    </div>
    <div className="tool-group" role="group" aria-label="Décaler le motif">
      <button type="button" className="tool-button" disabled={disabled || !canShiftLeft} onClick={() => onShift(-1)} title="Décaler d’une colonne à gauche (−7 jours)"><Icon path="m10 5-7 7 7 7M3 12h18" />Gauche</button>
      <button type="button" className="tool-button" disabled={disabled || !canShiftRight} onClick={() => onShift(1)} title="Décaler d’une colonne à droite (+7 jours)"><Icon path="m14 5 7 7-7 7M21 12H3" />Droite</button>
    </div>
  </div>;
}
