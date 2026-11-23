import { describe, expect, it } from 'vitest';
import { clearBest, localDate, progress, recordBest } from './bests';

describe('personal bests', () => {
  it('saves the first value and only replaces it with a higher one', () => {
    let b = recordBest({}, 'spider', 80, '2026-11-20');
    expect(b.spider).toEqual({ value: 80, date: '2026-11-20' });
    const same = recordBest(b, 'spider', 75, '2026-11-21');
    expect(same).toBe(b); // unchanged object: nothing to save
    b = recordBest(b, 'spider', 92, '2026-11-22');
    expect(b.spider).toEqual({ value: 92, date: '2026-11-22' });
  });

  it('ignores junk values and keeps other entries', () => {
    const b = { a: { value: 60, date: '2026-11-01' } };
    expect(recordBest(b, 'x', 0, '2026-11-02')).toBe(b);
    expect(recordBest(b, 'x', NaN, '2026-11-02')).toBe(b);
    expect(recordBest(b, 'x', 70, '2026-11-02')).toEqual({ ...b, x: { value: 70, date: '2026-11-02' } });
  });

  it('clears one entry', () => {
    const b = { a: { value: 60, date: '2026-11-01' }, c: { value: 9, date: '2026-11-01' } };
    expect(clearBest(b, 'a')).toEqual({ c: b.c });
    expect(clearBest(b, 'missing')).toBe(b);
  });

  it('measures progress from start to goal, clamped', () => {
    expect(progress(60, 120, 90)).toBe(0.5);
    expect(progress(60, 120, 40)).toBe(0);
    expect(progress(60, 120, 150)).toBe(1);
    expect(progress(100, 100, 100)).toBe(1);
  });

  it('formats the local date', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
