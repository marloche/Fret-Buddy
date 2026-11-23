import { describe, expect, it } from 'vitest';
import { pairKey, parsePairKey, roundState } from './changes';

describe('chord changes', () => {
  const A = { root: 9, quality: 'maj' };
  const D = { root: 2, quality: 'maj' };
  const Am = { root: 9, quality: 'min' };

  it('gives the same key in either order, and different keys for different pairs', () => {
    expect(pairKey(A, D)).toBe(pairKey(D, A));
    expect(pairKey(A, D)).not.toBe(pairKey(Am, D));
  });

  it('reads a key back', () => {
    expect(parsePairKey(pairKey(A, D))).toEqual([D, A]);
    expect(parsePairKey('junk')).toBeNull();
    expect(parsePairKey('x:maj|2:maj')).toBeNull();
  });

  it('counts down 3-2-1, then runs a minute, then is done', () => {
    expect(roundState(0)).toEqual({ phase: 'countdown', left: 3 });
    expect(roundState(2500)).toEqual({ phase: 'countdown', left: 1 });
    expect(roundState(3000)).toEqual({ phase: 'running', left: 60 });
    expect(roundState(3000 + 59_100)).toEqual({ phase: 'running', left: 1 });
    expect(roundState(63_000)).toEqual({ phase: 'done', left: 0 });
    expect(roundState(-50)).toEqual({ phase: 'countdown', left: 3 });
  });
});
