import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { boolean } from './boolean.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

describe('boolean', () => {
  it('compiles to a normalized descriptor', () => {
    expect(compileRuntimeSchema(boolean())).toEqual({
      kind: 'boolean',
      presence: 'required',
      options: {},
    });
    expect(compileRuntimeSchema(boolean().optional())).toEqual({
      kind: 'boolean',
      presence: 'optional',
      options: {},
    });
    expect(compileRuntimeSchema(boolean().default(false))).toEqual({
      kind: 'boolean',
      presence: 'defaulted',
      options: {},
      defaultValue: false,
    });
  });

  it('parses only strict boolean strings', () => {
    expect(parseRuntimeSchemaValue(boolean(), 'true')).toBe(true);
    expect(parseRuntimeSchemaValue(boolean(), 'false')).toBe(false);

    for (const value of ['1', '0', 'yes', 'no', 'on', 'off', 'TRUE', 'FALSE']) {
      expect(() => parseRuntimeSchemaValue(boolean(), value)).toThrow(UrlKitError);
    }
  });

  it('normalizes and serializes boolean values', () => {
    expect(normalizeRuntimeSchemaValue(boolean(), true)).toBe(true);
    expect(normalizeRuntimeSchemaValue(boolean(), false)).toBe(false);
    expect(serializeRuntimeSchemaValue(boolean(), true)).toBe('true');
    expect(serializeRuntimeSchemaValue(boolean(), false)).toBe('false');
  });

  it('rejects non-boolean structured values', () => {
    for (const value of ['true', 'false', 1, 0]) {
      expect(() => normalizeRuntimeSchemaValue(boolean(), value)).toThrow(UrlKitError);
      expect(() => serializeRuntimeSchemaValue(boolean(), value)).toThrow(UrlKitError);
    }
  });

  it('handles null and absent values according to presence', () => {
    expect(parseRuntimeSchemaValue(boolean().optional(), null)).toBeUndefined();
    expect(normalizeRuntimeSchemaValue(boolean().default(true), undefined)).toBe(true);
    expect(serializeRuntimeSchemaValue(boolean().default(false), null)).toBe('false');
    expect(() => parseRuntimeSchemaValue(boolean(), null)).toThrow(UrlKitError);
  });

  it('validates defaults at compile time', () => {
    expect(() =>
      compileRuntimeSchema(boolean().default('false' as never), { path: ['search', 'enabled'] }),
    ).toThrow(UrlKitError);
  });
});
