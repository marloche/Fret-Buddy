// Tempo math for the metronome. Pure functions only, so they can be unit-tested.

export const BPM_MIN = 20;
export const BPM_MAX = 300;

export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return BPM_MIN;
  return Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(bpm)));
}

export interface TimeSig {
  id: string;
  beats: number;
  /** Note value that gets one click: 4 = quarter, 8 = eighth. BPM counts this note. */
  unit: 4 | 8;
  /** Beat indexes (0-based) that start a group and get a lighter accent, besides beat 0. */
  groupStarts: number[];
}

export const TIME_SIGS: TimeSig[] = [
  { id: '2/4', beats: 2, unit: 4, groupStarts: [] },
  { id: '3/4', beats: 3, unit: 4, groupStarts: [] },
  { id: '4/4', beats: 4, unit: 4, groupStarts: [] },
  { id: '5/4', beats: 5, unit: 4, groupStarts: [3] }, // 3 + 2
  { id: '6/8', beats: 6, unit: 8, groupStarts: [3] }, // 3 + 3
  { id: '7/8', beats: 7, unit: 8, groupStarts: [2, 4] }, // 2 + 2 + 3
];

export function timeSigById(id: string): TimeSig {
  return TIME_SIGS.find((t) => t.id === id) ?? TIME_SIGS[2];
}

/** Clicks per beat: 1 = beats only, 2 = eighths, 3 = triplets, 4 = sixteenths. */
export type Subdivision = 1 | 2 | 3 | 4;

export const SUBDIVISIONS: { value: Subdivision; label: string }[] = [
  { value: 1, label: 'Beats' },
  { value: 2, label: '8ths' },
  { value: 3, label: 'Triplets' },
  { value: 4, label: '16ths' },
];

/** Seconds between two beats. */
export function secondsPerBeat(bpm: number): number {
  return 60 / clampBpm(bpm);
}

/** Seconds between two clicks, counting subdivisions. */
export function tickInterval(bpm: number, subdivision: Subdivision): number {
  return secondsPerBeat(bpm) / subdivision;
}

/** How loud/high a click is: 3 = bar start, 2 = group start, 1 = beat, 0 = subdivision. */
export type Accent = 0 | 1 | 2 | 3;

export function accentFor(sig: TimeSig, beat: number, sub: number, accentOn: boolean): Accent {
  if (sub > 0) return 0;
  if (!accentOn) return 1;
  if (beat === 0) return 3;
  if (sig.groupStarts.includes(beat)) return 2;
  return 1;
}

/** Position of the click after (beat, sub) in a bar. */
export function nextPosition(
  beat: number,
  sub: number,
  beats: number,
  subdivision: Subdivision,
): { beat: number; sub: number; newBar: boolean } {
  let s = sub + 1;
  let b = beat;
  if (s >= subdivision) {
    s = 0;
    b += 1;
  }
  if (b >= beats) return { beat: 0, sub: 0, newBar: true };
  return { beat: b, sub: s, newBar: false };
}
