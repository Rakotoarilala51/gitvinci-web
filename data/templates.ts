import type { Grid, Intensity, TextFontName } from "../lib/types";
import {
  calendarColumns,
  emptyGrid,
  normalizeGrid,
  placePattern,
} from "../lib/grid";
import { textToGrid } from "../lib/fonts";

export type TemplateDefinition = {
  name: string;
  description: string;
  placement?: "calendar";
  build: (year?: number) => Grid;
};

function gridFromStrings(rows: string[], intensity: Intensity = 4): Grid {
  return rows.map((row) =>
    row.split("").map((ch) => (ch === "0" ? 0 : intensity)),
  );
}

function textTemplate(
  text: string,
  fontSize: TextFontName,
  intensity: Intensity = 4,
): Grid {
  const { grid } = textToGrid(text, fontSize);
  return grid.map((row) => row.map((v) => (v > 0 ? intensity : 0)));
}

export function buildTemplate(
  template: TemplateDefinition,
  year: number,
): Grid | null {
  const pattern = template.build(year);
  return template.placement === "calendar"
    ? normalizeGrid(pattern, year)
    : placePattern(pattern, year);
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    name: "No-life",
    description:
      "Zéro jour de repos. Même le 29 février. C’est une blague, pas un conseil de vie.",
    placement: "calendar",
    build: (year = new Date().getUTCFullYear()) =>
      normalizeGrid(
        emptyGrid(calendarColumns(year)).map((row) =>
          row.map(() => 4 as Intensity),
        ),
        year,
      ),
  },
  {
    name: "Batman",
    description:
      "Le signal de Gotham, version pixel. À toi de veiller sur le code.",
    build: () =>
      gridFromStrings([
        "10000001010000001",
        "11000001110000011",
        "11110011111001111",
        "11111111111111111",
        "01111111111111110",
        "00110011111001100",
        "00000001110000000",
      ]),
  },
  {
    name: "C++",
    description: "Le C et ses deux plus, dans un blason pixel.",
    build: () => gridFromStrings([
      "00111111111111100",
      "01000000000000010",
      "10111000100010001",
      "10100001110111001",
      "10111000100010001",
      "01000000000000010",
      "00111111111111100",
    ]),
  },
  {
    name: "Python",
    description: "Deux serpents entrelacés, adaptés aux sept lignes du calendrier.",
    build: () => [
      "000222200",
      "000202200",
      "022222244",
      "022004440",
      "224444440",
      "002404000",
      "002444000",
    ].map(row => [...row].map(value => Number(value) as Intensity)),
  },
  {
    name: "JavaScript",
    description: "Le monogramme JS dans son carré, version contribution art.",
    build: () => gridFromStrings([
      "1111111111111",
      "1111011100011",
      "1111010111111",
      "1111011000111",
      "1011011111011",
      "1100110000111",
      "1111111111111",
    ]),
  },
  {
    name: "TypeScript",
    description: "Le monogramme TS, assorti au modèle JavaScript.",
    build: () => gridFromStrings([
      "1111111111111",
      "1000001100011",
      "1110110111111",
      "1110111000111",
      "1110111111011",
      "1110110000111",
      "1111111111111",
    ]),
  },
  {
    name: "Java",
    description: "Une tasse et sa vapeur : la pause café du calendrier.",
    build: () => gridFromStrings([
      "00000100000",
      "00001010000",
      "00000100000",
      "01111111110",
      "01000001010",
      "00111111100",
      "11111111110",
    ]),
  },
  {
    name: "Rust",
    description: "Un R au cœur d’un engrenage, simplifié en pixel art.",
    build: () => gridFromStrings([
      "00101010100",
      "01111111110",
      "11010001011",
      "01110111010",
      "11010010011",
      "01111111110",
      "00101010100",
    ]),
  },
  {
    name: "HIRE ME!",
    description: "Un message lisible pour ton prochain projet.",
    build: () => textTemplate("HIRE ME!", "5x7", 4),
  },
  {
    name: "SAY HI",
    description: "Un salut amical.",
    build: () => textTemplate("SAY HI", "5x7", 4),
  },
  {
    name: "CODE",
    description: "Pour les devs.",
    build: () => textTemplate("CODE", "5x7", 4),
  },
  {
    name: "Space Invader",
    description: "L’incontournable des salles d’arcade.",
    build: () =>
      gridFromStrings([
        "00100000100",
        "00010001000",
        "00111111100",
        "01101110110",
        "11111111111",
        "10100000101",
        "00011011000",
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
        "1010101",
        "1000001",
        "1100011",
        "1011101",
        "0111110",
      ]),
  },
  {
    name: "Musique",
    description: "Une note de musique.",
    build: () =>
      gridFromStrings([
        "0001111",
        "0001001",
        "0001001",
        "0001001",
        "0111011",
        "1111011",
        "0110000",
      ]),
  },
  {
    name: "Ghost",
    description: "Pac-Man forever.",
    build: () =>
      gridFromStrings([
        "001111100",
        "011111110",
        "110010011",
        "110010011",
        "111111111",
        "111111111",
        "101010101",
      ]),
  },
];
