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
      kind: 'date',
      presence: 'required',
      options: { format: 'date-time' },
    });
    expect(compileRuntimeSchema(date({ format: 'date-time' }).optional())).toEqual({
      kind: 'date',
      presence: 'optional',
      options: { format: 'date-time' },
    });
    expect(compileRuntimeSchema(dateTime().default(defaultValue))).toEqual({
      kind: 'date',
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
});
