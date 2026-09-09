"use client";
import { useEffect } from "react";
import { EDITOR_TOOLS } from "../data/editor-tools";
import type { Tool } from "../lib/types";

type Options = {
  disabled?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  setTool: (tool: Tool) => void;
};
export function useEditorShortcuts({
  disabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  setTool,
}: Options) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (
        disabled ||
        event.altKey ||
        (event.target instanceof HTMLElement &&
          event.target.closest(
            "input, textarea, select, [contenteditable=true], [role=dialog]",
          ))
      )
        return;
      const key = event.key.toLowerCase();
      if (event.metaKey || event.ctrlKey) {
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey ? canRedo : canUndo)
            (event.shiftKey ? onRedo : onUndo)();
        }
        if (key === "y") {
          event.preventDefault();
          if (canRedo) onRedo();
        }
        return;
      }
      const selected = EDITOR_TOOLS.find(
        (item) => item.shortcut.toLowerCase() === key,
      );
      if (selected) {
        event.preventDefault();
        setTool(selected.id);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [disabled, setTool, canUndo, canRedo, onUndo, onRedo]);
}
