// Checks the content files: exercises, lessons and the tab renderer that prints them.
import { describe, expect, it } from 'vitest';
import { BPM_MAX, BPM_MIN } from '../logic/tempo';
import { buildScale, scaleTypeById } from '../theory/build';
import { pcAt, STANDARD } from '../theory/fretboard';
import { parseNote, pcOf } from '../theory/notes';
import { renderTab, spider, stringIndex, type TabNote } from '../theory/tab';
import { voicingsFor } from '../theory/voicings';
import { CHORD_QUALITIES } from './chordQualities';
import { EXERCISES, exerciseById } from './exercises';
import { LESSONS } from './lessons';
import { SCALE_TYPES } from './scaleTypes';

const pcOfTab = (t: TabNote) => pcAt(STANDARD, stringIndex(t.s), t.f);

describe('tab renderer', () => {
  it('lines up all six strings', () => {
    const notes: TabNote[] = [
      { s: 6, f: 5 },
      { s: 5, f: 12 },
      { s: 3, f: 7, tech: 'h' },
      { s: 1, f: 0 },
      { s: 2, f: 10 },
    ];
    for (const sys of renderTab(notes, { groupSize: 2, perLine: 4 })) {
      expect(sys).toHaveLength(6);
      expect(new Set(sys.map((l) => l.length)).size).toBe(1);
    }
  });

  it('puts notes on the right line, high e on top, with techniques', () => {
    const [sys] = renderTab([
      { s: 3, f: 5 },
      { s: 3, f: 7, tech: 'h' },
    ]);
    expect(sys[0].startsWith('e|')).toBe(true);
    expect(sys[5].startsWith('E|')).toBe(true);
    expect(sys[2]).toBe('G|--5-h7-|');
    expect(sys[0]).toBe('e|-------|');
  });

  it('wraps long exercises into short lines', () => {
    expect(renderTab(spider([1, 2, 3, 4], 5), { perLine: 16 })).toHaveLength(3);
  });
});

describe('exercises', () => {
  it('have unique ids', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });

  for (const e of EXERCISES) {
    it(`${e.id} is well-formed`, () => {
      expect(e.tab || e.steps, 'needs tab or steps').toBeTruthy();
      expect(e.tips.length).toBeGreaterThan(0);
      expect(e.startBpm).toBeGreaterThanOrEqual(BPM_MIN);
      expect(e.goalBpm).toBeLessThanOrEqual(BPM_MAX);
      expect(e.goalBpm).toBeGreaterThanOrEqual(e.startBpm);
      for (const t of e.tab ?? []) {
        expect(t.s).toBeGreaterThanOrEqual(1);
        expect(t.s).toBeLessThanOrEqual(6);
        expect(t.f).toBeGreaterThanOrEqual(0);
        expect(t.f).toBeLessThanOrEqual(15);
      }
      // Hammer-ons go up the same string, pull-offs go down it.
      e.tab?.forEach((t, i) => {
        const prev = e.tab![i - 1];
        if (t.tech === 'h') expect(prev.s === t.s && t.f > prev.f, `hammer at ${i}`).toBe(true);
        if (t.tech === 'p') expect(prev.s === t.s && t.f < prev.f, `pull-off at ${i}`).toBe(true);
      });
    });
  }

  it('spider plays one finger per fret across all strings and back', () => {
    const notes = spider([1, 3, 2, 4], 5);
    expect(notes).toHaveLength(48);
    expect(notes.slice(0, 4)).toEqual([
      { s: 6, f: 5 },
      { s: 6, f: 7 },
      { s: 6, f: 6 },
      { s: 6, f: 8 },
    ]);
    expect(notes.slice(24, 28).map((n) => n.f)).toEqual([8, 6, 7, 5]); // reversed on the way down
  });

  it('scale runs only play notes of their scale', () => {
    const check = (id: string, root: string, scale: string) => {
      const allowed = new Set(buildScale(pcOf(parseNote(root)), scaleTypeById(scale)).byPc.keys());
      const tab = exerciseById(id)!.tab!;
      for (const t of tab) expect(allowed.has(pcOfTab(t)), `${id}: s${t.s} f${t.f}`).toBe(true);
      expect(pcOfTab(tab[0])).toBe(pcOf(parseNote(root))); // starts on the root
    };
    check('pent-box-a', 'A', 'minor-pent');
    check('g-major-octave', 'G', 'major');
  });
});

describe('lessons', () => {
  it('have unique ids', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });

  it('only reference chords, voicings and scales that exist', () => {
    for (const l of LESSONS) {
      for (const b of l.blocks) {
        if (b.type === 'chord') {
          expect(CHORD_QUALITIES.some((q) => q.id === b.quality), `${l.id}: ${b.quality}`).toBe(true);
          const vs = voicingsFor(pcOf(parseNote(b.root)), b.quality);
          expect(vs[b.voicing ?? 0], `${l.id}: ${b.root}${b.quality} voicing ${b.voicing}`).toBeDefined();
        }
        if (b.type === 'scale') expect(SCALE_TYPES.some((s) => s.id === b.scale), `${l.id}: ${b.scale}`).toBe(true);
        if (b.type === 'table') for (const r of b.rows) expect(r).toHaveLength(b.head.length);
      }
    }
  });

  it('CAGED lesson shows C as open, A-shape at 3 and E-shape at 8', () => {
    const vs = voicingsFor(0, 'maj');
    expect(vs[0].label).toBe('Open position');
    expect(vs[1].label).toContain('A-shape');
    expect(vs[1].frets[1]).toBe(3);
    expect(vs[2].label).toContain('E-shape');
    expect(vs[2].frets[0]).toBe(8);
  });
});
