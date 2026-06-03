import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { parseUnixSeconds } from './parse-unix-seconds.js';

describe('parseUnixSeconds', () => {
  it('parses finite integer seconds into Date values', () => {
    expect(parseUnixSeconds('1704067200').toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(parseUnixSeconds('-1').toISOString()).toBe('1969-12-31T23:59:59.000Z');
  });

  it('rejects fractional, NaN, Infinity, and non-numeric values', () => {
    for (const value of ['1.5', 'NaN', 'Infinity', '-Infinity', 'abc', '', ' 1', '1 ']) {
      expect(() => parseUnixSeconds(value)).toThrow(UrlKitError);
    }
  });

  it('rejects values outside the Date range', () => {
    expect(() => parseUnixSeconds('999999999999999999999')).toThrow(UrlKitError);
  });

  it('uses provided error context', () => {
    try {
      parseUnixSeconds('1.5', { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected unix seconds parsing to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
