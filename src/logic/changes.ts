// Chord changes drill: switch between two chords for a minute, then write down how many
// switches you made. Bests are kept per chord pair (see bests.ts).

export interface ChordRef {
  root: number; // pitch class, 0 = C
  quality: string; // chord quality id, e.g. 'maj', 'm7'
}

export const COUNTDOWN_S = 3;
export const ROUND_S = 60;

/** Same key for A→D and D→A: it's the same pair of chords to switch between. */
export function pairKey(a: ChordRef, b: ChordRef): string {
  return [`${a.root}:${a.quality}`, `${b.root}:${b.quality}`].sort().join('|');
}

export function parsePairKey(key: string): [ChordRef, ChordRef] | null {
  const parts = key.split('|').map((p) => p.split(':'));
  if (parts.length !== 2 || parts.some((p) => p.length !== 2 || !/^\d+$/.test(p[0]))) return null;
  const [a, b] = parts.map(([root, quality]) => ({ root: Number(root), quality }));
  return [a, b];
}

export type RoundPhase = 'countdown' | 'running' | 'done';

/** Where a round is, `elapsedMs` after Go: a 3-2-1 countdown, then the minute. `left` is whole seconds left in that phase. */
export function roundState(elapsedMs: number): { phase: RoundPhase; left: number } {
  const s = Math.max(0, elapsedMs) / 1000;
  if (s < COUNTDOWN_S) return { phase: 'countdown', left: Math.ceil(COUNTDOWN_S - s) };
  if (s < COUNTDOWN_S + ROUND_S) return { phase: 'running', left: Math.ceil(COUNTDOWN_S + ROUND_S - s) };
  return { phase: 'done', left: 0 };
}
