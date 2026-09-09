"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useEditor } from "../hooks/useEditor";
import { useNotification } from "../hooks/useNotification";
import { normalizeGrid } from "../lib/grid";
import Navbar from "../components/Navbar";
import StudioHero from "../components/studio/StudioHero";
import EditorStudio from "../components/studio/EditorStudio";
import TemplatePicker from "../components/TemplatePicker";
import Gallery from "../components/Gallery";
import ShareModal from "../components/ShareModal";
import CommitPlan from "../components/CommitPlan";
import ImageConverter from "../components/ImageConverter";

export default function Home() {
  const { t } = useTranslation();
  const editor = useEditor();
  const { year, grid, theme, thresholds, setThresholds, plan, replace } =
    editor;
  const { notification, notify } = useNotification();
  const [shareId, setShareId] = useState<string | null>(null);
  return (
    <main className="arcade-app min-h-screen">
      <a className="skip-link" href="#editor">
        {" "}
        {t("Aller à l’éditeur")}{" "}
      </a>
      <Navbar />

      <div className="app-container">
        <StudioHero />
        <EditorStudio
          editor={editor}
          shareOpen={!!shareId}
          onShare={() => setShareId(crypto.randomUUID())}
        />

        <p className="editor-help">
          {" "}
          {t(
            "Les décalages conservent tout le motif : une direction se désactive si un pixel sortirait de l’année.",
          )}{" "}
        </p>
        <CommitPlan
          plan={plan}
          thresholds={thresholds}
          onThresholdsChange={setThresholds}
        />
        <TemplatePicker
          year={year}
          theme={theme}
          onPaste={(next) => {
            replace(next);
            notify(t("Template ajouté. À toi de le personnaliser !"));
          }}
        />
        <section
          className="library-section"
          id="gallery"
          aria-label={t("Mes motifs et import")}
        >
          <Gallery
            grid={grid}
            year={year}
            thresholds={thresholds}
            theme={theme}
            onLoad={(art) => {
              if (editor.loadArt(art) === false)
                notify(t("Ce motif utilise une année indisponible."));
            }}
            onSaveNotification={notify}
          />
          <details className="image-import">
            <summary> {t("Importer une image")} </summary>
            <ImageConverter
              year={year}
              theme={theme}
              onPaste={(next) => {
                replace(normalizeGrid(next, year));
                notify(t("Image ajoutée."));
              }}
            />
          </details>
        </section>
        <footer className="site-footer text-xs">
          {" "}
          {t(
            "Gitvinci · Ton atelier de contribution art. GitHub n’est pas affilié à ce projet.",
          )}{" "}
        </footer>
      </div>
      {notification && (
        <div role="status" className="studio-notification">
          {notification}
        </div>
      )}
      {shareId && (
        <ShareModal
          id={shareId}
          grid={grid}
          year={year}
          thresholds={thresholds}
          theme={theme}
          onClose={() => setShareId(null)}
        />
      )}
    </main>
  );
}
