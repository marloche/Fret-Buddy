// Note spelling. A note is a letter plus an accidental, so E# and F stay different
// even though they sound the same. Pitch classes (0–11, C = 0) are for sound; spelled
// notes are for display.

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];

export interface Note {
  letter: number; // index into LETTERS
  acc: number; // -2 = bb, -1 = b, 0 = natural, 1 = #, 2 = ##
}

export const mod12 = (n: number) => ((n % 12) + 12) % 12;

export function pcOf(n: Note): number {
  return mod12(NATURAL_PC[n.letter] + n.acc);
}

const ACC_TEXT: Record<number, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' };
const ACC_ASCII: Record<number, string> = { [-2]: 'bb', [-1]: 'b', 0: '', 1: '#', 2: '##' };

/** Display name with real accidental symbols, e.g. "B♭". */
export function noteName(n: Note): string {
  return LETTERS[n.letter] + ACC_TEXT[n.acc];
}

/** Plain-text name, e.g. "Bb" (used in tests and ids). */
export function noteAscii(n: Note): string {
  return LETTERS[n.letter] + ACC_ASCII[n.acc];
}

export function parseNote(s: string): Note {
  const letter = LETTERS.indexOf(s[0].toUpperCase() as (typeof LETTERS)[number]);
  if (letter < 0) throw new Error(`Bad note: ${s}`);
  let acc = 0;
  for (const c of s.slice(1)) acc += c === '#' || c === '♯' ? 1 : c === 'b' || c === '♭' ? -1 : 0;
  return { letter, acc };
}

/**
 * A degree label like "1", "b3", "#4", "b7", "9". The number picks the letter
 * (counting up from the root letter), the sharps/flats adjust the major-scale interval.
 */
export interface Degree {
  label: string;
  number: number;
  semitones: number;
}

const MAJOR_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

export function parseDegree(label: string): Degree {
  const m = /^([b#]*)(\d+)$/.exec(label);
  if (!m) throw new Error(`Bad degree: ${label}`);
  const number = Number(m[2]);
  const shift = [...m[1]].reduce((a, c) => a + (c === '#' ? 1 : -1), 0);
  const idx = (number - 1) % 7;
  const octave = Math.floor((number - 1) / 7);
  return { label, number, semitones: MAJOR_SEMITONES[idx] + 12 * octave + shift };
}

/** Spell the note that is `degree` above `root`. */
export function transpose(root: Note, degree: Degree): Note {
  const letter = (root.letter + degree.number - 1) % 7;
  const targetPc = mod12(pcOf(root) + degree.semitones);
  let acc = targetPc - NATURAL_PC[letter];
  if (acc > 6) acc -= 12;
  if (acc < -6) acc += 12;
  return { letter, acc };
}

/** Pretty degree label for display: "b3" → "♭3". */
export function degreeText(label: string): string {
  return label.replace(/b/g, '♭').replace(/#/g, '♯');
}

/** The 12 roots offered in pickers. The name shown is the more common one. */
export const ROOTS: { pc: number; label: string; names: string[] }[] = [
  { pc: 0, label: 'C', names: ['C', 'B#'] },
  { pc: 1, label: 'C♯/D♭', names: ['Db', 'C#'] },
  { pc: 2, label: 'D', names: ['D'] },
  { pc: 3, label: 'E♭/D♯', names: ['Eb', 'D#'] },
  { pc: 4, label: 'E', names: ['E', 'Fb'] },
  { pc: 5, label: 'F', names: ['F', 'E#'] },
  { pc: 6, label: 'F♯/G♭', names: ['F#', 'Gb'] },
  { pc: 7, label: 'G', names: ['G'] },
  { pc: 8, label: 'A♭/G♯', names: ['Ab', 'G#'] },
  { pc: 9, label: 'A', names: ['A'] },
  { pc: 10, label: 'B♭/A♯', names: ['Bb', 'A#'] },
  { pc: 11, label: 'B', names: ['B', 'Cb'] },
];

/**
 * Pick how to name a root so the notes built on it read most simply:
 * fewest double sharps/flats, then fewest accidentals overall. Ties keep the
 * first (more common) name, so F♯ major wins over G♭ major.
 */
export function spellRoot(pc: number, degrees: Degree[]): Note {
  const options = ROOTS[mod12(pc)].names.map(parseNote);
  let best = options[0];
  let bestScore = Infinity;
  for (const root of options) {
    const notes = degrees.map((d) => transpose(root, d));
    const doubles = notes.filter((n) => Math.abs(n.acc) > 1).length;
    const total = notes.reduce((a, n) => a + Math.abs(n.acc), 0);
    const score = doubles * 100 + total;
    if (score < bestScore) {
      best = root;
      bestScore = score;
    }
  }
  return best;
}
