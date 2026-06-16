import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import type { InferRuntimeSchemaValue } from './contracts.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { number } from './number.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

describe('number', () => {
  it('compiles to a normalized descriptor', () => {
    expect(compileRuntimeSchema(number())).toEqual({
      type: 'number',
      presence: 'required',
      options: {},
    });
    expect(compileRuntimeSchema(number().optional())).toEqual({
      type: 'number',
      presence: 'optional',
      options: {},
    });
    expect(compileRuntimeSchema(number().default(1.5))).toEqual({
      type: 'number',
      presence: 'defaulted',
      options: {},
      defaultValue: 1.5,
    });
  });

  it('infers number values', () => {
    const schema = number().optional();
    const value = undefined as InferRuntimeSchemaValue<typeof schema>;

    expect(value).toBeUndefined();
  });

  it('parses, normalizes, and serializes finite numbers', () => {
    expect(parseRuntimeSchemaValue(number(), '1.5')).toBe(1.5);
    expect(parseRuntimeSchemaValue(number(), '-2')).toBe(-2);
    expect(normalizeRuntimeSchemaValue(number(), 1.5)).toBe(1.5);
    expect(serializeRuntimeSchemaValue(number(), 1.5)).toBe('1.5');
  });

  it('rejects non-finite and non-number values', () => {
    for (const value of ['', ' ', 'NaN', 'Infinity', '-Infinity']) {
      expect(() => parseRuntimeSchemaValue(number(), value)).toThrow(UrlKitError);
    }

    for (const value of [Number.NaN, Infinity, -Infinity, '1.5']) {
      expect(() => normalizeRuntimeSchemaValue(number(), value)).toThrow(UrlKitError);
      expect(() => serializeRuntimeSchemaValue(number(), value)).toThrow(UrlKitError);
    }
  });

  it('handles null and absent values according to presence', () => {
    expect(parseRuntimeSchemaValue(number().optional(), null)).toBeUndefined();
    expect(parseRuntimeSchemaValue(number().default(2), undefined)).toBe(2);
    expect(() => parseRuntimeSchemaValue(number(), null)).toThrow(UrlKitError);
  });

  it('validates defaults at compile time', () => {
    expect(() =>
      compileRuntimeSchema(number().default(Number.NaN), { path: ['search', 'page'] }),
    ).toThrow(UrlKitError);
    expect(() => compileRuntimeSchema(number().default('1' as never))).toThrow(UrlKitError);
  });
});
