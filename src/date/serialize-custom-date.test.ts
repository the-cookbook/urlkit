import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { DateFormatCodec } from './contracts.js';
import { serializeCustomDate } from './serialize-custom-date.js';

const dayMonthYearCodec: DateFormatCodec = {
  parse(value) {
    const [day, month, year] = value.split('-');

    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  },

  serialize(value) {
    const day = String(value.getUTCDate()).padStart(2, '0');
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const year = String(value.getUTCFullYear()).padStart(4, '0');

    return `${day}-${month}-${year}`;
  },
};

describe('serializeCustomDate', () => {
  it('serializes Date values through the provided codec', () => {
    expect(serializeCustomDate(new Date('2026-06-02T12:30:00.000Z'), dayMonthYearCodec)).toBe(
      '02-06-2026',
    );
  });

  it('rejects invalid Date values before calling the serializer', () => {
    expect(() => serializeCustomDate(new Date(Number.NaN), dayMonthYearCodec)).toThrow(UrlKitError);
  });

  it('rejects empty serializer output', () => {
    expect(() =>
      serializeCustomDate(new Date('2026-06-02T00:00:00.000Z'), {
        parse: dayMonthYearCodec.parse,
        serialize() {
          return '';
        },
      }),
    ).toThrow(UrlKitError);
  });

  it('rejects non-string serializer output', () => {
    expect(() =>
      serializeCustomDate(new Date('2026-06-02T00:00:00.000Z'), {
        parse: dayMonthYearCodec.parse,
        serialize() {
          return 123 as never;
        },
      }),
    ).toThrow(UrlKitError);
  });

  it('wraps serializer exceptions with cause', () => {
    const cause = new Error('bad serialize');

    try {
      serializeCustomDate(new Date('2026-06-02T00:00:00.000Z'), {
        parse: dayMonthYearCodec.parse,
        serialize() {
          throw cause;
        },
      });
      throw new Error('Expected serializeCustomDate to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).cause).toBe(cause);
    }
  });

  it('uses provided error code and path', () => {
    try {
      serializeCustomDate(
        new Date('2026-06-02T00:00:00.000Z'),
        {
          parse: dayMonthYearCodec.parse,
          serialize() {
            return '';
          },
        },
        { code: 'invalid-hash', path: ['hash'] },
      );
      throw new Error('Expected serializeCustomDate to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
