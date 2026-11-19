// Curated chord shapes. Strings are listed low E → high e (6th string first).
//   null = muted string, 0 = open string, n = fret number.
//   Fingers: 1 index … 4 pinky, null for open/muted strings.
// A test checks every shape: it may only contain the chord's own notes, the lowest
// note must be the root, and every fretted string needs a finger.

/** Open-position chords, at their real frets. */
export interface OpenShape {
  root: string; // note name, e.g. "C", "F#"
  quality: string; // id from chordQualities.ts
  frets: (number | null)[];
  fingers: (number | null)[];
  barre?: { fret: number; from: number; to: number }; // string indexes, low→high
}

/**
 * Movable (barre) shapes. Frets are relative to the root's fret on `rootString`,
 * so the shape works for any root by sliding it up the neck.
 */
export interface MovableShape {
  id: string;
  name: string; // e.g. "E-shape" (root on the 6th string)
  quality: string;
  rootString: number; // 0 = low E, 1 = A
  frets: (number | null)[]; // relative to the root fret
  fingers: (number | null)[];
  /** Index finger barre across these strings at the root fret. */
  barre?: { from: number; to: number };
}

const x = null;

export const OPEN_SHAPES: OpenShape[] = [
  // Major
  { root: 'C', quality: 'maj', frets: [x, 3, 2, 0, 1, 0], fingers: [x, 3, 2, x, 1, x] },
  { root: 'A', quality: 'maj', frets: [x, 0, 2, 2, 2, 0], fingers: [x, x, 1, 2, 3, x] },
  { root: 'G', quality: 'maj', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, x, x, x, 3] },
  { root: 'E', quality: 'maj', frets: [0, 2, 2, 1, 0, 0], fingers: [x, 2, 3, 1, x, x] },
  { root: 'D', quality: 'maj', frets: [x, x, 0, 2, 3, 2], fingers: [x, x, x, 1, 3, 2] },
  // Minor
  { root: 'A', quality: 'min', frets: [x, 0, 2, 2, 1, 0], fingers: [x, x, 2, 3, 1, x] },
  { root: 'E', quality: 'min', frets: [0, 2, 2, 0, 0, 0], fingers: [x, 2, 3, x, x, x] },
  { root: 'D', quality: 'min', frets: [x, x, 0, 2, 3, 1], fingers: [x, x, x, 2, 3, 1] },
  // Dominant 7
  { root: 'A', quality: '7', frets: [x, 0, 2, 0, 2, 0], fingers: [x, x, 2, x, 3, x] },
  { root: 'B', quality: '7', frets: [x, 2, 1, 2, 0, 2], fingers: [x, 2, 1, 3, x, 4] },
  { root: 'C', quality: '7', frets: [x, 3, 2, 3, 1, 0], fingers: [x, 3, 2, 4, 1, x] },
  { root: 'D', quality: '7', frets: [x, x, 0, 2, 1, 2], fingers: [x, x, x, 2, 1, 3] },
  { root: 'E', quality: '7', frets: [0, 2, 0, 1, 0, 0], fingers: [x, 2, x, 1, x, x] },
  { root: 'G', quality: '7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, x, x, x, 1] },
  // Major 7
  { root: 'A', quality: 'maj7', frets: [x, 0, 2, 1, 2, 0], fingers: [x, x, 2, 1, 3, x] },
  { root: 'C', quality: 'maj7', frets: [x, 3, 2, 0, 0, 0], fingers: [x, 3, 2, x, x, x] },
  { root: 'D', quality: 'maj7', frets: [x, x, 0, 2, 2, 2], fingers: [x, x, x, 1, 2, 3] },
  { root: 'E', quality: 'maj7', frets: [0, 2, 1, 1, 0, 0], fingers: [x, 3, 1, 2, x, x] },
  { root: 'F', quality: 'maj7', frets: [x, x, 3, 2, 1, 0], fingers: [x, x, 3, 2, 1, x] },
  { root: 'G', quality: 'maj7', frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, x, x, x, 1] },
  // Minor 7
  { root: 'A', quality: 'm7', frets: [x, 0, 2, 0, 1, 0], fingers: [x, x, 2, x, 1, x] },
  { root: 'E', quality: 'm7', frets: [0, 2, 0, 0, 0, 0], fingers: [x, 2, x, x, x, x] },
  { root: 'D', quality: 'm7', frets: [x, x, 0, 2, 1, 1], fingers: [x, x, x, 2, 1, 1], barre: { fret: 1, from: 4, to: 5 } },
  // Sus 2
  { root: 'A', quality: 'sus2', frets: [x, 0, 2, 2, 0, 0], fingers: [x, x, 1, 2, x, x] },
  { root: 'D', quality: 'sus2', frets: [x, x, 0, 2, 3, 0], fingers: [x, x, x, 1, 3, x] },
  // Sus 4
  { root: 'A', quality: 'sus4', frets: [x, 0, 2, 2, 3, 0], fingers: [x, x, 1, 2, 3, x] },
  { root: 'D', quality: 'sus4', frets: [x, x, 0, 2, 3, 3], fingers: [x, x, x, 1, 3, 4] },
  { root: 'E', quality: 'sus4', frets: [0, 2, 2, 2, 0, 0], fingers: [x, 2, 3, 4, x, x] },
  // Diminished
  { root: 'D', quality: 'dim', frets: [x, x, 0, 1, 3, 1], fingers: [x, x, x, 1, 3, 2] },
  // Augmented
  { root: 'C', quality: 'aug', frets: [x, 3, 2, 1, 1, 0], fingers: [x, 4, 3, 1, 2, x] },
  { root: 'E', quality: 'aug', frets: [0, 3, 2, 1, 1, 0], fingers: [x, 4, 3, 1, 2, x] },
  // Add 9
  { root: 'C', quality: 'add9', frets: [x, 3, 2, 0, 3, 0], fingers: [x, 2, 1, x, 3, x] },
  { root: 'E', quality: 'add9', frets: [0, 2, 4, 1, 0, 0], fingers: [x, 2, 4, 1, x, x] },
];

export const MOVABLE_SHAPES: MovableShape[] = [
  // E-shape: root on the 6th string
  { id: 'E-maj', name: 'E-shape barre', quality: 'maj', rootString: 0, frets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1], barre: { from: 0, to: 5 } },
  { id: 'E-min', name: 'E-shape barre', quality: 'min', rootString: 0, frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], barre: { from: 0, to: 5 } },
  { id: 'E-7', name: 'E-shape barre', quality: '7', rootString: 0, frets: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1], barre: { from: 0, to: 5 } },
  { id: 'E-maj7', name: 'E-shape (5th muted)', quality: 'maj7', rootString: 0, frets: [0, x, 1, 1, 0, x], fingers: [1, x, 3, 4, 2, x] },
  { id: 'E-m7', name: 'E-shape barre', quality: 'm7', rootString: 0, frets: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1], barre: { from: 0, to: 5 } },
  { id: 'E-sus4', name: 'E-shape barre', quality: 'sus4', rootString: 0, frets: [0, 2, 2, 2, 0, 0], fingers: [1, 2, 3, 4, 1, 1], barre: { from: 0, to: 5 } },
  { id: 'E-aug', name: 'E-shape (5th muted)', quality: 'aug', rootString: 0, frets: [0, x, 2, 1, 1, x], fingers: [1, x, 4, 2, 3, x] },
  // A-shape: root on the 5th string
  { id: 'A-maj', name: 'A-shape barre', quality: 'maj', rootString: 1, frets: [x, 0, 2, 2, 2, 0], fingers: [x, 1, 2, 3, 4, 1], barre: { from: 1, to: 5 } },
  { id: 'A-min', name: 'A-shape barre', quality: 'min', rootString: 1, frets: [x, 0, 2, 2, 1, 0], fingers: [x, 1, 3, 4, 2, 1], barre: { from: 1, to: 5 } },
  { id: 'A-7', name: 'A-shape barre', quality: '7', rootString: 1, frets: [x, 0, 2, 0, 2, 0], fingers: [x, 1, 3, 1, 4, 1], barre: { from: 1, to: 5 } },
  { id: 'A-maj7', name: 'A-shape barre', quality: 'maj7', rootString: 1, frets: [x, 0, 2, 1, 2, 0], fingers: [x, 1, 3, 2, 4, 1], barre: { from: 1, to: 5 } },
  { id: 'A-m7', name: 'A-shape barre', quality: 'm7', rootString: 1, frets: [x, 0, 2, 0, 1, 0], fingers: [x, 1, 3, 1, 2, 1], barre: { from: 1, to: 5 } },
  { id: 'A-sus2', name: 'A-shape barre', quality: 'sus2', rootString: 1, frets: [x, 0, 2, 2, 0, 0], fingers: [x, 1, 3, 4, 1, 1], barre: { from: 1, to: 5 } },
  { id: 'A-sus4', name: 'A-shape barre', quality: 'sus4', rootString: 1, frets: [x, 0, 2, 2, 3, 0], fingers: [x, 1, 2, 3, 4, 1], barre: { from: 1, to: 5 } },
  { id: 'A-dim', name: 'A-shape (no barre)', quality: 'dim', rootString: 1, frets: [x, 0, 1, 2, 1, x], fingers: [x, 1, 2, 4, 3, x] },
  { id: 'A-aug', name: 'A-shape (no barre)', quality: 'aug', rootString: 1, frets: [x, 0, 3, 2, 2, x], fingers: [x, 1, 4, 2, 3, x] },
  { id: 'A-add9', name: 'A-shape barre', quality: 'add9', rootString: 1, frets: [x, 0, 2, 4, 2, 0], fingers: [x, 1, 2, 4, 3, 1], barre: { from: 1, to: 5 } },
];
