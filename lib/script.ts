import type { CommitEntry } from "./types";

export function generateBashScript(
  plan: CommitEntry[],
  repoUrl: string,
  branch: string,
  gitEmail: string,
  gitName: string,
): string {
  const lines: string[] = [];
  lines.push("#!/usr/bin/env bash");
  lines.push("# Generated automatically by Gitvinci.");
  lines.push(
    "# Recreates a pixel-art pattern on your GitHub contribution graph.",
  );
  lines.push("#");
  lines.push("# HOW TO USE:");
  lines.push(
    "#   1. Create a NEW empty (or nearly empty) repository on GitHub.",
  );
  lines.push(
    "#      A repo with pre-existing commits on these dates will make",
  );
  lines.push("#      the pattern impossible or blobby — prefer a fresh one.");
  lines.push(
    "#   2. The commit email must match one of the emails verified on",
  );
  lines.push(
    "#      your GitHub account, otherwise contributions will not count.",
  );
  lines.push("#   3. Make sure private contributions are shown if the repo is");
  lines.push("#      private: GitHub > Settings > Profile > 'Include private");
  lines.push("#      contributions on my profile'.");
  lines.push("#   4. Run this script, then git push. The pattern only appears");
  lines.push("#      after the push reaches GitHub.");
  lines.push("");
  lines.push("set -euo pipefail");
  lines.push("");
  lines.push(`EMAIL="${gitEmail || "you@example.com"}"`);
  lines.push(`NAME="${gitName || "Gitvinci User"}"`);
  lines.push(`BRANCH="${branch || "main"}"`);
  lines.push(`REPO_URL="${repoUrl}"`);
  lines.push("");
  lines.push('if [ -n "$REPO_URL" ]; then');
  lines.push('  echo "==> Cloning repository..."');
  lines.push("  rm -rf .gitvinci-work");
  lines.push('  git clone "$REPO_URL" .gitvinci-work');
  lines.push("  cd .gitvinci-work");
  lines.push("else");
  lines.push(
    '  echo "==> No repository URL provided, using current directory."',
  );
  lines.push(
    "  echo \"    Make sure 'git init' has been run and a remote is configured.\"",
  );
  lines.push("fi");
  lines.push("");
  lines.push('git config user.email "$EMAIL"');
  lines.push('git config user.name "$NAME"');
  lines.push('if ! git show-ref --verify --quiet "refs/heads/$BRANCH"; then');
  lines.push('  git checkout -b "$BRANCH" 2>/dev/null || true');
  lines.push("else");
  lines.push('  git checkout "$BRANCH"');
  lines.push("fi");
  lines.push("");

  for (const [i, entry] of plan.entries()) {
    const commitTime = `${entry.date}T12:00:00Z`;
    lines.push(
      `# (${i + 1}/${plan.length}) ${entry.date} — ${entry.count} commit${entry.count > 1 ? "s" : ""}`,
    );
    for (let c = 1; c <= entry.count; c++) {
      const verb = [
        "Touch",
        "Warm",
        "Tune",
        "Restyle",
        "Refresh",
        "Sharpen",
        "Polish",
      ][i % 7];
      lines.push(
        `GIT_AUTHOR_DATE='${commitTime}' GIT_COMMITTER_DATE='${commitTime}' git commit --allow-empty --no-edit -m "${verb}: pixel ${i + 1}-${c}"`,
      );
    }
  }

  lines.push("");
  lines.push('echo "==> Done. Pushing to origin/$BRANCH..."');
  lines.push(
    'git push -u origin "$BRANCH" 2>/dev/null || git push origin "$BRANCH"',
  );
  lines.push("");
  lines.push('echo ""');
  lines.push('echo "Success! Check your GitHub profile in a few minutes."');

  return lines.join("\n");
}
