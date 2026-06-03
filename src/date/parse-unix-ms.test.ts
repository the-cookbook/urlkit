import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { parseUnixMs } from './parse-unix-ms.js';

describe('parseUnixMs', () => {
  it('parses finite integer milliseconds into Date values', () => {
    expect(parseUnixMs('1704067200123').toISOString()).toBe('2024-01-01T00:00:00.123Z');
    expect(parseUnixMs('-1').toISOString()).toBe('1969-12-31T23:59:59.999Z');
  });

  it('rejects fractional, NaN, Infinity, and non-numeric values', () => {
    for (const value of ['1.5', 'NaN', 'Infinity', '-Infinity', 'abc', '', ' 1', '1 ']) {
      expect(() => parseUnixMs(value)).toThrow(UrlKitError);
    }
  });

  it('rejects values outside the Date range', () => {
    expect(() => parseUnixMs('999999999999999999999')).toThrow(UrlKitError);
  });

  it('uses provided error context', () => {
    try {
      parseUnixMs('1.5', { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected unix milliseconds parsing to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
