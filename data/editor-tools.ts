import type { Tool } from "../lib/types";
export const EDITOR_TOOLS: {
  id: Tool;
  label: string;
  shortcut: string;
  path: string;
}[] = [
  {
    id: "brush",
    label: "Pinceau",
    shortcut: "B",
    path: "m14 3 7 7-9 9-7-7 9-9ZM5 12l-2 9 9-2M12 5l7 7",
  },
  {
    id: "eraser",
    label: "Gomme",
    shortcut: "E",
    path: "m14 3 7 7-11 11H6l-4-4L14 3ZM7 12l7 7M10 21h12",
  },
  {
    id: "fill",
    label: "Remplir",
    shortcut: "F",
    path: "m10 3 9 9-8 8-9-9 8-8ZM2 11h17M8 1l5 5M21 16s-2 3-2 4a2 2 0 0 0 4 0c0-1-2-4-2-4Z",
  },
  {
    id: "cycle",
    label: "Cycle",
    shortcut: "C",
    path: "M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6M4 17a9 9 0 0 0 15 2l3-3m0 6v-6h-6",
  },
];
