/** RFC 4180 cell. */
export function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function csvLine(cells: Array<string | number | boolean | null | undefined>) {
  return cells.map((c) => csvCell(c == null ? "" : String(c))).join(",");
}
