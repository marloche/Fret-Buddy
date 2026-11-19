import { describe, expect, it } from 'vitest';
import {
  accentFor,
  clampBpm,
  nextPosition,
  secondsPerBeat,
  tickInterval,
  timeSigById,
} from './tempo';
import { addTap, bpmFromTaps, TAP_KEEP, TAP_RESET_MS } from './tap';
import { trainerBpm, trainerDone, type Trainer } from './trainer';

describe('tempo math', () => {
  it('converts BPM to seconds per beat', () => {
    expect(secondsPerBeat(60)).toBe(1);
    expect(secondsPerBeat(120)).toBe(0.5);
    expect(secondsPerBeat(300)).toBeCloseTo(0.2);
  });

  it('divides the beat by the subdivision', () => {
    expect(tickInterval(120, 1)).toBe(0.5);
    expect(tickInterval(120, 2)).toBe(0.25);
    expect(tickInterval(120, 3)).toBeCloseTo(1 / 6);
    expect(tickInterval(120, 4)).toBe(0.125);
  });

  it('clamps BPM to 20–300 and rounds', () => {
    expect(clampBpm(5)).toBe(20);
    expect(clampBpm(999)).toBe(300);
    expect(clampBpm(120.4)).toBe(120);
    expect(clampBpm(NaN)).toBe(20);
  });

  it('walks through a bar and wraps', () => {
    let pos = { beat: 0, sub: 0, newBar: false };
    const seen: string[] = [];
    for (let i = 0; i < 9; i++) {
      seen.push(`${pos.beat}.${pos.sub}`);
      pos = nextPosition(pos.beat, pos.sub, 4, 2);
    }
    expect(seen).toEqual(['0.0', '0.1', '1.0', '1.1', '2.0', '2.1', '3.0', '3.1', '0.0']);
  });

  it('accents beat 1, group starts lighter, subdivisions lightest', () => {
    const sig78 = timeSigById('7/8');
    expect(accentFor(sig78, 0, 0, true)).toBe(3);
    expect(accentFor(sig78, 2, 0, true)).toBe(2);
    expect(accentFor(sig78, 1, 0, true)).toBe(1);
    expect(accentFor(sig78, 1, 1, true)).toBe(0);
    expect(accentFor(sig78, 0, 0, false)).toBe(1);
  });
});

describe('tap tempo', () => {
  it('needs two taps', () => {
    expect(bpmFromTaps(addTap([], 1000))).toBeNull();
  });

  it('averages the gaps', () => {
    let taps: number[] = [];
    for (const t of [0, 500, 1000, 1500]) taps = addTap(taps, t);
    expect(bpmFromTaps(taps)).toBe(120);
    // Uneven taps average out: gaps 480, 520 → 500 ms → 120 BPM
    expect(bpmFromTaps([0, 480, 1000])).toBe(120);
  });

  it('starts over after a long pause', () => {
    let taps = addTap(addTap([], 0), 500);
    taps = addTap(taps, 500 + TAP_RESET_MS + 1);
    expect(taps).toHaveLength(1);
  });

  it('keeps only the most recent taps', () => {
    let taps: number[] = [];
    for (let i = 0; i < 20; i++) taps = addTap(taps, i * 1000);
    expect(taps).toHaveLength(TAP_KEEP);
    expect(bpmFromTaps(taps)).toBe(60);
  });
});

describe('speed trainer', () => {
  const t: Trainer = { enabled: true, start: 60, target: 80, step: 5, barsPerStep: 4 };

  it('steps up every N bars', () => {
    expect([0, 3, 4, 7, 8, 12].map((b) => trainerBpm(t, b))).toEqual([60, 60, 65, 65, 70, 75]);
  });

  it('stops at the target', () => {
    expect(trainerBpm(t, 16)).toBe(80);
    expect(trainerBpm(t, 100)).toBe(80);
    expect(trainerDone(t, 15)).toBe(false);
    expect(trainerDone(t, 16)).toBe(true);
  });

  it('does not overshoot when the step does not divide evenly', () => {
    expect(trainerBpm({ ...t, step: 7 }, 12)).toBe(80);
  });

  it('can step down', () => {
    expect(trainerBpm({ ...t, start: 100, target: 90 }, 4)).toBe(95);
    expect(trainerBpm({ ...t, start: 100, target: 90 }, 40)).toBe(90);
  });
});
