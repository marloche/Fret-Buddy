// Chord qualities, written as degree labels. To add one, add a line here and give it
// at least one shape in chordShapes.ts (a test checks every quality has a voicing).

export interface ChordQuality {
  id: string;
  /** Suffix after the root, e.g. "m7" → "Am7". Empty for major. */
  symbol: string;
  name: string;
  degrees: string[];
}

export const CHORD_QUALITIES: ChordQuality[] = [
  { id: 'maj', symbol: '', name: 'Major', degrees: ['1', '3', '5'] },
  { id: 'min', symbol: 'm', name: 'Minor', degrees: ['1', 'b3', '5'] },
  { id: '7', symbol: '7', name: 'Dominant 7', degrees: ['1', '3', '5', 'b7'] },
  { id: 'maj7', symbol: 'maj7', name: 'Major 7', degrees: ['1', '3', '5', '7'] },
  { id: 'm7', symbol: 'm7', name: 'Minor 7', degrees: ['1', 'b3', '5', 'b7'] },
  { id: 'sus2', symbol: 'sus2', name: 'Suspended 2', degrees: ['1', '2', '5'] },
  { id: 'sus4', symbol: 'sus4', name: 'Suspended 4', degrees: ['1', '4', '5'] },
  { id: 'dim', symbol: 'dim', name: 'Diminished', degrees: ['1', 'b3', 'b5'] },
  { id: 'aug', symbol: 'aug', name: 'Augmented', degrees: ['1', '3', '#5'] },
  { id: 'add9', symbol: 'add9', name: 'Add 9', degrees: ['1', '3', '5', '9'] },
];
