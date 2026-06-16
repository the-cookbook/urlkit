import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { string } from './string.js';

describe('normalizeRuntimeSchemaValue', () => {
  it('normalizes structured values through schema codecs', () => {
    expect(normalizeRuntimeSchemaValue(string(), 'value')).toBe('value');
  });

  it('applies optional and default absence behavior', () => {
    expect(normalizeRuntimeSchemaValue(string().optional(), undefined)).toBeUndefined();
    expect(normalizeRuntimeSchemaValue(string().optional(), null)).toBeUndefined();
    expect(normalizeRuntimeSchemaValue(string().default('fallback'), undefined)).toBe('fallback');
    expect(normalizeRuntimeSchemaValue(string().default('fallback'), null)).toBe('fallback');
  });

  it('rejects invalid structured values', () => {
    try {
      normalizeRuntimeSchemaValue(string(), 1, { path: ['search', 'q'] });
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).path).toEqual(['search', 'q']);
    }
  });

  it('rejects schemas without normalize codecs', () => {
    const schema = createRuntimeSchemaBuilder<string, 'test'>({ type: 'test' });

    expect(() => normalizeRuntimeSchemaValue(schema, 'value')).toThrow(UrlKitError);
  });
});
