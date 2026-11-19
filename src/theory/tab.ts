// Text tablature. Exercises are stored as note lists and rendered here, so the
// columns always line up and the same data can be checked by tests.

/** One note: string 1 = high e … 6 = low E (tab numbering), fret, optional technique into this note. */
export interface TabNote {
  s: number;
  f: number;
  /** h = hammer-on, p = pull-off, / = slide up, \ = slide down (written before the note). */
  tech?: 'h' | 'p' | '/' | '\\';
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

export interface TabOptions {
  /** Bar line after this many notes. */
  groupSize?: number;
  /** Notes per printed line before wrapping. Keep it short so it reads on a phone. */
  perLine?: number;
}

/** Renders notes as tab. Returns one block of 6 lines (high e first) per printed line. */
export function renderTab(notes: TabNote[], { groupSize = 4, perLine = 16 }: TabOptions = {}): string[][] {
  const systems: string[][] = [];
  for (let i = 0; i < notes.length; i += perLine) {
    const chunk = notes.slice(i, i + perLine);
    let lines = STRING_NAMES.map((n) => `${n}|`);
    chunk.forEach((note, j) => {
      const digits = String(note.f);
      lines = lines.map((line, idx) => {
        const s = idx + 1;
        if (s === note.s) return line + '-' + (note.tech ?? '-') + digits;
        return line + '--' + '-'.repeat(digits.length);
      });
      const end = j + 1 === chunk.length;
      if (!end && (j + 1) % groupSize === 0) lines = lines.map((l) => l + '-|');
    });
    systems.push(lines.map((l) => l + '-|'));
  }
  return systems;
}

/** Tab string number (1 = high e) → fretboard string index (0 = low E). */
export const stringIndex = (s: number) => 6 - s;

// ---------- Pattern helpers used by src/data/exercises.ts ----------

/**
 * "Spider" chromatic: play the finger order on each string from low E to high e,
 * then the reversed order back down. Finger n plays fret startFret + n − 1.
 */
export function spider(order: number[], startFret: number): TabNote[] {
  const up = [6, 5, 4, 3, 2, 1].flatMap((s) => order.map((finger) => ({ s, f: startFret + finger - 1 })));
  const back = [...order].reverse();
  const down = [1, 2, 3, 4, 5, 6].flatMap((s) => back.map((finger) => ({ s, f: startFret + finger - 1 })));
  return [...up, ...down];
}

/** 1-2-3-4 on these strings in this order, then back with 4-3-2-1 in reverse string order. */
export function chromaticOn(strings: number[], startFret: number): TabNote[] {
  const up = strings.flatMap((s) => [0, 1, 2, 3].map((o) => ({ s, f: startFret + o })));
  const down = [...strings].reverse().flatMap((s) => [3, 2, 1, 0].map((o) => ({ s, f: startFret + o })));
  return [...up, ...down];
}

/** Position shapes: [string, fret] pairs played up, then back down without repeating the top note. */
export function upAndDown(pairs: [number, number][]): TabNote[] {
  const up = pairs.map(([s, f]) => ({ s, f }));
  return [...up, ...up.slice(0, -1).reverse()];
}
