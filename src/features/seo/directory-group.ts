import type { DirectoryCompany } from "@/features/seo/directory-queries";

export type DirectoryLetterGroup = {
  letter: string;
  rows: DirectoryCompany[];
};

export function directoryLetter(name: string): string {
  const ch = name.trim().charAt(0).toUpperCase();
  return ch >= "A" && ch <= "Z" ? ch : "#";
}

/** Path segment: A → a, # → other. */
export function directoryLetterSlug(letter: string): string {
  return letter === "#" ? "other" : letter.toLowerCase();
}

export function parseDirectoryLetterParam(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (s === "other") return "#";
  if (/^[a-z]$/.test(s)) return s.toUpperCase();
  return null;
}

export function groupDirectoryByLetter(
  rows: DirectoryCompany[],
): DirectoryLetterGroup[] {
  const map = new Map<string, DirectoryCompany[]>();
  for (const row of rows) {
    const letter = directoryLetter(row.name);
    const list = map.get(letter) ?? [];
    list.push(row);
    map.set(letter, list);
  }
  const keys = [...map.keys()].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });
  return keys.map((letter) => ({ letter, rows: map.get(letter) ?? [] }));
}
