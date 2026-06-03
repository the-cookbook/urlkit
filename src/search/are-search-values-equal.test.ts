import { describe, expect, it } from 'vitest';
import { areSearchValuesEqual } from './are-search-values-equal.js';

describe('areSearchValuesEqual', () => {
  it('compares primitives exactly', () => {
    expect(areSearchValuesEqual('a', 'a')).toBe(true);
    expect(areSearchValuesEqual(1, '1')).toBe(false);
  });

  it('compares dates by timestamp', () => {
    expect(
      areSearchValuesEqual(
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    ).toBe(true);
    expect(
      areSearchValuesEqual(
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-01-02T00:00:00.000Z'),
      ),
    ).toBe(false);
  });

  it('compares arrays by ordered normalized values', () => {
    expect(areSearchValuesEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(areSearchValuesEqual(['b', 'a'], ['a', 'b'])).toBe(false);
  });

  it('compares plain objects deeply', () => {
    expect(areSearchValuesEqual({ a: 1, b: ['x'] }, { b: ['x'], a: 1 })).toBe(true);
    expect(areSearchValuesEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
});
