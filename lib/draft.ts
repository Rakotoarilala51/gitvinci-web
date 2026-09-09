import {
  calendarColumns,
  emptyGrid,
  normalizeGrid,
  DEFAULT_THRESHOLDS,
} from "./grid";
import { decodeGrid } from "./storage";
import { currentYear, maxYear, parseThresholds } from "./editor-config";

export function readDraft(search: string, raw: string | null) {
  let restoredYear = currentYear;
  let restoredThresholds = { ...DEFAULT_THRESHOLDS };
  let restoredGrid = emptyGrid(calendarColumns(restoredYear));
  try {
    const params = new URLSearchParams(search);
    if (params.has("grid")) {
      const requestedYear = Number(params.get("year"));
      if (
        requestedYear >= 2001 &&
        Number.isInteger(requestedYear) &&
        requestedYear <= maxYear
      )
        restoredYear = requestedYear;
      const values = params.get("t")?.split(",").map(Number);
      if (values?.length === 4)
        restoredThresholds = parseThresholds({
          l1: values[0],
          l2: values[1],
          l3: values[2],
          l4: values[3],
        });
      restoredGrid = decodeGrid(
        params.get("grid")!,
        calendarColumns(restoredYear),
      );
    } else {
      const draft = JSON.parse(raw ?? "null");
      if (draft && Array.isArray(draft.grid)) {
        if (
          Number.isInteger(draft.year) &&
          draft.year >= 2001 &&
          draft.year <= maxYear
        )
          restoredYear = draft.year;
        restoredGrid = draft.grid;
        restoredThresholds = parseThresholds(draft.thresholds);
      }
    }
  } catch {
    /* Ignore errors and use defaults. */
  }

  return {
    year: restoredYear,
    grid: normalizeGrid(restoredGrid, restoredYear),
    thresholds: restoredThresholds,
  };
}
