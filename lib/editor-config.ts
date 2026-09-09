import { DEFAULT_THRESHOLDS } from "./grid";
import type { ThresholdConfig } from "./types";

export const DRAFT_KEY = "gitvinci:draft";
export const currentYear = new Date().getUTCFullYear();
export const maxYear = currentYear + 5;
export function parseThresholds(
  value: Partial<ThresholdConfig> | null,
): ThresholdConfig {
  const result = { ...DEFAULT_THRESHOLDS };
  for (const key of ["l1", "l2", "l3", "l4"] as const) {
    const amount = value?.[key];
    if (
      typeof amount === "number" &&
      Number.isInteger(amount) &&
      amount >= 1 &&
      amount <= 100
    )
      result[key] = amount;
  }
  return result;
}

export const CELL_SIZE = 12;
export const CELL_GAP = 3;
