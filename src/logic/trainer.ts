// Speed trainer: the tempo moves from start toward target by `step` every `barsPerStep` bars.
import { clampBpm } from './tempo';

export interface Trainer {
  enabled: boolean;
  start: number;
  target: number;
  step: number;
  barsPerStep: number;
}

export const DEFAULT_TRAINER: Trainer = { enabled: false, start: 60, target: 100, step: 5, barsPerStep: 4 };

/** BPM for a bar (0-based bar count since play started). Works upward or downward, never passes target. */
export function trainerBpm(t: Trainer, bar: number): number {
  const start = clampBpm(t.start);
  const target = clampBpm(t.target);
  const step = Math.max(1, Math.abs(Math.round(t.step)));
  const every = Math.max(1, Math.round(t.barsPerStep));
  const steps = Math.floor(Math.max(0, bar) / every);
  const dir = target >= start ? 1 : -1;
  const bpm = start + dir * steps * step;
  return dir === 1 ? Math.min(bpm, target) : Math.max(bpm, target);
}

/** True once the trainer has reached its target at this bar. */
export function trainerDone(t: Trainer, bar: number): boolean {
  return trainerBpm(t, bar) === clampBpm(t.target);
}
