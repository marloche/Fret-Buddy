// Builds spelled scales and chords from the degree lists in src/data.
import { CHORD_QUALITIES, type ChordQuality } from '../data/chordQualities';
import { SCALE_TYPES, type ScaleType } from '../data/scaleTypes';
import { noteName, parseDegree, pcOf, spellRoot, transpose, type Degree, type Note } from './notes';

export interface SpelledTone {
  note: Note;
  name: string;
  pc: number;
  degree: string;
}

export interface Built {
  root: Note;
  rootName: string;
  tones: SpelledTone[];
  /** pitch class → tone, for labelling fretboard positions. */
  byPc: Map<number, SpelledTone>;
}

function build(rootPc: number, degreeLabels: string[]): Built {
  const degrees: Degree[] = degreeLabels.map(parseDegree);
  const root = spellRoot(rootPc, degrees);
  const tones = degrees.map((d) => {
    const note = transpose(root, d);
    return { note, name: noteName(note), pc: pcOf(note), degree: d.label };
  });
  return { root, rootName: noteName(root), tones, byPc: new Map(tones.map((t) => [t.pc, t])) };
}

export function scaleTypeById(id: string): ScaleType {
  return SCALE_TYPES.find((s) => s.id === id) ?? SCALE_TYPES[0];
}

export function qualityById(id: string): ChordQuality {
  return CHORD_QUALITIES.find((q) => q.id === id) ?? CHORD_QUALITIES[0];
}

export function buildScale(rootPc: number, type: ScaleType): Built {
  return build(rootPc, type.degrees);
}

export function buildChord(rootPc: number, quality: ChordQuality): Built & { symbol: string } {
  const b = build(rootPc, quality.degrees);
  return { ...b, symbol: b.rootName + quality.symbol };
}
