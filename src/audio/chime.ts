// A soft two-note chime for "time's up on this item". Separate from the metronome so
// it works whether or not the click is running.
import { preferPlayback } from './session';

let ctx: AudioContext | null = null;

/** Call from a click/tap so iOS allows audio later. */
export function primeChime(): void {
  preferPlayback();
  ctx ??= new AudioContext();
  if (ctx.state !== 'running') void ctx.resume();
}

export function chime(times = 1): void {
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.02;
  for (let k = 0; k < times; k++) {
    [880, 1318.5].forEach((freq, i) => {
      const t = t0 + k * 0.5 + i * 0.14;
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }
}
