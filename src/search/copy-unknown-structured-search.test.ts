import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { copyUnknownStructuredSearch } from './copy-unknown-structured-search.js';

describe('copyUnknownStructuredSearch', () => {
  it('copies string and string array unknown values', () => {
    const result = copyUnknownStructuredSearch({ debug: 'true', tags: ['a', 'b'] });

    expect(result).toEqual({ debug: 'true', tags: ['a', 'b'] });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result?.tags)).toBe(true);
  });

  it('omits absent unknown values', () => {
    expect(copyUnknownStructuredSearch({ debug: undefined, empty: null })).toBeUndefined();
  });

  it('rejects non-string unknown values', () => {
    expect(() => copyUnknownStructuredSearch({ debug: true })).toThrow(UrlKitError);
    expect(() => copyUnknownStructuredSearch({ tags: ['a', 1] })).toThrow(UrlKitError);
  });
});
