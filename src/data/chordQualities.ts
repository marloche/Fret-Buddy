// Chord qualities, written as degree labels. To add one, add a line here and give it
// at least one shape in chordShapes.ts (a test checks every quality has a voicing).

export interface ChordQuality {
  id: string;
  /** Suffix after the root, e.g. "m7" → "Am7". Empty for major. */
  symbol: string;
  name: string;
  degrees: string[];
  /** One or two lines: what it sounds like and what makes it this type. Shown on the Chords tab. */
  blurb: string;
}

export const CHORD_QUALITIES: ChordQuality[] = [
  { id: 'maj', symbol: '', name: 'Major', degrees: ['1', '3', '5'], blurb: 'Bright and settled. The everyday "home" chord most songs start and end on.' },
  { id: 'min', symbol: 'm', name: 'Minor', degrees: ['1', 'b3', '5'], blurb: 'Darker, sadder or more serious. It\'s a major chord with the 3rd lowered by one fret.' },
  { id: '7', symbol: '7', name: 'Dominant 7', degrees: ['1', '3', '5', 'b7'], blurb: 'A major chord plus a ♭7. Bluesy and restless; it pulls toward the chord a 4th up (G7 → C).' },
  { id: 'maj7', symbol: 'maj7', name: 'Major 7', degrees: ['1', '3', '5', '7'], blurb: 'A major chord plus the 7th, one fret below the root. Soft, dreamy, a little jazzy.' },
  { id: 'm7', symbol: 'm7', name: 'Minor 7', degrees: ['1', 'b3', '5', 'b7'], blurb: 'A minor chord plus a ♭7. Mellow and smooth; all over soul, funk and R&B.' },
  { id: 'sus2', symbol: 'sus2', name: 'Suspended 2', degrees: ['1', '2', '5'], blurb: 'The 3rd is swapped for the 2nd, so it\'s neither major nor minor. Open and airy.' },
  { id: 'sus4', symbol: 'sus4', name: 'Suspended 4', degrees: ['1', '4', '5'], blurb: 'The 3rd is swapped for the 4th. Tense; it wants to fall back to the plain major chord.' },
  { id: 'dim', symbol: 'dim', name: 'Diminished', degrees: ['1', 'b3', 'b5'], blurb: 'Minor 3rd and a lowered 5th. Tense and dark; usually a quick passing chord.' },
  { id: 'aug', symbol: 'aug', name: 'Augmented', degrees: ['1', '3', '#5'], blurb: 'Major 3rd and a raised 5th. Eerie and rising; a stepping stone between two chords.' },
  { id: 'add9', symbol: 'add9', name: 'Add 9', degrees: ['1', '3', '5', '9'], blurb: 'A major chord plus the 9th (the 2nd, an octave up). Shimmery; big in pop and acoustic songs.' },
];
