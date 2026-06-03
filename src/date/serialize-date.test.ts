import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { serializeDate } from './serialize-date.js';

describe('serializeDate', () => {
  it('serializes using YYYY-MM-DD', () => {
    expect(serializeDate(new Date(Date.UTC(2026, 5, 2)))).toBe('2026-06-02');
  });

  it('uses UTC calendar fields to prevent timezone drift', () => {
    const value = new Date(Date.UTC(2026, 5, 2, 23, 59, 59, 999));

    expect(serializeDate(value)).toBe('2026-06-02');
  });

  it('rejects invalid Date values', () => {
    expect(() => serializeDate(new Date(Number.NaN))).toThrow(UrlKitError);
    expect(() => serializeDate('2026-06-02' as never)).toThrow(UrlKitError);
  });

  it('uses provided error code and path', () => {
    try {
      serializeDate(new Date(Number.NaN), { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected serializeDate to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
