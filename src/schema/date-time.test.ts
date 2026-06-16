import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import type { InferRuntimeSchemaValue } from './contracts.js';
import { date } from './date.js';
import { dateTime } from './date-time.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import {
  safeNormalizeRuntimeSchemaValue,
  safeParseRuntimeSchemaValue,
  safeSerializeRuntimeSchemaValue,
} from './safe-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

describe('dateTime', () => {
  it('compiles dateTime to a normalized date descriptor with date-time format', () => {
    const defaultValue = new Date('2026-01-01T10:30:00.000Z');

    expect(compileRuntimeSchema(dateTime())).toEqual({
      type: 'date',
      presence: 'required',
      options: { format: 'date-time' },
    });
    expect(compileRuntimeSchema(date({ format: 'date-time' }).optional())).toEqual({
      type: 'date',
      presence: 'optional',
      options: { format: 'date-time' },
    });
    expect(compileRuntimeSchema(dateTime().default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: 'date-time' },
      defaultValue,
    });
  });

  it('infers Date values', () => {
    const schema = dateTime().optional();
    const value = undefined as InferRuntimeSchemaValue<typeof schema>;
    const defaulted = new Date();

    expect(value).toBeUndefined();
    expect(defaulted).toBeInstanceOf(Date);
  });

  it('parses strict UTC date-time strings into Date values', () => {
    const value = parseRuntimeSchemaValue(dateTime(), '2026-01-01T10:30:00.123Z');

    expect(value.toISOString()).toBe('2026-01-01T10:30:00.123Z');
  });

  it('supports date({ format: date-time })', () => {
    const value = parseRuntimeSchemaValue(
      date({ format: 'date-time' }),
      '2026-01-01T10:30:00.000Z',
    );

    expect(value.toISOString()).toBe('2026-01-01T10:30:00.000Z');
  });

  it('normalizes Date values', () => {
    const value = new Date('2026-01-01T10:30:00.123Z');

    expect(normalizeRuntimeSchemaValue(dateTime(), value)).toBe(value);
  });

  it('serializes Date values as strict UTC date-time strings', () => {
    const value = new Date(Date.UTC(2026, 0, 1, 10, 30, 0, 123));

    expect(serializeRuntimeSchemaValue(dateTime(), value)).toBe('2026-01-01T10:30:00.123Z');
  });

  it('rejects ambiguous and offset date-time strings', () => {
    for (const value of [
      '2026-01-01T10:30:00',
      '2026-01-01 10:30:00',
      '2026-01-01T10:30:00+02:00',
      '2026-01-01T10:30:00.000+02:00',
    ]) {
      expect(() => parseRuntimeSchemaValue(dateTime(), value)).toThrow(UrlKitError);
    }
  });

  it('handles null and absent values according to presence', () => {
    const defaultValue = new Date('2026-01-01T10:30:00.000Z');

    expect(parseRuntimeSchemaValue(dateTime().optional(), null)).toBeUndefined();
    expect(parseRuntimeSchemaValue(dateTime().default(defaultValue), undefined)).toBe(defaultValue);
    expect(() => parseRuntimeSchemaValue(dateTime(), null)).toThrow(UrlKitError);
    expect(() => normalizeRuntimeSchemaValue(dateTime(), null)).toThrow(UrlKitError);
    expect(() => serializeRuntimeSchemaValue(dateTime(), null)).toThrow(UrlKitError);
  });

  it('validates Date defaults at compile time', () => {
    expect(() =>
      compileRuntimeSchema(dateTime().default(new Date(Number.NaN)), { path: ['search', 'from'] }),
    ).toThrow(UrlKitError);
    expect(() =>
      compileRuntimeSchema(dateTime().default('2026-01-01T10:30:00.000Z' as never)),
    ).toThrow(UrlKitError);
  });

  it('returns safe failures for invalid parse, normalize, and serialize operations', () => {
    const parseResult = safeParseRuntimeSchemaValue(dateTime(), '2026-01-01T10:30:00+02:00');
    const normalizeResult = safeNormalizeRuntimeSchemaValue(dateTime(), '2026-01-01T10:30:00.000Z');
    const serializeResult = safeSerializeRuntimeSchemaValue(dateTime(), new Date(Number.NaN));

    expect(parseResult.success).toBe(false);
    expect(normalizeResult.success).toBe(false);
    expect(serializeResult.success).toBe(false);
  });

  it('uses search and hash error contexts', () => {
    try {
      parseRuntimeSchemaValue(dateTime(), 'wrong', { errorCode: 'invalid-hash', path: ['hash'] });
      throw new Error('Expected date-time parsing to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });

  it('supports custom runtime date-time format strings', () => {
    const defaultValue = new Date('2026-01-01T10:30:05.000Z');
    const schema = dateTime({ format: 'dd-MM-yyyy HH:mm:ss' });

    expect(compileRuntimeSchema(schema.default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: 'dd-MM-yyyy HH:mm:ss' },
      defaultValue,
    });
    const parsed = parseRuntimeSchemaValue(schema, '01-01-2026 10:30:05');

    expect(parsed.toISOString()).toBe('2026-01-01T10:30:05.000Z');
    expect(parsed.getUTCHours()).toBe(10);
    expect(parsed.getUTCMinutes()).toBe(30);
    expect(parsed.getUTCSeconds()).toBe(5);
    expect(normalizeRuntimeSchemaValue(schema, defaultValue)).toBe(defaultValue);
    expect(serializeRuntimeSchemaValue(schema, defaultValue)).toBe('01-01-2026 10:30:05');
  });

  it('supports custom runtime date-time format strings with milliseconds and quoted literals', () => {
    const defaultValue = new Date('2026-01-01T10:30:05.123Z');
    const schema = dateTime({ format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" });

    expect(parseRuntimeSchemaValue(schema, '2026-01-01T10:30:05.123Z').toISOString()).toBe(
      '2026-01-01T10:30:05.123Z',
    );
    expect(serializeRuntimeSchemaValue(schema, defaultValue)).toBe('2026-01-01T10:30:05.123Z');
  });

  it('supports custom runtime date-time formats through explicit codecs', () => {
    const customFormat = {
      parse(value: string) {
        const [datePart = '', timePart = ''] = value.split(' ');
        const [day = '', month = '', year = ''] = datePart.split('-');
        const [hour = '', minute = '', second = ''] = timePart.split(':');

        return new Date(
          Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second),
          ),
        );
      },
      serialize(value: Date) {
        const day = String(value.getUTCDate()).padStart(2, '0');
        const month = String(value.getUTCMonth() + 1).padStart(2, '0');
        const year = String(value.getUTCFullYear()).padStart(4, '0');
        const hour = String(value.getUTCHours()).padStart(2, '0');
        const minute = String(value.getUTCMinutes()).padStart(2, '0');
        const second = String(value.getUTCSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
      },
    };
    const defaultValue = new Date('2026-01-01T10:30:05.000Z');
    const schema = dateTime({ format: customFormat });

    expect(compileRuntimeSchema(schema.default(defaultValue))).toEqual({
      type: 'date',
      presence: 'defaulted',
      options: { format: customFormat },
      defaultValue,
    });
    const parsed = parseRuntimeSchemaValue(schema, '01-01-2026 10:30:05');

    expect(parsed.toISOString()).toBe('2026-01-01T10:30:05.000Z');
    expect(parsed.getUTCHours()).toBe(10);
    expect(parsed.getUTCMinutes()).toBe(30);
    expect(parsed.getUTCSeconds()).toBe(5);
    expect(normalizeRuntimeSchemaValue(schema, defaultValue)).toBe(defaultValue);
    expect(serializeRuntimeSchemaValue(schema, defaultValue)).toBe('01-01-2026 10:30:05');
  });

  it('infers Date values for custom runtime date-time formats', () => {
    const schema = dateTime({
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

  it('rejects non date-time built-in formats and invalid codec descriptors', () => {
    expect(() => dateTime({ format: 'date' as never })).toThrow(UrlKitError);
    expect(() => dateTime({ format: 'unix-seconds' as never })).toThrow(UrlKitError);
    expect(() => dateTime({ format: 'unix-ms' as never })).toThrow(UrlKitError);
    expect(() => dateTime({ format: 'DD-MM-YYYY HH:mm:ss' as never })).toThrow(UrlKitError);
    expect(() => dateTime({ format: 'dd-MM-yyyy' as never })).toThrow(UrlKitError);
    expect(() => dateTime('dd-MM-yyyy HH:mm:ss' as never)).toThrow(UrlKitError);
    expect(() =>
      dateTime({
        format: {
          parse() {
            return new Date();
          },
        } as never,
      }),
    ).toThrow(UrlKitError);
    expect(() =>
      dateTime({
        format: {
          serialize() {
            return 'x';
          },
        } as never,
      }),
    ).toThrow(UrlKitError);
  });

  it('returns safe failures for invalid custom date-time formats', () => {
    const parseResult = safeParseRuntimeSchemaValue(
      dateTime({
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
    );
    const serializeResult = safeSerializeRuntimeSchemaValue(
      dateTime({
        format: {
          parse(value: string) {
            return new Date(value);
          },
          serialize() {
            return '';
          },
        },
      }),
      new Date('2026-01-01T10:30:00.000Z'),
    );

    expect(parseResult.success).toBe(false);
    expect(serializeResult.success).toBe(false);
  });
});
