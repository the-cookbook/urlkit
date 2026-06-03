import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { serializeDateTime } from './serialize-date-time.js';

describe('serializeDateTime', () => {
  it('serializes Date values as strict UTC date-time strings', () => {
    expect(serializeDateTime(new Date('2026-01-01T10:30:00.123Z'))).toBe(
      '2026-01-01T10:30:00.123Z',
    );
  });

  it('always serializes with the UTC Z suffix', () => {
    const value = new Date(Date.UTC(2026, 0, 1, 10, 30, 0, 0));

    expect(serializeDateTime(value)).toBe('2026-01-01T10:30:00.000Z');
  });

  it('rejects invalid Date values', () => {
    expect(() => serializeDateTime(new Date(Number.NaN))).toThrow(UrlKitError);
    expect(() => serializeDateTime('2026-01-01T10:30:00.000Z' as never)).toThrow(UrlKitError);
  });

  it('rejects dates outside the strict four-digit year format', () => {
    expect(() => serializeDateTime(new Date('+010000-01-01T00:00:00.000Z'))).toThrow(UrlKitError);
  });

  it('uses provided error code and path', () => {
    try {
      serializeDateTime(new Date(Number.NaN), { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected serializeDateTime to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
