import { describe, expect, it, expectTypeOf } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import type { InferRuntimeSchemaValue } from './contracts.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';
import { string } from './string.js';

describe('string', () => {
  it('compiles to a normalized descriptor', () => {
    expect(compileRuntimeSchema(string())).toEqual({
      type: 'string',
      presence: 'required',
      options: {},
    });
    expect(compileRuntimeSchema(string().optional())).toEqual({
      type: 'string',
      presence: 'optional',
      options: {},
    });
    expect(compileRuntimeSchema(string().default('profile'))).toEqual({
      type: 'string',
      presence: 'defaulted',
      options: {},
      defaultValue: 'profile',
    });
  });

  it('infers optional, required, and defaulted values', () => {
    const optional = string().optional();
    const required = optional.required();
    const defaulted = optional.default('fallback');

    expectTypeOf<string | undefined>(undefined as InferRuntimeSchemaValue<typeof optional>);
    expectTypeOf<string>(undefined as unknown as InferRuntimeSchemaValue<typeof required>);
    expectTypeOf<string>(undefined as unknown as InferRuntimeSchemaValue<typeof defaulted>);
  });

  it('parses, normalizes, and serializes string values', () => {
    expect(parseRuntimeSchemaValue(string(), 'router')).toBe('router');
    expect(normalizeRuntimeSchemaValue(string(), 'router')).toBe('router');
    expect(serializeRuntimeSchemaValue(string(), 'router')).toBe('router');
  });

  it('handles null and absent values according to presence', () => {
    expect(parseRuntimeSchemaValue(string().optional(), null)).toBeUndefined();
    expect(normalizeRuntimeSchemaValue(string().optional(), null)).toBeUndefined();
    expect(serializeRuntimeSchemaValue(string().optional(), null)).toBeUndefined();
    expect(parseRuntimeSchemaValue(string().default('fallback'), null)).toBe('fallback');
    expect(normalizeRuntimeSchemaValue(string().default('fallback'), undefined)).toBe('fallback');
  });

  it('rejects invalid structured values', () => {
    expect(() => normalizeRuntimeSchemaValue(string(), 1)).toThrow(UrlKitError);
    expect(() => serializeRuntimeSchemaValue(string(), false)).toThrow(UrlKitError);
  });

  it('validates defaults at compile time', () => {
    expect(() =>
      compileRuntimeSchema(string().default(1 as never), { path: ['search', 'q'] }),
    ).toThrow(UrlKitError);
  });
});
