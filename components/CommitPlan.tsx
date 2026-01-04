"use client";

import { useMemo } from "react";
import type {
  Grid,
  ThresholdConfig,
  ThemeMode,
  CommitEntry,
} from "../lib/types";
import { countCommits, countActiveCells, isFuture, cellToDate } from "../lib/grid";
import { themePanelColors } from "../lib/colors";

type Props = {
  grid: Grid;
  year: number;
  thresholds: ThresholdConfig;
  theme: ThemeMode;
  message: string;
  includeFuture: boolean;
  onMessageChange: (msg: string) => void;
  onIncludeFutureChange: (v: boolean) => void;
  plan: CommitEntry[];
};

export default function CommitPlan({
  grid,
  year,
  thresholds,
  theme,
  message,
  includeFuture,
  onMessageChange,
  onIncludeFutureChange,
  plan,
}: Props) {
  const panel = themePanelColors(theme);

  const futureCount = useMemo(() => {
    let count = 0;
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 53; x++) {
        if (grid[y][x] > 0 && isFuture(cellToDate(y, x, year))) count++;
      }
    }
    return count;
  }, [grid, year]);

  const totalCommits = countCommits(plan);
  const activeCells = countActiveCells(grid);

  const input =
    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const inputStyle = { color: panel.text, borderColor: panel.border };
  void thresholds;

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: panel.text }}>
        Plan de commits
      </h3>

      <label className="block text-xs font-medium mb-1" style={{ color: panel.muted }}>
        Message de commit
      </label>
      <input
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        className={input}
        style={inputStyle}
        placeholder="gitvinci pattern"
      />

      <label
        className="flex items-center gap-2 mt-2 text-xs cursor-pointer"
        style={{ color: panel.text }}
      >
        <input
          type="checkbox"
          checked={includeFuture}
          onChange={(e) => onIncludeFutureChange(e.target.checked)}
          className="accent-accent"
        />
        Inclure les dates futures ({futureCount} cellules)
      </label>
      {futureCount > 0 && includeFuture && (
        <p className="mt-1 text-[11px] text-warn">
          ⚠️ {futureCount} cellules sont dans le futur : GitHub ne prendra en compte ces commits
          qu&apos;à partir de la date arrivée. Décoche pour les exclure du plan.
        </p>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border p-2" style={{ borderColor: panel.border }}>
          <div className="text-lg font-bold text-accent">{activeCells}</div>
          <div className="text-[10px]" style={{ color: panel.muted }}>
            cellules actives
          </div>
        </div>
        <div className="rounded-lg border p-2" style={{ borderColor: panel.border }}>
          <div className="text-lg font-bold text-accent">{totalCommits}</div>
          <div className="text-[10px]" style={{ color: panel.muted }}>
            commits générés
          </div>
        </div>
        <div className="rounded-lg border p-2" style={{ borderColor: panel.border }}>
          <div className="text-lg font-bold text-accent">{plan.length}</div>
          <div className="text-[10px]" style={{ color: panel.muted }}>
            jours avec commits
          </div>
        </div>
      </div>

      <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border" style={{ borderColor: panel.border }}>
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0" style={{ background: panel.card }}>
            <tr style={{ color: panel.muted }}>
              <th className="px-2 py-1.5 font-medium">Date</th>
              <th className="px-2 py-1.5 font-medium">Commits</th>
            </tr>
          </thead>
          <tbody style={{ color: panel.text }}>
            {plan.map((entry) => (
              <tr key={entry.date} className="border-t" style={{ borderColor: panel.border }}>
                <td className="px-2 py-1 font-mono">{entry.date}</td>
                <td className="px-2 py-1">{entry.count}</td>
              </tr>
            ))}
            {plan.length === 0 && (
              <tr>
                <td colSpan={2} className="px-2 py-3 text-center" style={{ color: panel.muted }}>
                  Dessine quelque chose sur la grille pour générer un plan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}