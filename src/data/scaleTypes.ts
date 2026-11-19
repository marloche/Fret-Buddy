// Scale types, written as degree labels. Everything else (notes, intervals, fretboard)
// is worked out from these. To add a scale, add a line here.

export interface ScaleType {
  id: string;
  name: string;
  /** Degrees from the root, e.g. "b3" = minor third. Numbers pick the letter, so spelling comes out right. */
  degrees: string[];
  /** One line on what it sounds like or where it's used. */
  blurb: string;
}

export const SCALE_TYPES: ScaleType[] = [
  { id: 'major', name: 'Major (Ionian)', degrees: ['1', '2', '3', '4', '5', '6', '7'], blurb: 'Bright and settled. The reference every other scale is compared to.' },
  { id: 'minor', name: 'Natural minor (Aeolian)', degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'], blurb: 'Darker, sad or serious. Major with a lowered 3rd, 6th and 7th.' },
  { id: 'major-pent', name: 'Major pentatonic', degrees: ['1', '2', '3', '5', '6'], blurb: 'Major without the 4th and 7th. Hard to hit a wrong note; country and pop leads.' },
  { id: 'minor-pent', name: 'Minor pentatonic', degrees: ['1', 'b3', '4', '5', 'b7'], blurb: 'The rock and blues workhorse. Learn this box first.' },
  { id: 'blues', name: 'Blues', degrees: ['1', 'b3', '4', 'b5', '5', 'b7'], blurb: 'Minor pentatonic plus the ♭5 "blue note". Bend into it or pass through it.' },
  { id: 'harmonic-minor', name: 'Harmonic minor', degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'], blurb: 'Natural minor with a raised 7th. Exotic, classical, neoclassical metal.' },
  { id: 'melodic-minor', name: 'Melodic minor', degrees: ['1', '2', 'b3', '4', '5', '6', '7'], blurb: 'Major with a lowered 3rd. Smooth minor sound used a lot in jazz.' },
  { id: 'dorian', name: 'Dorian', degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'], blurb: 'Minor with a bright 6th. Funk, Santana, "So What".' },
  { id: 'phrygian', name: 'Phrygian', degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], blurb: 'Minor with a ♭2. Dark, Spanish and metal flavors.' },
  { id: 'lydian', name: 'Lydian', degrees: ['1', '2', '3', '#4', '5', '6', '7'], blurb: 'Major with a ♯4. Dreamy, floating, film-score sound.' },
  { id: 'mixolydian', name: 'Mixolydian', degrees: ['1', '2', '3', '4', '5', '6', 'b7'], blurb: 'Major with a ♭7. Rock, blues-rock and jam bands over dominant chords.' },
  { id: 'locrian', name: 'Locrian', degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], blurb: 'The unstable one, with a ♭5. Mostly heard over diminished chords.' },
];
