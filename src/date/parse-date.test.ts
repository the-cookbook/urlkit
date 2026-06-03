import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { parseDate } from './parse-date.js';

describe('parseDate', () => {
  it('parses YYYY-MM-DD into UTC midnight Date', () => {
    const value = parseDate('2026-06-02');

    expect(value).toBeInstanceOf(Date);
    expect(value.toISOString()).toBe('2026-06-02T00:00:00.000Z');
  });

  it('rejects invalid calendar dates', () => {
    for (const value of ['2026-02-31', '2026-13-01', '2026-00-01', '2026-01-00']) {
      expect(() => parseDate(value)).toThrow(UrlKitError);
    }
  });

  it('rejects non-date strings', () => {
    for (const value of ['', '2026-6-2', '2026/06/02', '2026-06-02T00:00:00.000Z', 'not-a-date']) {
      expect(() => parseDate(value)).toThrow(UrlKitError);
    }
  });

  it('preserves year zero through explicit UTC full-year handling', () => {
    expect(parseDate('0000-01-01').getUTCFullYear()).toBe(0);
  });

  it('uses provided error code and path', () => {
    try {
      parseDate('wrong', { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected parseDate to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
