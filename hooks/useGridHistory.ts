"use client";
import { useCallback, useReducer } from "react";
import { createHistory, historyReducer } from "../lib/history";
import type { Grid } from "../lib/types";

export function useGridHistory(initial: () => Grid) {
  const [state, dispatch] = useReducer(historyReducer, initial, (factory) =>
    createHistory(factory()),
  );
  const edit = useCallback(
    (grid: Grid, checkpoint = true) =>
      dispatch({ type: "edit", grid, checkpoint }),
    [],
  );
  const reset = useCallback(
    (grid: Grid) => dispatch({ type: "reset", grid }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  return {
    grid: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    edit,
    reset,
    undo,
    redo,
  };
}
