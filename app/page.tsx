"use client";
import { useTranslation } from "react-i18next";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Grid, Intensity, SavedArt, ThemeMode, Tool, ThresholdConfig } from "../lib/types";
import { calendarColumns, DEFAULT_THRESHOLDS, emptyGrid, gridsEqual, normalizeGrid, patternSpace, placePattern, shiftGrid, buildCommitPlan } from "../lib/grid";
import { textToGrid } from "../lib/fonts";
import { decodeGrid } from "../lib/storage";
import EditorGrid from "../components/EditorGrid";
import Navbar from "../components/Navbar";
import Toolbar from "../components/Toolbar";
import IntensityPalette from "../components/IntensityPalette";
import TemplatePicker from "../components/TemplatePicker";
import Gallery from "../components/Gallery";
import ShareModal from "../components/ShareModal";
import CommitPlan from "../components/CommitPlan";
import ImageConverter from "../components/ImageConverter";

const DRAFT_KEY = "gitvinci:draft";
const currentYear = new Date().getUTCFullYear();
const maxYear = currentYear + 5;
function parseThresholds(value: Partial<ThresholdConfig> | null): ThresholdConfig {
  const result = { ...DEFAULT_THRESHOLDS };
  for (const key of ["l1", "l2", "l3", "l4"] as const) {
    const amount = value?.[key];
    if (typeof amount === "number" && Number.isInteger(amount) && amount >= 1 && amount <= 100) result[key] = amount;
  }
  return result;
}

export default function Home() {
  const { t } = useTranslation();

  const [year, setYear] = useState(currentYear);
  const [grid, setGrid] = useState<Grid>(() => emptyGrid(calendarColumns(currentYear)));
  const [tool, setTool] = useState<Tool>("brush");
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>(4);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [past, setPast] = useState<Grid[]>([]);
  const [future, setFuture] = useState<Grid[]>([]);
  const [text, setText] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<ThresholdConfig>({ ...DEFAULT_THRESHOLDS });
  const [ready, setReady] = useState(false);
  const textStroke = useRef(false);
  const notifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const space = patternSpace(year);
  const textPattern = textToGrid(text, "5x7");
  const textFits = textPattern.width <= space.width;
  const hasArt = grid.some(row => row.some(Boolean));
  const shiftedLeft = useMemo(() => shiftGrid(grid, year, -1), [grid, year]);
  const shiftedRight = useMemo(() => shiftGrid(grid, year, 1), [grid, year]);
  const plan = useMemo(() => buildCommitPlan(grid, year, thresholds, "gitvinci pattern", true), [grid, year, thresholds]);

  useEffect(() => {
    let restoredYear = currentYear;
    let restoredThresholds = { ...DEFAULT_THRESHOLDS };
    let restoredGrid = emptyGrid(calendarColumns(restoredYear));
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("grid")) {
        const requestedYear = Number(params.get("year"));
        if (requestedYear >= 2001 && Number.isInteger(requestedYear) && requestedYear <= maxYear) restoredYear = requestedYear;
        const values = params.get("t")?.split(",").map(Number);
        if (values?.length === 4) restoredThresholds = parseThresholds({ l1: values[0], l2: values[1], l3: values[2], l4: values[3] });
        restoredGrid = decodeGrid(params.get("grid")!, calendarColumns(restoredYear));
      } else {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
        if (draft && Array.isArray(draft.grid)) {
          if (Number.isInteger(draft.year) && draft.year >= 2001 && draft.year <= maxYear) restoredYear = draft.year;
          restoredGrid = draft.grid;
          restoredThresholds = parseThresholds(draft.thresholds);
        }
      }
    } catch { /* Ignore errors and use defaults. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore browser-only persisted state once
    setThresholds(restoredThresholds);
    setYear(restoredYear);
    setGrid(normalizeGrid(restoredGrid, restoredYear));
    setReady(true);
    return () => { if (notifyTimer.current) clearTimeout(notifyTimer.current); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ grid, year, thresholds })); }
    catch { /* Editing remains available without local storage. */ }
  }, [grid, year, ready, thresholds]);

  const notify = useCallback((message: string) => {
    setNotification(message);
    if (notifyTimer.current) clearTimeout(notifyTimer.current);
    notifyTimer.current = setTimeout(() => setNotification(null), 2600);
  }, []);

  function remember() {
    setPast(previous => [...previous, grid].slice(-60));
    setFuture([]);
  }

  function replace(next: Grid) {
    if (!gridsEqual(grid, next)) { remember(); setGrid(next); }
    setText("");
    textStroke.current = false;
  }

  function undo() {
    if (!past.length) return;
    setFuture(previous => [grid, ...previous].slice(0, 60));
    setGrid(past[past.length - 1]);
    setPast(past.slice(0, -1));
    setText("");
    textStroke.current = false;
  }

  function redo() {
    if (!future.length) return;
    setPast(previous => [...previous, grid].slice(-60));
    setGrid(future[0]);
    setFuture(future.slice(1));
    setText("");
    textStroke.current = false;
  }

  function changeYear(nextYear: number) {
    setGrid(normalizeGrid(grid, nextYear));
    setYear(nextYear);
    setPast([]);
    setFuture([]);
    setText("");
    textStroke.current = false;
  }

  function writeText(value: string, intensity = selectedIntensity) {
    setText(value);
    const pattern = textToGrid(value, "5x7");
    const next = placePattern(pattern.grid, year, intensity);
    if (!next) return;
    if (!textStroke.current) { remember(); textStroke.current = true; }
    setGrid(next);
  }

  function loadArt(art: SavedArt) {
    if (art.year < 2001 || art.year > maxYear) { notify(t("Ce motif utilise une année indisponible.")); return; }
    setThresholds(parseThresholds(art.thresholds));
    setYear(art.year);
    setGrid(normalizeGrid(art.grid, art.year));
    setPast([]);
    setFuture([]);
    setText("");
  }

  return (
    <main className="arcade-app min-h-screen">
      <a className="skip-link" href="#editor">{" "}{t("Aller à l’éditeur")}{" "}</a>
      <Navbar />

      <div className="app-container">
        <section className="hero" aria-labelledby="hero-title">
          <div><p className="eyebrow">{" "}{t("GITHUB CONTRIBUTION ART / ÉDITION ARCADE")}{" "}</p>
            <h1 id="hero-title">{" "}{t("Tes commits.")}{" "}<br /><span>{" "}{t("Ton terrain de jeu.")}{" "}</span></h1>
            <p className="hero-description">{" "}{t("Un vrai calendrier, des pixels et tes idées. Dessine à la main, écris directement dans l’éditeur ou pars d’un template.")}{" "}</p>
            <a href="#editor" className="hero-cta">{" "}{t("À toi de jouer")}{" "}<span aria-hidden="true">↓</span></a>
          </div>
          <div className="pixel-art" aria-hidden="true">
            {["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10100000101", "00011011000"].flatMap((row, y) =>
              [...row].map((cell, x) => <span key={y * 11 + x} className={cell === "1" ? "pixel-on" : ""} />))}
            <p>MAKE COMMITS. MAKE ART.</p>
          </div>
        </section>

        <section id="editor" className="editor-section" aria-labelledby="editor-title">
          <div className="section-heading">
            <div><span className="step-number">✎</span><h2 id="editor-title">{" "}{t("Ton studio pixel")}{" "}</h2></div>
            <div className="editor-settings">
              <label htmlFor="calendar-year">{" "}{t("Année")}{" "}</label>
              <select id="calendar-year" value={year} onChange={event => changeYear(Number(event.target.value))}>
                {Array.from({ length: maxYear - 2000 }, (_, i) => maxYear - i).map(value => <option key={value}>{value}</option>)}
              </select>
              <button className="preview-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? t("☀ Clair") : t("☾ Sombre")}</button>
            </div>
          </div>
          <div className="studio-controls">
            <Toolbar tool={tool} setTool={setTool} canUndo={past.length > 0} canRedo={future.length > 0} canClear={hasArt} disabled={!ready || !!shareId} canShiftLeft={hasArt && !!shiftedLeft} canShiftRight={hasArt && !!shiftedRight} onShift={direction => { const next = direction === -1 ? shiftedLeft : shiftedRight; if (next) replace(next); }} onUndo={undo} onRedo={redo} onClear={() => replace(emptyGrid(calendarColumns(year)))} theme={theme} />
            <IntensityPalette selected={selectedIntensity} onChange={value => { setSelectedIntensity(value); if (text && textFits) { textStroke.current = false; writeText(text, value); textStroke.current = false; } }} theme={theme} />
          </div>
          <div className="editor-text">
            <label htmlFor="pixel-text"><span aria-hidden="true">Tt</span>{" "}{t("Texte → pixel art")}{" "}</label>
            <input id="pixel-text" value={text} placeholder={t("Écris ici : CODE, HELLO, HIRE ME!…")}
              onFocus={() => { textStroke.current = false; }} onBlur={() => { textStroke.current = false; }}
              onChange={event => writeText(event.target.value)}
              aria-describedby="text-help" aria-invalid={!textFits} autoComplete="off" spellCheck={false} />
            <span className={textFits ? "text-capacity" : "text-danger"}>{textPattern.width} / {space.width}{" "}{t("colonnes")}{" "}</span>
          </div>
          <p id="text-help" className={`editor-help ${textFits ? "" : "text-danger"}`}>
            {textFits ? t("Le texte remplace le dessin en direct. Annuler restaure le motif précédent. Police 5 × 7 ; accents convertis, symboles inconnus remplacés par ?.") : t("Texte trop long pour les semaines disponibles. Raccourcis-le : le dernier motif valide est conservé.")}
          </p>
          <EditorGrid key={year} grid={grid} year={year} theme={theme} tool={tool} selectedIntensity={selectedIntensity} disabled={!ready}
            onEdit={(next, options) => { if (options.startStroke) remember(); setGrid(next); setText(""); textStroke.current = false; }} />
          <div className="studio-status"><span>{year}{" "}{t("· calendrier annuel · UTC ·")}{" "}{grid.flat().filter(Boolean).length}{" "}{t("jours dessinés")}{" "}</span>
            <span>{" "}{t("Dates futures éditables · décalage : 1 colonne = 7 jours")}{" "}</span>
            <button className="studio-share" disabled={!grid.flat().some(Boolean)} onClick={() => setShareId(crypto.randomUUID())}>{" "}{t("Partager le motif ↗")}{" "}</button>
          </div>
        </section>

        <p className="editor-help">{" "}{t("Les décalages conservent tout le motif : une direction se désactive si un pixel sortirait de l’année.")}{" "}</p>
        <CommitPlan plan={plan} thresholds={thresholds} onThresholdsChange={setThresholds} />
        <TemplatePicker year={year} theme={theme} onPaste={next => { replace(next); notify(t("Template ajouté. À toi de le personnaliser !")); }} />
        <section className="library-section" id="gallery" aria-label={t("Mes motifs et import")}>
          <Gallery grid={grid} year={year} thresholds={thresholds} theme={theme} onLoad={loadArt} onSaveNotification={notify} />
          <details className="image-import"><summary>{" "}{t("Importer une image")}{" "}</summary><ImageConverter year={year} theme={theme} onPaste={next => { replace(normalizeGrid(next, year)); notify(t("Image ajoutée.")); }} /></details>
        </section>
        <footer className="site-footer text-xs">{" "}{t("Gitvinci · Ton atelier de contribution art. GitHub n’est pas affilié à ce projet.")}{" "}</footer>
      </div>
      {notification && <div role="status" className="studio-notification">{notification}</div>}
      {shareId && <ShareModal id={shareId} grid={grid} year={year} thresholds={thresholds} theme={theme} onClose={() => setShareId(null)} />}
    </main>
  );
}
