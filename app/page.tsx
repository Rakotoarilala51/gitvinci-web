"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Grid,
  Intensity,
  SavedArt,
  ThemeMode,
  ThresholdConfig,
  Tool,
} from "../lib/types";
import {
  emptyGrid,
  gridsEqual,
  getMonthLabels,
  DEFAULT_THRESHOLDS,
  buildCommitPlan,
} from "../lib/grid";
import { decodeGrid } from "../lib/storage";
import { themePanelColors } from "../lib/colors";
import EditorGrid from "../components/EditorGrid";
import GridPreview from "../components/GridPreview";
import Toolbar from "../components/Toolbar";
import IntensityPalette from "../components/IntensityPalette";
import SettingsPanel from "../components/SettingsPanel";
import TextConverter from "../components/TextConverter";
import ImageConverter from "../components/ImageConverter";
import TemplatePicker from "../components/TemplatePicker";
import CommitPlan from "../components/CommitPlan";
import ScriptPanel from "../components/ScriptPanel";
import Gallery from "../components/Gallery";
import ShareModal from "../components/ShareModal";

const DRAFT_KEY = "gitvinci:draft";

type Draft = {
  grid: Grid;
  year: number;
  thresholds: ThresholdConfig;
  tool: Tool;
  selectedIntensity: Intensity;
};

export default function Home() {
  const [grid, setGrid] = useState<Grid>(() => emptyGrid());
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [tool, setTool] = useState<Tool>("cycle");
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity>(3);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    ...DEFAULT_THRESHOLDS,
  });
  const [past, setPast] = useState<Grid[]>([]);
  const [future, setFuture] = useState<Grid[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareId, setShareId] = useState<string>("");
  const [commitMessage, setCommitMessage] = useState("gitvinci pattern");
  const [includeFuture, setIncludeFuture] = useState(false);

  const notifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);
  const initialised = useRef(false);

  const monthLabels = useMemo(() => getMonthLabels(year), [year]);

  const setInitialFromParams = (params: URLSearchParams) => {
    const y = Number(params.get("year"));
    if (y && y > 2000 && y < 2100) setYear(y);
    const t = params.get("t");
    if (t) {
      const parts = t.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n) && n > 0)) {
        setThresholds({ l1: parts[0], l2: parts[1], l3: parts[2], l4: parts[3] });
      }
    }
  };

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const params = new URLSearchParams(window.location.search);
    const artParam = params.get("art");
    const gridParam = params.get("grid");
    if (gridParam) {
      const decoded = decodeGrid(gridParam, 53);
      if (!gridsEqual(decoded, emptyGrid())) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from share URL
        setGrid(decoded);
        setInitialFromParams(params);
        initialised.current = true;
        return;
      }
    }
    if (artParam) {
      setShareId(artParam);
    }
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Draft;
        if (parsed.grid && Array.isArray(parsed.grid)) {
          setGrid(parsed.grid);
          if (parsed.year) setYear(parsed.year);
          if (parsed.thresholds) setThresholds({ ...DEFAULT_THRESHOLDS, ...parsed.thresholds });
        }
      } catch {
        // ignore corrupt draft
      }
    }
    initialised.current = true;
  }, []);

  useEffect(() => {
    if (!initialised.current) return;
    const draft: Draft = { grid, year, thresholds, tool, selectedIntensity };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // storage full or unavailable
    }
  }, [grid, year, thresholds, tool, selectedIntensity]);

  const notify = useCallback((msg: string) => {
    setNotification(msg);
    if (notifyTimer.current) clearTimeout(notifyTimer.current);
    notifyTimer.current = setTimeout(() => setNotification(null), 2400);
  }, []);

  const handleEdit = useCallback(
    (
      next: Grid,
      opts: { startStroke: boolean; intent: "brush" | "fill" | "cycle" }
    ) => {
      setGrid(next);
      if (opts.startStroke) {
        const prev = grid;
        setPast((p) => (p.length >= 60 ? [...p.slice(1), prev] : [...p, prev]));
        setFuture([]);
      }
    },
    [grid]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([grid, ...future].slice(0, 60));
    setGrid(prev);
  }, [grid, past, future]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast([...past, grid].slice(-60));
    setGrid(next);
  }, [grid, past, future]);

  const clear = useCallback(() => {
    const empty = emptyGrid();
    if (gridsEqual(grid, empty)) return;
    setPast((p) => (p.length >= 60 ? [...p.slice(1), grid] : [...p, grid]));
    setFuture([]);
    setGrid(empty);
  }, [grid]);

  const handlePaste = useCallback(
    (newGrid: Grid) => {
      setPast((p) => (p.length >= 60 ? [...p.slice(1), grid] : [...p, grid]));
      setFuture([]);
      setGrid(newGrid);
      notify("Motif ajouté !");
    },
    [grid, notify]
  );

  const handleLoadArt = useCallback(
    (art: SavedArt) => {
      setPast((p) => (p.length >= 60 ? [...p.slice(1), grid] : [...p, grid]));
      setFuture([]);
      setGrid(art.grid.map((r) => [...r]));
      setYear(art.year);
      setThresholds({ ...DEFAULT_THRESHOLDS, ...art.thresholds });
    },
    [grid]
  );

  const openShare = () => {
    setShareId(crypto.randomUUID());
    setShareOpen(true);
  };

  const plan = useMemo(
    () => buildCommitPlan(grid, year, thresholds, commitMessage, includeFuture),
    [grid, year, thresholds, commitMessage, includeFuture]
  );

  const panel = themePanelColors(theme);

  return (
    <main className="arcade-app min-h-screen">
      <a className="skip-link" href="#editor">Aller à l’éditeur</a>
      <header className="site-header">
        <div className="app-container header-inner">
          <a href="#" className="brand" aria-label="Gitvinci, accueil">
            <span className="brand-mark" aria-hidden="true">G<span>▝</span></span>
            <span>gitvinci<span className="brand-dot">.</span></span>
          </a>
          <nav aria-label="Navigation principale">
            <a href="#editor">Éditeur</a>
            <a href="#create">Créer</a>
            <a href="#export">Exporter <span aria-hidden="true">↗</span></a>
          </nav>
          <span className="status-badge"><span /> ATELIER PIXEL</span>
        </div>
      </header>

      <div className="app-container">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">GITHUB CONTRIBUTION ART / ÉDITION ARCADE</p>
            <h1 id="hero-title">Tes commits.<br /><span>Ton terrain de jeu.</span></h1>
            <p className="hero-description">Transforme ton graph GitHub en pixel art. Dessine un motif,
              joue avec les intensités et génère ton script de commits.</p>
            <a href="#editor" className="hero-cta">À toi de jouer <span aria-hidden="true">↓</span></a>
          </div>
          <div className="pixel-art" aria-hidden="true">
            {["00110001100", "00011011000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"].flatMap((row, y) =>
              [...row].map((cell, x) => <span key={y * 11 + x} className={cell === "1" ? "pixel-on" : ""} />)
            )}
            <p>MAKE COMMITS. MAKE ART.</p>
          </div>
        </section>

        <section id="editor" className="editor-section space-y-4" aria-labelledby="editor-title">
          <div className="section-heading">
            <div><span className="step-number">01</span><h2 id="editor-title">Le terrain de jeu</h2></div>
            <span className="eyebrow">{year} / 53 × 7 PIXELS</span>
          </div>
          <div className="editor-toolbar flex flex-wrap items-center justify-between gap-3">
            <Toolbar
              tool={tool}
              setTool={setTool}
              canUndo={past.length > 0}
              canRedo={future.length > 0}
              onUndo={undo}
              onRedo={redo}
              onClear={clear}
              theme={theme}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <IntensityPalette
                selected={selectedIntensity}
                onChange={setSelectedIntensity}
                theme={theme}
              />
            </div>
          </div>

          <EditorGrid
            grid={grid}
            tool={tool}
            selectedIntensity={selectedIntensity}
            theme={theme}
            monthLabels={monthLabels}
            onEdit={handleEdit}
            onStrokeEnd={() => {}}
          />
        </section>

        <section className="preview-section">
          <div className="section-heading">
            <div><span className="live-dot" /><h2>Aperçu GitHub</h2></div>
            <button className="preview-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? "☀ Aperçu clair" : "☾ Aperçu sombre"}
            </button>
          </div>
          <GridPreview grid={grid} year={year} theme={theme} />
        </section>

        <section className="workspace-columns grid lg:grid-cols-2 gap-6">
          <div id="create" className="space-y-4 min-w-0">
            <div className="section-heading"><div><span className="step-number">02</span><h2>Compose ton motif</h2></div></div>
            <SettingsPanel
              year={year}
              setYear={setYear}
              thresholds={thresholds}
              setThresholds={setThresholds}
              theme={theme}
            />
            <TemplatePicker theme={theme} onPaste={handlePaste} />
            <TextConverter year={year} theme={theme} onPaste={handlePaste} />
            <ImageConverter year={year} theme={theme} onPaste={handlePaste} />
          </div>

          <div id="export" className="space-y-4 min-w-0">
            <div className="section-heading"><div><span className="step-number">03</span><h2>Passe au commit</h2></div></div>
            <CommitPlan
              grid={grid}
              year={year}
              thresholds={thresholds}
              theme={theme}
              message={commitMessage}
              includeFuture={includeFuture}
              onMessageChange={setCommitMessage}
              onIncludeFutureChange={setIncludeFuture}
              plan={plan}
            />
            <ScriptPanel plan={plan} theme={theme} />
            <div className="flex gap-2">
              <button
                onClick={openShare}
                disabled={grid.every((r) => r.every((c) => c === 0))}
                className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-on transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🔗 Partager ce motif
              </button>
            </div>
            <Gallery
              grid={grid}
              year={year}
              thresholds={thresholds}
              theme={theme}
              onLoad={handleLoadArt}
              onSaveNotification={notify}
            />
          </div>
        </section>

        <footer className="site-footer text-xs" style={{ color: panel.muted }}>
          Fait pour le fun — GitHub n&apos;est pas affilié. Les commits vides peuvent avoir
          un impact sur ton profil.
        </footer>
      </div>

      {notification && (
        <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-on shadow-lg">
          {notification}
        </div>
      )}

      {shareOpen && (
        <ShareModal
          grid={grid}
          year={year}
          thresholds={thresholds}
          id={shareId}
          theme={theme}
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
}