import type { Intensity, ThemeMode } from "./types";

export const GITHUB_SCALE_LIGHT = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
];

export const GITHUB_SCALE_DARK = [
  "#161b22",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
];

export const EDITOR_SCALE_LIGHT = [
  "#111827", "#20265b", "#2a3fe5", "#8f7cce", "#f4b9b0",
];

export const EDITOR_SCALE_DARK = EDITOR_SCALE_LIGHT;

export function scaleFor(theme: ThemeMode): string[] {
  return theme === "light" ? GITHUB_SCALE_LIGHT : GITHUB_SCALE_DARK;
}

export function colorFor(theme: ThemeMode, level: Intensity): string {
  return scaleFor(theme)[level];
}

export function editorColorFor(theme: ThemeMode, level: Intensity): string {
  return (theme === "light" ? EDITOR_SCALE_LIGHT : EDITOR_SCALE_DARK)[level];
}

// Application chrome follows the arcade tokens; theme controls the GitHub preview.
export function themePanelColors(_theme: ThemeMode) {
  void _theme;
  return {
    card: "var(--surface)",
    border: "var(--border-soft)",
    text: "var(--fg)",
    muted: "var(--muted)",
    gridBg: "var(--bg)",
  };
}
