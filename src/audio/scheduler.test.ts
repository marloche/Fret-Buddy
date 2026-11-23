// Engine test with a fake audio clock: checks count-in, gap-click silence and the trainer
// against what the scheduler actually queues and plays.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_GAP } from '../logic/tempo';
import { DEFAULT_TRAINER } from '../logic/trainer';
import { Metronome, type MetronomeSettings, type Tick } from './scheduler';

const clicks = vi.hoisted(() => [] as number[]);
vi.mock('./click', () => ({ playClick: (_ctx: unknown, time: number) => clicks.push(time) }));

class FakeCtx {
  static last: FakeCtx;
  currentTime = 0;
  state = 'running';
  constructor() {
    FakeCtx.last = this;
  }
  resume() {
    return Promise.resolve();
  }
}

beforeEach(() => {
  clicks.length = 0;
  vi.stubGlobal('AudioContext', FakeCtx);
  vi.stubGlobal('window', { setInterval: () => 1 });
  vi.stubGlobal('document', { hidden: false });
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
});
afterEach(() => vi.unstubAllGlobals());

const base: MetronomeSettings = {
  bpm: 240, // 4 beats a second: one 4/4 bar per second
  timeSig: '4/4',
  subdivision: 1,
  accent: true,
  volume: 1,
  trainer: DEFAULT_TRAINER,
  countIn: 0,
  gap: DEFAULT_GAP,
};

/** Runs the engine for `seconds` of fake audio time and returns every tick it queued. */
async function run(settings: MetronomeSettings, seconds: number, onBpm: (bpm: number, bar: number) => void = () => {}) {
  let s = settings;
  const m: Metronome = new Metronome(
    () => s,
    () => {},
    (bpm) => {
      s = { ...s, bpm };
      onBpm(bpm, (m as unknown as { bar: number }).bar);
    },
  );
  await m.start();
  const ctx = FakeCtx.last;
  const ticks = new Map<number, Tick>();
  const internals = m as unknown as { schedule: () => void; queue: Tick[] };
  for (let t = 0; t <= seconds; t += 0.02) {
    ctx.currentTime = t;
    internals.schedule();
    for (const k of internals.queue) ticks.set(k.time, k);
  }
  m.stop();
  return [...ticks.values()].filter((k) => k.time < seconds).sort((a, b) => a.time - b.time);
}

describe('metronome engine', () => {
  it('plays one count-in bar, then alternates click and silent bars, keeping time through the silence', async () => {
    const ticks = await run({ ...base, countIn: 1, gap: { enabled: true, playBars: 1, muteBars: 1 } }, 5);
    const byBar = new Map<number, string[]>();
    for (const k of ticks) byBar.set(k.bar, [...(byBar.get(k.bar) ?? []), k.phase]);
    expect([...byBar.keys()]).toEqual([-1, 0, 1, 2, 3]);
    expect(byBar.get(-1)).toEqual(['count', 'count', 'count', 'count']);
    expect(byBar.get(0)).toEqual(['play', 'play', 'play', 'play']);
    expect(byBar.get(1)).toEqual(['mute', 'mute', 'mute', 'mute']);
    expect(byBar.get(2)?.[0]).toBe('play');
    // Sound only on non-silent ticks...
    expect(clicks.filter((t) => t < 5)).toEqual(ticks.filter((k) => k.phase !== 'mute').map((k) => k.time));
    // ...but the beat grid stays even all the way through.
    const gaps = ticks.slice(1).map((k, i) => k.time - ticks[i].time);
    gaps.forEach((g) => expect(g).toBeCloseTo(0.25, 6));
  });

  it('without count-in starts straight on bar 0', async () => {
    const ticks = await run(base, 1.5);
    expect(ticks[0]).toMatchObject({ bar: 0, beat: 0, phase: 'play' });
    expect(clicks.filter((t) => t < 1.5).length).toBe(ticks.length);
  });

  it('holds the speed trainer at its start tempo through the count-in', async () => {
    const calls: [number, number][] = [];
    await run(
      { ...base, bpm: 80, countIn: 2, trainer: { enabled: true, start: 120, target: 200, step: 10, barsPerStep: 1 } },
      6,
      (bpm, bar) => calls.push([bpm, bar]),
    );
    expect(calls[0]).toEqual([120, -2]); // set at start
    expect(calls.find(([bpm]) => bpm === 130)?.[1]).toBe(1); // first step only after a full real bar
  });
});
