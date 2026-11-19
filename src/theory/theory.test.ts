import { describe, expect, it } from 'vitest';
import { CHORD_QUALITIES } from '../data/chordQualities';
import { MOVABLE_SHAPES, OPEN_SHAPES } from '../data/chordShapes';
import { SCALE_TYPES } from '../data/scaleTypes';
import { buildChord, buildScale, qualityById, scaleTypeById } from './build';
import { pcAt, positionsFor, STANDARD } from './fretboard';
import { noteAscii, parseDegree, parseNote, pcOf } from './notes';
import { voicingsFor } from './voicings';

const pc = (name: string) => pcOf(parseNote(name));
const scale = (root: string, type: string) =>
  buildScale(pc(root), scaleTypeById(type)).tones.map((t) => noteAscii(t.note)).join(' ');
const chord = (root: string, q: string) =>
  buildChord(pc(root), qualityById(q)).tones.map((t) => noteAscii(t.note)).join(' ');

describe('degrees', () => {
  it('turns labels into semitones', () => {
    expect(['1', 'b3', '#4', 'b7', '7', '9'].map((d) => parseDegree(d).semitones)).toEqual([0, 3, 6, 10, 11, 14]);
  });
});

describe('scales', () => {
  it('spells common scales', () => {
    expect(scale('C', 'major')).toBe('C D E F G A B');
    expect(scale('A', 'minor-pent')).toBe('A C D E G');
    expect(scale('A', 'minor')).toBe('A B C D E F G');
    expect(scale('E', 'blues')).toBe('E G A Bb B D');
    expect(scale('D', 'dorian')).toBe('D E F G A B C');
    expect(scale('F', 'lydian')).toBe('F G A B C D E');
    expect(scale('A', 'harmonic-minor')).toBe('A B C D E F G#');
  });

  it('uses each letter once in 7-note scales', () => {
    expect(scale('F#', 'major')).toBe('F# G# A# B C# D# E#');
    expect(scale('Bb', 'major')).toBe('Bb C D Eb F G A');
    for (const type of SCALE_TYPES.filter((t) => t.degrees.length === 7)) {
      for (let root = 0; root < 12; root++) {
        const letters = buildScale(root, type).tones.map((t) => t.note.letter);
        expect(new Set(letters).size, `${root} ${type.id}`).toBe(7);
      }
    }
  });

  it('picks the simpler name for a root', () => {
    expect(scale('Db', 'major')).toBe('Db Eb F Gb Ab Bb C'); // not C# major (7 sharps)
    expect(scale('G#', 'minor')).toBe('G# A# B C# D# E F#'); // not Ab minor (7 flats)
  });

  it('never needs double sharps or flats in a major or natural minor key', () => {
    for (let root = 0; root < 12; root++) {
      for (const id of ['major', 'minor']) {
        const accs = buildScale(root, scaleTypeById(id)).tones.map((t) => Math.abs(t.note.acc));
        expect(Math.max(...accs), `${root} ${id}`).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('chords', () => {
  it('spells chord tones', () => {
    expect(chord('C', 'maj')).toBe('C E G');
    expect(chord('C', '7')).toBe('C E G Bb');
    expect(chord('A', 'm7')).toBe('A C E G');
    expect(chord('G', 'aug')).toBe('G B D#');
    expect(chord('B', 'dim')).toBe('B D F');
    expect(chord('C', 'add9')).toBe('C E G D');
    expect(buildChord(pc('F#'), qualityById('m7')).symbol).toBe('F♯m7');
  });
});

describe('fretboard', () => {
  it('knows the notes on the neck', () => {
    expect(pcAt(STANDARD, 0, 5)).toBe(pc('A'));
    expect(pcAt(STANDARD, 4, 1)).toBe(pc('C'));
    expect(pcAt(STANDARD, 5, 12)).toBe(pc('E'));
  });
  it('finds every A on frets 0–12', () => {
    const found = positionsFor(STANDARD, new Set([pc('A')]), 12).map((p) => `${p.string}:${p.fret}`);
    expect(found).toEqual(['0:5', '1:0', '1:12', '2:7', '3:2', '4:10', '5:5']);
  });
});

describe('chord voicings', () => {
  const qualityIds = CHORD_QUALITIES.map((q) => q.id);

  it('only uses known qualities and roots', () => {
    for (const s of [...OPEN_SHAPES, ...MOVABLE_SHAPES]) expect(qualityIds).toContain(s.quality);
  });

  for (const q of CHORD_QUALITIES) {
    it(`${q.name}: every root has a voicing, and every voicing is correct`, () => {
      for (let root = 0; root < 12; root++) {
        const built = buildChord(root, q);
        const allowed = new Set(built.tones.map((t) => t.pc));
        const voicings = voicingsFor(root, q.id);
        expect(voicings.length, built.symbol).toBeGreaterThan(0);

        for (const v of voicings) {
          const where = `${built.symbol} ${v.label} [${v.frets.map((f) => (f === null ? 'x' : f)).join(' ')}]`;
          const sounding = v.frets
            .map((f, s) => (f === null ? null : pcAt(STANDARD, s, f)))
            .filter((p): p is number => p !== null);

          // Only chord tones…
          for (const p of sounding) expect(allowed.has(p), `${where}: stray note`).toBe(true);
          // …the root in the bass…
          expect(sounding[0], `${where}: bass is not the root`).toBe(root % 12);
          // …and the defining 3rd/sus note and 7th/9th/altered 5th are all there (a plain 5th may be left out).
          const essentials = built.tones.filter((t) => t.degree !== '5').map((t) => t.pc);
          for (const e of essentials) expect(sounding, `${where}: missing ${e}`).toContain(e);

          // Fingering: every fretted string has a finger 1–4, open/muted strings have none.
          v.frets.forEach((f, s) => {
            const finger = v.fingers[s];
            if (f !== null && f > 0) expect(finger, `${where}: string ${s} needs a finger`).toBeGreaterThanOrEqual(1);
            else expect(finger, `${where}: string ${s} should have no finger`).toBeNull();
          });
          // Playable stretch: fretted notes within 5 frets.
          const fretted = v.frets.filter((f): f is number => f !== null && f > 0);
          if (fretted.length) expect(Math.max(...fretted) - Math.min(...fretted), where).toBeLessThanOrEqual(4);
        }
      }
    });
  }
});
