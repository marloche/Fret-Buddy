import { describe, expect, it } from 'vitest';
import {
  elapsed,
  formatClock,
  formatDuration,
  goTo,
  itemRemaining,
  noteBpm,
  pause,
  resume,
  startSession,
  summarize,
  toLogEntry,
  type LogEntry,
  type RoutineItem,
} from './practice';

const routine: RoutineItem[] = [
  { id: 'a', kind: 'exercise', exerciseId: 'spider-1234', label: 'Spider', minutes: 2 },
  { id: 'b', kind: 'free', label: 'Song', minutes: 3 },
];
const T0 = new Date(2026, 10, 18, 20, 0, 0).getTime();
const MIN = 60_000;

describe('session clock', () => {
  it('counts time, but not while paused', () => {
    let s = startSession(T0, null);
    expect(elapsed(s, T0 + 30_000)).toBe(30_000);
    s = pause(s, T0 + 30_000);
    expect(elapsed(s, T0 + 10 * MIN)).toBe(30_000);
    s = resume(s, T0 + 10 * MIN);
    expect(elapsed(s, T0 + 10 * MIN + 5_000)).toBe(35_000);
  });

  it('pausing or resuming twice changes nothing', () => {
    const s = pause(startSession(T0, null), T0 + 1000);
    expect(pause(s, T0 + 9000)).toBe(s);
    const r = resume(s, T0 + 2000);
    expect(resume(r, T0 + 5000)).toBe(r);
  });

  it('counts down routine items and moves through them', () => {
    let s = startSession(T0, routine);
    expect(itemRemaining(s, routine, T0 + 30_000)).toBe(90_000);
    s = goTo(s, routine, 1, T0 + 2 * MIN);
    expect(s.index).toBe(1);
    expect(s.visited).toEqual(['Spider', 'Song']);
    expect(itemRemaining(s, routine, T0 + 3 * MIN)).toBe(2 * MIN);
    s = goTo(s, routine, 2, T0 + 5 * MIN);
    expect(s.done).toBe(true);
    expect(s.resumedAt).toBeNull(); // the clock stops at the end
    expect(elapsed(s, T0 + 60 * MIN)).toBe(5 * MIN);
  });

  it('a free session has no items', () => {
    const s = startSession(T0, null);
    expect(s.index).toBeNull();
    expect(itemRemaining(s, routine, T0)).toBeNull();
    expect(s.visited).toEqual(['Free practice']);
  });

  it('remembers the top tempo', () => {
    let s = startSession(T0, null);
    s = noteBpm(noteBpm(noteBpm(s, 80), 120), 100);
    expect(s.maxBpm).toBe(120);
  });

  it('turns into a log entry', () => {
    const s = noteBpm(startSession(T0, routine), 90);
    const e = toLogEntry(s, T0 + 7 * MIN, 'x');
    expect(e).toEqual({ id: 'x', start: new Date(T0).toISOString(), durationMs: 7 * MIN, items: ['Spider'], maxBpm: 90 });
  });
});

describe('formatting', () => {
  it('formats clocks', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(65_000)).toBe('1:05');
    expect(formatClock(3_729_000)).toBe('1:02:09');
    expect(formatClock(-5_000)).toBe('0:00');
  });
  it('formats durations', () => {
    expect(formatDuration(20_000)).toBe('<1 min');
    expect(formatDuration(12 * MIN)).toBe('12 min');
    expect(formatDuration(65 * MIN)).toBe('1 h 5 min');
    expect(formatDuration(120 * MIN)).toBe('2 h');
  });
});

describe('log summary', () => {
  const entry = (daysAgo: number, minutes: number): LogEntry => {
    const d = new Date(T0);
    d.setDate(d.getDate() - daysAgo);
    return { id: `${daysAgo}`, start: d.toISOString(), durationMs: minutes * MIN, items: [], maxBpm: null };
  };

  it('totals the last 7 days and counts the streak', () => {
    const log = [entry(0, 15), entry(1, 20), entry(2, 10), entry(4, 30), entry(8, 60)];
    const sum = summarize(log, T0);
    expect(sum.weekMs).toBe(75 * MIN); // the 8-days-ago session doesn't count
    expect(sum.weekSessions).toBe(4);
    expect(sum.streakDays).toBe(3); // today, yesterday, the day before; day 3 is missing
  });

  it('keeps the streak alive if you have not practiced yet today', () => {
    expect(summarize([entry(1, 10), entry(2, 10)], T0).streakDays).toBe(2);
    expect(summarize([entry(2, 10)], T0).streakDays).toBe(0);
  });

  it('is empty for an empty log', () => {
    expect(summarize([], T0)).toEqual({ weekMs: 0, weekSessions: 0, streakDays: 0 });
  });
});
