type Cell = string | number | null | undefined;

/**
 * Formats one CSV cell (RFC 4180). Text that a spreadsheet would treat as a
 * formula (leading = + - @) is prefixed with an apostrophe; numbers are left as-is.
 */
function cell(value: Cell): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : "";
  let text = value;
  if (/^[=+\-@]/.test(text) && Number.isNaN(Number(text))) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Builds a CSV document. Starts with a UTF-8 BOM so Excel detects the encoding. */
export function toCsv<T extends Record<string, Cell>>(
  columns: (keyof T & string)[],
  rows: T[],
): string {
  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((c) => cell(row[c])).join(",")),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** A downloadable CSV response. */
export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
