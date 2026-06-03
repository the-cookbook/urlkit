import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { serializeUnixSeconds } from './serialize-unix-seconds.js';

describe('serializeUnixSeconds', () => {
  it('serializes Date values as integer seconds', () => {
    expect(serializeUnixSeconds(new Date('2024-01-01T00:00:00.000Z'))).toBe('1704067200');
    expect(serializeUnixSeconds(new Date('1969-12-31T23:59:59.000Z'))).toBe('-1');
  });

  it('rejects invalid dates and dates with fractional seconds', () => {
    expect(() => serializeUnixSeconds(new Date(Number.NaN))).toThrow(UrlKitError);
    expect(() => serializeUnixSeconds(new Date('2024-01-01T00:00:00.123Z'))).toThrow(UrlKitError);
  });

  it('uses provided error context', () => {
    try {
      serializeUnixSeconds(new Date(Number.NaN), { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected unix seconds serialization to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
