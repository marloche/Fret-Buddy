// Turns the curated shapes into concrete voicings for a chosen root + quality.
import { MOVABLE_SHAPES, OPEN_SHAPES } from '../data/chordShapes';
import { mod12, parseNote, pcOf } from './notes';
import { openPcs, STANDARD, type Tuning } from './fretboard';

export interface Voicing {
  id: string;
  label: string; // "Open", "E-shape barre (5th fret)"
  frets: (number | null)[]; // absolute frets, low E first
  fingers: (number | null)[];
  barre?: { fret: number; from: number; to: number };
  /** First fret drawn in the diagram (1 = nut shown). */
  baseFret: number;
}

const DIAGRAM_FRETS = 5;

function baseFretFor(frets: (number | null)[]): number {
  const fretted = frets.filter((f): f is number => f !== null && f > 0);
  if (!fretted.length) return 1;
  const max = Math.max(...fretted);
  // Show the nut only when the shape sits near it; a barre higher up starts the box at the barre.
  if (max <= DIAGRAM_FRETS - 1) return 1;
  return Math.min(...fretted);
}

export function voicingsFor(rootPc: number, qualityId: string, tuning: Tuning = STANDARD): Voicing[] {
  const out: Voicing[] = [];
  for (const s of OPEN_SHAPES) {
    if (s.quality !== qualityId || pcOf(parseNote(s.root)) !== mod12(rootPc)) continue;
    out.push({ id: `open-${s.root}-${s.quality}`, label: 'Open position', frets: s.frets, fingers: s.fingers, barre: s.barre, baseFret: baseFretFor(s.frets) });
  }
  const open = openPcs(tuning);
  const movable = MOVABLE_SHAPES.filter((s) => s.quality === qualityId)
    .map((s) => {
      // Root fret on the shape's root string; at 0 the "open" version is already
      // covered by open shapes (or would need different fingering), so use the 12th fret.
      const r = mod12(rootPc - open[s.rootString]) || 12;
      const frets = s.frets.map((f) => (f === null ? null : f + r));
      return {
        id: s.id,
        label: `${s.name} · fret ${r}`,
        frets,
        fingers: s.fingers,
        barre: s.barre ? { fret: r, from: s.barre.from, to: s.barre.to } : undefined,
        baseFret: baseFretFor(frets),
        r,
      };
    })
    .sort((a, b) => a.r - b.r);
  for (const { r: _r, ...v } of movable) {
    if (!out.some((o) => o.frets.join() === v.frets.join())) out.push(v);
  }
  return out;
}
