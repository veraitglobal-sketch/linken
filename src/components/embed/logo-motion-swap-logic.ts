import type { LogoWallEntry } from "@/features/widgets/logo-wall";

export function initialSwapCells(
  pool: LogoWallEntry[],
  cells: number,
): string[] {
  return pool.slice(0, cells).map((e) => e.id);
}

export function batchSwapIds(
  pool: LogoWallEntry[],
  current: string[],
  previous: string[],
): string[] {
  const used = new Set<string>();
  const next: string[] = [];
  for (let i = 0; i < current.length; i++) {
    const pick = pickUnused(pool, used, current[i], previous[i]);
    next.push(pick);
    used.add(pick);
  }
  return next;
}

export function randomSwapOneId(
  pool: LogoWallEntry[],
  current: string[],
  cellIndex: number,
  previous: string[],
): string[] {
  const used = new Set(current.filter((_, i) => i !== cellIndex));
  const pick = pickUnused(
    pool,
    used,
    current[cellIndex],
    previous[cellIndex],
  );
  const next = [...current];
  next[cellIndex] = pick;
  return next;
}

function pickUnused(
  pool: LogoWallEntry[],
  used: Set<string>,
  avoidCurrent?: string,
  avoidPrev?: string,
): string {
  const candidates = pool
    .map((e) => e.id)
    .filter((id) => !used.has(id) && id !== avoidCurrent && id !== avoidPrev);
  const list =
    candidates.length > 0
      ? candidates
      : pool.map((e) => e.id).filter((id) => !used.has(id));
  if (list.length === 0) return pool[0]?.id ?? avoidCurrent ?? "";
  return list[Math.floor(Math.random() * list.length)]!;
}

export function shuffleIndices(n: number): number[] {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
