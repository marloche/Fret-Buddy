// The guitar neck as data. Strings are listed low to high (index 0 = low E).
// Tuning and handedness are parameters so alternate tunings / lefty mode can be added later.
import { mod12, parseNote, pcOf } from './notes';

export interface Tuning {
  id: string;
  name: string;
  /** Open-string notes, low string first. */
  strings: string[];
}

export const STANDARD: Tuning = { id: 'standard', name: 'Standard (E A D G B E)', strings: ['E', 'A', 'D', 'G', 'B', 'E'] };

export function openPcs(t: Tuning): number[] {
  return t.strings.map((s) => pcOf(parseNote(s)));
}

export function pcAt(t: Tuning, string: number, fret: number): number {
  return mod12(openPcs(t)[string] + fret);
}

export interface Position {
  string: number;
  fret: number;
  pc: number;
}

/** Every fret position (0..maxFret) whose pitch class is in `pcs`. */
export function positionsFor(t: Tuning, pcs: Set<number>, maxFret: number, minFret = 0): Position[] {
  const out: Position[] = [];
  openPcs(t).forEach((open, string) => {
    for (let fret = minFret; fret <= maxFret; fret++) {
      const pc = mod12(open + fret);
      if (pcs.has(pc)) out.push({ string, fret, pc });
    }
  });
  return out;
}
