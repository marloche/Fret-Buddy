// Tap tempo: average the gaps between recent taps.
import { clampBpm } from './tempo';

/** A gap longer than this starts a new tap sequence. */
export const TAP_RESET_MS = 2000;
/** Only the most recent taps count, so the tempo follows you if you change speed. */
export const TAP_KEEP = 8;

/** Adds a tap (timestamp in ms) and returns the new list of taps. */
export function addTap(taps: number[], now: number): number[] {
  const last = taps[taps.length - 1];
  if (last === undefined || now - last > TAP_RESET_MS || now <= last) return [now];
  return [...taps, now].slice(-TAP_KEEP);
}

/** BPM from the taps, or null until there are at least two. */
export function bpmFromTaps(taps: number[]): number | null {
  if (taps.length < 2) return null;
  const avgGap = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
  return clampBpm(60000 / avgGap);
}
