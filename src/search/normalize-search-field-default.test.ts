import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { normalizeSearchFieldDefault } from './normalize-search-field-default.js';

describe('normalizeSearchFieldDefault', () => {
  it('normalizes one-field defaults', () => {
    expect(normalizeSearchFieldDefault('one', int(), 2, ['page'])).toBe(2);
  });

  it('normalizes and freezes many-field defaults', () => {
    const value = normalizeSearchFieldDefault('many', string(), ['react', 'router'], ['tag']);

    expect(value).toEqual(['react', 'router']);
    expect(Object.isFrozen(value)).toBe(true);
  });

  it('rejects non-array many-field defaults', () => {
    expect(() => normalizeSearchFieldDefault('many', string(), 'react', ['tag'])).toThrow(
      UrlKitError,
    );
  });

  it('throws invalid-descriptor for invalid default values', () => {
    expect(() => normalizeSearchFieldDefault('one', int(), 1.5, ['page'])).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
  });
});
