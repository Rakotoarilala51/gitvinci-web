import type { Grid } from "./types";
import { gridsEqual } from "./grid";

export const HISTORY_LIMIT = 60;
export type HistoryState = { present: Grid; past: Grid[]; future: Grid[] };
export type HistoryAction =
  | { type: "edit"; grid: Grid; checkpoint: boolean }
  | { type: "reset"; grid: Grid }
  | { type: "undo" }
  | { type: "redo" };

export function createHistory(grid: Grid): HistoryState {
  return { present: grid, past: [], future: [] };
}

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "reset":
      return createHistory(action.grid);
    case "edit":
      if (gridsEqual(state.present, action.grid)) return state;
      return {
        present: action.grid,
        past: action.checkpoint
          ? [...state.past, state.present].slice(-HISTORY_LIMIT)
          : state.past,
        future: [],
      };
    case "undo": {
      const previous = state.past[state.past.length - 1];
      return previous
        ? {
            present: previous,
            past: state.past.slice(0, -1),
            future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
          }
        : state;
    }
    case "redo": {
      const next = state.future[0];
      return next
        ? {
            present: next,
            past: [...state.past, state.present].slice(-HISTORY_LIMIT),
            future: state.future.slice(1),
          }
        : state;
    }
  }
}
