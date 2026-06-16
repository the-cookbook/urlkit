import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { int } from './int.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

describe('int', () => {
  it('compiles to a normalized descriptor', () => {
    expect(compileRuntimeSchema(int())).toEqual({ type: 'int', presence: 'required', options: {} });
    expect(compileRuntimeSchema(int().optional())).toEqual({
      type: 'int',
      presence: 'optional',
      options: {},
    });
    expect(compileRuntimeSchema(int().default(1))).toEqual({
      type: 'int',
      presence: 'defaulted',
      options: {},
      defaultValue: 1,
    });
  });

  it('parses, normalizes, and serializes finite integers', () => {
    expect(parseRuntimeSchemaValue(int(), '1')).toBe(1);
    expect(parseRuntimeSchemaValue(int(), '-2')).toBe(-2);
    expect(normalizeRuntimeSchemaValue(int(), 1)).toBe(1);
    expect(serializeRuntimeSchemaValue(int(), 1)).toBe('1');
  });

  it('rejects decimals, non-finite numbers, and non-number structured values', () => {
    for (const value of ['1.5', 'NaN', 'Infinity', '']) {
      expect(() => parseRuntimeSchemaValue(int(), value)).toThrow(UrlKitError);
    }

    for (const value of [1.5, Number.NaN, Infinity, '1']) {
      expect(() => normalizeRuntimeSchemaValue(int(), value)).toThrow(UrlKitError);
      expect(() => serializeRuntimeSchemaValue(int(), value)).toThrow(UrlKitError);
    }
  });

  it('handles null and absent values according to presence', () => {
    expect(parseRuntimeSchemaValue(int().optional(), null)).toBeUndefined();
    expect(parseRuntimeSchemaValue(int().default(2), undefined)).toBe(2);
    expect(() => normalizeRuntimeSchemaValue(int(), null)).toThrow(UrlKitError);
  });

  it('validates defaults at compile time', () => {
    expect(() => compileRuntimeSchema(int().default(1.5), { path: ['search', 'page'] })).toThrow(
      UrlKitError,
    );
    expect(() => compileRuntimeSchema(int().default(Number.NaN))).toThrow(UrlKitError);
  });
});
