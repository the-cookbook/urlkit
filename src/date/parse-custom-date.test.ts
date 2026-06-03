import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { DateFormatCodec } from './contracts.js';
import { parseCustomDate } from './parse-custom-date.js';

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

describe('parseCustomDate', () => {
  it('parses custom date strings through the provided codec', () => {
    expect(parseCustomDate('02-06-2026', dayMonthYearCodec).toISOString()).toBe(
      '2026-06-02T00:00:00.000Z',
    );
  });

  it('rejects Invalid Date results', () => {
    expect(() =>
      parseCustomDate('wrong', {
        parse() {
          return new Date(Number.NaN);
        },
        serialize: dayMonthYearCodec.serialize,
      }),
    ).toThrow(UrlKitError);
  });

  it('rejects non-Date parser results', () => {
    expect(() =>
      parseCustomDate('wrong', {
        parse() {
          return '2026-06-02' as never;
        },
        serialize: dayMonthYearCodec.serialize,
      }),
    ).toThrow(UrlKitError);
  });

  it('wraps parser exceptions with cause', () => {
    const cause = new Error('bad parse');

    try {
      parseCustomDate('wrong', {
        parse() {
          throw cause;
        },
        serialize: dayMonthYearCodec.serialize,
      });
      throw new Error('Expected parseCustomDate to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).cause).toBe(cause);
    }
  });

  it('uses provided error code and path', () => {
    try {
      parseCustomDate(
        'wrong',
        {
          parse() {
            return new Date(Number.NaN);
          },
          serialize: dayMonthYearCodec.serialize,
        },
        { code: 'invalid-hash', path: ['hash'] },
      );
      throw new Error('Expected parseCustomDate to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
