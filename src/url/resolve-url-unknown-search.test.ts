import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { resolveUrlUnknownSearch } from './resolve-url-unknown-search.js';

describe('resolveUrlUnknownSearch', () => {
  it('strips unknown search params', () => {
    expect(resolveUrlUnknownSearch({ debug: 'true' }, 'strip')).toBeUndefined();
  });

  it('preserves unknown search params as a copy', () => {
    const raw = { debug: 'true', tag: ['a', 'b'] } as const;
    const preserved = resolveUrlUnknownSearch(raw, 'preserve');

    expect(preserved).toEqual(raw);
    expect(preserved).not.toBe(raw);
    expect(Object.isFrozen(preserved)).toBe(true);
  });

  it('throws invalid-search for unknown search params in error mode', () => {
    expect(() => resolveUrlUnknownSearch({ debug: 'true' }, 'error')).toThrow(UrlKitError);

    try {
      resolveUrlUnknownSearch({ debug: 'true' }, 'error');
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).path).toEqual(['debug']);
    }
  });
});
