import type { CommitEntry } from "./types";

export function formatCommitDate(date: string): string {
  return date.split("-").reverse().join("-");
}

export function commitsToText(plan: CommitEntry[]): string {
  return plan
    .map(
      ({ date, count }) =>
        `${formatCommitDate(date)} : ${count} commit${count > 1 ? "s" : ""}`,
    )
    .join("\n");
}

export function commitsToCsv(plan: CommitEntry[]): string {
  return (
    "date,commits\n" +
    plan
      .map(({ date, count }) => `${formatCommitDate(date)},${count}`)
      .join("\n")
  );
}
