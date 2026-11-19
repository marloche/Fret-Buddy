// Metronome engine: a lookahead scheduler on the Web Audio clock.
//
//   setInterval(25ms) ─► schedule every click due within the lookahead window
//                        at its exact audio-clock time (osc.start(time))
//   requestAnimationFrame ─► report clicks whose time has passed, for the beat display
//
// The timer only keeps the buffer full; the audio clock does the timing, so clicks don't drift.
import {
  accentFor,
  nextPosition,
  tickInterval,
  timeSigById,
  type Accent,
  type Subdivision,
} from '../logic/tempo';
import { trainerBpm, type Trainer } from '../logic/trainer';
import { playClick } from './click';

export interface MetronomeSettings {
  bpm: number;
  timeSig: string;
  subdivision: Subdivision;
  accent: boolean;
  volume: number; // 0..1
  trainer: Trainer;
}

export interface Tick {
  time: number;
  beat: number;
  sub: number;
  bar: number;
  accent: Accent;
}

const TIMER_MS = 25;
const LOOKAHEAD_S = 0.1;
// Browsers slow background timers to about once a second, so schedule further ahead while hidden.
const HIDDEN_LOOKAHEAD_S = 1.5;
const START_DELAY_S = 0.06;

export class Metronome {
  private ctx: AudioContext | null = null;
  private timer: number | null = null;
  private raf: number | null = null;
  private nextTime = 0;
  private beat = 0;
  private sub = 0;
  private bar = 0;
  private queue: Tick[] = [];
  private lastSig = '';
  playing = false;

  constructor(
    private getSettings: () => MetronomeSettings,
    private onTick: (tick: Tick) => void,
    /** Called when the speed trainer changes the tempo. */
    private onTrainerBpm: (bpm: number) => void,
  ) {}

  async start(): Promise<void> {
    if (this.playing) return;
    // The AudioContext must be created/resumed inside a user gesture (iOS especially).
    this.ctx ??= new AudioContext({ latencyHint: 'interactive' });
    if (this.ctx.state !== 'running') await this.ctx.resume();
    this.playing = true;
    this.beat = 0;
    this.sub = 0;
    this.bar = 0;
    this.queue = [];
    this.lastSig = this.getSettings().timeSig;
    this.applyTrainer();
    this.nextTime = this.ctx.currentTime + START_DELAY_S;
    this.schedule();
    this.timer = window.setInterval(() => this.schedule(), TIMER_MS);
    this.raf = requestAnimationFrame(this.draw);
  }

  stop(): void {
    this.playing = false;
    if (this.timer !== null) clearInterval(this.timer);
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.timer = null;
    this.raf = null;
    this.queue = [];
  }

  private applyTrainer(): void {
    const s = this.getSettings();
    if (!s.trainer.enabled) return;
    const bpm = trainerBpm(s.trainer, this.bar);
    if (bpm !== s.bpm) this.onTrainerBpm(bpm);
  }

  private schedule = (): void => {
    const ctx = this.ctx;
    if (!ctx || !this.playing) return;
    const ahead = document.hidden ? HIDDEN_LOOKAHEAD_S : LOOKAHEAD_S;
    // The display loop pauses while the tab is hidden; drop old ticks so the queue can't grow forever.
    while (this.queue.length && this.queue[0].time < ctx.currentTime - 1) this.queue.shift();
    // If the tab was frozen, don't fire a burst of late clicks: jump ahead.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + START_DELAY_S;
    while (this.nextTime < ctx.currentTime + ahead) {
      const s = this.getSettings();
      const sig = timeSigById(s.timeSig);
      if (s.timeSig !== this.lastSig) {
        // Time signature changed mid-bar: restart the bar so beat 1 lines up.
        this.lastSig = s.timeSig;
        this.beat = 0;
        this.sub = 0;
      }
      if (this.sub >= s.subdivision) this.sub = 0; // subdivision got smaller mid-beat
      const accent = accentFor(sig, this.beat, this.sub, s.accent);
      playClick(ctx, this.nextTime, accent, s.volume);
      this.queue.push({ time: this.nextTime, beat: this.beat, sub: this.sub, bar: this.bar, accent });

      this.nextTime += tickInterval(s.bpm, s.subdivision);
      const next = nextPosition(this.beat, this.sub, sig.beats, s.subdivision);
      this.beat = next.beat;
      this.sub = next.sub;
      if (next.newBar) {
        this.bar += 1;
        this.applyTrainer();
      }
    }
  };

  private draw = (): void => {
    if (!this.playing || !this.ctx) return;
    const now = this.ctx.currentTime;
    let latest: Tick | undefined;
    while (this.queue.length && this.queue[0].time <= now) latest = this.queue.shift();
    if (latest) this.onTick(latest);
    this.raf = requestAnimationFrame(this.draw);
  };
}
