import type { Grid, Intensity, TextFontName } from "../lib/types";
import { textToGrid } from "../lib/fonts";

export type TemplateDefinition = {
  name: string;
  description: string;
  build: () => Grid;
};

function gridFromStrings(rows: string[], intensity: Intensity = 3): Grid {
  return rows.map((row) =>
    row.split("").map((ch) => (ch === "0" ? 0 : intensity))
  );
}

function textTemplate(text: string, fontSize: TextFontName, intensity: Intensity = 3): Grid {
  const { grid } = textToGrid(text, fontSize);
  return grid.map((row) => row.map((v) => (v > 0 ? intensity : 0)));
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    name: "HIRE ME!",
    description: "Un banner clair et direct.",
    build: () => textTemplate("HIRE ME!", "5x7", 3),
  },
  {
    name: "SAY HI",
    description: "Un salut amical.",
    build: () => textTemplate("SAY HI", "5x7", 3),
  },
  {
    name: "CODE",
    description: "Pour les devs.",
    build: () => textTemplate("CODE", "5x7", 3),
  },
  {
    name: "Space Invader",
    description: "Le classique des année 80.",
    build: () =>
      gridFromStrings([
        "01000100010",
        "00100100100",
        "00110110100",
        "01111111110",
        "11011111011",
        "11010001011",
        "00001110000",
      ]),
  },
  {
    name: "Cœur",
    description: "De l'amour pour ton graph.",
    build: () =>
      gridFromStrings([
        "0110110",
        "1111111",
        "1111111",
        "1111111",
        "0111110",
        "0011100",
        "0001000",
      ]),
  },
  {
    name: "Sourire",
    description: "Keep it positive.",
    build: () =>
      gridFromStrings([
        "0111110",
        "1000001",
        "1101011",
        "1000001",
        "1011101",
        "1000001",
        "0111110",
      ]),
  },
  {
    name: "Musique",
    description: "Une note de musique.",
    build: () =>
      gridFromStrings([
        "0001000000",
        "0001000000",
        "0001000000",
        "0001000000",
        "0111111000",
        "0101000000",
        "0000000000",
      ]),
  },
  {
    name: "Ghost",
    description: "Pac-Man forever.",
    build: () =>
      gridFromStrings([
        "011111110",
        "111111111",
        "111101111",
        "111111111",
        "111111111",
        "101101101",
        "100100101",
      ]),
  },
];