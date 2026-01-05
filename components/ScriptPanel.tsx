"use client";

import { useMemo, useState } from "react";
import type { CommitEntry, ThemeMode } from "../lib/types";
import { generateBashScript } from "../lib/script";
import { themePanelColors } from "../lib/colors";

type Props = {
  plan: CommitEntry[];
  theme: ThemeMode;
};

export default function ScriptPanel({ plan, theme }: Props) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [gitEmail, setGitEmail] = useState("");
  const [gitName, setGitName] = useState("");
  const [copied, setCopied] = useState(false);
  const panel = themePanelColors(theme);

  const script = useMemo(
    () => generateBashScript(plan, repoUrl, branch, gitEmail, gitName),
    [plan, repoUrl, branch, gitEmail, gitName],
  );

  const download = () => {
    const blob = new Blob([script], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gitvinci-pattern.sh";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const input =
    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const inputStyle = { color: panel.text, borderColor: panel.border };

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{ background: panel.card, borderColor: panel.border }}
    >
      <h3 className="text-sm font-semibold mb-1" style={{ color: panel.text }}>
        Générateur de script git
      </h3>
      <p className="text-xs mb-3" style={{ color: panel.muted }}>
        Un script bash téléchargeable. Aucun token ne transite ici — tu exécutes
        et pushes toi-même.
      </p>

      <div className="grid sm:grid-cols-2 gap-2">
        <label className="block sm:col-span-2">
          <span className="text-[11px]" style={{ color: panel.muted }}>
            URL du dépôt GitHub (optionnel)
          </span>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo.git"
            className={input}
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="text-[11px]" style={{ color: panel.muted }}>
            Branche
          </span>
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className={input}
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="text-[11px]" style={{ color: panel.muted }}>
            Email git (doit être vérifié sur GitHub)
          </span>
          <input
            value={gitEmail}
            onChange={(e) => setGitEmail(e.target.value)}
            placeholder="you@example.com"
            className={input}
            style={inputStyle}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px]" style={{ color: panel.muted }}>
            Nom git
          </span>
          <input
            value={gitName}
            onChange={(e) => setGitName(e.target.value)}
            placeholder="Your Name"
            className={input}
            style={inputStyle}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={download}
          disabled={plan.length === 0}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-on transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⬇ Télécharger gitvinci-pattern.sh
        </button>
        <button
          onClick={copy}
          className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent/10"
          style={{ color: panel.text, borderColor: panel.border }}
        >
          {copied ? "✓ Copié !" : "Copier le script"}
        </button>
      </div>

      {plan.length > 0 && (
        <pre
          className="mt-3 max-h-72 overflow-auto rounded-lg border p-3 text-[11px] leading-relaxed"
          style={{
            background: panel.gridBg,
            color: panel.text,
            borderColor: panel.border,
          }}
        >
          {script}
        </pre>
      )}

      <div
        className="mt-3 rounded-lg border p-3 text-[11px] space-y-1"
        style={{ borderColor: panel.border, color: panel.muted }}
      >
        <p>⚠️ 3 conditions pour que les contributions comptent :</p>
        <ul className="list-disc list-inside pl-2 space-y-0.5">
          <li>
            L&apos;email du commit doit correspondre à un email vérifié sur ton
            compte GitHub.
          </li>
          <li>
            Le dépôt doit être public — ou privé avec « Include private
            contributions » activé.
          </li>
          <li>
            Il faut réellement pusher : tant que le push n&apos;arrive pas, rien
            ne s&apos;affiche.
          </li>
        </ul>
      </div>
    </div>
  );
}
