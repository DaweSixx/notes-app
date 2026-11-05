// 24×24 stroke icons; circles are written as arcs so every icon is a list of <path d>
export const icons = {
  plus: ["M12 5v14M5 12h14"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6", "M10 11v6M14 11v6"],
  undo: ["M9 14 4 9l5-5", "M4 9h10.5a5.5 5.5 0 0 1 0 11H11"],
  redo: ["m15 14 5-5-5-5", "M20 9H9.5a5.5 5.5 0 0 0 0 11H13"],
  arrowLeft: ["M19 12H5M12 19l-7-7 7-7"],
  check: ["M20 6 9 17l-5-5"],
  sun: [
    "M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0",
    "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  ],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"],
  clock: ["M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0", "M12 7v5l3 2"],
  alert: [
    "M12 9v4M12 17h.01",
    "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  ],
  note: ["M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z", "M14 3v6h6M8 13h8M8 17h5"],
  save: [
    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z",
    "M17 21v-8H7v8M7 3v5h8",
  ],
  help: [
    "M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0",
    "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01",
  ],
  history: ["M3 12a9 9 0 1 0 3-6.7L3 8", "M3 3v5h5M12 7v5l3 2"],
  x: ["M18 6 6 18M6 6l12 12"],
  sort: ["M7 4v16M3 8l4-4 4 4", "M17 20V4M13 16l4 4 4-4"],
  sparkle: [
    "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z",
    "M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z",
  ],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof icons;
