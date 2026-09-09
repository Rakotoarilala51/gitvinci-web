"use client";
import { useTranslation } from "react-i18next";
import type { EditorController } from "../../hooks/useEditor";
import { maxYear } from "../../lib/editor-config";
import EditorGrid from "../EditorGrid";
import Toolbar from "../Toolbar";
import IntensityPalette from "../IntensityPalette";

export default function EditorStudio({
  editor,
  shareOpen,
  onShare,
}: {
  editor: EditorController;
  shareOpen: boolean;
  onShare: () => void;
}) {
  const { t } = useTranslation();
  const {
    year,
    changeYear,
    theme,
    setTheme,
    tool,
    setTool,
    canUndo,
    canRedo,
    hasArt,
    ready,
    canShiftLeft,
    canShiftRight,
    shift,
    undo,
    redo,
    clear,
    selectedIntensity,
    changeIntensity,
    text,
    endTextSession,
    writeText,
    textFits,
    textWidth,
    availableWidth,
    grid,
    edit,
  } = editor;
  return (
    <section
      id="editor"
      className="editor-section"
      aria-labelledby="editor-title"
    >
      <div className="section-heading">
        <div>
          <span className="step-number">✎</span>
          <h2 id="editor-title"> {t("Ton studio pixel")} </h2>
        </div>
        <div className="editor-settings">
          <label htmlFor="calendar-year"> {t("Année")} </label>
          <select
            id="calendar-year"
            value={year}
            onChange={(event) => changeYear(Number(event.target.value))}
          >
            {Array.from({ length: maxYear - 2000 }, (_, i) => maxYear - i).map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
          <button
            className="preview-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? t("☀ Clair") : t("☾ Sombre")}
          </button>
        </div>
      </div>
      <div className="studio-controls">
        <Toolbar
          tool={tool}
          setTool={setTool}
          canUndo={canUndo}
          canRedo={canRedo}
          canClear={hasArt}
          disabled={!ready || shareOpen}
          canShiftLeft={canShiftLeft}
          canShiftRight={canShiftRight}
          onShift={shift}
          onUndo={undo}
          onRedo={redo}
          onClear={clear}
          theme={theme}
        />
        <IntensityPalette
          selected={selectedIntensity}
          onChange={changeIntensity}
          theme={theme}
        />
      </div>
      <div className="editor-text">
        <label htmlFor="pixel-text">
          <span aria-hidden="true">Tt</span> {t("Texte → pixel art")}{" "}
        </label>
        <input
          id="pixel-text"
          value={text}
          placeholder={t("Écris ici : CODE, HELLO, HIRE ME!…")}
          onFocus={endTextSession}
          onBlur={endTextSession}
          onChange={(event) => writeText(event.target.value)}
          aria-describedby="text-help"
          aria-invalid={!textFits}
          autoComplete="off"
          spellCheck={false}
        />
        <span className={textFits ? "text-capacity" : "text-danger"}>
          {textWidth} / {availableWidth} {t("colonnes")}{" "}
        </span>
      </div>
      <p
        id="text-help"
        className={`editor-help ${textFits ? "" : "text-danger"}`}
      >
        {textFits
          ? t(
              "Le texte remplace le dessin en direct. Annuler restaure le motif précédent. Police 5 × 7 ; accents convertis, symboles inconnus remplacés par ?.",
            )
          : t(
              "Texte trop long pour les semaines disponibles. Raccourcis-le : le dernier motif valide est conservé.",
            )}
      </p>
      <EditorGrid
        key={year}
        grid={grid}
        year={year}
        theme={theme}
        tool={tool}
        selectedIntensity={selectedIntensity}
        disabled={!ready}
        onEdit={edit}
      />
      <div className="studio-status">
        <span>
          {year} {t("· calendrier annuel · UTC ·")}{" "}
          {grid.flat().filter(Boolean).length} {t("jours dessinés")}{" "}
        </span>
        <span>
          {" "}
          {t("Dates futures éditables · décalage : 1 colonne = 7 jours")}{" "}
        </span>
        <button
          className="studio-share"
          disabled={!grid.flat().some(Boolean)}
          onClick={onShare}
        >
          {" "}
          {t("Partager le motif ↗")}{" "}
        </button>
      </div>
    </section>
  );
}
