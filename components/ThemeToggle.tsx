"use client";

import type { ThemeMode } from "../lib/types";

type Props = {
  mode: ThemeMode;
  onChange: (m: ThemeMode) => void;
};

export default function ThemeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center rounded-lg border border-border-soft overflow-hidden">
      <button
        onClick={() => onChange("light")}
        className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
          mode === "light" ? "bg-accent text-accent-on" : "text-foreground"
        }`}
        aria-pressed={mode === "light"}
      >
        ☀️ Clair
      </button>
      <button
        onClick={() => onChange("dark")}
        className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
          mode === "dark" ? "bg-accent text-accent-on" : "text-foreground"
        }`}
        aria-pressed={mode === "dark"}
      >
        🌙 Sombre
      </button>
    </div>
  );
}
