import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import type { InferRuntimeSchemaValue } from './contracts.js';
import { date } from './date.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

describe('date', () => {
  it('compiles to a normalized date descriptor', () => {
    const defaultValue = new Date('2026-06-02T15:30:00.000Z');

    expect(compileRuntimeSchema(date())).toEqual({
      type: 'date',
      presence: 'required',
      options: { format: 'date' },
    });
    expect(compileRuntimeSchema(date({ format: 'date' }).optional())).toEqual({
      type: 'date',
      presence: 'optional',
      options: { format: 'date' },
    });
    expect(compileRuntimeSchema(date().default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: 'date' },
      defaultValue,
    });
  });

  it('infers Date values', () => {
    const schema = date().optional();
    const value = undefined as InferRuntimeSchemaValue<typeof schema>;
    const defaulted = new Date();

    expect(value).toBeUndefined();
    expect(defaulted).toBeInstanceOf(Date);
  });

  it('parses date-only strings into UTC midnight dates', () => {
    const value = parseRuntimeSchemaValue(date(), '2026-06-02');

    expect(value.toISOString()).toBe('2026-06-02T00:00:00.000Z');
  });

  it('normalizes Date values', () => {
    const value = new Date('2026-06-02T15:30:00.000Z');

    expect(normalizeRuntimeSchemaValue(date(), value)).toBe(value);
  });

  it('serializes Date values using UTC calendar fields', () => {
    const value = new Date(Date.UTC(2026, 5, 2, 23, 59, 59, 999));

    expect(serializeRuntimeSchemaValue(date(), value)).toBe('2026-06-02');
  });

  it('rejects invalid serialized, structured, and Date values', () => {
    for (const value of ['2026-02-31', '2026-13-01', '2026-00-01', 'not-a-date']) {
      expect(() => parseRuntimeSchemaValue(date(), value)).toThrow(UrlKitError);
    }

    expect(() => normalizeRuntimeSchemaValue(date(), '2026-06-02')).toThrow(UrlKitError);
    expect(() => normalizeRuntimeSchemaValue(date(), new Date(Number.NaN))).toThrow(UrlKitError);
    expect(() => serializeRuntimeSchemaValue(date(), new Date(Number.NaN))).toThrow(UrlKitError);
  });

  it('handles null and absent values according to presence', () => {
    const defaultValue = new Date('2026-06-02T00:00:00.000Z');

    expect(parseRuntimeSchemaValue(date().optional(), null)).toBeUndefined();
    expect(parseRuntimeSchemaValue(date().default(defaultValue), undefined)).toBe(defaultValue);
    expect(() => parseRuntimeSchemaValue(date(), null)).toThrow(UrlKitError);
    expect(() => normalizeRuntimeSchemaValue(date(), null)).toThrow(UrlKitError);
    expect(() => serializeRuntimeSchemaValue(date(), null)).toThrow(UrlKitError);
  });

  it('validates Date defaults at compile time', () => {
    expect(() =>
      compileRuntimeSchema(date().default(new Date(Number.NaN)), { path: ['search', 'from'] }),
    ).toThrow(UrlKitError);
    expect(() => compileRuntimeSchema(date().default('2026-06-02' as never))).toThrow(UrlKitError);
  });

  it('uses search and hash error contexts', () => {
    try {
      parseRuntimeSchemaValue(date(), 'wrong', {
        errorCode: 'invalid-hash',
        path: ['hash'],
      });
      expect.unreachable('Expected date parsing to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect(error).toMatchObject({
        code: 'invalid-hash',
        path: ['hash'],
      });
    }
  });

  it('supports unix-seconds date format', () => {
    const defaultValue = new Date('2024-01-01T00:00:00.000Z');

    expect(compileRuntimeSchema(date({ format: 'unix-seconds' }).default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: 'unix-seconds' },
      defaultValue,
    });
    expect(
      parseRuntimeSchemaValue(date({ format: 'unix-seconds' }), '1704067200').toISOString(),
    ).toBe('2024-01-01T00:00:00.000Z');
    expect(serializeRuntimeSchemaValue(date({ format: 'unix-seconds' }), defaultValue)).toBe(
      '1704067200',
    );
  });

  it('supports unix-ms date format', () => {
    const defaultValue = new Date('2024-01-01T00:00:00.123Z');

    expect(compileRuntimeSchema(date({ format: 'unix-ms' }).default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: 'unix-ms' },
      defaultValue,
    });
    expect(
      parseRuntimeSchemaValue(date({ format: 'unix-ms' }), '1704067200123').toISOString(),
    ).toBe('2024-01-01T00:00:00.123Z');
    expect(serializeRuntimeSchemaValue(date({ format: 'unix-ms' }), defaultValue)).toBe(
      '1704067200123',
    );
  });

  it('rejects invalid unix date format values', () => {
    for (const format of ['unix-seconds', 'unix-ms'] as const) {
      for (const value of ['1.5', 'NaN', 'Infinity', '-Infinity', 'wrong']) {
        expect(() => parseRuntimeSchemaValue(date({ format }), value)).toThrow(UrlKitError);
      }
    }

    expect(() =>
      serializeRuntimeSchemaValue(
        date({ format: 'unix-seconds' }),
        new Date('2024-01-01T00:00:00.123Z'),
      ),
    ).toThrow(UrlKitError);
    expect(() =>
      serializeRuntimeSchemaValue(date({ format: 'unix-ms' }), new Date(Number.NaN)),
    ).toThrow(UrlKitError);
  });

  it('handles null and absent values for unix date formats according to presence', () => {
    const defaultValue = new Date('2024-01-01T00:00:00.000Z');

    expect(
      parseRuntimeSchemaValue(date({ format: 'unix-seconds' }).optional(), null),
    ).toBeUndefined();
    expect(
      parseRuntimeSchemaValue(date({ format: 'unix-ms' }).default(defaultValue), undefined),
    ).toBe(defaultValue);
    expect(() => parseRuntimeSchemaValue(date({ format: 'unix-seconds' }), null)).toThrow(
      UrlKitError,
    );
    expect(() => normalizeRuntimeSchemaValue(date({ format: 'unix-ms' }), null)).toThrow(
      UrlKitError,
    );
    expect(() => serializeRuntimeSchemaValue(date({ format: 'unix-ms' }), null)).toThrow(
      UrlKitError,
    );
  });

  it('supports custom runtime date format strings', () => {
    const defaultValue = new Date('2026-06-02T00:00:00.000Z');
    const schema = date({ format: 'dd-MM-yyyy' });

    expect(compileRuntimeSchema(schema.default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: 'dd-MM-yyyy' },
      defaultValue,
    });
    expect(parseRuntimeSchemaValue(schema, '02-06-2026').toISOString()).toBe(
      '2026-06-02T00:00:00.000Z',
    );
    expect(normalizeRuntimeSchemaValue(schema, defaultValue)).toBe(defaultValue);
    expect(serializeRuntimeSchemaValue(schema, defaultValue)).toBe('02-06-2026');
  });

  it('supports custom runtime date formats through explicit codecs', () => {
    const customFormat = {
      parse(value: string) {
        const [day, month, year] = value.split('-');

        return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      },
      serialize(value: Date) {
        const day = String(value.getUTCDate()).padStart(2, '0');
        const month = String(value.getUTCMonth() + 1).padStart(2, '0');
        const year = String(value.getUTCFullYear()).padStart(4, '0');

        return `${day}-${month}-${year}`;
      },
    };
    const defaultValue = new Date('2026-06-02T00:00:00.000Z');
    const schema = date({ format: customFormat });

    expect(compileRuntimeSchema(schema.default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: customFormat },
      defaultValue,
    });
    expect(parseRuntimeSchemaValue(schema, '02-06-2026').toISOString()).toBe(
      '2026-06-02T00:00:00.000Z',
    );
    expect(normalizeRuntimeSchemaValue(schema, defaultValue)).toBe(defaultValue);
    expect(serializeRuntimeSchemaValue(schema, defaultValue)).toBe('02-06-2026');
  });

  it('infers Date values for custom runtime date formats', () => {
    const schema = date({
      format: {
        parse(value: string) {
          return new Date(value);
        },
        serialize(value: Date) {
          return value.toISOString();
        },
      },
    }).optional();
    const value = undefined as InferRuntimeSchemaValue<typeof schema>;

    expect(value).toBeUndefined();
  });

  it('rejects invalid custom parser results and serializer output', () => {
    expect(() =>
      parseRuntimeSchemaValue(
        date({
          format: {
            parse() {
              return new Date(Number.NaN);
            },
            serialize(value: Date) {
              return value.toISOString();
            },
          },
        }),
        'wrong',
      ),
    ).toThrow(UrlKitError);

    expect(() =>
      serializeRuntimeSchemaValue(
        date({
          format: {
            parse(value: string) {
              return new Date(value);
            },
            serialize() {
              return '';
            },
          },
        }),
        new Date('2026-06-02T00:00:00.000Z'),
      ),
    ).toThrow(UrlKitError);

    expect(() =>
      serializeRuntimeSchemaValue(
        date({
          format: {
            parse(value: string) {
              return new Date(value);
            },
            serialize() {
              return 123 as never;
            },
          },
        }),
        new Date('2026-06-02T00:00:00.000Z'),
      ),
    ).toThrow(UrlKitError);
  });

  it('rejects unsupported format strings and invalid codec descriptors', () => {
    expect(() => date({ format: 'DD-MM-YYYY' as never })).toThrow(UrlKitError);
    expect(() => date({ format: 'dd-MM-yyyy HH:mm:ss' as never })).toThrow(UrlKitError);
    expect(() => date('dd-MM-yyyy' as never)).toThrow(UrlKitError);
    expect(() =>
      date({
        format: {
          parse() {
            return new Date();
          },
        } as never,
      }),
    ).toThrow(UrlKitError);
    expect(() =>
      date({
        format: {
          serialize() {
            return 'x';
          },
        } as never,
      }),
    ).toThrow(UrlKitError);
  });

  it('keeps custom codecs runtime-only by not changing static descriptor exports', () => {
    const customFormat = {
      parse(value: string) {
        return new Date(value);
      },
      serialize(value: Date) {
        return value.toISOString();
      },
    };

    expect(compileRuntimeSchema(date({ format: customFormat })).options.format).toBe(customFormat);
  });
});
