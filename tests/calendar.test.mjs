import assert from "node:assert/strict";
import { test, after } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const output = mkdtempSync(join(tmpdir(), "gitvinci-calendar-"));
execFileSync(process.execPath, [
  "node_modules/typescript/bin/tsc",
  "lib/grid.ts",
  "lib/history.ts",
  "lib/draft.ts",
  "lib/commit-export.ts",
  "lib/fonts.ts",
  "lib/storage.ts",
  "data/templates.ts",
  "--outDir",
  output,
  "--module",
  "commonjs",
  "--target",
  "es2020",
  "--skipLibCheck",
]);
after(() => rmSync(output, { recursive: true, force: true }));
const calendar = require(join(output, "lib/grid.js"));
const { textToGrid } = require(join(output, "lib/fonts.js"));
const { encodeGrid, decodeGrid } = require(join(output, "lib/storage.js"));
const { TEMPLATES, buildTemplate } = require(join(output, "data/templates.js"));

test("each year has exactly its real days, aligned Sunday–Saturday, including leap years", () => {
  for (let year = 2000; year <= 2100; year++) {
    const days = [];
    const columns = calendar.calendarColumns(year);
    assert.ok(Number.isInteger(columns));
    for (let x = 0; x < columns; x++)
      for (let y = 0; y < 7; y++) {
        if (!calendar.isCalendarDay(y, x, year)) continue;
        const date = calendar.cellToDate(y, x, year);
        assert.equal(date.getUTCDay(), y);
        days.push(calendar.dateToKey(date));
      }
    const expected =
      (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    assert.equal(days.length, expected);
    assert.equal(new Set(days).size, expected);
    assert.equal(days[0], `${year}-01-01`);
    assert.equal(days.at(-1), `${year}-12-31`);
    assert.equal(calendar.getMonthLabels(year).filter(Boolean).length, 12);
  }
  assert.equal(calendar.calendarColumns(2000), 54);
});

test("normalization and fill preserve all calendar dates, including future dates", () => {
  const year = new Date().getUTCFullYear();
  const full = calendar
    .emptyGrid(calendar.calendarColumns(year))
    .map((row) => row.map(() => 4));
  const cleaned = calendar.normalizeGrid(full, year);
  cleaned.forEach((row, y) =>
    row.forEach((value, x) =>
      assert.equal(value, calendar.canPaint(y, x, year) ? 4 : 0),
    ),
  );
  const pastYear = 2024;
  const blank = calendar.emptyGrid(calendar.calendarColumns(pastYear));
  const result = calendar.floodFill(blank, 1, 0, 4, (x, y) =>
    calendar.canPaint(y, x, pastYear),
  );
  assert.equal(calendar.countActiveCells(result.grid), 366);
});

test("54-column and legacy 53-column patterns survive sharing", () => {
  for (const columns of [53, 54]) {
    const grid = calendar.emptyGrid(columns);
    grid[6][columns - 1] = 4;
    grid[0][0] = 2;
    assert.deepEqual(decodeGrid(encodeGrid(grid), columns), grid);
  }
});

test("all templates are rectangular and fit without clipping or changing active pixels", () => {
  for (const template of TEMPLATES) {
    const pattern = template.build(2024);
    assert.equal(pattern.length, 7, template.name);
    assert.ok(pattern.every((row) => row.length === pattern[0].length));
    assert.ok(pattern.flat().some(Boolean));
    const placed = buildTemplate(template, 2024);
    assert.ok(placed, template.name);
    assert.equal(
      placed.flat().filter(Boolean).length,
      pattern.flat().filter(Boolean).length,
    );
    placed.forEach((row, y) =>
      row.forEach((v, x) => {
        if (v) assert.ok(calendar.canPaint(y, x, 2024));
      }),
    );
  }
});

test("text width matches output, including accents, unknown symbols and empty text", () => {
  for (const text of ["", "CODE", "HIRE ME!", "été", "A🙂B", "你好"]) {
    const { grid, width } = textToGrid(text, "5x7");
    assert.ok(
      grid.every((row) => row.length === width),
      text,
    );
  }
  assert.equal(textToGrid("CODE", "5x7").width, 23);
  assert.deepEqual(textToGrid("été", "5x7"), textToGrid("ETE", "5x7"));
  assert.equal(
    calendar.placePattern(textToGrid("X".repeat(100), "5x7").grid, 2024),
    null,
  );
  assert.ok(
    calendar
      .placePattern(textToGrid("", "5x7").grid, 2024)
      .flat()
      .every((v) => v === 0),
  );
});

test("shifting moves each pixel by seven days and refuses destructive boundary moves", () => {
  const year = 2024;
  const original = calendar.emptyGrid(calendar.calendarColumns(year));
  original[3][10] = 2;
  original[6][12] = 4;
  for (const direction of [-1, 1]) {
    const shifted = calendar.shiftGrid(original, year, direction);
    assert.equal(shifted[3][10 + direction], 2);
    assert.equal(shifted[6][12 + direction], 4);
    assert.equal(calendar.countActiveCells(shifted), 2);
    assert.deepEqual(calendar.shiftGrid(shifted, year, -direction), original);
  }
  original[1][0] = 4;
  assert.equal(calendar.shiftGrid(original, year, -1), null);
  assert.equal(original[1][0], 4);
});

test("future drawing survives normalization, sharing and the daily commit plan", () => {
  const year = new Date().getUTCFullYear() + 1;
  const grid = calendar.emptyGrid(calendar.calendarColumns(year));
  grid[3][10] = 2;
  const preserved = calendar.normalizeGrid(grid, year);
  assert.equal(preserved[3][10], 2);
  assert.deepEqual(
    decodeGrid(encodeGrid(preserved), preserved[0].length),
    grid,
  );
  const plan = calendar.buildCommitPlan(
    preserved,
    year,
    calendar.DEFAULT_THRESHOLDS,
    "",
    true,
  );
  assert.equal(plan.length, 1);
  assert.equal(plan[0].count, 5);
  assert.equal(
    plan[0].date,
    calendar.dateToKey(calendar.cellToDate(3, 10, year)),
  );
  assert.equal(
    calendar.buildCommitPlan(
      preserved,
      year,
      calendar.DEFAULT_THRESHOLDS,
      "",
      false,
    ).length,
    0,
  );
});

test("No-life fills every actual day of common, leap and 54-column years", () => {
  const template = TEMPLATES.find((item) => item.name === "No-life");
  for (const year of [2000, 2024, 2025, 2027]) {
    const grid = buildTemplate(template, year);
    const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    assert.equal(grid.flat().filter(Boolean).length, days);
    grid.forEach((row, y) =>
      row.forEach((value, x) =>
        assert.equal(value, calendar.isCalendarDay(y, x, year) ? 4 : 0),
      ),
    );
  }
});

test("Batman is a symmetric seven-row silhouette", () => {
  const pattern = TEMPLATES.find((item) => item.name === "Batman").build();
  assert.equal(pattern.length, 7);
  for (const row of pattern) assert.deepEqual(row, [...row].reverse());
});

const { createHistory, historyReducer } = require(
  join(output, "lib/history.js"),
);
const { readDraft } = require(join(output, "lib/draft.js"));
const { commitsToCsv } = require(join(output, "lib/commit-export.js"));

test("a drawing stroke is a single undo step and new edits discard redo", () => {
  const blank = calendar.emptyGrid();
  const first = calendar.cloneGrid(blank);
  first[2][10] = 4;
  const last = calendar.cloneGrid(first);
  last[2][11] = 4;
  let history = createHistory(blank);
  history = historyReducer(history, {
    type: "edit",
    grid: first,
    checkpoint: true,
  });
  history = historyReducer(history, {
    type: "edit",
    grid: last,
    checkpoint: false,
  });
  assert.equal(history.past.length, 1);
  history = historyReducer(history, { type: "undo" });
  assert.deepEqual(history.present, blank);
  history = historyReducer(history, { type: "redo" });
  assert.deepEqual(history.present, last);
  history = historyReducer(history, { type: "undo" });
  history = historyReducer(history, {
    type: "edit",
    grid: first,
    checkpoint: true,
  });
  assert.equal(history.future.length, 0);
  assert.deepEqual(blank, calendar.emptyGrid());
});

test("history is bounded and changing a document clears undo and redo", () => {
  let history = createHistory(calendar.emptyGrid());
  for (let i = 0; i < 80; i++) {
    const grid = calendar.cloneGrid(history.present);
    grid[0][0] = (i + 1) % 5;
    history = historyReducer(history, { type: "edit", grid, checkpoint: true });
  }
  assert.equal(history.past.length, 60);
  history = historyReducer(history, {
    type: "reset",
    grid: calendar.emptyGrid(54),
  });
  assert.equal(history.present[0].length, 54);
  assert.equal(history.past.length, 0);
  assert.equal(history.future.length, 0);
});

test("draft restoration handles corruption and prioritizes shared patterns", () => {
  assert.ok(
    readDraft("", "{broken")
      .grid.flat()
      .every((v) => v === 0),
  );
  const grid = calendar.emptyGrid();
  grid[2][10] = 2;
  const search = "?year=2024&grid=" + encodeGrid(grid) + "&t=1,7,10,20";
  const restored = readDraft(
    search,
    JSON.stringify({ year: 2023, grid: calendar.emptyGrid() }),
  );
  assert.equal(restored.year, 2024);
  assert.equal(restored.grid[2][10], 2);
  assert.equal(restored.thresholds.l2, 7);
  assert.equal(
    readDraft("?year=2024&grid=" + encodeGrid(grid) + "&t=-1,200,0,20", null)
      .thresholds.l2,
    5,
  );
});

test("commit CSV preserves requested date format and counts", () => {
  assert.equal(
    commitsToCsv([{ date: "2013-12-10", count: 5, message: "" }]),
    "date,commits\n10-12-2013,5",
  );
});
