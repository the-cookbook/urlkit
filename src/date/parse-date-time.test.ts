import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { parseDateTime } from './parse-date-time.js';

describe('parseDateTime', () => {
  it('parses strict UTC date-time strings into Date values', () => {
    const value = parseDateTime('2026-01-01T10:30:00.123Z');

    expect(value).toBeInstanceOf(Date);
    expect(value.toISOString()).toBe('2026-01-01T10:30:00.123Z');
  });

  it('rejects ambiguous or offset date-time strings', () => {
    for (const value of [
      '2026-01-01T10:30:00',
      '2026-01-01 10:30:00',
      '2026-01-01T10:30:00+02:00',
      '2026-01-01T10:30:00.000+02:00',
      '2026-01-01T10:30:00Z',
    ]) {
      expect(() => parseDateTime(value)).toThrow(UrlKitError);
    }
  });

  it('rejects invalid calendar instants', () => {
    for (const value of [
      '2026-02-31T10:30:00.000Z',
      '2026-13-01T10:30:00.000Z',
      '2026-00-01T10:30:00.000Z',
      '2026-01-01T24:00:00.000Z',
      '2026-01-01T10:60:00.000Z',
      '2026-01-01T10:30:60.000Z',
    ]) {
      expect(() => parseDateTime(value)).toThrow(UrlKitError);
    }
  });

  it('rejects non-date-time strings', () => {
    for (const value of ['', '2026-01-01', 'not-a-date-time', '2026/01/01T10:30:00.000Z']) {
      expect(() => parseDateTime(value)).toThrow(UrlKitError);
    }
  });

  it('preserves year zero through explicit UTC full-year handling', () => {
    expect(parseDateTime('0000-01-01T00:00:00.000Z').getUTCFullYear()).toBe(0);
  });

  it('uses provided error code and path', () => {
    try {
      parseDateTime('wrong', { code: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected parseDateTime to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
