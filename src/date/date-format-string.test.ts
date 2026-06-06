import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import {
  parseDateFormatString,
  serializeDateFormatString,
  validateDateFormatString,
} from './date-format-string.js';

describe('date format strings', () => {
  it('parses and serializes strict date format strings', () => {
    const value = parseDateFormatString('02-06-2026', 'dd-MM-yyyy', 'date');

    expect(value.toISOString()).toBe('2026-06-02T00:00:00.000Z');
    expect(serializeDateFormatString(value, 'dd-MM-yyyy', 'date')).toBe('02-06-2026');
  });

  it('parses and serializes strict date-time format strings as UTC instants', () => {
    const value = parseDateFormatString(
      '02-06-2026 15:04:05.123',
      'dd-MM-yyyy HH:mm:ss.SSS',
      'date-time',
    );

    expect(value.toISOString()).toBe('2026-06-02T15:04:05.123Z');
    expect(value.getUTCFullYear()).toBe(2026);
    expect(value.getUTCMonth()).toBe(5);
    expect(value.getUTCDate()).toBe(2);
    expect(value.getUTCHours()).toBe(15);
    expect(value.getUTCMinutes()).toBe(4);
    expect(value.getUTCSeconds()).toBe(5);
    expect(value.getUTCMilliseconds()).toBe(123);
    expect(serializeDateFormatString(value, 'dd-MM-yyyy HH:mm:ss.SSS', 'date-time')).toBe(
      '02-06-2026 15:04:05.123',
    );
  });

  it('serializes strict date-time format strings from UTC fields', () => {
    const value = new Date('2026-06-02T12:30:05.000Z');

    expect(serializeDateFormatString(value, 'dd-MM-yyyy HH:mm:ss', 'date-time')).toBe(
      '02-06-2026 12:30:05',
    );
  });

  it('supports quoted literals in date-time format strings', () => {
    const value = parseDateFormatString(
      '2026-06-02T15:04:05.123Z',
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
      'date-time',
    );

    expect(value.toISOString()).toBe('2026-06-02T15:04:05.123Z');
    expect(serializeDateFormatString(value, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", 'date-time')).toBe(
      '2026-06-02T15:04:05.123Z',
    );
  });

  it('allows date-time formats without milliseconds only for zero-millisecond values', () => {
    const value = parseDateFormatString('02-06-2026 15:04:05', 'dd-MM-yyyy HH:mm:ss', 'date-time');

    expect(value.toISOString()).toBe('2026-06-02T15:04:05.000Z');
    expect(serializeDateFormatString(value, 'dd-MM-yyyy HH:mm:ss', 'date-time')).toBe(
      '02-06-2026 15:04:05',
    );
    expect(() =>
      serializeDateFormatString(
        new Date('2026-06-02T15:04:05.123Z'),
        'dd-MM-yyyy HH:mm:ss',
        'date-time',
      ),
    ).toThrow(UrlKitError);
  });

  it('rejects invalid calendar values and non-matching inputs', () => {
    expect(() => parseDateFormatString('31-02-2026', 'dd-MM-yyyy', 'date')).toThrow(UrlKitError);
    expect(() => parseDateFormatString('2026-06-02', 'dd-MM-yyyy', 'date')).toThrow(UrlKitError);
    expect(() =>
      parseDateFormatString('02-06-2026 24:00:00', 'dd-MM-yyyy HH:mm:ss', 'date-time'),
    ).toThrow(UrlKitError);
  });

  it('rejects unsupported, duplicate, and missing tokens', () => {
    expect(() => validateDateFormatString('DD-MM-yyyy', 'date')).toThrow(UrlKitError);
    expect(() => validateDateFormatString('dd-MM-yyyy-yyyy', 'date')).toThrow(UrlKitError);
    expect(() => validateDateFormatString('dd-MM', 'date')).toThrow(UrlKitError);
    expect(() => validateDateFormatString('dd-MM-yyyy HH:mm:ss', 'date')).toThrow(UrlKitError);
    expect(() => validateDateFormatString('dd-MM-yyyy', 'date-time')).toThrow(UrlKitError);
    expect(() => validateDateFormatString('yyyy-MM-ddTHH:mm:ss.SSS', 'date-time')).toThrow(
      UrlKitError,
    );
  });

  it('uses provided error context for parse and serialize failures', () => {
    try {
      parseDateFormatString('wrong', 'dd-MM-yyyy', 'date', {
        code: 'invalid-hash',
        path: ['hash'],
      });
      throw new Error('Expected date format parsing to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }

    try {
      serializeDateFormatString(new Date(Number.NaN), 'dd-MM-yyyy', 'date', {
        code: 'invalid-hash',
        path: ['hash'],
      });
      throw new Error('Expected date format serialization to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
