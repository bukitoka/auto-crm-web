/** Header names the way the API reads them: trimmed, lowercase, spaces as underscores. */
export function normalizeHeader(name: string): string {
  return name.trim().toLowerCase().replace(/ /g, "_");
}

/** Split the first line of a CSV into cells, honoring double quotes. */
export function parseHeaderLine(text: string): string[] {
  const firstLine = text.replace(/^﻿/, "").split(/\r?\n/, 1)[0] ?? "";
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i];
    if (quoted) {
      if (char === '"' && firstLine[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells.map(normalizeHeader).filter(Boolean);
}

export type HeaderCheck = {
  /** Required columns the file does not have. */
  missing: string[];
  /** Columns the import will ignore. */
  ignored: string[];
  /** Columns the import will read. */
  recognized: string[];
};

export function checkHeaders(headers: string[], known: string[], required: string[]): HeaderCheck {
  return {
    missing: required.filter((name) => !headers.includes(name)),
    ignored: headers.filter((name) => !known.includes(name)),
    recognized: headers.filter((name) => known.includes(name)),
  };
}
