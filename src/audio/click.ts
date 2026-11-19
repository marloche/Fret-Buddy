// Synthesized metronome click: a short pitched blip. Higher and louder for accents.
import type { Accent } from '../logic/tempo';

const PITCH: Record<Accent, number> = { 0: 800, 1: 1200, 2: 1500, 3: 2000 };
const GAIN: Record<Accent, number> = { 0: 0.35, 1: 0.7, 2: 0.85, 3: 1 };
const LENGTH_S = 0.05;

export function playClick(ctx: AudioContext, time: number, accent: Accent, volume: number): void {
  if (volume <= 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(PITCH[accent], time);
  const peak = Math.min(1, volume) * GAIN[accent];
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + LENGTH_S);
  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + LENGTH_S + 0.01);
}
