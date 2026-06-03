import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { serializeUnixMs } from './serialize-unix-ms.js';

describe('serializeUnixMs', () => {
  it('serializes Date values as integer milliseconds', () => {
    expect(serializeUnixMs(new Date('2024-01-01T00:00:00.123Z'))).toBe('1704067200123');
    expect(serializeUnixMs(new Date('1969-12-31T23:59:59.999Z'))).toBe('-1');
  });

  it('rejects invalid dates', () => {
    expect(() => serializeUnixMs(new Date(Number.NaN))).toThrow(UrlKitError);
  });

  it('uses provided error context', () => {
    try {
      serializeUnixMs(new Date(Number.NaN), { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected unix milliseconds serialization to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
