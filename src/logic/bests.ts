// Personal bests: the fastest tempo you've marked as played cleanly, per drill (or chord pair).
// You mark it yourself, because only you can hear whether it was clean.

export interface Best {
  value: number;
  /** Local date, YYYY-MM-DD. */
  date: string;
}

export type Bests = Record<string, Best>;

/** Saves `value` for `id` if it beats the current best. Returns the same object when nothing changed. */
export function recordBest(bests: Bests, id: string, value: number, date: string): Bests {
  if (!Number.isFinite(value) || value <= 0) return bests;
  const old = bests[id];
  if (old && old.value >= value) return bests;
  return { ...bests, [id]: { value: Math.round(value), date } };
}

export function clearBest(bests: Bests, id: string): Bests {
  if (!(id in bests)) return bests;
  const next = { ...bests };
  delete next[id];
  return next;
}

/** How far from start to goal, 0..1, for a progress bar. */
export function progress(start: number, goal: number, best: number): number {
  if (goal <= start) return best >= goal ? 1 : 0;
  return Math.min(1, Math.max(0, (best - start) / (goal - start)));
}

/** Today's local date as YYYY-MM-DD (not UTC, so a late-evening session counts as today). */
export function localDate(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
